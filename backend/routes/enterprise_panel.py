"""
Enterprise Panel Routes
Backend APIs for the enterprise panel pages (pages/enterprise/).
Replaces mock data in EnterpriseContext with real MongoDB-backed endpoints.
"""
from fastapi import APIRouter, HTTPException
from datetime import datetime
from bson import ObjectId
from pydantic import BaseModel
from typing import Optional, List
from models import(
    EmployeeCreate,
    EmployeeUpdate,
    BulkEmployeeCreate,
    WalletAmountRequest,
    AllocateRequest,
    ProfileUpdate,
    POCUpdate,
    SettingsUpdate
)
from database import (
    company_col,
    wallets_collection,
    transactions_collection,
    enterprise_employees_collection,
    enterprise_settings_collection,
    company_poc_collection,
    individualusers,
    enterprise_notifications_collection,
)

enterprise_panel_router = APIRouter(prefix="/api/enterprise-panel", tags=["Enterprise Panel"])


# ==================== PYDANTIC MODELS ====================




def serialize_doc(doc: dict) -> dict:
    """Convert MongoDB doc to JSON-safe dict."""
    if doc and "_id" in doc:
        doc["id"] = str(doc["_id"])
        del doc["_id"]
    return doc


async def create_notification(company_id: str, title: str, message: str, notif_type: str = "info"):
    """Create a notification for an enterprise."""
    doc = {
        "company_id": company_id,
        "title": title,
        "message": message,
        "type": notif_type,  # info, success, warning, alert
        "read": False,
        "created_at": datetime.utcnow(),
    }
    await enterprise_notifications_collection.insert_one(doc)


def serialize_employee(doc: dict) -> dict:
    """Convert employee MongoDB doc to frontend-compatible format."""
    if not doc:
        return doc
    return {
        "id": str(doc["_id"]),
        "employeeId": doc.get("employee_id", ""),
        "firstName": doc.get("first_name", ""),
        "lastName": doc.get("last_name", ""),
        "email": doc.get("email", ""),
        "phone": doc.get("phone", ""),
        "dateOfBirth": doc.get("date_of_birth", ""),
        "gender": doc.get("gender", "Other"),
        "department": doc.get("department", ""),
        "designation": doc.get("designation", ""),
        "role": doc.get("role", "Employee"),
        "dateOfJoining": doc.get("date_of_joining", ""),
        "employmentType": doc.get("employment_type", "Full-time"),
        "govIdType": doc.get("gov_id_type", ""),
        "govIdNumber": doc.get("gov_id_number", ""),
        "profilePhoto": doc.get("profile_photo"),
        "documents": doc.get("documents", []),
        "walletBalance": doc.get("wallet_balance", 0),
        "spendingLimit": doc.get("spending_limit", 50000),
        "salaryBand": doc.get("salary_band", ""),
        "status": doc.get("status", "active"),
        "kycVerified": doc.get("kyc_verified", False),
        "twoFactorEnabled": doc.get("two_factor_enabled", False),
        "lastLogin": doc.get("last_login", "Never"),
        "createdAt": doc.get("created_at", ""),
    }


def serialize_transaction(doc: dict) -> dict:
    """Convert transaction MongoDB doc to frontend-compatible format."""
    if not doc:
        return doc
    ts = doc.get("timestamp") or doc.get("created_at")
    if isinstance(ts, datetime):
        ts = ts.strftime("%Y-%m-%d %H:%M:%S")
    return {
        "id": str(doc["_id"]),
        "senderId": doc.get("sender_id", ""),
        "senderName": doc.get("sender_name", ""),
        "receiverId": doc.get("receiver_id", ""),
        "receiverName": doc.get("receiver_name", ""),
        "amount": doc.get("amount", 0),
        "type": doc.get("type", ""),
        "status": doc.get("status", ""),
        "timestamp": ts or "",
        "description": doc.get("description", ""),
    }


# ==================== EMPLOYEES ====================

@enterprise_panel_router.get("/employees/{company_id}")
async def list_employees(company_id: str):
    """Get all employees for a company."""
    cursor = enterprise_employees_collection.find({"company_id": company_id})
    employees = []
    async for doc in cursor:
        employees.append(serialize_employee(doc))
    return {"success": True, "employees": employees}


@enterprise_panel_router.post("/employees/{company_id}")
async def add_employee(company_id: str, emp: EmployeeCreate):
    """Add a single employee."""
    # Check duplicate email
    existing = await enterprise_employees_collection.find_one({
        "company_id": company_id, "email": emp.email
    })
    if existing:
        raise HTTPException(status_code=400, detail="Employee with this email already exists")

    # Cross-check: does this employee already exist as an individual user?
    clean_phone = emp.phone.strip().replace(" ", "").replace("-", "")
    if clean_phone.startswith("+91"):
        clean_phone = clean_phone[3:]
    if clean_phone.startswith("91") and len(clean_phone) > 10:
        clean_phone = clean_phone[2:]
    
    match_filter = {"$or": []}
    if emp.email:
        match_filter["$or"].append({"email": emp.email})
    if clean_phone:
        match_filter["$or"].append({"phone": {"$regex": f".*{clean_phone}$"}})
    
    is_verified = False
    if match_filter["$or"]:
        existing_user = await individualusers.find_one(match_filter)
        if existing_user:
            is_verified = True

    now = datetime.utcnow().strftime("%Y-%m-%d")
    doc = {
        "company_id": company_id,
        "employee_id": emp.employee_id,
        "first_name": emp.first_name,
        "last_name": emp.last_name,
        "email": emp.email,
        "phone": emp.phone,
        "date_of_birth": emp.date_of_birth,
        "gender": emp.gender,
        "department": emp.department,
        "designation": emp.designation,
        "role": emp.role,
        "date_of_joining": emp.date_of_joining or now,
        "employment_type": emp.employment_type,
        "gov_id_type": emp.gov_id_type,
        "gov_id_number": emp.gov_id_number,
        "documents": [],
        "wallet_balance": emp.wallet_balance,
        "spending_limit": emp.spending_limit,
        "salary_band": emp.salary_band,
        "status": "active",
        "kyc_verified": is_verified,
        "two_factor_enabled": emp.two_factor_enabled,
        "last_login": "Never",
        "created_at": now,
    }
    result = await enterprise_employees_collection.insert_one(doc)
    doc["_id"] = result.inserted_id

    # Auto-generate notification
    name = f"{emp.first_name} {emp.last_name}"
    verified_msg = " (KYC Verified)" if is_verified else ""
    await create_notification(
        company_id, "Employee Added",
        f"New employee {name} has been added{verified_msg}",
        "success"
    )

    return {"success": True, "employee": serialize_employee(doc)}


@enterprise_panel_router.post("/employees/{company_id}/bulk")
async def bulk_add_employees(company_id: str, req: BulkEmployeeCreate):
    """Bulk add employees."""
    now = datetime.utcnow().strftime("%Y-%m-%d")
    docs = []
    for emp in req.employees:
        # Cross-check against individual users
        clean_phone = emp.phone.strip().replace(" ", "").replace("-", "")
        if clean_phone.startswith("+91"):
            clean_phone = clean_phone[3:]
        if clean_phone.startswith("91") and len(clean_phone) > 10:
            clean_phone = clean_phone[2:]
        
        match_filter = {"$or": []}
        if emp.email:
            match_filter["$or"].append({"email": emp.email})
        if clean_phone:
            match_filter["$or"].append({"phone": {"$regex": f".*{clean_phone}$"}})
        
        is_verified = False
        if match_filter["$or"]:
            existing_user = await individualusers.find_one(match_filter)
            if existing_user:
                is_verified = True

        docs.append({
            "company_id": company_id,
            "employee_id": emp.employee_id,
            "first_name": emp.first_name,
            "last_name": emp.last_name,
            "email": emp.email,
            "phone": emp.phone,
            "date_of_birth": emp.date_of_birth,
            "gender": emp.gender,
            "department": emp.department,
            "designation": emp.designation,
            "role": emp.role,
            "date_of_joining": emp.date_of_joining or now,
            "employment_type": emp.employment_type,
            "gov_id_type": emp.gov_id_type,
            "gov_id_number": emp.gov_id_number,
            "documents": [],
            "wallet_balance": emp.wallet_balance,
            "spending_limit": emp.spending_limit,
            "salary_band": emp.salary_band,
            "status": "active",
            "kyc_verified": is_verified,
            "two_factor_enabled": emp.two_factor_enabled,
            "last_login": "Never",
            "created_at": now,
        })

    if docs:
        result = await enterprise_employees_collection.insert_many(docs)
        # Fetch inserted docs for response
        inserted = []
        for doc_id in result.inserted_ids:
            doc = await enterprise_employees_collection.find_one({"_id": doc_id})
            if doc:
                inserted.append(serialize_employee(doc))
        # Auto-generate notification
        verified_count = sum(1 for d in docs if d.get("kyc_verified"))
        msg = f"{len(inserted)} employees added via bulk upload"
        if verified_count > 0:
            msg += f" ({verified_count} already KYC verified)"
        await create_notification(company_id, "Bulk Onboarding", msg, "success")

        return {"success": True, "count": len(inserted), "employees": inserted}

    return {"success": True, "count": 0, "employees": []}


@enterprise_panel_router.put("/employees/{employee_id}")
async def update_employee(employee_id: str, data: EmployeeUpdate):
    """Update an employee's details."""
    update_fields = {}
    for key, val in data.dict(exclude_unset=True).items():
        if val is not None:
            update_fields[key] = val

    if not update_fields:
        raise HTTPException(status_code=400, detail="No fields to update")

    try:
        result = await enterprise_employees_collection.update_one(
            {"_id": ObjectId(employee_id)},
            {"$set": update_fields}
        )
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Employee not found")

        doc = await enterprise_employees_collection.find_one({"_id": ObjectId(employee_id)})
        return {"success": True, "employee": serialize_employee(doc)}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@enterprise_panel_router.delete("/employees/{employee_id}")
async def delete_employee(employee_id: str):
    """Delete an employee."""
    try:
        result = await enterprise_employees_collection.delete_one({"_id": ObjectId(employee_id)})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Employee not found")
        return {"success": True, "message": "Employee deleted"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@enterprise_panel_router.patch("/employees/{employee_id}/toggle-status")
async def toggle_employee_status(employee_id: str):
    """Toggle employee status between active and suspended."""
    try:
        doc = await enterprise_employees_collection.find_one({"_id": ObjectId(employee_id)})
        if not doc:
            raise HTTPException(status_code=404, detail="Employee not found")

        new_status = "suspended" if doc.get("status") == "active" else "active"
        await enterprise_employees_collection.update_one(
            {"_id": ObjectId(employee_id)},
            {"$set": {"status": new_status}}
        )
        return {"success": True, "new_status": new_status}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# ==================== EMPLOYEE WALLET OPS ====================

@enterprise_panel_router.post("/employees/{employee_id}/wallet/credit")
async def credit_employee_wallet(employee_id: str, req: WalletAmountRequest):
    """Credit an employee's wallet."""
    if req.amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be positive")

    try:
        doc = await enterprise_employees_collection.find_one({"_id": ObjectId(employee_id)})
        if not doc:
            raise HTTPException(status_code=404, detail="Employee not found")

        new_balance = doc.get("wallet_balance", 0) + req.amount
        await enterprise_employees_collection.update_one(
            {"_id": ObjectId(employee_id)},
            {"$set": {"wallet_balance": new_balance}}
        )

        # Log transaction
        company_id = doc.get("company_id")
        await transactions_collection.insert_one({
            "company_id": company_id,
            "sender_id": "enterprise",
            "sender_name": "Enterprise",
            "receiver_id": employee_id,
            "receiver_name": f"{doc.get('first_name', '')} {doc.get('last_name', '')}",
            "amount": req.amount,
            "type": "credit",
            "status": "completed",
            "timestamp": datetime.utcnow(),
            "description": req.description or "Wallet credit by enterprise",
            "source": "enterprise_panel",
        })

        return {"success": True, "new_balance": new_balance}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@enterprise_panel_router.post("/employees/{employee_id}/wallet/debit")
async def debit_employee_wallet(employee_id: str, req: WalletAmountRequest):
    """Debit an employee's wallet."""
    if req.amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be positive")

    try:
        doc = await enterprise_employees_collection.find_one({"_id": ObjectId(employee_id)})
        if not doc:
            raise HTTPException(status_code=404, detail="Employee not found")

        new_balance = max(0, doc.get("wallet_balance", 0) - req.amount)
        await enterprise_employees_collection.update_one(
            {"_id": ObjectId(employee_id)},
            {"$set": {"wallet_balance": new_balance}}
        )

        return {"success": True, "new_balance": new_balance}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@enterprise_panel_router.post("/employees/{employee_id}/wallet/freeze")
async def freeze_employee_wallet(employee_id: str):
    """Freeze an employee's wallet (set status to suspended)."""
    try:
        result = await enterprise_employees_collection.update_one(
            {"_id": ObjectId(employee_id)},
            {"$set": {"status": "suspended"}}
        )
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Employee not found")
        return {"success": True, "message": "Wallet frozen"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@enterprise_panel_router.post("/employees/{employee_id}/wallet/unfreeze")
async def unfreeze_employee_wallet(employee_id: str):
    """Unfreeze an employee's wallet (set status to active)."""
    try:
        result = await enterprise_employees_collection.update_one(
            {"_id": ObjectId(employee_id)},
            {"$set": {"status": "active"}}
        )
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Employee not found")
        return {"success": True, "message": "Wallet unfrozen"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# ==================== ENTERPRISE WALLET ====================

@enterprise_panel_router.get("/wallet/{company_id}")
async def get_enterprise_wallet(company_id: str):
    """Get enterprise wallet balance."""
    wallet = await wallets_collection.find_one({"company_id": company_id})
    if not wallet:
        # Create a default wallet if none exists
        wallet_doc = {
            "company_id": company_id,
            "wallet_id": f"ENT-{company_id[:8].upper()}",
            "balance": 0,
            "currency": "INR",
            "status": "active",
            "created_at": datetime.utcnow(),
        }
        await wallets_collection.insert_one(wallet_doc)
        return {"success": True, "balance": 0, "wallet_id": wallet_doc["wallet_id"]}

    return {
        "success": True,
        "balance": wallet.get("balance", 0),
        "wallet_id": wallet.get("wallet_id", ""),
    }


@enterprise_panel_router.post("/wallet/{company_id}/add-funds")
async def add_funds(company_id: str, req: WalletAmountRequest):
    """Add funds to enterprise wallet."""
    if req.amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be positive")

    wallet = await wallets_collection.find_one({"company_id": company_id})
    if not wallet:
        # Create wallet
        wallet_doc = {
            "company_id": company_id,
            "wallet_id": f"ENT-{company_id[:8].upper()}",
            "balance": req.amount,
            "currency": "INR",
            "status": "active",
            "created_at": datetime.utcnow(),
        }
        await wallets_collection.insert_one(wallet_doc)
        new_balance = req.amount
    else:
        new_balance = wallet.get("balance", 0) + req.amount
        await wallets_collection.update_one(
            {"company_id": company_id},
            {"$set": {"balance": new_balance, "updated_at": datetime.utcnow()}}
        )

    # Log transaction
    company = await company_col.find_one({"_id": ObjectId(company_id)})
    company_name = company.get("legal_name", "Enterprise") if company else "Enterprise"

    await transactions_collection.insert_one({
        "company_id": company_id,
        "sender_id": "external",
        "sender_name": "Bank Transfer",
        "receiver_id": "enterprise",
        "receiver_name": company_name,
        "amount": req.amount,
        "type": "credit",
        "status": "completed",
        "timestamp": datetime.utcnow(),
        "description": req.description or "Funds added to enterprise wallet",
        "source": "enterprise_panel",
    })

    await create_notification(
        company_id, "Funds Added",
        f"₹{req.amount:,.0f} has been added to enterprise wallet",
        "success"
    )

    return {"success": True, "new_balance": new_balance}


@enterprise_panel_router.post("/wallet/{company_id}/withdraw")
async def withdraw_funds(company_id: str, req: WalletAmountRequest):
    """Withdraw funds from enterprise wallet."""
    if req.amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be positive")

    wallet = await wallets_collection.find_one({"company_id": company_id})
    if not wallet:
        raise HTTPException(status_code=404, detail="Wallet not found")

    current = wallet.get("balance", 0)
    if req.amount > current:
        raise HTTPException(status_code=400, detail="Insufficient balance")

    new_balance = current - req.amount
    await wallets_collection.update_one(
        {"company_id": company_id},
        {"$set": {"balance": new_balance, "updated_at": datetime.utcnow()}}
    )

    company = await company_col.find_one({"_id": ObjectId(company_id)})
    company_name = company.get("legal_name", "Enterprise") if company else "Enterprise"

    await transactions_collection.insert_one({
        "company_id": company_id,
        "sender_id": "enterprise",
        "sender_name": company_name,
        "receiver_id": "external",
        "receiver_name": "Bank Transfer",
        "amount": req.amount,
        "type": "debit",
        "status": "completed",
        "timestamp": datetime.utcnow(),
        "description": req.description or "Funds withdrawn from enterprise wallet",
        "source": "enterprise_panel",
    })

    await create_notification(
        company_id, "Funds Withdrawn",
        f"₹{req.amount:,.0f} has been withdrawn from enterprise wallet",
        "info"
    )

    return {"success": True, "new_balance": new_balance}


@enterprise_panel_router.post("/wallet/{company_id}/allocate")
async def allocate_to_employee(company_id: str, req: AllocateRequest):
    """Allocate funds from enterprise wallet to an employee wallet."""
    if req.amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be positive")

    # Check enterprise balance
    wallet = await wallets_collection.find_one({"company_id": company_id})
    if not wallet:
        raise HTTPException(status_code=404, detail="Enterprise wallet not found")

    current = wallet.get("balance", 0)
    if req.amount > current:
        raise HTTPException(status_code=400, detail="Insufficient enterprise balance")

    # Find employee
    try:
        emp = await enterprise_employees_collection.find_one({"_id": ObjectId(req.employee_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid employee ID")

    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")

    # Deduct from enterprise
    new_ent_balance = current - req.amount
    await wallets_collection.update_one(
        {"company_id": company_id},
        {"$set": {"balance": new_ent_balance, "updated_at": datetime.utcnow()}}
    )

    # Credit employee
    new_emp_balance = emp.get("wallet_balance", 0) + req.amount
    await enterprise_employees_collection.update_one(
        {"_id": ObjectId(req.employee_id)},
        {"$set": {"wallet_balance": new_emp_balance}}
    )

    # Log transaction
    company = await company_col.find_one({"_id": ObjectId(company_id)})
    company_name = company.get("legal_name", "Enterprise") if company else "Enterprise"

    await transactions_collection.insert_one({
        "company_id": company_id,
        "sender_id": "enterprise",
        "sender_name": company_name,
        "receiver_id": req.employee_id,
        "receiver_name": f"{emp.get('first_name', '')} {emp.get('last_name', '')}",
        "amount": req.amount,
        "type": "transfer",
        "status": "completed",
        "timestamp": datetime.utcnow(),
        "description": req.description or "Fund allocation to employee wallet",
        "source": "enterprise_panel",
    })

    emp_name = f"{emp.get('first_name', '')} {emp.get('last_name', '')}"
    await create_notification(
        company_id, "Funds Allocated",
        f"₹{req.amount:,.0f} allocated to {emp_name}",
        "info"
    )

    return {"success": True, "enterprise_balance": new_ent_balance, "employee_balance": new_emp_balance}


# ==================== TRANSACTIONS ====================

@enterprise_panel_router.get("/transactions/{company_id}")
async def list_transactions(company_id: str, limit: int = 100):
    """Get transactions for a company (enterprise panel format)."""
    cursor = transactions_collection.find(
        {"company_id": company_id}
    ).sort("timestamp", -1).limit(limit)

    txns = []
    async for doc in cursor:
        txns.append(serialize_transaction(doc))

    return {"success": True, "transactions": txns}


# ==================== PROFILE ====================

@enterprise_panel_router.get("/profile/{company_id}")
async def get_profile(company_id: str):
    """Get company profile with POC info."""
    try:
        company = await company_col.find_one({"_id": ObjectId(company_id)})
        if not company:
            raise HTTPException(status_code=404, detail="Company not found")

        # Get POC (first one)
        poc = await company_poc_collection.find_one({"company_id": company_id})

        # Get wallet
        wallet = await wallets_collection.find_one({"company_id": company_id})

        profile = {
            "companyName": company.get("legal_name", ""),
            "registrationNumber": company.get("registration_number", ""),
            "gstNumber": company.get("gst_number", ""),
            "businessType": company.get("company_type", ""),
            "industry": company.get("industry_category", ""),
            "website": company.get("website", ""),
            "registeredAddress": company.get("registered_address", ""),
            "documents": company.get("documents", []),
            "walletId": wallet.get("wallet_id") if wallet else None,
            "poc": {
                "name": poc.get("name", "") if poc else "",
                "email": poc.get("email", "") if poc else "",
                "phone": poc.get("phone", "") if poc else "",
                "designation": poc.get("designation", "") if poc else "",
                "kycDocuments": poc.get("kyc_documents", []) if poc else [],
                "status": poc.get("status", "pending") if poc else "pending",
            }
        }

        return {"success": True, "profile": profile}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@enterprise_panel_router.put("/profile/{company_id}")
async def update_profile(company_id: str, data: ProfileUpdate):
    """Update company profile."""
    update_fields = {}
    field_mapping = {
        "company_name": "legal_name",
        "registration_number": "registration_number",
        "gst_number": "gst_number",
        "business_type": "company_type",
        "industry": "industry_category",
        "website": "website",
        "registered_address": "registered_address",
    }

    for pydantic_field, db_field in field_mapping.items():
        val = getattr(data, pydantic_field, None)
        if val is not None:
            update_fields[db_field] = val

    if not update_fields:
        raise HTTPException(status_code=400, detail="No fields to update")

    update_fields["updated_at"] = datetime.utcnow()

    try:
        result = await company_col.update_one(
            {"_id": ObjectId(company_id)},
            {"$set": update_fields}
        )
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Company not found")

        return {"success": True, "message": "Profile updated"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@enterprise_panel_router.put("/profile/{company_id}/poc")
async def update_poc(company_id: str, data: POCUpdate):
    """Update POC info."""
    update_fields = {}
    for key, val in data.dict(exclude_unset=True).items():
        if val is not None:
            update_fields[key] = val

    if not update_fields:
        raise HTTPException(status_code=400, detail="No fields to update")

    # Find or create POC
    poc = await company_poc_collection.find_one({"company_id": company_id})
    if poc:
        await company_poc_collection.update_one(
            {"company_id": company_id},
            {"$set": update_fields}
        )
    else:
        update_fields["company_id"] = company_id
        update_fields["created_at"] = datetime.utcnow()
        await company_poc_collection.insert_one(update_fields)

    return {"success": True, "message": "POC updated"}


# ==================== SETTINGS ====================

@enterprise_panel_router.get("/settings/{company_id}")
async def get_settings(company_id: str):
    """Get enterprise settings."""
    settings = await enterprise_settings_collection.find_one({"company_id": company_id})

    if not settings:
        # Return defaults
        return {
            "success": True,
            "settings": {
                "defaultWalletLimit": 50000,
                "defaultSpendingLimit": 30000,
                "approvalWorkflow": False,
                "emailNotifications": True,
                "transactionAlerts": True,
                "lowBalanceAlert": True,
                "lowBalanceThreshold": 10000,
                "twoFactorRequired": False,
                "sessionTimeout": "30",
                "ipWhitelist": "",
            }
        }

    return {
        "success": True,
        "settings": {
            "defaultWalletLimit": settings.get("default_wallet_limit", 50000),
            "defaultSpendingLimit": settings.get("default_spending_limit", 30000),
            "approvalWorkflow": settings.get("approval_workflow", False),
            "emailNotifications": settings.get("email_notifications", True),
            "transactionAlerts": settings.get("transaction_alerts", True),
            "lowBalanceAlert": settings.get("low_balance_alert", True),
            "lowBalanceThreshold": settings.get("low_balance_threshold", 10000),
            "twoFactorRequired": settings.get("two_factor_required", False),
            "sessionTimeout": settings.get("session_timeout", "30"),
            "ipWhitelist": settings.get("ip_whitelist", ""),
        }
    }


@enterprise_panel_router.put("/settings/{company_id}")
async def update_settings(company_id: str, data: SettingsUpdate):
    """Save enterprise settings."""
    update_fields = {}
    for key, val in data.dict(exclude_unset=True).items():
        if val is not None:
            update_fields[key] = val

    if not update_fields:
        raise HTTPException(status_code=400, detail="No fields to update")

    update_fields["updated_at"] = datetime.utcnow()

    # Upsert
    existing = await enterprise_settings_collection.find_one({"company_id": company_id})
    if existing:
        await enterprise_settings_collection.update_one(
            {"company_id": company_id},
            {"$set": update_fields}
        )
    else:
        update_fields["company_id"] = company_id
        await enterprise_settings_collection.insert_one(update_fields)

    return {"success": True, "message": "Settings saved"}


# ==================== ANALYTICS ====================

@enterprise_panel_router.get("/analytics/{company_id}")
async def get_analytics(company_id: str):
    """Get aggregate analytics for enterprise dashboard and analytics page."""
    try:
        # Employee stats
        total_employees = await enterprise_employees_collection.count_documents({"company_id": company_id})
        active_employees = await enterprise_employees_collection.count_documents({"company_id": company_id, "status": "active"})
        suspended_employees = await enterprise_employees_collection.count_documents({"company_id": company_id, "status": "suspended"})

        # Employee wallet totals
        emp_cursor = enterprise_employees_collection.find({"company_id": company_id})
        total_emp_balance = 0
        async for emp in emp_cursor:
            total_emp_balance += emp.get("wallet_balance", 0)

        # Enterprise wallet
        wallet = await wallets_collection.find_one({"company_id": company_id})
        enterprise_balance = wallet.get("balance", 0) if wallet else 0

        # Transaction stats
        tx_cursor = transactions_collection.find({"company_id": company_id})
        total_sent = 0
        total_received = 0
        tx_count = 0
        async for tx in tx_cursor:
            amount = tx.get("amount", 0)
            if tx.get("sender_id") == "enterprise":
                total_sent += amount
            if tx.get("receiver_id") == "enterprise":
                total_received += amount
            tx_count += 1

        return {
            "success": True,
            "analytics": {
                "totalEmployees": total_employees,
                "activeEmployees": active_employees,
                "suspendedEmployees": suspended_employees,
                "totalEmployeeBalance": total_emp_balance,
                "enterpriseBalance": enterprise_balance,
                "totalSent": total_sent,
                "totalReceived": total_received,
                "transactionCount": tx_count,
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==================== NOTIFICATIONS ====================

def serialize_notification(doc: dict) -> dict:
    """Convert notification MongoDB doc to frontend-compatible format."""
    if not doc:
        return doc
    ts = doc.get("created_at")
    if isinstance(ts, datetime):
        ts = ts.isoformat()
    return {
        "id": str(doc["_id"]),
        "title": doc.get("title", ""),
        "message": doc.get("message", ""),
        "type": doc.get("type", "info"),
        "read": doc.get("read", False),
        "createdAt": ts or "",
    }


@enterprise_panel_router.get("/notifications/{company_id}")
async def list_notifications(company_id: str, limit: int = 50):
    """Get notifications for a company (newest first)."""
    cursor = enterprise_notifications_collection.find(
        {"company_id": company_id}
    ).sort("created_at", -1).limit(limit)

    notifications = []
    async for doc in cursor:
        notifications.append(serialize_notification(doc))

    unread_count = await enterprise_notifications_collection.count_documents(
        {"company_id": company_id, "read": False}
    )

    return {"success": True, "notifications": notifications, "unreadCount": unread_count}


@enterprise_panel_router.patch("/notifications/{notification_id}/read")
async def mark_notification_read(notification_id: str):
    """Mark a single notification as read."""
    try:
        result = await enterprise_notifications_collection.update_one(
            {"_id": ObjectId(notification_id)},
            {"$set": {"read": True}}
        )
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Notification not found")
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@enterprise_panel_router.patch("/notifications/{company_id}/read-all")
async def mark_all_notifications_read(company_id: str):
    """Mark all notifications as read for a company."""
    await enterprise_notifications_collection.update_many(
        {"company_id": company_id, "read": False},
        {"$set": {"read": True}}
    )
    return {"success": True}


# ==================== ERP INTEGRATION MANAGEMENT ====================

@enterprise_panel_router.post("/integration/{company_id}/generate-key")
async def dashboard_generate_key(company_id: str):
    """Generate an API key for ERP integration (dashboard-facing)."""
    from database import api_keys_collection
    from utils.api_key import generate_api_key, hash_api_key

    existing = await api_keys_collection.find_one({"company_id": company_id, "is_active": True})
    if existing:
        raise HTTPException(status_code=400, detail="Active API key already exists. Revoke it first.")

    api_key = generate_api_key()
    hashed = hash_api_key(api_key)

    # Get company name
    company = await company_col.find_one({"company_id": company_id})
    company_name = company.get("company_name", "") if company else ""

    await api_keys_collection.insert_one({
        "company_id": company_id,
        "company_name": company_name,
        "hashed_key": hashed,
        "is_active": True,
        "created_at": datetime.utcnow()
    })

    await create_notification(company_id, "API Key Generated", "A new ERP integration API key has been generated.", "info")

    return {"success": True, "api_key": api_key, "message": "Save this key securely. It will not be shown again."}


@enterprise_panel_router.get("/integration/{company_id}/key-status")
async def dashboard_key_status(company_id: str):
    """Check if an API key exists for this company."""
    from database import api_keys_collection

    key_doc = await api_keys_collection.find_one({"company_id": company_id, "is_active": True})
    if not key_doc:
        return {"has_key": False}

    return {
        "has_key": True,
        "created_at": key_doc.get("created_at", "").isoformat() if key_doc.get("created_at") else None,
    }


@enterprise_panel_router.delete("/integration/{company_id}/revoke-key")
async def dashboard_revoke_key(company_id: str):
    """Revoke the API key for this company."""
    from database import api_keys_collection

    result = await api_keys_collection.update_one(
        {"company_id": company_id, "is_active": True},
        {"$set": {"is_active": False, "revoked_at": datetime.utcnow()}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="No active key found")

    await create_notification(company_id, "API Key Revoked", "ERP integration API key has been revoked.", "warning")
    return {"success": True}


@enterprise_panel_router.get("/integration/{company_id}/webhook-status")
async def dashboard_webhook_status(company_id: str):
    """Get webhook configuration for this company."""
    from database import erp_webhooks_collection

    webhook = await erp_webhooks_collection.find_one({"company_id": company_id})
    if not webhook:
        return {"has_webhook": False}

    return {
        "has_webhook": True,
        "url": webhook.get("url", ""),
        "events": webhook.get("events", []),
        "updated_at": webhook.get("updated_at", "").isoformat() if webhook.get("updated_at") else None,
    }


@enterprise_panel_router.post("/integration/{company_id}/webhook")
async def dashboard_register_webhook(company_id: str, body: dict):
    """Register or update a webhook for this company."""
    from database import erp_webhooks_collection

    url = body.get("url", "")
    events = body.get("events", [])
    if not url:
        raise HTTPException(status_code=400, detail="Webhook URL is required")

    await erp_webhooks_collection.update_one(
        {"company_id": company_id},
        {"$set": {
            "company_id": company_id,
            "url": url,
            "events": events,
            "updated_at": datetime.utcnow()
        }},
        upsert=True
    )

    await create_notification(company_id, "Webhook Updated", f"ERP webhook registered: {url}", "info")
    return {"success": True}


@enterprise_panel_router.delete("/integration/{company_id}/webhook")
async def dashboard_remove_webhook(company_id: str):
    """Remove webhook for this company."""
    from database import erp_webhooks_collection

    await erp_webhooks_collection.delete_one({"company_id": company_id})
    return {"success": True}
