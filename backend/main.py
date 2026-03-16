from dotenv import load_dotenv
load_dotenv()  # Load .env before any other imports that use os.getenv

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.mock_otp import router as mock_otp_router
from routes.admin import admin_router
from routes.auth import authrouter
from routes.enterprise import enterprise_router
from routes.company_routes import company_router
from routes.enterprise_panel import enterprise_panel_router
from routes.integration import integration_router
from routes.poc import poc_router
from routes.wallet import wallet_router
from routes.individual_kyc import router as individual_kyc_router
from routes.coupons import coupon_router

app = FastAPI()

origins = [
    "http://localhost:8080",
    "http://192.168.0.106:8080/",
    "https://sure-pay-five.vercel.app/",
    "https://sure-pay-git-dev-kanikas-projects-a9b7412c.vercel.app",
    "https://sure-8tkv3k7hs-kanikas-projects-a9b7412c.vercel.app",
    "https://surepay-frontend-8fccff2970db.herokuapp.com",
    "https://surepay-frontend-1ce34bb911bf.herokuapp.com"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(authrouter, prefix="")
app.include_router(company_router, prefix="")
app.include_router(poc_router, prefix="")
app.include_router(wallet_router)
app.include_router(individual_kyc_router)
app.include_router(admin_router)
app.include_router(enterprise_router)
app.include_router(enterprise_panel_router)
app.include_router(integration_router)
app.include_router(mock_otp_router)
app.include_router(coupon_router)
