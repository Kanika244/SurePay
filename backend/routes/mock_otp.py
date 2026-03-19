from fastapi import HTTPException , APIRouter
from datetime import timedelta , datetime
from models import PhoneOTPRequest , PhoneOTPVerify
from utils.utils import generate_otp
from database import  individual_otp , individualusers

router = APIRouter(prefix="/auth",tags=["Mock OTP"])

@router.post("/send_otp")
async def send_otp(data: PhoneOTPRequest):
    phone = data.phone
    otp = generate_otp()

    existing_user = await individualusers.find_one({"phone": phone}) 

    await individual_otp.delete_many({"phone": data.phone})

    await individual_otp.insert_one({
        "phone": data.phone,
        "otp": otp,
        "expires_at": datetime.utcnow() + timedelta(minutes=5)
    })

    print(f"MOCK OTP for {data.phone} is {otp}")
    return{
        "message": "OTP sent successfully(mock)",
        "demo_otp":otp,
        "is_existing_user": True if existing_user else False
    }

@router.post("/verify-otp")
async def verify_otp(data: PhoneOTPVerify):
    phone = data.phone
    otp = data.otp

    record = await individual_otp.find_one({"phone": phone})

    if not record:
        raise HTTPException(status_code=400, detail="OTP not found")

    if record["otp"] != data.otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")

    if record["expires_at"] < datetime.utcnow():
        raise HTTPException(status_code=400, detail="OTP expired")

    await individual_otp.delete_one({"phone": data.phone})

    user = await individualusers.find_one({"phone":phone})
    is_new_user = False
    if user:
        await individualusers.update_one(
            {"phone": phone},
            {"$set": {"last_login": datetime.utcnow()}})

    else:
         await individualusers.insert_one({
            "phone": phone,
            "is_phone_verified": True,
            "created_at": datetime.utcnow(),
            "last_login": datetime.utcnow(),
            "kyc_status": "NOT_STARTED"
        })
         is_new_user = True


    return {
        "message": "OTP verified successfully",
        "is_new_user": is_new_user
        }
