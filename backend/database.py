from motor.motor_asyncio import AsyncIOMotorClient # pyright: ignore[reportMissingImports] 
import os

_use_local = os.getenv("USE_LOCAL", "true").strip().lower() == "true"
_local_url  = os.getenv("MONGO_URL_LOCAL", "mongodb://localhost:27017")
_atlas_url  = os.getenv("MONGO_URL_ATLAS", "mongodb://localhost:27017")
Mongo_url = _local_url if _use_local else _atlas_url

print(f"[DB] Connected to: {'Local' if _use_local else 'Atlas'} ({Mongo_url})")
client = AsyncIOMotorClient(Mongo_url)

database = client.get_database("SurePay")
users_collection = database.get_collection("users") # Enterprise users
otp_collection = database.get_collection("otp") # OTPs for enterprise users


individualusers= database.get_collection("individual_users") # Individual users
individual_otp = database.get_collection("individual_otp") # OTPs for individual users
company_poc_collection = database.get_collection("company_poc")
company_col = database.get_collection("company")
wallets_collection = database.get_collection("wallets")
individual_wallet_collection = database.get_collection("individual_wallet")  # Individual wallets
individual_kyc_collection = database.get_collection("individual_details")  # KYC data for individual user
transactions_collection = database.get_collection("transactions")  # Enterprise transactions
enterprise_employees_collection = database.get_collection("enterprise_employees")  # Enterprise panel employees
enterprise_settings_collection = database.get_collection("enterprise_settings")  # Enterprise panel settings
enterprise_notifications_collection = database.get_collection("enterprise_notifications")  # Enterprise notifications
api_keys_collection = database.get_collection("api_keys")
erp_webhooks_collection = database.get_collection("erp_webhooks")

# Coupon system collections
coupon_merchants_collection   = database.get_collection("coupon_merchants")
coupon_templates_collection   = database.get_collection("coupon_templates")
issued_coupons_collection     = database.get_collection("issued_coupons")
coupon_redemptions_collection = database.get_collection("coupon_redemptions")