from fastapi import APIRouter, Depends, HTTPException, Security, BackgroundTasks
from fastapi.security import APIKeyHeader
from datetime import datetime
import httpx

from database import (
    enterprise_employees_collection,
    wallets_collection,
    enterprise_notifications_collection,
    api_keys_collection,
    erp_webhooks_collection,
)
from models import (
    EmployeeIntegrationSchema,
    EmployeeUpdateSchema,
    WebhookRegisterSchema,
    APIKeyCreateSchema,
)

from utils.api_key import generate_api_key, hash_api_key


integration_router = APIRouter(prefix="/api/v1/integrate", tags=["ERP Integration"])


# ─────────────────────────────────────────────────────────────
# API KEY AUTHENTICATION
# ─────────────────────────────────────────────────────────────

api_key_header = APIKeyHeader(name="X-SurePay-API-Key")


async def verify_api_key(api_key: str = Security(api_key_header)):
    """Dependency — validates the API key sent by the ERP system."""
    hashed = hash_api_key(api_key)
    company = await api_keys_collection.find_one({
        "hashed_key": hashed,
        "is_active": True
    })
    if not company:
        raise HTTPException(status_code=401, detail="Invalid or inactive API key")
    return company


# ─────────────────────────────────────────────────────────────
# GENERATE API KEY
# Call this once when a new enterprise onboards to SurePay
# ─────────────────────────────────────────────────────────────

@integration_router.post("/generate-key")
async def generate_integration_key(body: APIKeyCreateSchema):
    """
    Generate a unique API key for an enterprise.
    Call this once during enterprise onboarding.
    The key is shown ONLY ONCE — enterprise must save it.
    """
    # Check if company already has a key
    existing = await api_keys_collection.find_one({"company_id": body.company_id})
    if existing:
        raise HTTPException(
            status_code=400,
            detail="API key already exists for this company. Revoke the old one first."
        )

    api_key = generate_api_key()
    hashed = hash_api_key(api_key)

    await api_keys_collection.insert_one({
        "company_id": body.company_id,
        "company_name": body.company_name,
        "hashed_key": hashed,
        "is_active": True,
        "created_at": datetime.utcnow()
    })

    return {
        "api_key": api_key,          # shown ONCE — tell enterprise to save this
        "company_id": body.company_id,
        "company_name": body.company_name,
        "message": "Save this API key securely. It will not be shown again."
    }


@integration_router.delete("/revoke-key/{company_id}")
async def revoke_api_key(company_id: str):
    """Revoke an enterprise's API key (e.g. if compromised)."""
    result = await api_keys_collection.update_one(
        {"company_id": company_id},
        {"$set": {"is_active": False, "revoked_at": datetime.utcnow()}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Company not found")
    return {"status": "revoked", "company_id": company_id}


# ─────────────────────────────────────────────────────────────
# EMPLOYEE SYNC ENDPOINTS
# ERP calls these automatically when employee data changes
# ─────────────────────────────────────────────────────────────

@integration_router.post("/employee/add")
async def add_employee(
    employee: EmployeeIntegrationSchema,
    background_tasks: BackgroundTasks,
    company=Depends(verify_api_key)
):
    """
    ERP calls this when a new employee joins the company.
    Automatically creates employee record + wallet in SurePay.
    """
    company_id = company["company_id"]

    # Check if employee already exists
    existing = await enterprise_employees_collection.find_one({
        "email": employee.email,
        "company_id": company_id
    })
    if existing:
        raise HTTPException(status_code=409, detail="Employee already exists with this email")

    # Create employee record
    new_employee = {
        "company_id": company_id,
        "erp_employee_id": employee.employee_id,   # store ERP's own ID for reference
        "first_name": employee.first_name,
        "last_name": employee.last_name,
        "email": employee.email,
        "phone": employee.phone,
        "department": employee.department,
        "designation": employee.designation,
        "salary": employee.salary,
        "kyc_verified": False,
        "is_active": True,
        "source": "erp_integration",               # track that this came from ERP
        "created_at": datetime.utcnow()
    }
    result = await enterprise_employees_collection.insert_one(new_employee)
    surepay_id = str(result.inserted_id)

    # Create wallet for employee
    await wallets_collection.insert_one({
        "company_id": company_id,
        "employee_id": surepay_id,
        "balance": 0.0,
        "created_at": datetime.utcnow()
    })

    # Notify admin on dashboard
    await enterprise_notifications_collection.insert_one({
        "company_id": company_id,
        "title": "New Employee Synced from ERP",
        "message": f"{employee.first_name} {employee.last_name} ({employee.department}) added via ERP. KYC pending.",
        "type": "info",
        "read": False,
        "created_at": datetime.utcnow()
    })

    # Fire webhook back to ERP in background (non-blocking)
    background_tasks.add_task(
        fire_webhook,
        company_id=company_id,
        event="employee.created",
        data={
            "erp_employee_id": employee.employee_id,
            "surepay_id": surepay_id,
            "status": "created",
            "kyc_status": "pending",
            "wallet_created": True
        }
    )

    return {
        "status": "success",
        "surepay_id": surepay_id,
        "erp_employee_id": employee.employee_id,
        "wallet_created": True,
        "kyc_status": "pending",
        "message": f"{employee.first_name} {employee.last_name} onboarded successfully."
    }


@integration_router.post("/employee/bulk")
async def bulk_add_employees(
    employees: list[EmployeeIntegrationSchema],
    background_tasks: BackgroundTasks,
    company=Depends(verify_api_key)
):
    """
    ERP calls this for bulk onboarding (e.g. 50 new joiners at once).
    Skips employees that already exist.
    """
    company_id = company["company_id"]
    created = []
    skipped = []

    for employee in employees:
        # Skip if already exists
        existing = await enterprise_employees_collection.find_one({
            "email": employee.email,
            "company_id": company_id
        })
        if existing:
            skipped.append(employee.email)
            continue

        new_employee = {
            "company_id": company_id,
            "erp_employee_id": employee.employee_id,
            "first_name": employee.first_name,
            "last_name": employee.last_name,
            "email": employee.email,
            "phone": employee.phone,
            "department": employee.department,
            "designation": employee.designation,
            "salary": employee.salary,
            "kyc_verified": False,
            "is_active": True,
            "source": "erp_integration",
            "created_at": datetime.utcnow()
        }
        result = await enterprise_employees_collection.insert_one(new_employee)
        surepay_id = str(result.inserted_id)

        # Create wallet
        await wallets_collection.insert_one({
            "company_id": company_id,
            "employee_id": surepay_id,
            "balance": 0.0,
            "created_at": datetime.utcnow()
        })

        created.append({
            "email": employee.email,
            "surepay_id": surepay_id,
            "erp_employee_id": employee.employee_id
        })

    # Notify admin
    if created:
        await enterprise_notifications_collection.insert_one({
            "company_id": company_id,
            "title": "Bulk ERP Sync Complete",
            "message": f"{len(created)} employees synced from ERP. {len(skipped)} skipped (already exist).",
            "type": "info",
            "read": False,
            "created_at": datetime.utcnow()
        })

    return {
        "status": "success",
        "created_count": len(created),
        "skipped_count": len(skipped),
        "created": created,
        "skipped_emails": skipped
    }


@integration_router.put("/employee/update")
async def update_employee(
    employee: EmployeeUpdateSchema,
    company=Depends(verify_api_key)
):
    """
    ERP calls this when employee details change.
    e.g. department transfer, promotion, salary update.
    """
    company_id = company["company_id"]

    # Build update dict — only include fields that were provided
    update_data = {
        k: v for k, v in employee.dict().items()
        if v is not None and k != "employee_id"
    }
    update_data["updated_at"] = datetime.utcnow()

    result = await enterprise_employees_collection.update_one(
        {"erp_employee_id": employee.employee_id, "company_id": company_id},
        {"$set": update_data}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Employee not found")

    return {
        "status": "success",
        "message": "Employee updated successfully",
        "updated_fields": list(update_data.keys())
    }


@integration_router.delete("/employee/remove/{employee_id}")
async def remove_employee(
    employee_id: str,
    background_tasks: BackgroundTasks,
    company=Depends(verify_api_key)
):
    """
    ERP calls this when an employee resigns or is terminated.
    Deactivates the account in SurePay (does not delete data).
    """
    company_id = company["company_id"]

    # Find employee first to get their name for notification
    employee = await enterprise_employees_collection.find_one({
        "erp_employee_id": employee_id,
        "company_id": company_id
    })
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    # Deactivate (soft delete — keeps data for records)
    await enterprise_employees_collection.update_one(
        {"erp_employee_id": employee_id, "company_id": company_id},
        {"$set": {
            "is_active": False,
            "deactivated_at": datetime.utcnow()
        }}
    )

    # Notify admin
    await enterprise_notifications_collection.insert_one({
        "company_id": company_id,
        "title": "Employee Deactivated via ERP",
        "message": f"{employee['first_name']} {employee['last_name']} has been deactivated via ERP sync.",
        "type": "warning",
        "read": False,
        "created_at": datetime.utcnow()
    })

    # Notify ERP via webhook
    background_tasks.add_task(
        fire_webhook,
        company_id=company_id,
        event="employee.deactivated",
        data={
            "erp_employee_id": employee_id,
            "surepay_id": str(employee["_id"]),
            "status": "deactivated"
        }
    )

    return {
        "status": "success",
        "message": f"Employee {employee['first_name']} {employee['last_name']} deactivated"
    }


@integration_router.get("/employee/status/{employee_id}")
async def get_employee_status(
    employee_id: str,
    company=Depends(verify_api_key)
):
    """
    ERP can check KYC status and wallet balance of an employee.
    Use ERP's own employee_id to query.
    """
    company_id = company["company_id"]

    employee = await enterprise_employees_collection.find_one({
        "erp_employee_id": employee_id,
        "company_id": company_id
    })
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    wallet = await wallets_collection.find_one({
        "employee_id": str(employee["_id"])
    })

    return {
        "erp_employee_id": employee_id,
        "surepay_id": str(employee["_id"]),
        "name": f"{employee['first_name']} {employee['last_name']}",
        "email": employee["email"],
        "department": employee.get("department"),
        "kyc_verified": employee.get("kyc_verified", False),
        "is_active": employee.get("is_active", True),
        "wallet_balance": wallet["balance"] if wallet else 0.0,
        "source": employee.get("source", "manual"),
        "created_at": employee.get("created_at")
    }


@integration_router.get("/employees/all")
async def get_all_integrated_employees(company=Depends(verify_api_key)):
    """Get all employees that were synced via ERP integration."""
    company_id = company["company_id"]

    cursor = enterprise_employees_collection.find({
        "company_id": company_id,
        "source": "erp_integration"
    })
    employees = []
    async for emp in cursor:
        employees.append({
            "surepay_id": str(emp["_id"]),
            "erp_employee_id": emp.get("erp_employee_id"),
            "name": f"{emp['first_name']} {emp['last_name']}",
            "email": emp["email"],
            "department": emp.get("department"),
            "kyc_verified": emp.get("kyc_verified", False),
            "is_active": emp.get("is_active", True),
            "created_at": emp.get("created_at")
        })

    return {
        "company_id": company_id,
        "total": len(employees),
        "employees": employees
    }


# ─────────────────────────────────────────────────────────────
# WEBHOOK SYSTEM — SurePay notifies ERP when events happen
# ─────────────────────────────────────────────────────────────

@integration_router.post("/webhook/register")
async def register_webhook(
    body: WebhookRegisterSchema,
    company=Depends(verify_api_key)
):
    """
    Enterprise registers their URL to receive events from SurePay.

    Available events:
    - employee.created      → new employee onboarded
    - employee.deactivated  → employee deactivated
    - kyc.completed         → employee completed KYC
    - wallet.created        → wallet created for employee
    - wallet.funded         → funds added to employee wallet
    """
    company_id = company["company_id"]

    # Upsert — update if exists, insert if not
    await erp_webhooks_collection.update_one(
        {"company_id": company_id},
        {"$set": {
            "company_id": company_id,
            "url": body.url,
            "events": body.events,
            "updated_at": datetime.utcnow()
        }},
        upsert=True
    )

    return {
        "status": "registered",
        "webhook_url": body.url,
        "listening_for": body.events
    }


@integration_router.get("/webhook/status")
async def get_webhook_status(company=Depends(verify_api_key)):
    """Check what webhook is registered for this company."""
    company_id = company["company_id"]

    webhook = await erp_webhooks_collection.find_one({"company_id": company_id})
    if not webhook:
        return {"status": "no webhook registered"}

    return {
        "status": "active",
        "webhook_url": webhook["url"],
        "listening_for": webhook["events"],
        "updated_at": webhook.get("updated_at")
    }


@integration_router.delete("/webhook/remove")
async def remove_webhook(company=Depends(verify_api_key)):
    """Remove the registered webhook for this company."""
    company_id = company["company_id"]
    await erp_webhooks_collection.delete_one({"company_id": company_id})
    return {"status": "webhook removed"}


# ─────────────────────────────────────────────────────────────
# INTERNAL HELPER — fires webhook to ERP (called in background)
# ─────────────────────────────────────────────────────────────

async def fire_webhook(company_id: str, event: str, data: dict):
    """
    Sends an event notification to the ERP's registered webhook URL.
    Called automatically in the background after employee actions.
    """
    webhook = await erp_webhooks_collection.find_one({
        "company_id": company_id,
        "events": event
    })

    if not webhook:
        return  # No webhook registered for this event — skip silently

    payload = {
        "event": event,
        "company_id": company_id,
        "timestamp": datetime.utcnow().isoformat(),
        "data": data
    }

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                webhook["url"],
                json=payload,
                timeout=10.0
            )
            print(f"Webhook fired: {event} → {webhook['url']} | Status: {response.status_code}")
    except Exception as e:
        print(f"Webhook failed for company {company_id}, event {event}: {e}")
        # TODO in production: save failed webhooks to DB and retry