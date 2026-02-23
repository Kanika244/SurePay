from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from datetime import datetime, timedelta
from bson import ObjectId
import os
import uuid
import re
from database import individual_kyc_collection, individualusers, enterprise_employees_collection, otp_collection
from models import KYCPersonalDetails
from utils.ocr_utils import extract_text_async, parse_id_card
import bcrypt
from utils.utils import generate_otp, send_email_smtplib
from utils.email_templates import get_otp_email

router = APIRouter(prefix="/api/kyc", tags=["Individual KYC"])


# ── Helper: clean and find user by phone ──
def clean_phone_number(phone: str) -> str:
    clean = phone.strip().replace(" ", "").replace("-", "")
    if clean.startswith("+91"): clean = clean[3:]
    if clean.startswith("91") and len(clean) > 10: clean = clean[2:]
    return clean

async def find_user_by_phone(phone: str):
    clean = clean_phone_number(phone)
    return await individualusers.find_one({"phone": {"$regex": f".*{clean}$"}})


@router.post("/personal-details")
async def save_personal_details(data: KYCPersonalDetails):
    # FIXED: use regex lookup instead of exact match
    existing_user = await find_user_by_phone(data.phone)
    print(existing_user)

    if not existing_user:
        raise HTTPException(status_code=404, detail="User verification missing. Please verify phone first.")

    user_id = str(existing_user["_id"])

    existing_kyc = await individual_kyc_collection.find_one({"user_id": user_id})

    kyc_data = {
        "user_id": user_id,
        "phone": data.phone,
        "full_name": data.full_name,
        "dob": data.dob,
        "gender": data.gender,
        "address": data.address,
        "same_as_aadhaar": data.same_as_aadhaar,
        "updated_at": datetime.utcnow()
    }

    if existing_kyc:
        await individual_kyc_collection.update_one(
            {"user_id": user_id},
            {"$set": kyc_data}
        )
        kyc_id = str(existing_kyc["_id"])
    else:
        kyc_data["created_at"] = datetime.utcnow()
        kyc_data["kyc_status"] = "in_progress"
        kyc_data["current_step"] = "personal"
        result = await individual_kyc_collection.insert_one(kyc_data)
        kyc_id = str(result.inserted_id)

    await individualusers.update_one(
        {"_id": existing_user["_id"]},
        {"$set": {"kyc_status": "IN_PROGRESS", "kyc_id": kyc_id}}
    )

    return {
        "success": True,
        "message": "Personal details saved successfully",
        "user_id": user_id,
        "kyc_id": kyc_id
    }


@router.get("/personal-details/{phone}")
async def get_personal_details(phone: str):
    user = await find_user_by_phone(phone)  # FIXED
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user_id = str(user["_id"])
    kyc_record = await individual_kyc_collection.find_one({"user_id": user_id})

    if not kyc_record:
        raise HTTPException(status_code=404, detail="KYC record not found")

    return {
        "user_id": user_id,
        "kyc_id": str(kyc_record["_id"]),
        "phone": phone,
        "full_name": kyc_record.get("full_name", ""),
        "dob": kyc_record.get("dob", ""),
        "gender": kyc_record.get("gender", ""),
        "address": kyc_record.get("address", ""),
        "same_as_aadhaar": kyc_record.get("same_as_aadhaar", False),
        "kyc_status": kyc_record.get("kyc_status", ""),
        "current_step": kyc_record.get("current_step", "")
    }


@router.get("/details-by-id/{user_id}")
async def get_details_by_user_id(user_id: str):
    kyc_record = await individual_kyc_collection.find_one({"user_id": user_id})

    if not kyc_record:
        raise HTTPException(status_code=404, detail="KYC record not found")

    return {
        "user_id": user_id,
        "kyc_id": str(kyc_record["_id"]),
        "phone": kyc_record.get("phone", ""),
        "full_name": kyc_record.get("full_name", ""),
        "dob": kyc_record.get("dob", ""),
        "gender": kyc_record.get("gender", ""),
        "address": kyc_record.get("address", ""),
        "same_as_aadhaar": kyc_record.get("same_as_aadhaar", False),
        "kyc_status": kyc_record.get("kyc_status", ""),
        "current_step": kyc_record.get("current_step", "")
    }


@router.get("/status/{phone}")
async def get_kyc_status(phone: str):
    user = await find_user_by_phone(phone)  # FIXED

    if not user:
        return {"phone": phone, "kyc_status": "not_started", "current_step": None, "has_record": False}

    user_id = str(user["_id"])
    kyc_record = await individual_kyc_collection.find_one({"user_id": user_id})

    if not kyc_record:
        return {"phone": phone, "user_id": user_id, "kyc_status": "not_started", "current_step": None, "has_record": False}

    return {
        "phone": phone,
        "user_id": user_id,
        "kyc_id": str(kyc_record["_id"]),
        "kyc_status": kyc_record.get("kyc_status", "in_progress"),
        "current_step": kyc_record.get("current_step", ""),
        "has_record": True
    }


UPLOAD_DIR = "uploads/kyc_documents"
os.makedirs(UPLOAD_DIR, exist_ok=True)


async def save_upload_file(upload_file: UploadFile, prefix: str) -> str:
    file_extension = os.path.splitext(upload_file.filename)[1]
    unique_filename = f"{prefix}_{uuid.uuid4().hex}{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    content = await upload_file.read()
    with open(file_path, "wb") as f:
        f.write(content)
    return file_path


def parse_pan_number(text: str) -> str | None:
    pan_pattern = r"[A-Z]{5}[0-9]{4}[A-Z]"
    match = re.search(pan_pattern, text.upper())
    return match.group() if match else None


@router.post("/documents")
async def upload_documents(
    phone: str = Form(...),
    pan_image: UploadFile = File(...),
    aadhaar_front: UploadFile = File(...),
    aadhaar_back: UploadFile = File(...)
):
    # FIXED: use regex lookup
    existing_user = await find_user_by_phone(phone)
    if not existing_user:
        raise HTTPException(status_code=404, detail="User not found. Please verify phone first.")

    user_id = str(existing_user["_id"])

    existing_kyc = await individual_kyc_collection.find_one({"user_id": user_id})
    if not existing_kyc:
        raise HTTPException(status_code=404, detail="Please complete personal details first.")

    pan_content = await pan_image.read()
    aadhaar_front_content = await aadhaar_front.read()
    aadhaar_back_content = await aadhaar_back.read()

    await pan_image.seek(0)
    await aadhaar_front.seek(0)
    await aadhaar_back.seek(0)

    pan_path = await save_upload_file(pan_image, f"pan_{user_id}")
    aadhaar_front_path = await save_upload_file(aadhaar_front, f"aadhaar_front_{user_id}")
    aadhaar_back_path = await save_upload_file(aadhaar_back, f"aadhaar_back_{user_id}")

    pan_number = None
    pan_name = None
    aadhaar_number = None
    aadhaar_name = None

    try:
        pan_text = await extract_text_async(pan_content, is_pdf=False)
        pan_number = parse_pan_number(pan_text)
        _, pan_name = parse_id_card(pan_text)
        print(f"PAN OCR: number={pan_number}, name={pan_name}")

        aadhaar_text = await extract_text_async(aadhaar_front_content, is_pdf=False)
        aadhaar_number, aadhaar_name = parse_id_card(aadhaar_text)
        print(f"Aadhaar OCR: number={aadhaar_number}, name={aadhaar_name}")
    except Exception as e:
        print(f"OCR Error (non-fatal): {e}")

    document_data = {
        "pan_image_path": pan_path,
        "aadhaar_front_path": aadhaar_front_path,
        "aadhaar_back_path": aadhaar_back_path,
        "pan_number": pan_number,
        "pan_name": pan_name,
        "aadhaar_number": aadhaar_number,
        "aadhaar_name": aadhaar_name,
        "ocr_completed": bool(pan_number or aadhaar_number),
        "documents_uploaded_at": datetime.utcnow(),
        "current_step": "documents",
        "updated_at": datetime.utcnow()
    }

    await individual_kyc_collection.update_one(
        {"user_id": user_id},
        {"$set": document_data}
    )

    return {
        "success": True,
        "message": "Documents uploaded and processed successfully",
        "user_id": user_id,
        "kyc_id": str(existing_kyc["_id"]),
        "extracted_data": {
            "pan_number": pan_number,
            "pan_name": pan_name,
            "aadhaar_number": aadhaar_number,
            "aadhaar_name": aadhaar_name
        }
    }


@router.get("/documents/{phone}")
async def get_documents(phone: str):
    user = await find_user_by_phone(phone)  # FIXED
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user_id = str(user["_id"])
    kyc_record = await individual_kyc_collection.find_one({"user_id": user_id})

    if not kyc_record:
        raise HTTPException(status_code=404, detail="KYC record not found")

    return {
        "user_id": user_id,
        "pan_uploaded": bool(kyc_record.get("pan_image_path")),
        "aadhaar_front_uploaded": bool(kyc_record.get("aadhaar_front_path")),
        "aadhaar_back_uploaded": bool(kyc_record.get("aadhaar_back_path")),
        "documents_uploaded_at": kyc_record.get("documents_uploaded_at")
    }


@router.post("/selfie")
async def upload_selfie(
    phone: str = Form(...),
    selfie_data: str = Form(...)
):
    import base64

    # FIXED: use regex lookup
    existing_user = await find_user_by_phone(phone)
    if not existing_user:
        raise HTTPException(status_code=404, detail="User not found. Please verify phone first.")

    user_id = str(existing_user["_id"])

    existing_kyc = await individual_kyc_collection.find_one({"user_id": user_id})
    if not existing_kyc:
        raise HTTPException(status_code=404, detail="Please complete previous KYC steps first.")

    try:
        if "," in selfie_data:
            selfie_data = selfie_data.split(",")[1]
        image_bytes = base64.b64decode(selfie_data)
        unique_filename = f"selfie_{user_id}_{uuid.uuid4().hex}.jpg"
        file_path = os.path.join(UPLOAD_DIR, unique_filename)
        with open(file_path, "wb") as f:
            f.write(image_bytes)
    except Exception as e:
        print(f"Selfie save error: {e}")
        raise HTTPException(status_code=400, detail="Invalid selfie image data.")

    await individual_kyc_collection.update_one(
        {"user_id": user_id},
        {"$set": {
            "selfie_path": file_path,
            "selfie_uploaded_at": datetime.utcnow(),
            "liveness_completed": True,
            "current_step": "selfie",
            "updated_at": datetime.utcnow()
        }}
    )

    return {
        "success": True,
        "message": "Selfie uploaded successfully",
        "user_id": user_id,
        "kyc_id": str(existing_kyc["_id"]),
        "selfie_path": file_path
    }


@router.post("/password")
async def set_password(
    phone: str = Form(...),
    password: str = Form(...)
):
    if len(password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")
    if not re.search(r"[A-Z]", password):
        raise HTTPException(status_code=400, detail="Password must contain uppercase letter")
    if not re.search(r"[a-z]", password):
        raise HTTPException(status_code=400, detail="Password must contain lowercase letter")
    if not re.search(r"[0-9]", password):
        raise HTTPException(status_code=400, detail="Password must contain a number")
    if not re.search(r"[!@#$%^&*]", password):
        raise HTTPException(status_code=400, detail="Password must contain special character")

    # FIXED: use regex lookup
    existing_user = await find_user_by_phone(phone)
    if not existing_user:
        raise HTTPException(status_code=404, detail="User not found. Please verify phone first.")

    user_id = str(existing_user["_id"])
    password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

    await individualusers.update_one(
        {"_id": existing_user["_id"]},
        {"$set": {
            "password_hash": password_hash.decode('utf-8'),
            "password_set_at": datetime.utcnow()
        }}
    )

    existing_kyc = await individual_kyc_collection.find_one({"user_id": user_id})
    if existing_kyc:
        await individual_kyc_collection.update_one(
            {"user_id": user_id},
            {"$set": {
                "password_hash": password_hash.decode('utf-8'),
                "password_set_at": datetime.utcnow(),
                "current_step": "password",
                "updated_at": datetime.utcnow()
            }}
        )

    return {"success": True, "message": "Password set successfully", "user_id": user_id}


@router.post("/submit")
async def submit_kyc(phone: str = Form(...)):
    # FIXED: use regex lookup
    existing_user = await find_user_by_phone(phone)
    if not existing_user:
        raise HTTPException(status_code=404, detail="User not found. Please verify phone first.")

    user_id = str(existing_user["_id"])

    existing_kyc = await individual_kyc_collection.find_one({"user_id": user_id})
    if not existing_kyc:
        raise HTTPException(status_code=404, detail="KYC record not found. Please complete all steps first.")

    await individual_kyc_collection.update_one(
        {"user_id": user_id},
        {"$set": {
            "kyc_status": "SUBMITTED",
            "current_step": "completed",
            "consent_confirmed": True,
            "submitted_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }}
    )

    await individualusers.update_one(
        {"_id": existing_user["_id"]},
        {"$set": {"kyc_status": "SUBMITTED", "kyc_submitted_at": datetime.utcnow()}}
    )

    # Cross-check enterprise employees
    user_phone = existing_user.get("phone", "")
    user_email = existing_kyc.get("email") or existing_user.get("email", "")
    clean = clean_phone_number(user_phone)

    match_filter = {"$or": []}
    if user_email:
        match_filter["$or"].append({"email": user_email})
    if clean:
        match_filter["$or"].append({"phone": {"$regex": f".*{clean}$"}})

    if match_filter["$or"]:
        result = await enterprise_employees_collection.update_many(
            match_filter, {"$set": {"kyc_verified": True}}
        )
        if result.modified_count > 0:
            print(f"[KYC] Updated {result.modified_count} enterprise employee(s) to kyc_verified=True")

    return {
        "success": True,
        "message": "KYC submitted successfully",
        "user_id": user_id,
        "kyc_id": str(existing_kyc["_id"]),
        "status": "SUBMITTED"
    }


# ══════════════════════════════════════════
#  INDIVIDUAL LOGIN
# ══════════════════════════════════════════

@router.post("/login")
async def individual_login(phone: str = Form(...)):
    clean = clean_phone_number(phone)

    if len(clean) != 10 or not clean.isdigit():
        raise HTTPException(status_code=400, detail="Invalid phone number. Please enter 10 digits.")

    user = await individualusers.find_one({"phone": {"$regex": f".*{clean}$"}})
    kyc_by_phone = await individual_kyc_collection.find_one({"phone": {"$regex": f".*{clean}$"}})

    if not user and not kyc_by_phone:
        raise HTTPException(status_code=404, detail="Phone number not registered. Please sign up first.")

    if user and not kyc_by_phone:
        user_id = str(user["_id"])
        kyc = await individual_kyc_collection.find_one({"user_id": user_id})
        if not kyc:
            raise HTTPException(status_code=400, detail="Registration incomplete. Please complete your profile first.")

    if user:
        user_id = str(user["_id"])
    else:
        user_id = kyc_by_phone.get("user_id")
        if user_id:
            user = await individualusers.find_one({"_id": ObjectId(user_id)})

    if not user_id:
        raise HTTPException(status_code=404, detail="User account not found. Please sign up first.")

    kyc = await individual_kyc_collection.find_one({"user_id": user_id})
    if not kyc:
        kyc = kyc_by_phone

    return {
        "success": True,
        "message": "Login successful",
        "user": {
            "user_id": user_id,
            "phone": user.get("phone") if user else clean,
            "kyc_status": user.get("kyc_status", "PENDING") if user else "PENDING",
            "full_name": kyc.get("full_name") if kyc else None,
            "wallet_balance": user.get("wallet_balance", 0) if user else 0,
            "created_at": str(user.get("created_at", "")) if user else ""
        }
    }


@router.get("/user/{phone}")
async def get_individual_user(phone: str):
    user = await find_user_by_phone(phone)  # FIXED
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user_id = str(user["_id"])
    kyc = await individual_kyc_collection.find_one({"user_id": user_id})

    return {
        "success": True,
        "user": {
            "user_id": user_id,
            "phone": user.get("phone"),
            "kyc_status": user.get("kyc_status", "PENDING"),
            "full_name": kyc.get("full_name") if kyc else None,
            "dob": kyc.get("dob") if kyc else None,
            "gender": kyc.get("gender") if kyc else None,
            "address": kyc.get("address") if kyc else None,
            "wallet_balance": user.get("wallet_balance", 0),
            "created_at": str(user.get("created_at", "")),
            "employer_name": user.get("employer_name"),
            "company_id": user.get("company_id")
        }
    }


@router.patch("/update-email")
async def update_email(phone: str = Form(...), email: str = Form(...)):
    """Save or update the email for an individual user. Required before enabling 2FA."""
    import re as _re
    if not _re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", email):
        raise HTTPException(status_code=400, detail="Invalid email address.")

    user = await find_user_by_phone(phone)
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    user_id = str(user["_id"])

    # Save on user document
    await individualusers.update_one(
        {"_id": user["_id"]},
        {"$set": {"email": email, "email_updated_at": datetime.utcnow()}}
    )

    # Also save on KYC record so submit cross-check works
    kyc = await individual_kyc_collection.find_one({"user_id": user_id})
    if kyc:
        await individual_kyc_collection.update_one(
            {"user_id": user_id},
            {"$set": {"email": email}}
        )

    return {"success": True, "message": "Email updated successfully.", "email": email}


# ══════════════════════════════════════════
#  TRANSACTION PIN
# ══════════════════════════════════════════


@router.post("/set-pin")
async def set_transaction_pin(phone: str = Form(...), pin: str = Form(...)):
    if not pin.isdigit() or len(pin) != 4:
        raise HTTPException(status_code=400, detail="PIN must be exactly 4 digits.")

    user = await find_user_by_phone(phone)  # FIXED
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    pin_hash = bcrypt.hashpw(pin.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
    await individualusers.update_one(
        {"_id": user["_id"]},
        {"$set": {"transaction_pin_hash": pin_hash, "pin_set_at": datetime.utcnow()}}
    )
    return {"success": True, "message": "Transaction PIN set successfully."}


@router.post("/verify-pin")
async def verify_transaction_pin(phone: str = Form(...), pin: str = Form(...)):
    user = await find_user_by_phone(phone)  # FIXED
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    pin_hash = user.get("transaction_pin_hash")
    if not pin_hash:
        raise HTTPException(status_code=400, detail="Transaction PIN not set. Please set a PIN first.")

    if not bcrypt.checkpw(pin.encode("utf-8"), pin_hash.encode("utf-8")):
        raise HTTPException(status_code=400, detail="Incorrect PIN.")

    return {"success": True, "message": "PIN verified."}


@router.get("/pin-status/{phone}")
async def get_pin_status(phone: str):
    user = await find_user_by_phone(phone)  # FIXED
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    return {
        "success": True,
        "pin_set": bool(user.get("transaction_pin_hash")),
        "pin_set_at": str(user.get("pin_set_at", ""))
    }


# ══════════════════════════════════════════
#  TWO-FACTOR AUTHENTICATION
# ══════════════════════════════════════════

@router.post("/2fa/send-otp")
async def send_2fa_otp(phone: str = Form(...)):
    user = await find_user_by_phone(phone)  # FIXED
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    email = user.get("email")
    if not email:
        kyc = await individual_kyc_collection.find_one({"user_id": str(user["_id"])})
        email = kyc.get("email") if kyc else None

    if not email:
        raise HTTPException(status_code=400, detail="No email address found for this account.")

    otp = generate_otp()
    await otp_collection.delete_many({"phone": phone, "type": "2fa"})
    await otp_collection.insert_one({
        "phone": phone, "type": "2fa", "otp": otp,
        "expires_at": datetime.utcnow() + timedelta(minutes=5)
    })

    send_email_smtplib(
        sender_email="kanikajain0610@gmail.com",
        recipient_email=email,
        subject="Your SurePay 2FA Code",
        body=get_otp_email(otp, purpose="Two-Factor Authentication"),
        smtp_server="smtp.gmail.com", smtp_port=587,
        username="kanikajain0610@gmail.com",
        password=os.getenv("MY_PASS")
    )

    masked = email[0] + "***" + email[email.index("@"):]
    return {"success": True, "message": f"OTP sent to {masked}"}


@router.post("/2fa/verify-otp")
async def verify_2fa_otp(phone: str = Form(...), otp: str = Form(...)):
    record = await otp_collection.find_one({"phone": phone, "type": "2fa"})

    if not record:
        raise HTTPException(status_code=400, detail="OTP not found. Please request a new one.")
    if record["otp"] != otp:
        raise HTTPException(status_code=400, detail="Incorrect OTP.")
    if record["expires_at"] < datetime.utcnow():
        raise HTTPException(status_code=400, detail="OTP has expired. Please request a new one.")

    user = await find_user_by_phone(phone)  # FIXED
    if user:
        await individualusers.update_one(
            {"_id": user["_id"]},
            {"$set": {"two_fa_enabled": True, "two_fa_enabled_at": datetime.utcnow()}}
        )

    await otp_collection.delete_one({"phone": phone, "type": "2fa"})
    return {"success": True, "message": "Two-factor authentication enabled successfully."}


@router.post("/2fa/disable")
async def disable_2fa(phone: str = Form(...)):
    user = await find_user_by_phone(phone)  # FIXED
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    await individualusers.update_one(
        {"_id": user["_id"]},
        {"$set": {"two_fa_enabled": False, "two_fa_disabled_at": datetime.utcnow()}}
    )
    return {"success": True, "message": "Two-factor authentication disabled."}


@router.get("/2fa/status/{phone}")
async def get_2fa_status(phone: str):
    user = await find_user_by_phone(phone)  # FIXED
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    return {
        "success": True,
        "two_fa_enabled": bool(user.get("two_fa_enabled", False))
    }