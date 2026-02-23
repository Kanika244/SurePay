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

class LoginResponse(BaseModel):
    access_token:str
    token_type:str
    company_id:str
    company_name:str = ""
    status:str

class EmailRequest(BaseModel): # Send OTP to email for password setup
    email: EmailStr



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


class PasswordSetup(BaseModel):
    email: EmailStr
    password: str = Field(...,min_length=8)


class CompanyCreate(BaseModel):
    user_email: EmailStr
    legal_name:str = Field(...,min_length=2)
    company_type:str
    country:str
    registered_address:str
    industry_category:str
    password: str



class POCCreate(BaseModel):
    user_email: EmailStr
    full_name:str 
    email:EmailStr
    mobile:str = Field(...,pattern=r"^\d{10}$")
    designation:str
    aadhar_number:str = Field(...,pattern=r"^\d{12}$")
    is_authorized:bool
    gov_id_url: str
    auth_proof_url: str


# Individual KYC Models
class KYCPersonalDetails(BaseModel):
    phone: str = Field(..., description="Phone number of the individual user")
    full_name: str = Field(..., min_length=2, description="Full name as per PAN")
    dob: str = Field(..., description="Date of birth in YYYY-MM-DD format")
    gender: Optional[str] = Field(None, description="Gender (optional)")
    address: str = Field(..., min_length=5, description="Current residential address")
    same_as_aadhaar: bool = Field(default=False, description="Whether address is same as Aadhaar")


class AdminLogin(BaseModel):
    Email:EmailStr
    Password:str


class ChatMessage(BaseModel):
    role: str  # "user" or "agent"
    text: str

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[ChatMessage]] = []


class EmployeeCreate(BaseModel):
    employee_id: str
    first_name: str
    last_name: str
    email: str
    phone: str
    date_of_birth: Optional[str] = ""
    gender: Optional[str] = "Other"
    department: str
    designation: str
    role: str = "Employee"
    date_of_joining: Optional[str] = ""
    employment_type: str = "Full-time"
    gov_id_type: Optional[str] = ""
    gov_id_number: Optional[str] = ""
    wallet_balance: float = 0
    spending_limit: float = 50000
    salary_band: Optional[str] = ""
    two_factor_enabled: bool = False

class EmployeeUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    department: Optional[str] = None
    designation: Optional[str] = None
    role: Optional[str] = None
    employment_type: Optional[str] = None
    gov_id_type: Optional[str] = None
    gov_id_number: Optional[str] = None
    spending_limit: Optional[float] = None
    salary_band: Optional[str] = None
    two_factor_enabled: Optional[bool] = None


class BulkEmployeeCreate(BaseModel):
    employees: List[EmployeeCreate]


class WalletAmountRequest(BaseModel):
    amount: float
    description: Optional[str] = ""


class AllocateRequest(BaseModel):
    employee_id: str
    amount: float
    description: Optional[str] = "Fund allocation to employee wallet"


class ProfileUpdate(BaseModel):
    company_name: Optional[str] = None
    registration_number: Optional[str] = None
    gst_number: Optional[str] = None
    business_type: Optional[str] = None
    industry: Optional[str] = None
    website: Optional[str] = None
    registered_address: Optional[str] = None


class POCUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    designation: Optional[str] = None


class SettingsUpdate(BaseModel):
    default_wallet_limit: Optional[float] = None
    default_spending_limit: Optional[float] = None
    approval_workflow: Optional[bool] = None
    email_notifications: Optional[bool] = None
    transaction_alerts: Optional[bool] = None
    low_balance_alert: Optional[bool] = None
    low_balance_threshold: Optional[float] = None
    two_factor_required: Optional[bool] = None
    session_timeout: Optional[str] = None
    ip_whitelist: Optional[str] = None


# Enterprise Models
class AddMoneyRequest(BaseModel):
    company_id: str
    amount: float
    description: Optional[str] = "Wallet top-up"


class TransferRequest(BaseModel):
    company_id: str
    recipient_wallet_id: str
    amount: float
    description: str



class EmployeeIntegrationSchema(BaseModel):
    employee_id: str          # ERP's own employee ID
    first_name: str
    last_name: str
    email: EmailStr
    phone: str
    department: str
    designation: Optional[str] = None
    salary: Optional[float] = None


class EmployeeUpdateSchema(BaseModel):
    employee_id: str          # ERP's own employee ID
    department: Optional[str] = None
    designation: Optional[str] = None
    salary: Optional[float] = None
    is_active: Optional[bool] = None


class WebhookRegisterSchema(BaseModel):
    url: str                  # ERP's URL to receive events from SurePay
    events: List[str]         # e.g. ["kyc.completed", "wallet.created"]


class APIKeyCreateSchema(BaseModel):
    company_id: str
    company_name: str



class TransferRequest(BaseModel):
    sender_user_id: str
    receiver_id: str        # SurePay ID or phone
    amount: float
    note: str = ""


class IndividualTopUpRequest(BaseModel):
    user_id: str
    amount: float
    method: str = "bank"    # bank / upi / card
    description: str = "Wallet top-up"
