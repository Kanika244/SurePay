from fastapi import APIRouter, HTTPException, Body
from database import wallets_collection, individual_wallet_collection, individualusers, transactions_collection, company_col, enterprise_employees_collection, enterprise_settings_collection
from datetime import datetime
import random
import string
from pydantic import BaseModel
from bson import ObjectId
from models import TransferRequest, IndividualTopUpRequest

wallet_router = APIRouter(prefix="/api/v1/wallet", tags=["Wallet"])

class WalletCreateRequest(BaseModel):
    company_id: str

class IndividualWalletRequest(BaseModel):
    user_id: str

@wallet_router.post("/create")
async def create_wallet(request: WalletCreateRequest):
    try:
        # Check if wallet already exists for this company
        existing_wallet = await wallets_collection.find_one({"company_id": request.company_id})
        if existing_wallet:
             return {
                "status": "success",
                "message": "Wallet retrieved successfully",
                "wallet_id": existing_wallet["wallet_id"]
            }

        # Generate Wallet ID
        random_suffix = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
        wallet_id = f"ENT-{random_suffix}"

        wallet_doc = {
            "company_id": request.company_id,
            "wallet_id": wallet_id,
            "balance": 0.0,
            "currency": "INR",
            "created_at": datetime.utcnow(),
            "status": "active"
        }

        await wallets_collection.insert_one(wallet_doc)

        return {
            "status": "success",
            "message": "Wallet created successfully",
            "wallet_id": wallet_id
        }

    except Exception as e:
        print(f"Wallet Creation Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to create wallet")


# ============ INDIVIDUAL WALLET ============

@wallet_router.post("/individual/activate")
async def activate_individual_wallet(request: IndividualWalletRequest):
    """
    Activate wallet for individual user.
    Creates a new wallet if user doesn't have one.
    """
    try:
        # Check if user exists
        user = await individualusers.find_one({"_id": ObjectId(request.user_id)})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Check if wallet already exists for this user
        existing_wallet = await individual_wallet_collection.find_one({"user_id": request.user_id})
        if existing_wallet:
            return {
                "status": "success",
                "message": "Wallet already active",
                "wallet": {
                    "wallet_id": existing_wallet["wallet_id"],
                    "balance": existing_wallet.get("balance", 0),
                    "currency": existing_wallet.get("currency", "INR"),
                    "status": existing_wallet.get("status", "active")
                }
            }
        
        # Generate unique wallet ID for individual
        random_suffix = ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))
        wallet_id = f"IND-{random_suffix}"
        
        # Create wallet document
        wallet_doc = {
            "user_id": request.user_id,
            "wallet_id": wallet_id,
            "balance": 0.0,
            "currency": "INR",
            "status": "active",
            "created_at": datetime.utcnow()
        }
        
        # Insert wallet
        result = await individual_wallet_collection.insert_one(wallet_doc)
        
        # Update user record with wallet_id
        await individualusers.update_one(
            {"_id": ObjectId(request.user_id)},
            {"$set": {
                "wallet_id": wallet_id,
                "wallet_activated": True,
                "wallet_activated_at": datetime.utcnow()
            }}
        )
        
        return {
            "status": "success",
            "message": "Wallet activated successfully",
            "wallet": {
                "wallet_id": wallet_id,
                "balance": 0.0,
                "currency": "INR",
                "status": "active"
            }
        }
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"Individual Wallet Activation Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to activate wallet")


@wallet_router.get("/individual/{user_id}")
async def get_individual_wallet(user_id: str):
    """
    Get wallet details for individual user.
    """
    try:
        wallet = await individual_wallet_collection.find_one({"user_id": user_id})
        
        if not wallet:
            return {
                "status": "not_found",
                "message": "Wallet not activated",
                "wallet": None
            }
        
        return {
            "status": "success",
            "wallet": {
                "wallet_id": wallet["wallet_id"],
                "balance": wallet.get("balance", 0),
                "currency": wallet.get("currency", "INR"),
                "status": wallet.get("status", "active"),
                "created_at": str(wallet.get("created_at", ""))
            }
        }
    
    except Exception as e:
        print(f"Get Wallet Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to get wallet")


@wallet_router.get("/individual/{user_id}/transactions")
async def get_individual_transactions(user_id: str, limit: int = 20):
    """
    Get transactions for individual user with sender details.
    """
    try:
        # Get user's wallet
        wallet = await individual_wallet_collection.find_one({"user_id": user_id})
        
        if not wallet:
            return {
                "status": "error",
                "message": "Wallet not found",
                "transactions": []
            }
        
        wallet_id = wallet.get("wallet_id")
        
        # Fetch transactions for this wallet
        cursor = transactions_collection.find(
            {"wallet_id": wallet_id}
        ).sort("created_at", -1).limit(limit)
        
        transactions = await cursor.to_list(length=limit)
        
        # Enrich transactions with sender details
        enriched_transactions = []
        for tx in transactions:
            tx_data = {
                "id": str(tx.get("_id")),
                "type": tx.get("type"),
                "amount": tx.get("amount"),
                "description": tx.get("description"),
                "status": tx.get("status"),
                "created_at": str(tx.get("created_at", "")),
                "sender_wallet_id": tx.get("sender_wallet_id"),
                "sender_type": tx.get("sender_type"),
                "sender_name": None
            }
            
            # If credit from enterprise, get company name
            if tx.get("type") == "credit" and tx.get("sender_type") == "enterprise":
                sender_wallet_id = tx.get("sender_wallet_id")
                if sender_wallet_id:
                    # Find company wallet
                    sender_wallet = await wallets_collection.find_one({"wallet_id": sender_wallet_id})
                    if sender_wallet:
                        company_id = sender_wallet.get("company_id")
                        company = await company_col.find_one({"_id": ObjectId(company_id)})
                        if company:
                            tx_data["sender_name"] = company.get("legal_name")
            
            enriched_transactions.append(tx_data)
        
        return {
            "status": "success",
            "transactions": enriched_transactions,
            "wallet_id": wallet_id
        }
    
    except Exception as e:
        print(f"Get Transactions Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to get transactions")



# Add this to your routes/wallet.py file (wallet_router)



@wallet_router.post("/individual/transfer")
async def transfer_money(request: TransferRequest):
    """
    Transfer money from one individual wallet to another.
    Deducts from sender, credits receiver, creates transaction records for both.
    """
    try:
        # ── 1. Get sender wallet ──
        sender_wallet = await individual_wallet_collection.find_one({"user_id": request.sender_user_id})
        if not sender_wallet:
            raise HTTPException(status_code=404, detail="Sender wallet not found.")

        if sender_wallet.get("status") != "active":
            raise HTTPException(status_code=400, detail="Sender wallet is frozen.")

        if sender_wallet.get("balance", 0) < request.amount:
            raise HTTPException(status_code=400, detail="Insufficient balance.")

        if request.amount <= 0:
            raise HTTPException(status_code=400, detail="Amount must be greater than 0.")

        # ── 2. Find receiver by SurePay ID or phone ──
        receiver_kyc = None
        receiver_user = None

        # Try matching by surepay_id pattern (name.surname@surepay)
        if "@surepay" in request.receiver_id:
            from database import individual_kyc_collection
            # Extract name from surepay id
            name_part = request.receiver_id.replace("@surepay", "").replace(".", " ")
            receiver_kyc = await individual_kyc_collection.find_one(
                {"full_name": {"$regex": name_part, "$options": "i"}}
            )
            if receiver_kyc:
                receiver_user = await individualusers.find_one({"_id": ObjectId(receiver_kyc["user_id"])})

        # Try matching by phone
        if not receiver_user:
            clean_phone = request.receiver_id.strip().replace(" ", "").replace("-", "")
            if clean_phone.startswith("+91"):
                clean_phone = clean_phone[3:]
            if clean_phone.startswith("91") and len(clean_phone) > 10:
                clean_phone = clean_phone[2:]
            receiver_user = await individualusers.find_one(
                {"phone": {"$regex": f".*{clean_phone}$"}}
            )

        if not receiver_user:
            raise HTTPException(status_code=404, detail="Receiver not found. Check the SurePay ID or phone number.")

        receiver_user_id = str(receiver_user["_id"])

        # Prevent sending to self
        if receiver_user_id == request.sender_user_id:
            raise HTTPException(status_code=400, detail="Cannot send money to yourself.")

        # ── 3. Get receiver wallet ──
        receiver_wallet = await individual_wallet_collection.find_one({"user_id": receiver_user_id})
        if not receiver_wallet:
            raise HTTPException(status_code=404, detail="Receiver does not have an active wallet.")

        if receiver_wallet.get("status") != "active":
            raise HTTPException(status_code=400, detail="Receiver wallet is frozen.")

        sender_wallet_id   = sender_wallet["wallet_id"]
        receiver_wallet_id = receiver_wallet["wallet_id"]
        now = datetime.utcnow()

        # ── 4. Deduct from sender ──
        await individual_wallet_collection.update_one(
            {"wallet_id": sender_wallet_id},
            {"$inc": {"balance": -request.amount}}
        )

        # ── 5. Credit receiver ──
        await individual_wallet_collection.update_one(
            {"wallet_id": receiver_wallet_id},
            {"$inc": {"balance": request.amount}}
        )

        # ── 6. Create transaction record for sender (debit) ──
        sender_tx = {
            "wallet_id": sender_wallet_id,
            "type": "debit",
            "amount": request.amount,
            "description": request.note or f"Sent to {request.receiver_id}",
            "status": "completed",
            "receiver_wallet_id": receiver_wallet_id,
            "sender_type": "individual",
            "created_at": now
        }
        await transactions_collection.insert_one(sender_tx)

        # ── 7. Create transaction record for receiver (credit) ──
        # Get sender name for display
        from database import individual_kyc_collection
        sender_kyc = await individual_kyc_collection.find_one({"user_id": request.sender_user_id})
        sender_name = sender_kyc.get("full_name", "Someone") if sender_kyc else "Someone"

        receiver_tx = {
            "wallet_id": receiver_wallet_id,
            "type": "credit",
            "amount": request.amount,
            "description": request.note or f"Received from {sender_name}",
            "status": "completed",
            "sender_wallet_id": sender_wallet_id,
            "sender_type": "individual",
            "sender_name": sender_name,
            "created_at": now
        }
        await transactions_collection.insert_one(receiver_tx)

        # ── 8. Get updated balance ──
        updated_wallet = await individual_wallet_collection.find_one({"wallet_id": sender_wallet_id})

        return {
            "status": "success",
            "message": f"₹{request.amount} sent successfully.",
            "new_balance": updated_wallet.get("balance", 0),
            "transaction_id": str(sender_tx.get("_id", ""))
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"Transfer Error: {e}")
        raise HTTPException(status_code=500, detail="Transfer failed. Please try again.")


@wallet_router.post("/individual/top-up")
async def top_up_individual_wallet(request: IndividualTopUpRequest):
    """
    Add money to an individual wallet (simulated top-up).
    Persists the updated balance to MongoDB so it survives re-login.
    """
    try:
        if request.amount <= 0:
            raise HTTPException(status_code=400, detail="Amount must be greater than 0.")

        wallet = await individual_wallet_collection.find_one({"user_id": request.user_id})
        if not wallet:
            raise HTTPException(status_code=404, detail="Wallet not found. Please activate your wallet first.")

        if wallet.get("status") != "active":
            raise HTTPException(status_code=400, detail="Wallet is frozen.")

        # Atomically increment balance
        await individual_wallet_collection.update_one(
            {"user_id": request.user_id},
            {"$inc": {"balance": request.amount}}
        )

        # Record the credit transaction
        tx = {
            "wallet_id": wallet["wallet_id"],
            "type": "credit",
            "amount": request.amount,
            "description": request.description or f"Top-up via {request.method}",
            "status": "completed",
            "sender_type": "external",
            "sender_wallet_id": None,
            "created_at": datetime.utcnow(),
        }
        await transactions_collection.insert_one(tx)

        updated = await individual_wallet_collection.find_one({"user_id": request.user_id})
        return {
            "status": "success",
            "message": f"₹{request.amount} added to your wallet.",
            "new_balance": updated.get("balance", 0),
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"Top-up Error: {e}")
        raise HTTPException(status_code=500, detail="Top-up failed. Please try again.")


@wallet_router.get("/individual/{user_id}/company-wallet")
async def get_company_wallet_for_user(user_id: str):
    """
    Check if an individual user is an employee of any company.
    Returns the company wallet/allocation info if they are.
    Matches by phone or email against enterprise_employees_collection.
    """
    try:
        # Get individual user record to find their phone/email
        user = await individualusers.find_one({"_id": ObjectId(user_id)})
        phone = ""
        email = ""

        if user:
            phone = user.get("phone", "")
            email = user.get("email", "")
        else:
            # Fallback: check KYC collection if user record is missing
            from database import individual_kyc_collection
            kyc = await individual_kyc_collection.find_one({"user_id": user_id})
            if kyc:
                phone = kyc.get("phone", "")
                email = kyc.get("email", "")
            else:
                return {"status": "not_found", "company_wallet": None}

        # Normalize phone
        clean_phone = phone.strip().replace(" ", "").replace("-", "")
        if clean_phone.startswith("+91"):
            clean_phone = clean_phone[3:]
        if clean_phone.startswith("91") and len(clean_phone) > 10:
            clean_phone = clean_phone[2:]

        # Build filter to match employee by phone or email
        filters = []
        if email:
            filters.append({"email": email})
        if clean_phone:
            filters.append({"phone": {"$regex": f".*{clean_phone}$"}})

        if not filters:
            return {"status": "not_found", "company_wallet": None}

        employee = await enterprise_employees_collection.find_one({"$or": filters})
        if not employee:
            return {"status": "not_found", "company_wallet": None}

        # Employee is suspended → treat as no company wallet
        if employee.get("status") == "suspended":
            return {"status": "suspended", "company_wallet": None}

        company_id = employee.get("company_id", "")
        company_name = "Company"
        company_logo = ""
        two_fa_required = False

        if company_id:
            try:
                company = await company_col.find_one({"_id": ObjectId(company_id)})
                if company:
                    company_name = company.get("legal_name", "Company")
                    company_logo = company.get("logo", "")
                # Fetch enterprise settings for 2FA requirement
                settings = await enterprise_settings_collection.find_one({"company_id": company_id})
                if settings:
                    two_fa_required = settings.get("two_factor_required", False)
            except Exception:
                pass

        return {
            "status": "success",
            "company_wallet": {
                "employee_record_id": str(employee["_id"]),
                "company_id": company_id,
                "company_name": company_name,
                "company_logo": company_logo,
                "employee_id": employee.get("employee_id", ""),
                "department": employee.get("department", ""),
                "designation": employee.get("designation", ""),
                "balance": employee.get("wallet_balance", 0),
                "spending_limit": employee.get("spending_limit", 0),
                "currency": "INR",
                "status": employee.get("status", "active"),
                "two_fa_required": two_fa_required,
            }
        }

    except Exception as e:
        print(f"Get Company Wallet Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch company wallet")


class EmployerTransferRequest(BaseModel):
    sender_user_id: str        # individual user's MongoDB _id
    receiver_id: str           # SurePay ID or phone of recipient
    amount: float              # wallet portion AFTER coupon deduction (0 if coupon covered all)
    note: str = ""


@wallet_router.post("/individual/employer-transfer")
async def employer_wallet_transfer(request: EmployerTransferRequest):
    """
    Deducts from the employee's EMPLOYER wallet (enterprise_employees_collection.wallet_balance).
    Use this instead of /individual/transfer when the PWA user pays from their company allocation.
    """
    try:
        # 1. Resolve employee record via phone/email
        user = await individualusers.find_one({"_id": ObjectId(request.sender_user_id)})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        phone = user.get("phone", "")
        email = user.get("email", "")
        clean_phone = phone.strip().replace(" ", "").replace("-", "")
        if clean_phone.startswith("+91"):
            clean_phone = clean_phone[3:]
        if clean_phone.startswith("91") and len(clean_phone) > 10:
            clean_phone = clean_phone[2:]

        emp_filters = []
        if email:
            emp_filters.append({"email": email})
        if clean_phone:
            emp_filters.append({"phone": {"$regex": f".*{clean_phone}$"}})
        if not emp_filters:
            raise HTTPException(status_code=404, detail="Employee record not found")

        employee = await enterprise_employees_collection.find_one({"$or": emp_filters})
        if not employee:
            raise HTTPException(status_code=404, detail="No employer wallet found for this user")

        # 2. Check balance
        current_balance = employee.get("wallet_balance", 0)
        if request.amount < 0:
            raise HTTPException(status_code=400, detail="Amount cannot be negative")
        if request.amount > current_balance:
            raise HTTPException(status_code=400, detail=f"Insufficient employer wallet balance (₹{current_balance} available)")

        # 3. Find receiver
        receiver_user = None
        if "@surepay" in request.receiver_id:
            from database import individual_kyc_collection
            name_part = request.receiver_id.replace("@surepay", "").replace(".", " ")
            receiver_kyc = await individual_kyc_collection.find_one(
                {"full_name": {"$regex": name_part, "$options": "i"}}
            )
            if receiver_kyc:
                receiver_user = await individualusers.find_one({"_id": ObjectId(receiver_kyc["user_id"])})

        if not receiver_user:
            clean_recv = request.receiver_id.strip().replace(" ", "").replace("-", "")
            if clean_recv.startswith("+91"):
                clean_recv = clean_recv[3:]
            if clean_recv.startswith("91") and len(clean_recv) > 10:
                clean_recv = clean_recv[2:]
            receiver_user = await individualusers.find_one(
                {"phone": {"$regex": f".*{clean_recv}$"}}
            )

        if not receiver_user:
            raise HTTPException(status_code=404, detail="Receiver not found. Check the SurePay ID or phone number.")

        receiver_user_id = str(receiver_user["_id"])
        if receiver_user_id == request.sender_user_id:
            raise HTTPException(status_code=400, detail="Cannot send money to yourself.")

        # 4. Deduct from employer wallet (skip if amount is 0 — coupon paid it all)
        if request.amount > 0:
            await enterprise_employees_collection.update_one(
                {"_id": employee["_id"]},
                {"$inc": {"wallet_balance": -request.amount}}
            )
            # Credit receiver's personal wallet
            receiver_wallet = await individual_wallet_collection.find_one({"user_id": receiver_user_id})
            if receiver_wallet:
                await individual_wallet_collection.update_one(
                    {"wallet_id": receiver_wallet["wallet_id"]},
                    {"$inc": {"balance": request.amount}}
                )

        # 5. Record transaction
        now = datetime.utcnow()
        if request.amount > 0:
            tx = {
                "wallet_id": f"EMP-{str(employee['_id'])}",
                "type": "debit",
                "amount": request.amount,
                "description": request.note or f"Sent to {request.receiver_id}",
                "status": "completed",
                "sender_type": "employer_wallet",
                "created_at": now,
            }
            await transactions_collection.insert_one(tx)

        updated_emp = await enterprise_employees_collection.find_one({"_id": employee["_id"]})
        return {
            "status": "success",
            "message": f"₹{request.amount} sent from employer wallet.",
            "new_balance": updated_emp.get("wallet_balance", 0),
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"Employer Transfer Error: {e}")
        raise HTTPException(status_code=500, detail="Employer wallet transfer failed.")
