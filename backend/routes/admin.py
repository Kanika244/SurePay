from fastapi import APIRouter, HTTPException
from models import AdminLogin
from database import (
    company_col,
    individualusers,
    company_poc_collection,
    wallets_collection,
    individual_wallet_collection,
    individual_kyc_collection,
    transactions_collection,
    enterprise_employees_collection,
)
from bson import ObjectId
from datetime import datetime
from pydantic import BaseModel
import os

admin_router = APIRouter(prefix="/api/admin", tags=["Admin Auth"])

ADMIN_EMAIL = os.getenv("ADMIN_EMAIL")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD")


class WalletActionRequest(BaseModel):
    amount: float = 0
    description: str = ""


@admin_router.post("/login")
async def admin_login(admin: AdminLogin):
    if admin.Email != ADMIN_EMAIL or admin.Password != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return {
        "message": "Admin login successful",
        "admin_email": admin.Email,
        "token": "admin-mock-session-token"
    }


# ============ ADMIN DASHBOARD STATS ============

@admin_router.get("/stats")
async def get_admin_stats():
    """Get real-time dashboard statistics from the database."""
    try:
        total_enterprises = await company_col.count_documents({})
        total_individuals = await individualusers.count_documents({})
        total_employees = await enterprise_employees_collection.count_documents({})
        total_transactions = await transactions_collection.count_documents({})

        enterprise_wallets = await wallets_collection.find({}).to_list(length=1000)
        enterprise_wallet_total = sum(w.get("balance", 0) for w in enterprise_wallets)

        individual_wallets = await individual_wallet_collection.find({}).to_list(length=1000)
        individual_wallet_total = sum(w.get("balance", 0) for w in individual_wallets)

        # Employee wallet balances from enterprise_employees_collection
        emp_cursor = enterprise_employees_collection.find({})
        emp_wallet_total = 0
        async for emp in emp_cursor:
            emp_wallet_total += emp.get("wallet_balance", 0)

        total_wallet_balance = enterprise_wallet_total + individual_wallet_total + emp_wallet_total

        # Top enterprises by wallet balance
        top_enterprises = []
        companies = await company_col.find({}).to_list(length=100)
        for comp in companies:
            comp_id = str(comp["_id"])
            wallet = await wallets_collection.find_one({"company_id": comp_id})
            balance = wallet.get("balance", 0) if wallet else 0
            top_enterprises.append({"name": comp.get("legal_name", "Unknown"), "volume": balance})
        top_enterprises.sort(key=lambda x: x["volume"], reverse=True)
        top_enterprises = top_enterprises[:5]

        wallet_distribution = [
            {"name": "Enterprises", "value": enterprise_wallet_total},
            {"name": "Employees", "value": emp_wallet_total},
            {"name": "Individuals", "value": individual_wallet_total},
        ]

        return {
            "success": True,
            "totalEnterprises": total_enterprises,
            "totalIndividuals": total_individuals,
            "totalEmployees": total_employees,
            "totalTransactions": total_transactions,
            "totalWalletBalance": total_wallet_balance,
            "topEnterprisesByVolume": top_enterprises,
            "walletDistribution": wallet_distribution,
        }
    except Exception as e:
        print(f"Admin Stats Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch admin stats")


# ============ ENTERPRISES ============

@admin_router.get("/enterprises")
async def get_admin_enterprises():
    """Get all enterprises with wallet info."""
    try:
        companies = await company_col.find({}).to_list(length=100)
        result = []
        for comp in companies:
            comp_id = str(comp["_id"])
            wallet = await wallets_collection.find_one({"company_id": comp_id})
            employee_count = await enterprise_employees_collection.count_documents({"company_id": comp_id})
            
            # Fetch POC
            poc = await company_poc_collection.find_one({"company_id": comp_id})
            poc_data = {
                "name": poc.get("name", "") if poc else "",
                "email": poc.get("email", "") if poc else "",
                "phone": poc.get("phone", "") if poc else "",
                "designation": poc.get("designation", "") if poc else "",
                "status": poc.get("status", "pending") if poc else "pending",
            }

            result.append({
                "id": comp_id,
                "name": comp.get("legal_name", "Unknown"),
                "email": comp.get("email", ""),
                "status": comp.get("status", "active"),
                "walletBalance": wallet.get("balance", 0) if wallet else 0,
                "walletId": wallet.get("wallet_id", "") if wallet else "",
                "industry": comp.get("industry_category", ""),
                "companyType": comp.get("company_type", ""),
                "employeeCount": employee_count,
                "companyCode": comp.get("company_code", ""),
                "createdAt": str(comp.get("created_at", "")),
                "address": comp.get("registered_address", ""),
                "country": comp.get("country", "India"),
                "documents": comp.get("documents", []),
                "poc": poc_data,
            })
        return {"success": True, "enterprises": result}
    except Exception as e:
        print(f"Admin Enterprises Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch enterprises")


@admin_router.patch("/enterprises/{enterprise_id}/toggle-status")
async def toggle_enterprise_status(enterprise_id: str):
    """Toggle enterprise status between active and suspended."""
    try:
        comp = await company_col.find_one({"_id": ObjectId(enterprise_id)})
        if not comp:
            raise HTTPException(status_code=404, detail="Enterprise not found")
        new_status = "suspended" if comp.get("status", "active") == "active" else "active"
        await company_col.update_one({"_id": ObjectId(enterprise_id)}, {"$set": {"status": new_status}})
        return {"success": True, "new_status": new_status}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@admin_router.post("/enterprises/{enterprise_id}/wallet/credit")
async def admin_credit_enterprise_wallet(enterprise_id: str, req: WalletActionRequest):
    """Admin: Credit an enterprise wallet."""
    wallet = await wallets_collection.find_one({"company_id": enterprise_id})
    if not wallet:
        raise HTTPException(status_code=404, detail="Enterprise wallet not found")
    new_balance = wallet.get("balance", 0) + req.amount
    await wallets_collection.update_one({"company_id": enterprise_id}, {"$set": {"balance": new_balance}})
    await transactions_collection.insert_one({
        "company_id": enterprise_id, "sender_id": "admin", "sender_name": "Admin",
        "receiver_id": "enterprise", "amount": req.amount, "type": "credit",
        "status": "completed", "timestamp": datetime.utcnow(),
        "description": req.description or "Admin wallet credit",
        "source": "admin_panel",
    })
    return {"success": True, "new_balance": new_balance}


@admin_router.post("/enterprises/{enterprise_id}/wallet/debit")
async def admin_debit_enterprise_wallet(enterprise_id: str, req: WalletActionRequest):
    """Admin: Debit an enterprise wallet."""
    wallet = await wallets_collection.find_one({"company_id": enterprise_id})
    if not wallet:
        raise HTTPException(status_code=404, detail="Enterprise wallet not found")
    current = wallet.get("balance", 0)
    new_balance = max(0, current - req.amount)
    await wallets_collection.update_one({"company_id": enterprise_id}, {"$set": {"balance": new_balance}})
    return {"success": True, "new_balance": new_balance}


@admin_router.post("/enterprises/{enterprise_id}/wallet/freeze")
async def admin_freeze_enterprise(enterprise_id: str):
    await company_col.update_one({"_id": ObjectId(enterprise_id)}, {"$set": {"status": "suspended"}})
    return {"success": True}


@admin_router.post("/enterprises/{enterprise_id}/wallet/unfreeze")
async def admin_unfreeze_enterprise(enterprise_id: str):
    await company_col.update_one({"_id": ObjectId(enterprise_id)}, {"$set": {"status": "active"}})
    return {"success": True}


# ============ EMPLOYEES ============

@admin_router.get("/employees")
async def get_admin_employees():
    """Get all employees across all companies (from enterprise_employees_collection)."""
    try:
        cursor = enterprise_employees_collection.find({})
        result = []
        async for emp in cursor:
            company_id = emp.get("company_id", "")
            company = await company_col.find_one({"_id": ObjectId(company_id)}) if company_id else None
            result.append({
                "id": str(emp["_id"]),
                "name": f"{emp.get('first_name', '')} {emp.get('last_name', '')}".strip(),
                "email": emp.get("email", ""),
                "phone": emp.get("phone", ""),
                "role": emp.get("role", "Employee"),
                "department": emp.get("department", ""),
                "status": emp.get("status", "active"),
                "walletBalance": emp.get("wallet_balance", 0),
                "spendingLimit": emp.get("spending_limit", 0),
                "enterpriseName": company.get("legal_name", "") if company else "",
                "companyId": company_id,
                "joinedVia": "Enterprise Panel",
                "createdAt": str(emp.get("created_at", "")),
                "documents": emp.get("documents", []),
            })
        return {"success": True, "employees": result}
    except Exception as e:
        print(f"Admin Employees Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch employees")


@admin_router.patch("/employees/{employee_id}/toggle-status")
async def toggle_employee_status_admin(employee_id: str):
    """Toggle employee status."""
    try:
        emp = await enterprise_employees_collection.find_one({"_id": ObjectId(employee_id)})
        if not emp:
            raise HTTPException(status_code=404, detail="Employee not found")
        new_status = "suspended" if emp.get("status", "active") == "active" else "active"
        await enterprise_employees_collection.update_one(
            {"_id": ObjectId(employee_id)}, {"$set": {"status": new_status}}
        )
        return {"success": True, "new_status": new_status}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@admin_router.post("/employees/{employee_id}/wallet/credit")
async def admin_credit_employee_wallet(employee_id: str, req: WalletActionRequest):
    emp = await enterprise_employees_collection.find_one({"_id": ObjectId(employee_id)})
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    new_balance = emp.get("wallet_balance", 0) + req.amount
    await enterprise_employees_collection.update_one(
        {"_id": ObjectId(employee_id)}, {"$set": {"wallet_balance": new_balance}}
    )
    return {"success": True, "new_balance": new_balance}


@admin_router.post("/employees/{employee_id}/wallet/debit")
async def admin_debit_employee_wallet(employee_id: str, req: WalletActionRequest):
    emp = await enterprise_employees_collection.find_one({"_id": ObjectId(employee_id)})
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    new_balance = max(0, emp.get("wallet_balance", 0) - req.amount)
    await enterprise_employees_collection.update_one(
        {"_id": ObjectId(employee_id)}, {"$set": {"wallet_balance": new_balance}}
    )
    return {"success": True, "new_balance": new_balance}


@admin_router.post("/employees/{employee_id}/wallet/freeze")
async def admin_freeze_employee(employee_id: str):
    await enterprise_employees_collection.update_one(
        {"_id": ObjectId(employee_id)}, {"$set": {"status": "suspended"}}
    )
    return {"success": True}


@admin_router.post("/employees/{employee_id}/wallet/unfreeze")
async def admin_unfreeze_employee(employee_id: str):
    await enterprise_employees_collection.update_one(
        {"_id": ObjectId(employee_id)}, {"$set": {"status": "active"}}
    )
    return {"success": True}


# ============ INDIVIDUALS ============

@admin_router.get("/individuals")
async def get_admin_individuals():
    """Get all individual users with KYC and wallet info."""
    try:
        users = await individualusers.find({}).to_list(length=500)
        result = []
        for user in users:
            user_id = str(user["_id"])
            kyc = await individual_kyc_collection.find_one({"user_id": user_id})
            wallet = await individual_wallet_collection.find_one({"user_id": user_id})
            
            # Map KYC documents
            documents = []
            if kyc:
                if kyc.get("pan_image_path"):
                    documents.append({"name": "PAN Card", "type": "ID Proof", "path": kyc["pan_image_path"]})
                if kyc.get("aadhaar_front_path"):
                    documents.append({"name": "Aadhaar Front", "type": "Address Proof", "path": kyc["aadhaar_front_path"]})
                if kyc.get("aadhaar_back_path"):
                    documents.append({"name": "Aadhaar Back", "type": "Address Proof", "path": kyc["aadhaar_back_path"]})
                if kyc.get("selfie_path"):
                    documents.append({"name": "Selfie", "type": "Liveness Proof", "path": kyc["selfie_path"]})

            result.append({
                "id": user_id,
                "name": kyc.get("full_name", "") if kyc else "",
                "phone": user.get("phone", ""),
                "email": user.get("email", ""),
                "status": user.get("status", "active"),
                "walletBalance": wallet.get("balance", 0) if wallet else 0,
                "walletId": wallet.get("wallet_id", "") if wallet else "",
                "kycStatus": user.get("kyc_status", "PENDING"),
                "employerName": user.get("employer_name", ""),
                "createdAt": str(user.get("created_at", "")),
                "documents": documents,
            })
        return {"success": True, "individuals": result}
    except Exception as e:
        print(f"Admin Individuals Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch individuals")


@admin_router.patch("/individuals/{user_id}/toggle-status")
async def toggle_individual_status(user_id: str):
    """Toggle individual user status."""
    try:
        user = await individualusers.find_one({"_id": ObjectId(user_id)})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        new_status = "suspended" if user.get("status", "active") == "active" else "active"
        await individualusers.update_one({"_id": ObjectId(user_id)}, {"$set": {"status": new_status}})
        return {"success": True, "new_status": new_status}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@admin_router.post("/individuals/{user_id}/wallet/credit")
async def admin_credit_individual_wallet(user_id: str, req: WalletActionRequest):
    wallet = await individual_wallet_collection.find_one({"user_id": user_id})
    if not wallet:
        raise HTTPException(status_code=404, detail="Wallet not found")
    new_balance = wallet.get("balance", 0) + req.amount
    await individual_wallet_collection.update_one({"user_id": user_id}, {"$set": {"balance": new_balance}})
    await transactions_collection.insert_one({
        "wallet_id": wallet["wallet_id"], "type": "credit", "amount": req.amount,
        "description": req.description or "Admin wallet credit",
        "status": "completed", "sender_type": "admin", "created_at": datetime.utcnow(),
    })
    return {"success": True, "new_balance": new_balance}


@admin_router.post("/individuals/{user_id}/wallet/debit")
async def admin_debit_individual_wallet(user_id: str, req: WalletActionRequest):
    wallet = await individual_wallet_collection.find_one({"user_id": user_id})
    if not wallet:
        raise HTTPException(status_code=404, detail="Wallet not found")
    new_balance = max(0, wallet.get("balance", 0) - req.amount)
    await individual_wallet_collection.update_one({"user_id": user_id}, {"$set": {"balance": new_balance}})
    return {"success": True, "new_balance": new_balance}


@admin_router.post("/individuals/{user_id}/wallet/freeze")
async def admin_freeze_individual(user_id: str):
    await individual_wallet_collection.update_one({"user_id": user_id}, {"$set": {"status": "frozen"}})
    await individualusers.update_one({"_id": ObjectId(user_id)}, {"$set": {"status": "suspended"}})
    return {"success": True}


@admin_router.post("/individuals/{user_id}/wallet/unfreeze")
async def admin_unfreeze_individual(user_id: str):
    await individual_wallet_collection.update_one({"user_id": user_id}, {"$set": {"status": "active"}})
    await individualusers.update_one({"_id": ObjectId(user_id)}, {"$set": {"status": "active"}})
    return {"success": True}


# ============ TRANSACTIONS ============

@admin_router.get("/transactions/recent")
async def get_admin_transactions(limit: int = 20):
    """Get recent transactions across the platform."""
    try:
        cursor = transactions_collection.find({}).sort("created_at", -1).limit(limit)
        txns = await cursor.to_list(length=limit)
        result = []
        for tx in txns:
            sender_name = tx.get("sender_name", "")
            receiver_name = tx.get("receiver_name", "")

            # Enrich if names missing
            if not sender_name and tx.get("company_id"):
                try:
                    company = await company_col.find_one({"_id": ObjectId(tx["company_id"])})
                    if company:
                        sender_name = company.get("legal_name", "")
                except Exception:
                    pass

            recipient_wid = tx.get("recipient_wallet_id", "") or tx.get("receiver_wallet_id", "")
            if not receiver_name and recipient_wid:
                if recipient_wid.startswith("IND-"):
                    ind_wallet = await individual_wallet_collection.find_one({"wallet_id": recipient_wid})
                    if ind_wallet:
                        kyc = await individual_kyc_collection.find_one({"user_id": ind_wallet.get("user_id", "")})
                        receiver_name = kyc.get("full_name", "Individual User") if kyc else "Individual User"

            ts = tx.get("created_at") or tx.get("timestamp", "")
            result.append({
                "id": str(tx["_id"]),
                "senderName": sender_name or tx.get("sender_name", "Unknown"),
                "senderType": tx.get("sender_type", "enterprise"),
                "receiverName": receiver_name or tx.get("receiver_name", "Unknown"),
                "amount": tx.get("amount", 0),
                "type": tx.get("type", ""),
                "status": tx.get("status", ""),
                "description": tx.get("description", ""),
                "timestamp": str(ts),
            })
        return {"success": True, "transactions": result}
    except Exception as e:
        print(f"Admin Transactions Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch transactions")