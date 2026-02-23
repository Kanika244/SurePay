"""
Enterprise Dashboard Routes
Handles dashboard stats, transactions, wallet operations, and team management.
"""
from fastapi import APIRouter, HTTPException, Form
from datetime import datetime
from bson import ObjectId
from pydantic import BaseModel
from typing import Optional
from database import (
    company_col, 
    wallets_collection, 
    transactions_collection,
    company_poc_collection,
    individual_wallet_collection
)
from models import AddMoneyRequest , TransferRequest
enterprise_router = APIRouter(prefix="/api/enterprise", tags=["Enterprise"])


# ============ DASHBOARD ============

@enterprise_router.get("/dashboard/{company_id}")
async def get_dashboard_stats(company_id: str):
    """
    Get dashboard statistics for an enterprise.
    """
    try:
        # Get company info
        company = await company_col.find_one({"_id": ObjectId(company_id)})
        if not company:
            raise HTTPException(status_code=404, detail="Company not found")
        
        # Get wallet balance
        wallet = await wallets_collection.find_one({"company_id": company_id})
        wallet_balance = wallet.get("balance", 0) if wallet else 0
        
        # Get transaction count
        tx_count = await transactions_collection.count_documents({"company_id": company_id})
        
        # Get team members count
        team_count = await company_poc_collection.count_documents({"company_id": company_id})
        
        # Get pending approvals (transactions with pending status)
        pending_count = await transactions_collection.count_documents({
            "company_id": company_id,
            "status": "pending"
        })
        
        return {
            "success": True,
            "company_name": company.get("legal_name", ""),
            "stats": {
                "wallet_balance": wallet_balance,
                "total_transactions": tx_count,
                "team_members": team_count,
                "pending_approvals": pending_count
            },
            "wallet_id": wallet.get("wallet_id") if wallet else None
        }
    except Exception as e:
        print(f"Dashboard error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============ WALLET ============

@enterprise_router.get("/wallet/{company_id}")
async def get_wallet(company_id: str):
    """
    Get wallet details for a company.
    """
    wallet = await wallets_collection.find_one({"company_id": company_id})
    if not wallet:
        raise HTTPException(status_code=404, detail="Wallet not found")
    
    return {
        "success": True,
        "wallet_id": wallet.get("wallet_id"),
        "balance": wallet.get("balance", 0),
        "currency": wallet.get("currency", "INR"),
        "status": wallet.get("status", "active")
    }


@enterprise_router.post("/wallet/add-money")
async def add_money(request: AddMoneyRequest):
    """
    Add money to enterprise wallet.
    """
    if request.amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be positive")
    
    # Find wallet
    wallet = await wallets_collection.find_one({"company_id": request.company_id})
    if not wallet:
        raise HTTPException(status_code=404, detail="Wallet not found")
    
    # Update balance
    new_balance = wallet.get("balance", 0) + request.amount
    await wallets_collection.update_one(
        {"company_id": request.company_id},
        {"$set": {"balance": new_balance, "updated_at": datetime.utcnow()}}
    )
    
    # Create transaction record
    transaction = {
        "company_id": request.company_id,
        "wallet_id": wallet.get("wallet_id"),
        "type": "credit",
        "amount": request.amount,
        "description": request.description,
        "status": "completed",
        "created_at": datetime.utcnow()
    }
    await transactions_collection.insert_one(transaction)
    
    return {
        "success": True,
        "message": "Money added successfully",
        "new_balance": new_balance
    }


@enterprise_router.post("/wallet/transfer")
async def transfer_money(request: TransferRequest):
    """
    Transfer money to another wallet (enterprise or individual).
    """
    if request.amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be positive")
    
    # Find sender wallet (enterprise)
    sender_wallet = await wallets_collection.find_one({"company_id": request.company_id})
    if not sender_wallet:
        raise HTTPException(status_code=404, detail="Sender wallet not found")
    
    # Check balance
    if sender_wallet.get("balance", 0) < request.amount:
        raise HTTPException(status_code=400, detail="Insufficient balance")
    
    # Check if recipient is an individual wallet (starts with IND-)
    is_individual_recipient = request.recipient_wallet_id.startswith("IND-")
    
    if is_individual_recipient:
        # Find individual wallet
        recipient_wallet = await individual_wallet_collection.find_one({"wallet_id": request.recipient_wallet_id})
        if not recipient_wallet:
            raise HTTPException(status_code=404, detail="Individual wallet not found")
        
        # Deduct from sender (enterprise)
        sender_new_balance = sender_wallet.get("balance", 0) - request.amount
        await wallets_collection.update_one(
            {"company_id": request.company_id},
            {"$set": {"balance": sender_new_balance, "updated_at": datetime.utcnow()}}
        )
        
        # Add to recipient (individual wallet)
        recipient_new_balance = recipient_wallet.get("balance", 0) + request.amount
        await individual_wallet_collection.update_one(
            {"wallet_id": request.recipient_wallet_id},
            {"$set": {"balance": recipient_new_balance, "updated_at": datetime.utcnow()}}
        )
        
        # Create debit transaction for sender (enterprise)
        await transactions_collection.insert_one({
            "company_id": request.company_id,
            "wallet_id": sender_wallet.get("wallet_id"),
            "type": "debit",
            "amount": request.amount,
            "description": request.description,
            "recipient_wallet_id": request.recipient_wallet_id,
            "recipient_type": "individual",
            "status": "completed",
            "created_at": datetime.utcnow()
        })
        
        # Create credit transaction for individual recipient
        await transactions_collection.insert_one({
            "user_id": recipient_wallet.get("user_id"),
            "wallet_id": request.recipient_wallet_id,
            "type": "credit",
            "amount": request.amount,
            "description": f"Payment from {sender_wallet.get('wallet_id')}",
            "sender_wallet_id": sender_wallet.get("wallet_id"),
            "sender_type": "enterprise",
            "status": "completed",
            "created_at": datetime.utcnow()
        })
    else:
        # Enterprise-to-enterprise transfer
        recipient_wallet = await wallets_collection.find_one({"wallet_id": request.recipient_wallet_id})
        if not recipient_wallet:
            raise HTTPException(status_code=404, detail="Recipient wallet not found")
        
        # Deduct from sender
        sender_new_balance = sender_wallet.get("balance", 0) - request.amount
        await wallets_collection.update_one(
            {"company_id": request.company_id},
            {"$set": {"balance": sender_new_balance, "updated_at": datetime.utcnow()}}
        )
        
        # Add to recipient
        recipient_new_balance = recipient_wallet.get("balance", 0) + request.amount
        await wallets_collection.update_one(
            {"wallet_id": request.recipient_wallet_id},
            {"$set": {"balance": recipient_new_balance, "updated_at": datetime.utcnow()}}
        )
        
        # Create debit transaction for sender
        await transactions_collection.insert_one({
            "company_id": request.company_id,
            "wallet_id": sender_wallet.get("wallet_id"),
            "type": "debit",
            "amount": request.amount,
            "description": request.description,
            "recipient_wallet_id": request.recipient_wallet_id,
            "recipient_type": "enterprise",
            "status": "completed",
            "created_at": datetime.utcnow()
        })
        
        # Create credit transaction for recipient
        await transactions_collection.insert_one({
            "company_id": recipient_wallet.get("company_id"),
            "wallet_id": request.recipient_wallet_id,
            "type": "credit",
            "amount": request.amount,
            "description": f"Transfer from {sender_wallet.get('wallet_id')}",
            "sender_wallet_id": sender_wallet.get("wallet_id"),
            "sender_type": "enterprise",
            "status": "completed",
            "created_at": datetime.utcnow()
        })
    
    return {
        "success": True,
        "message": "Transfer successful",
        "new_balance": sender_new_balance
    }


# ============ TRANSACTIONS ============

@enterprise_router.get("/transactions/{company_id}")
async def get_transactions(company_id: str, limit: int = 10):
    """
    Get recent transactions for a company.
    """
    cursor = transactions_collection.find(
        {"company_id": company_id}
    ).sort("created_at", -1).limit(limit)
    
    transactions = []
    async for tx in cursor:
        transactions.append({
            "id": str(tx["_id"]),
            "type": tx.get("type"),
            "description": tx.get("description"),
            "amount": tx.get("amount"),
            "status": tx.get("status"),
            "created_at": tx.get("created_at")
        })
    
    return {
        "success": True,
        "count": len(transactions),
        "transactions": transactions
    }


# ============ TEAM ============

@enterprise_router.get("/team/{company_id}")
async def get_team_members(company_id: str):
    """
    Get all team members (POCs) for a company.
    """
    cursor = company_poc_collection.find({"company_id": company_id})
    
    members = []
    async for member in cursor:
        members.append({
            "id": str(member["_id"]),
            "name": member.get("name"),
            "email": member.get("email"),
            "role": member.get("role"),
            "phone": member.get("phone"),
            "created_at": member.get("created_at")
        })
    
    return {
        "success": True,
        "count": len(members),
        "members": members
    }


class AddTeamMemberRequest(BaseModel):
    company_id: str
    name: str
    email: str
    role: str
    phone: Optional[str] = None


@enterprise_router.post("/team/add")
async def add_team_member(request: AddTeamMemberRequest):
    """
    Add a new team member to the company.
    """
    # Check if email already exists for this company
    existing = await company_poc_collection.find_one({
        "company_id": request.company_id,
        "email": request.email
    })
    if existing:
        raise HTTPException(status_code=400, detail="Team member with this email already exists")
    
    member_doc = {
        "company_id": request.company_id,
        "name": request.name,
        "email": request.email,
        "role": request.role,
        "phone": request.phone,
        "created_at": datetime.utcnow(),
        "status": "active"
    }
    
    result = await company_poc_collection.insert_one(member_doc)
    
    return {
        "success": True,
        "message": "Team member added successfully",
        "member_id": str(result.inserted_id)
    }


@enterprise_router.delete("/team/{member_id}")
async def remove_team_member(member_id: str):
    """
    Remove a team member from the company.
    """
    try:
        result = await company_poc_collection.delete_one({"_id": ObjectId(member_id)})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Team member not found")
        
        return {
            "success": True,
            "message": "Team member removed successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# ============ SETTINGS ============

class UpdateSettingsRequest(BaseModel):
    company_id: str
    legal_name: Optional[str] = None
    industry_category: Optional[str] = None
    registered_address: Optional[str] = None


@enterprise_router.get("/settings/{company_id}")
async def get_settings(company_id: str):
    """
    Get company settings.
    """
    try:
        company = await company_col.find_one({"_id": ObjectId(company_id)})
        if not company:
            raise HTTPException(status_code=404, detail="Company not found")
        
        # Get wallet info
        wallet = await wallets_collection.find_one({"company_id": company_id})
        
        return {
            "success": True,
            "settings": {
                "legal_name": company.get("legal_name"),
                "user_email": company.get("user_email"),
                "company_type": company.get("company_type"),
                "industry_category": company.get("industry_category"),
                "registered_address": company.get("registered_address"),
                "country": company.get("country"),
                "wallet_id": wallet.get("wallet_id") if wallet else None,
                "created_at": company.get("created_at")
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@enterprise_router.put("/settings/update")
async def update_settings(request: UpdateSettingsRequest):
    """
    Update company settings.
    """
    update_fields = {}
    if request.legal_name:
        update_fields["legal_name"] = request.legal_name
    if request.industry_category:
        update_fields["industry_category"] = request.industry_category
    if request.registered_address:
        update_fields["registered_address"] = request.registered_address
    
    if not update_fields:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    update_fields["updated_at"] = datetime.utcnow()
    
    try:
        result = await company_col.update_one(
            {"_id": ObjectId(request.company_id)},
            {"$set": update_fields}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Company not found")
        
        return {
            "success": True,
            "message": "Settings updated successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============ REPORTS ============

@enterprise_router.get("/reports/{company_id}")
async def get_reports(company_id: str):
    """
    Get report statistics for a company.
    """
    try:
        # Get all transactions for the company
        cursor = transactions_collection.find({"company_id": company_id})
        
        total_credits = 0
        total_debits = 0
        transaction_count = 0
        
        async for tx in cursor:
            amount = tx.get("amount", 0)
            if tx.get("type") == "credit":
                total_credits += amount
            elif tx.get("type") == "debit":
                total_debits += amount
            transaction_count += 1
        
        avg_transaction = (total_credits + total_debits) / transaction_count if transaction_count > 0 else 0
        
        # Get wallet info
        wallet = await wallets_collection.find_one({"company_id": company_id})
        current_balance = wallet.get("balance", 0) if wallet else 0
        
        # Get team count
        team_count = await company_poc_collection.count_documents({"company_id": company_id})
        
        return {
            "success": True,
            "reports": {
                "total_credits": total_credits,
                "total_debits": total_debits,
                "transaction_count": transaction_count,
                "avg_transaction_size": round(avg_transaction, 2),
                "current_balance": current_balance,
                "team_count": team_count,
                "net_flow": total_credits - total_debits
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============ EMPLOYEES ============

@enterprise_router.get("/employees/{company_id}")
async def get_employees_with_wallet(company_id: str):
    """
    Get all employees (POCs) for a company with their wallet info.
    """
    try:
        cursor = company_poc_collection.find({"company_id": company_id})
        
        employees = []
        async for member in cursor:
            member_id = str(member["_id"])
            
            # Calculate total received for this employee
            tx_cursor = transactions_collection.find({
                "company_id": company_id,
                "recipient_id": member_id,
                "type": "debit"
            })
            
            total_received = 0
            async for tx in tx_cursor:
                total_received += tx.get("amount", 0)
            
            employees.append({
                "id": member_id,
                "name": member.get("name"),
                "email": member.get("email"),
                "role": member.get("role"),
                "phone": member.get("phone"),
                "wallet_balance": member.get("wallet_balance", 0),
                "total_received": total_received,
                "status": member.get("status", "active"),
                "created_at": member.get("created_at")
            })
        
        return {
            "success": True,
            "count": len(employees),
            "employees": employees
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
