from fastapi import APIRouter, HTTPException, Form
from bson import ObjectId
from datetime import datetime
from database import company_col, individualusers, individual_kyc_collection, company_poc_collection
from models import CompanyCreate
from routes.auth import hash_password
import random
import string

company_router = APIRouter(prefix="/company", tags=["company"])


def generate_company_code(legal_name: str) -> str:
    """Generate unique company code like SP-RIL-583"""
    # Get first 3 letters of company name (uppercase)
    prefix = ''.join(c for c in legal_name.upper() if c.isalpha())[:3]
    if len(prefix) < 3:
        prefix = prefix.ljust(3, 'X')
    
    # Random 3-digit number
    suffix = ''.join(random.choices(string.digits, k=3))
    
    return f"SP-{prefix}-{suffix}"


@company_router.post("/create")
async def create_company(data: CompanyCreate):
    existing = await company_col.find_one({"user_email": data.user_email})

    if existing:
        raise HTTPException(status_code=400, detail="Company already registered")
    
    # Generate unique company code
    company_code = generate_company_code(data.legal_name)
    
    # Ensure code is unique
    while await company_col.find_one({"company_code": company_code}):
        company_code = generate_company_code(data.legal_name)
    
    company_doc = {
        "user_email": data.user_email,
        "password": hash_password(data.password),
        "legal_name": data.legal_name,
        "company_type": data.company_type,
        "country": data.country,
        "registered_address": data.registered_address,
        "industry_category": data.industry_category,
        "company_code": company_code,  # Add company code
        "created_at": datetime.utcnow(),
        "face_verified": False,
        "wallet_created": False,
        "employee_count": 0
    }

    result = await company_col.insert_one(company_doc)
    return {
        "message": "Company registered successfully",
        "company_id": str(result.inserted_id),
        "company_code": company_code
    }


@company_router.get("/{company_id}")
async def get_company(company_id: str):
    try:
        company = await company_col.find_one({"_id": ObjectId(company_id)})
        if not company:
            raise HTTPException(status_code=404, detail="Company not found")
        
        # Serialize ObjectId
        company["_id"] = str(company["_id"])
        return company
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============ JOIN EMPLOYER ============

@company_router.post("/join")
async def join_employer(user_id: str = Form(...), company_code: str = Form(...)):
    """
    Link individual user to a company using company code.
    """
    try:
        # Validate user exists
        user = await individualusers.find_one({"_id": ObjectId(user_id)})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Check if already linked to a company
        if user.get("company_id"):
            return {
                "status": "already_linked",
                "message": "You are already linked to an employer",
                "company_id": user.get("company_id")
            }
        
        # Find company by code
        company = await company_col.find_one({"company_code": company_code.upper().strip()})
        if not company:
            raise HTTPException(status_code=404, detail="Invalid company code. Please check and try again.")
        
        company_id = str(company["_id"])
        
        # Update user with company link
        await individualusers.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {
                "company_id": company_id,
                "company_code": company_code.upper().strip(),
                "employer_name": company.get("legal_name"),
                "joined_employer_at": datetime.utcnow()
            }}
        )
        
        # Also update KYC collection if exists
        await individual_kyc_collection.update_one(
            {"user_id": user_id},
            {"$set": {
                "company_id": company_id,
                "employer_name": company.get("legal_name")
            }}
        )
        
        # Increment employee count for company
        await company_col.update_one(
            {"_id": company["_id"]},
            {"$inc": {"employee_count": 1}}
        )
        
        # Get user's KYC details for employee record
        kyc = await individual_kyc_collection.find_one({"user_id": user_id})
        
        # Add user to company_poc_collection so they appear in Enterprise Dashboard
        employee_doc = {
            "company_id": company_id,
            "individual_user_id": user_id,  # Link to individual user
            "name": kyc.get("full_name") if kyc else user.get("phone"),
            "email": kyc.get("email") if kyc else None,
            "phone": user.get("phone"),
            "role": "Employee",
            "status": "active",
            "wallet_balance": 0,
            "joined_via": "company_code",
            "created_at": datetime.utcnow()
        }
        
        await company_poc_collection.insert_one(employee_doc)
        
        return {
            "status": "success",
            "message": f"Successfully joined {company.get('legal_name')}",
            "company_id": company_id,
            "company_name": company.get("legal_name")
        }
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"Join Employer Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to join employer")


@company_router.get("/verify/{code}")
async def verify_company_code(code: str):

    # 1. First, FIND the company using the collection
    company = await company_col.find_one({"company_code": code.upper().strip()})
    
    # 2. Check if it exists
    if not company:
        return {
            "valid": False,
            "message": "Invalid company code"
        }
    
    # 3. Return data from the 'company' variable, NOT 'company_col'
    return {
        "valid": True,
        "company_name": company.get("legal_name"),      # <--- Fixed here
        "industry": company.get("industry_category")    # <--- Fixed here
    }
