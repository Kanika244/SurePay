from fastapi import APIRouter , HTTPException
from fastapi.security import OAuth2PasswordBearer
from bson import ObjectId
from datetime import datetime , timedelta
from models import User , LoginRequest , OTPverify
from database import users_collection , otp_collection
from passlib.context import CryptContext
from utils import generate_otp , send_email_smtplib
import jwt 
import hashlib
import os 
from dotenv import load_dotenv



load_dotenv()




router  = APIRouter()

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
    


@router.post("/register/")
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
            body = "Your OTP is: {otp}. It is valid for 5 minutes.".format(otp=otp),
            smtp_server="smtp.gmail.com",
            smtp_port = 587,
            username = "kanikajain0610@gmail.com",
            password = os.getenv("MY_PASS")
        )

    return {"message":"User Registered Successfully. OTP sent to email for verification."}

@router.post("/verify/")
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


@router.post("/login/")
async def login(login_data:LoginRequest):
    email = login_data.email
    password = login_data.password

    user_in_db = await users_collection.find_one({"email":email})

    if not user_in_db or not verify_password(password, user_in_db["password"]):
        raise HTTPException(status_code=400, detail="Invalid email or password")


    user_data = {"email": user_in_db["email"], "id": str(user_in_db["_id"])}
    access_token = create_token(data=user_data)
    return {"access_token": access_token, "token_type": "bearer"}
    return {"message":"Login Successful"}



