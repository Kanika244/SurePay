from fastapi import APIRouter, HTTPException
from models import AdminLogin
from database import (
    company_col,
    individualusers,
    company_poc_collection,
    wallets_collection,
    individual_wallet_collection,
    individual_kyc_collection,
    transactions_collection
)
from bson import ObjectId
from datetime import datetime
import os

admin_router = APIRouter(prefix="/api/admin", tags=["Admin Auth"])

ADMIN_EMAIL = os.getenv("ADMIN_EMAIL")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD")

@admin_router.post("/login")
async def admin_login(admin: AdminLogin):
    if admin.Email != ADMIN_EMAIL or admin.Password != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return {
        "message": "Admin login successful",
        "admin_email": admin.Email,
        "token":"admin-mock-session-token"
        }


# ============ ADMIN DASHBOARD STATS ============

@admin_router.get("/stats")
async def get_admin_stats():
    """
    Get real-time dashboard statistics from the database.
    """
    try:
        # Counts
        total_enterprises = await company_col.count_documents({})
        total_individuals = await individualusers.count_documents({})
        total_employees = await company_poc_collection.count_documents({})
        total_transactions = await transactions_collection.count_documents({})

        # Wallet balances
        enterprise_wallets = await wallets_collection.find({}).to_list(length=1000)
        enterprise_wallet_total = sum(w.get("balance", 0) for w in enterprise_wallets)

        individual_wallets = await individual_wallet_collection.find({}).to_list(length=1000)
        individual_wallet_total = sum(w.get("balance", 0) for w in individual_wallets)

        total_wallet_balance = enterprise_wallet_total + individual_wallet_total

        # Top enterprises by wallet balance
        top_enterprises = []
        companies = await company_col.find({}).to_list(length=100)
        for comp in companies:
            comp_id = str(comp["_id"])
            wallet = await wallets_collection.find_one({"company_id": comp_id})
            balance = wallet.get("balance", 0) if wallet else 0
            top_enterprises.append({
                "name": comp.get("legal_name", "Unknown"),
                "volume": balance
            })
        top_enterprises.sort(key=lambda x: x["volume"], reverse=True)
        top_enterprises = top_enterprises[:5]

        # Wallet distribution for pie chart
        wallet_distribution = [
            {"name": "Enterprises", "value": enterprise_wallet_total},
            {"name": "Employees", "value": 0},  # POC wallets not tracked separately
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


@admin_router.get("/enterprises")
async def get_admin_enterprises():
    """Get all enterprises with wallet info."""
    try:
        companies = await company_col.find({}).to_list(length=100)
        result = []
        for comp in companies:
            comp_id = str(comp["_id"])
            wallet = await wallets_collection.find_one({"company_id": comp_id})
            employee_count = await company_poc_collection.count_documents({"company_id": comp_id})
            result.append({
                "id": comp_id,
                "name": comp.get("legal_name", "Unknown"),
                "email": comp.get("email", ""),
                "status": comp.get("status", "active"),
                "walletBalance": wallet.get("balance", 0) if wallet else 0,
                "industry": comp.get("industry_category", ""),
                "companyType": comp.get("company_type", ""),
                "employeeCount": employee_count,
                "companyCode": comp.get("company_code", ""),
                "createdAt": str(comp.get("created_at", "")),
            })
        return {"success": True, "enterprises": result}
    except Exception as e:
        print(f"Admin Enterprises Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch enterprises")


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
            result.append({
                "id": user_id,
                "name": kyc.get("full_name", "") if kyc else "",
                "phone": user.get("phone", ""),
                "status": "active",
                "walletBalance": wallet.get("balance", 0) if wallet else 0,
                "walletId": wallet.get("wallet_id", "") if wallet else "",
                "kycStatus": user.get("kyc_status", "PENDING"),
                "employerName": user.get("employer_name", ""),
                "createdAt": str(user.get("created_at", "")),
            })
        return {"success": True, "individuals": result}
    except Exception as e:
        print(f"Admin Individuals Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch individuals")


@admin_router.get("/employees")
async def get_admin_employees():
    """Get all employees (POCs) across companies."""
    try:
        pocs = await company_poc_collection.find({}).to_list(length=500)
        result = []
        for poc in pocs:
            company_id = poc.get("company_id", "")
            company = await company_col.find_one({"_id": ObjectId(company_id)}) if company_id else None
            result.append({
                "id": str(poc["_id"]),
                "name": poc.get("name", ""),
                "email": poc.get("email", ""),
                "phone": poc.get("phone", ""),
                "role": poc.get("role", ""),
                "status": poc.get("status", "active"),
                "enterpriseName": company.get("legal_name", "") if company else "",
                "companyId": company_id,
                "joinedVia": poc.get("joined_via", ""),
                "createdAt": str(poc.get("created_at", "")),
            })
        return {"success": True, "employees": result}
    except Exception as e:
        print(f"Admin Employees Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch employees")


@admin_router.get("/transactions/recent")
async def get_admin_transactions(limit: int = 20):
    """Get recent transactions across the platform."""
    try:
        cursor = transactions_collection.find({}).sort("created_at", -1).limit(limit)
        txns = await cursor.to_list(length=limit)
        result = []
        for tx in txns:
            # Try to resolve sender/recipient names
            sender_name = ""
            receiver_name = ""

            sender_wallet_id = tx.get("sender_wallet_id", "") or tx.get("wallet_id", "")
            recipient_wallet_id = tx.get("recipient_wallet_id", "")

            # Resolve sender
            if tx.get("company_id"):
                company = await company_col.find_one({"_id": ObjectId(tx["company_id"])})
                if company:
                    sender_name = company.get("legal_name", "")

            # Resolve recipient
            if recipient_wallet_id:
                if recipient_wallet_id.startswith("IND-"):
                    ind_wallet = await individual_wallet_collection.find_one({"wallet_id": recipient_wallet_id})
                    if ind_wallet:
                        user_id = ind_wallet.get("user_id", "")
                        kyc = await individual_kyc_collection.find_one({"user_id": user_id})
                        receiver_name = kyc.get("full_name", "Individual User") if kyc else "Individual User"
                else:
                    ent_wallet = await wallets_collection.find_one({"wallet_id": recipient_wallet_id})
                    if ent_wallet:
                        comp = await company_col.find_one({"_id": ObjectId(ent_wallet["company_id"])})
                        receiver_name = comp.get("legal_name", "") if comp else ""

            result.append({
                "id": str(tx["_id"]),
                "senderName": sender_name,
                "senderType": tx.get("sender_type", "enterprise"),
                "receiverName": receiver_name,
                "amount": tx.get("amount", 0),
                "type": tx.get("type", ""),
                "status": tx.get("status", ""),
                "description": tx.get("description", ""),
                "timestamp": str(tx.get("created_at", "")),
            })
        return {"success": True, "transactions": result}
    except Exception as e:
        print(f"Admin Transactions Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch transactions")