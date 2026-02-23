from utils.email_templates import get_reset_password_email , get_otp_email
from fastapi import APIRouter , HTTPException
from fastapi.security import OAuth2PasswordBearer
from bson import ObjectId
from datetime import datetime , timedelta
from models import EmailRequest, PasswordSetup, User , LoginRequest , OTPverify
from database import users_collection , otp_collection, company_col
from passlib.context import CryptContext
from utils.utils import generate_otp , send_email_smtplib
import jwt 
import hashlib  
import os 
from dotenv import load_dotenv
from models import LoginResponse



load_dotenv()




authrouter  = APIRouter()

SECRET_KEY="1567fj62kk2jrj7j"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES=30

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

def hash_password(password: str)->str:
    sha = hashlib.sha256(password.encode("utf-8")).digest()

    return pwd_context.hash(sha)


def verify_password(password:str, hashed_password:str)->bool:
    sha = hashlib.sha256(password.encode("utf-8")).digest()
    return pwd_context.verify(sha, hashed_password)
    

def create_token(data:dict, expires_delta:timedelta = timedelta(minutes=15)):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp":expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt



# def verify_token(token:str):
#     try:
#         payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
#         return payload
#     except jwt.PyJWTError:
#         raise HTTPException(status_code=401, detail="Invalid token")
    


@authrouter.post("/register/")
async def register_user(data:User):
    user_in_db = await users_collection.find_one({"email":data.email})

    if user_in_db:
        raise HTTPException(status_code=400,detail="Alreday Registered")
    

    hashed_pass = hash_password(data.password)
    user_dict = data.dict(exclude={"id"})
    user_dict["id"] = str(ObjectId())
    user_dict["password"] = hashed_pass

    await users_collection.insert_one(user_dict)

    otp = generate_otp()

    otp_data = {
        "email":data.email,
        "otp":otp,
        "expires_at":datetime.utcnow()+timedelta(minutes=5)

    }


    print(otp_data)
    try:
        store_otp = await otp_collection.insert_one(otp_data)
        print(store_otp)
    except Exception as e:
        raise HTTPException(status_code=400, detail="Failed to store OTP")
    

    if store_otp:
        send_email_smtplib(
            sender_email="kanikajain0610@gmail.com",
            recipient_email=data.email,
            subject = "Your OTP for SurePay Registration",
            body = get_otp_email(otp,purpose=" Surepay Registration"),
            smtp_server="smtp.gmail.com",
            smtp_port = 587,
            username = "kanikajain0610@gmail.com",
            password = os.getenv("MY_PASS")
        )

    return {"message":"User Registered Successfully. OTP sent to email for verification."}

@authrouter.post("/verify") # Verify OTP    
async def verify_otp(data:OTPverify):
       email = data.email
       otp = data.otp
       print(f"Recieved otp {otp}")
       otp_record = await otp_collection.find_one({"email":email})
       print(otp_record)
       print("Record found")
        
       if not otp_record :
        print("otp not found")
        raise HTTPException(status_code=400,detail="Invalid OTP")
        
       if  otp_record["otp"]!=otp:
        raise HTTPException(status_code=400,detail="Invalid OTP")
        
       if otp_record["expires_at"] < datetime.utcnow():
            raise HTTPException(status_code=400,detail="OTP has expired")
       await otp_collection.delete_one({"email":email})


@authrouter.post("/login", response_model=LoginResponse)
async def login(login_data: LoginRequest):
    # 1. DIRECT LOOKUP: Check Company Collection for the email
    # Note: We query 'user_email' because that's how it's stored in CompanyCreate
    company = await company_col.find_one({"user_email": login_data.email})
    
    if not company:
        raise HTTPException(status_code=400, detail="Incorrect email or password")

    # 2. VERIFY PASSWORD
    # We compare the input password against the hashed password stored in the company doc
    if not verify_password(login_data.password, company["password"]):
        raise HTTPException(status_code=400, detail="Incorrect email or password")

    # 3. EXTRACT ID
    # This is the ID you need for the dashboard URL
    company_id = str(company["_id"])

    # 4. GENERATE TOKEN
    # We embed the company_id in the token so you can use it in other requests easily
    access_token = create_token(
        data={
            "sub": login_data.email, 
            "type": "company", 
            "id": company_id
        }
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "company_id": company_id, # <--- Frontend uses this for redirection
        "company_name": company.get("legal_name", ""),  # <--- Company name for display
        "status": "completed"     # Since the record exists, onboarding is done
    }



@authrouter.post("/send_email_otp") # Send OTP to email for password setup
async def send_email_otp(data: EmailRequest):
    existing_user = await users_collection.find_one({"email": data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")
    
    otp = generate_otp()

    await otp_collection.delete_many({"email": data.email})


    otp_data = {
        "email": data.email,
        "otp": otp,
        "expires_at": datetime.utcnow() + timedelta(minutes=5)
    }

   
    await otp_collection.insert_one(otp_data)

    send_email_smtplib(
        sender_email="kanikajain0610@gmail.com",
        recipient_email=data.email,
        subject="Your OTP for SurePay",
        body = get_otp_email(otp,purpose="Surepay Password Setup"),
        smtp_server="smtp.gmail.com",
        smtp_port = 587,
        username = "kanikajain0610@gmail.com",
        password = os.getenv("MY_PASS")
    )

    return {"message": "OTP sent successfully"}



@authrouter.post("/set-password") # Password setup after OTP verification
async def set_password(data: PasswordSetup):
    email = data.email
    password = data.password

    user = await users_collection.find_one({"email": email})

    if user:
        raise HTTPException(status_code=400, detail="User already exists")

    hashed_pass = hash_password(password)

    user_doc = {
        "email": email,
        "password": hashed_pass,
        "created_at": datetime.utcnow(),
        "verified": True
    }

    await users_collection.insert_one(user_doc)

    return {"message": "Account created successfully"}



# Add these routes to your authrouter in routes/auth.py

@authrouter.post("/forgot-password")
async def forgot_password(data: EmailRequest):
    """Send password reset link to enterprise email."""
    # Check if company exists with this email
    company = await company_col.find_one({"user_email": data.email})
    if not company:
        # Don't reveal if email exists or not (security best practice)
        return {"message": "If this email is registered, a reset link has been sent."}

    # Generate a reset token (valid 15 minutes)
    reset_token = create_token(
        data={"sub": data.email, "type": "password_reset"},
        expires_delta=timedelta(minutes=15)
    )

    # Store token in DB so we can verify it
    await otp_collection.delete_many({"email": data.email, "type": "password_reset"})
    await otp_collection.insert_one({
        "email": data.email,
        "type": "password_reset",
        "token": reset_token,
        "expires_at": datetime.utcnow() + timedelta(minutes=15)
    })

    # Send reset email
    reset_link = f"http://localhost:8080/reset-password?token={reset_token}"

    send_email_smtplib(
        sender_email="kanikajain0610@gmail.com",
        recipient_email=data.email,
        subject="Reset Your SurePay Password",
        body=get_reset_password_email(reset_link),
        smtp_server="smtp.gmail.com",
        smtp_port=587,
        username="kanikajain0610@gmail.com",
        password=os.getenv("MY_PASS")
    )

    return {"message": "If this email is registered, a reset link has been sent."}


@authrouter.post("/reset-password")
async def reset_password(data: dict):
    """Verify reset token and update password."""
    token = data.get("token")
    new_password = data.get("new_password")

    if not token or not new_password:
        raise HTTPException(status_code=400, detail="Token and new password are required")

    # Verify JWT token
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("type") != "password_reset":
            raise HTTPException(status_code=400, detail="Invalid reset token")
        email = payload.get("sub")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=400, detail="Reset link has expired. Please request a new one.")
    except jwt.PyJWTError:
        raise HTTPException(status_code=400, detail="Invalid reset token")

    # Check token exists in DB (ensures it hasn't been used)
    record = await otp_collection.find_one({"email": email, "type": "password_reset", "token": token})
    if not record:
        raise HTTPException(status_code=400, detail="Reset link has already been used or expired.")

    # Update password in company collection
    hashed = hash_password(new_password)
    result = await company_col.update_one(
        {"user_email": email},
        {"$set": {"password": hashed, "updated_at": datetime.utcnow()}}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Account not found")

    # Delete used token
    await otp_collection.delete_one({"email": email, "type": "password_reset"})

    return {"message": "Password reset successfully. You can now log in."}














