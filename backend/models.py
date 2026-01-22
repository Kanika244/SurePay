from pydantic import BaseModel , Field , EmailStr
from typing import List , Optional
from datetime import datetime
import re

class User(BaseModel):
    name: str = Field(pattern = "[A-Za-z ]{2,}$",description="Name should contain only letters and spaces , min 2 characters")
    email:str = Field()
    password:str



class LoginRequest(BaseModel):
    email:EmailStr
    password:str



class OTPverify(BaseModel):
    email:EmailStr
    otp:str = Field(...,pattern=r"^\d{6}$", description="OTP should be a 6 digit number")


class PhoneOTPRequest(BaseModel):
    phone: str = Field(...,example = "+919876543210")

    @classmethod
    def validate_phone(cls, phone: str):
        if not re.match(r"^\+?[1-9]\d{9,14}$", phone):
            raise ValueError("Invalid phone number format")
        return phone

class PhoneOTPVerify(BaseModel):
    phone: str
    otp: str