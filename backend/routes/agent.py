import os
import json
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from google import genai
from google.genai import types
from bson import ObjectId
from models import ChatMessage , ChatRequest

from database import (
    enterprise_employees_collection,
    wallets_collection,
    enterprise_notifications_collection,
    company_col,
    transactions_collection,
)

agent_router = APIRouter(prefix="/api/agent", tags=["Agent"])


GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
client = genai.Client(api_key=GEMINI_API_KEY)
MODEL = "gemini-2.0-flash"




TOOL_DECLARATIONS = types.Tool(function_declarations=[
    types.FunctionDeclaration(
        name="list_employees",
        description="List all employees for the enterprise. Returns employee names, departments, KYC status, wallet balance, and employment status.",
        parameters=types.Schema(
            type="OBJECT",
            properties={},
        ),
    ),
    types.FunctionDeclaration(
        name="search_employee",
        description="Search for a specific employee by name or email.",
        parameters=types.Schema(
            type="OBJECT",
            properties={
                "query": types.Schema(type="STRING", description="Name or email to search for"),
            },
            required=["query"],
        ),
    ),
    types.FunctionDeclaration(
        name="get_wallet_balance",
        description="Get the enterprise wallet balance.",
        parameters=types.Schema(
            type="OBJECT",
            properties={},
        ),
    ),
    types.FunctionDeclaration(
        name="get_analytics",
        description="Get enterprise analytics and dashboard statistics including total employees, active/suspended counts, wallet balances, and transaction summaries.",
        parameters=types.Schema(
            type="OBJECT",
            properties={},
        ),
    ),
    types.FunctionDeclaration(
        name="get_recent_notifications",
        description="Get recent notifications for the enterprise.",
        parameters=types.Schema(
            type="OBJECT",
            properties={
                "limit": types.Schema(type="INTEGER", description="Number of notifications to return, default 10"),
            },
        ),
    ),
    types.FunctionDeclaration(
        name="get_recent_transactions",
        description="Get recent transactions for the enterprise.",
        parameters=types.Schema(
            type="OBJECT",
            properties={
                "limit": types.Schema(type="INTEGER", description="Number of transactions to return, default 10"),
            },
        ),
    ),
    types.FunctionDeclaration(
        name="add_employee",
        description="Add a new employee to the enterprise. Requires at least first name, last name, email, phone, and department.",
        parameters=types.Schema(
            type="OBJECT",
            properties={
                "first_name": types.Schema(type="STRING", description="Employee first name"),
                "last_name": types.Schema(type="STRING", description="Employee last name"),
                "email": types.Schema(type="STRING", description="Employee email"),
                "phone": types.Schema(type="STRING", description="Employee phone number"),
                "department": types.Schema(type="STRING", description="Department name"),
                "designation": types.Schema(type="STRING", description="Job title/designation"),
            },
            required=["first_name", "last_name", "email", "phone", "department"],
        ),
    ),
    types.FunctionDeclaration(
        name="allocate_funds",
        description="Allocate funds from enterprise wallet to a specific employee's wallet.",
        parameters=types.Schema(
            type="OBJECT",
            properties={
                "employee_name": types.Schema(type="STRING", description="Name of the employee to allocate funds to"),
                "amount": types.Schema(type="NUMBER", description="Amount in INR to allocate"),
            },
            required=["employee_name", "amount"],
        ),
    ),
    types.FunctionDeclaration(
        name="get_unverified_employees",
        description="List employees who have not yet completed KYC verification.",
        parameters=types.Schema(
            type="OBJECT",
            properties={},
        ),
    ),
])


# ─── Tool executor ───
async def execute_tool(name: str, args: dict, company_id: str) -> dict:
    """Execute a tool call against the database directly."""
    try:
        if name == "list_employees":
            cursor = enterprise_employees_collection.find({"company_id": company_id})
            employees = []
            async for doc in cursor:
                employees.append({
                    "name": f"{doc.get('first_name', '')} {doc.get('last_name', '')}",
                    "email": doc.get("email", ""),
                    "department": doc.get("department", ""),
                    "status": doc.get("status", "active"),
                    "kyc_verified": doc.get("kyc_verified", False),
                    "wallet_balance": doc.get("wallet_balance", 0),
                })
            return {"employees": employees, "total": len(employees)}

        elif name == "search_employee":
            query = args.get("query", "")
            regex = {"$regex": query, "$options": "i"}
            cursor = enterprise_employees_collection.find({
                "company_id": company_id,
                "$or": [
                    {"first_name": regex},
                    {"last_name": regex},
                    {"email": regex},
                ]
            })
            results = []
            async for doc in cursor:
                results.append({
                    "name": f"{doc.get('first_name', '')} {doc.get('last_name', '')}",
                    "email": doc.get("email", ""),
                    "department": doc.get("department", ""),
                    "status": doc.get("status", ""),
                    "kyc_verified": doc.get("kyc_verified", False),
                    "wallet_balance": doc.get("wallet_balance", 0),
                    "phone": doc.get("phone", ""),
                })
            return {"results": results, "count": len(results)}

        elif name == "get_wallet_balance":
            wallet = await wallets_collection.find_one({"company_id": company_id})
            if not wallet:
                return {"balance": 0, "currency": "INR"}
            return {"balance": wallet.get("balance", 0), "currency": "INR", "wallet_id": wallet.get("wallet_id", "")}

        elif name == "get_analytics":
            employees = []
            async for doc in enterprise_employees_collection.find({"company_id": company_id}):
                employees.append(doc)
            total = len(employees)
            active = sum(1 for e in employees if e.get("status") == "active")
            suspended = sum(1 for e in employees if e.get("status") == "suspended")
            verified = sum(1 for e in employees if e.get("kyc_verified"))
            unverified = total - verified
            total_emp_balance = sum(e.get("wallet_balance", 0) for e in employees)

            wallet = await wallets_collection.find_one({"company_id": company_id})
            ent_balance = wallet.get("balance", 0) if wallet else 0

            return {
                "total_employees": total,
                "active_employees": active,
                "suspended_employees": suspended,
                "kyc_verified": verified,
                "kyc_unverified": unverified,
                "enterprise_wallet_balance": ent_balance,
                "total_employee_balance": total_emp_balance,
            }

        elif name == "get_recent_notifications":
            limit = args.get("limit", 10)
            cursor = enterprise_notifications_collection.find(
                {"company_id": company_id}
            ).sort("created_at", -1).limit(limit)
            notifs = []
            async for doc in cursor:
                notifs.append({
                    "title": doc.get("title", ""),
                    "message": doc.get("message", ""),
                    "type": doc.get("type", "info"),
                    "read": doc.get("read", False),
                })
            return {"notifications": notifs, "count": len(notifs)}

        elif name == "get_recent_transactions":
            limit = args.get("limit", 10)
            cursor = transactions_collection.find(
                {"company_id": company_id}
            ).sort("timestamp", -1).limit(limit)
            txns = []
            async for doc in cursor:
                txns.append({
                    "sender": doc.get("sender_name", ""),
                    "receiver": doc.get("receiver_name", ""),
                    "amount": doc.get("amount", 0),
                    "type": doc.get("type", ""),
                    "status": doc.get("status", ""),
                    "description": doc.get("description", ""),
                })
            return {"transactions": txns, "count": len(txns)}

        elif name == "add_employee":
            from datetime import datetime
            from routes.enterprise_panel import create_notification

            # Check duplicate
            existing = await enterprise_employees_collection.find_one({
                "company_id": company_id, "email": args["email"]
            })
            if existing:
                return {"error": f"Employee with email {args['email']} already exists"}

            now = datetime.utcnow().strftime("%Y-%m-%d")
            doc = {
                "company_id": company_id,
                "employee_id": f"EMP-{ObjectId()}",
                "first_name": args["first_name"],
                "last_name": args["last_name"],
                "email": args["email"],
                "phone": args.get("phone", ""),
                "department": args["department"],
                "designation": args.get("designation", ""),
                "role": "Employee",
                "date_of_joining": now,
                "employment_type": "Full-time",
                "date_of_birth": "",
                "gender": "Other",
                "gov_id_type": "",
                "gov_id_number": "",
                "documents": [],
                "wallet_balance": 0,
                "spending_limit": 50000,
                "salary_band": "",
                "status": "active",
                "kyc_verified": False,
                "two_factor_enabled": False,
                "last_login": "Never",
                "created_at": now,
            }
            await enterprise_employees_collection.insert_one(doc)

            name = f"{args['first_name']} {args['last_name']}"
            await create_notification(company_id, "Employee Added", f"New employee {name} added via AI Agent", "success")

            return {"success": True, "message": f"Employee {name} added to {args['department']} department"}

        elif name == "allocate_funds":
            from datetime import datetime
            from routes.enterprise_panel import create_notification

            emp_name = args["employee_name"]
            amount = args["amount"]

            # Find employee by name
            name_parts = emp_name.strip().split()
            query = {"company_id": company_id}
            if len(name_parts) >= 2:
                query["first_name"] = {"$regex": name_parts[0], "$options": "i"}
                query["last_name"] = {"$regex": name_parts[-1], "$options": "i"}
            else:
                query["$or"] = [
                    {"first_name": {"$regex": emp_name, "$options": "i"}},
                    {"last_name": {"$regex": emp_name, "$options": "i"}},
                ]

            emp = await enterprise_employees_collection.find_one(query)
            if not emp:
                return {"error": f"Employee '{emp_name}' not found"}

            # Check enterprise balance
            wallet = await wallets_collection.find_one({"company_id": company_id})
            if not wallet or wallet.get("balance", 0) < amount:
                return {"error": f"Insufficient enterprise wallet balance. Current: ₹{wallet.get('balance', 0) if wallet else 0:,.0f}"}

            # Deduct from enterprise
            new_ent_bal = wallet.get("balance", 0) - amount
            await wallets_collection.update_one(
                {"company_id": company_id},
                {"$set": {"balance": new_ent_bal}}
            )

            # Credit employee
            new_emp_bal = emp.get("wallet_balance", 0) + amount
            await enterprise_employees_collection.update_one(
                {"_id": emp["_id"]},
                {"$set": {"wallet_balance": new_emp_bal}}
            )

            full_name = f"{emp.get('first_name', '')} {emp.get('last_name', '')}"
            await create_notification(
                company_id, "Funds Allocated",
                f"₹{amount:,.0f} allocated to {full_name} via AI Agent", "info"
            )

            return {
                "success": True,
                "message": f"₹{amount:,.0f} allocated to {full_name}",
                "employee_new_balance": new_emp_bal,
                "enterprise_new_balance": new_ent_bal,
            }

        elif name == "get_unverified_employees":
            cursor = enterprise_employees_collection.find({
                "company_id": company_id, "kyc_verified": False
            })
            emps = []
            async for doc in cursor:
                emps.append({
                    "name": f"{doc.get('first_name', '')} {doc.get('last_name', '')}",
                    "email": doc.get("email", ""),
                    "department": doc.get("department", ""),
                })
            return {"unverified_employees": emps, "count": len(emps)}

        else:
            return {"error": f"Unknown tool: {name}"}

    except Exception as e:
        return {"error": str(e)}


# ─── System prompt ───
SYSTEM_PROMPT = """You are SurePay AI Assistant, an intelligent enterprise dashboard helper.
You help enterprise admins manage their employees, wallets, and operations.

Guidelines:
- Be concise and professional
- Use ₹ for currency (Indian Rupees)
- Format numbers with commas (e.g., ₹1,50,000)
- When listing data, use clean formatted lists
- If a tool returns an error, explain it clearly to the user
- Always confirm destructive actions before executing
- You can only perform actions for the current enterprise
- Do NOT make up data — always use the tools to fetch real data
"""


# ─── Main chat endpoint ───
@agent_router.post("/chat/{company_id}")
async def agent_chat(company_id: str, req: ChatRequest):
    """Process a chat message with the Gemini agent."""
    if not GEMINI_API_KEY:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY not configured")

    try:
        # Build conversation history
        contents = []
        for msg in (req.history or []):
            role = "user" if msg.role == "user" else "model"
            contents.append(types.Content(role=role, parts=[types.Part.from_text(text=msg.text)]))

        # Add current user message
        contents.append(types.Content(role="user", parts=[types.Part.from_text(text=req.message)]))

        # Call Gemini with tools
        response = client.models.generate_content(
            model=MODEL,
            contents=contents,
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_PROMPT,
                tools=[TOOL_DECLARATIONS],
                temperature=0.3,
            ),
        )

        # Process tool calls if present
        max_iterations = 5
        iteration = 0

        while iteration < max_iterations:
            iteration += 1

            # Check if there are function calls
            candidate = response.candidates[0]
            has_function_call = False

            for part in candidate.content.parts:
                if part.function_call:
                    has_function_call = True
                    break

            if not has_function_call:
                break

            # Execute each function call
            contents.append(candidate.content)

            function_response_parts = []
            for part in candidate.content.parts:
                if part.function_call:
                    fn_name = part.function_call.name
                    fn_args = dict(part.function_call.args) if part.function_call.args else {}

                    # Execute the tool
                    result = await execute_tool(fn_name, fn_args, company_id)

                    function_response_parts.append(
                        types.Part.from_function_response(
                            name=fn_name,
                            response=result,
                        )
                    )

            contents.append(types.Content(role="user", parts=function_response_parts))

            # Call Gemini again with the tool results
            response = client.models.generate_content(
                model=MODEL,
                contents=contents,
                config=types.GenerateContentConfig(
                    system_instruction=SYSTEM_PROMPT,
                    tools=[TOOL_DECLARATIONS],
                    temperature=0.3,
                ),
            )

        # Extract final text response
        reply = response.text or "I couldn't process that request. Please try again."

        return {"success": True, "reply": reply}

    except Exception as e:
        print(f"[Agent Error] {str(e)}")
        return {"success": False, "reply": f"Sorry, I encountered an error: {str(e)}"}
