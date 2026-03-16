from motor.motor_asyncio import AsyncIOMotorClient # pyright: ignore[reportMissingImports] 
import os

# Connect directly using Atlas URL from environment variable
Mongo_url = os.getenv("MONGO_URL_ATLAS")

Mongo_url = os.getenv("MONGO_URL_ATLAS")
if not Mongo_url:
    raise RuntimeError("[DB] MONGO_URL_ATLAS is not set. Cannot start without database.")
else:
    print(f"[DB] Connected to: Atlas ({Mongo_url[:30]}...)")

    
client = AsyncIOMotorClient(Mongo_url)
database = client.get_database("SurePay")

# Enterprise collections
users_collection = database.get_collection("users")
otp_collection = database.get_collection("otp")
company_poc_collection = database.get_collection("company_poc")
company_col = database.get_collection("company")
wallets_collection = database.get_collection("wallets")
api_keys_collection = database.get_collection("api_keys")
erp_webhooks_collection = database.get_collection("erp_webhooks")

# Individual user collections
individualusers = database.get_collection("individual_users")
individual_otp = database.get_collection("individual_otp")
individual_wallet_collection = database.get_collection("individual_wallet")
individual_kyc_collection = database.get_collection("individual_details")

# Transaction and notification collections
transactions_collection = database.get_collection("transactions")
enterprise_employees_collection = database.get_collection("enterprise_employees")
enterprise_settings_collection = database.get_collection("enterprise_settings")
enterprise_notifications_collection = database.get_collection("enterprise_notifications")

# Coupon system collections
coupon_merchants_collection = database.get_collection("coupon_merchants")
coupon_templates_collection = database.get_collection("coupon_templates")
issued_coupons_collection = database.get_collection("issued_coupons")
coupon_redemptions_collection = database.get_collection("coupon_redemptions")
