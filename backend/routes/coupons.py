"""
Enterprise Coupon Routes
Provides full CRUD + business logic for the programmable coupon system
used by enterprises to issue merchant-restricted spending coupons to employees.

Collections used:
  coupon_merchants_collection
  coupon_templates_collection
  issued_coupons_collection
  coupon_redemptions_collection
"""
from fastapi import APIRouter, HTTPException
from datetime import datetime, timedelta
from bson import ObjectId
from pydantic import BaseModel
from typing import Optional, List, Any

from database import (
    coupon_merchants_collection,
    coupon_templates_collection,
    issued_coupons_collection,
    coupon_redemptions_collection,
    enterprise_notifications_collection,
    enterprise_employees_collection,
    individualusers,
)

coupon_router = APIRouter(prefix="/api/enterprise/coupons", tags=["Enterprise Coupons"])

# ─────────────────────────────────────────────
# Pydantic Models
# ─────────────────────────────────────────────

class MerchantCreate(BaseModel):
    name: str
    category: str                    # fuel_station | restaurant | hotel
    merchantId: str
    location: str
    contactInfo: Optional[str] = None
    status: str = "active"


class TemplateCreate(BaseModel):
    name: str
    couponType: str                  # fuel | food | accommodation
    description: Optional[str] = None
    valueType: str                   # fixed | budget
    fixedAmount: Optional[float] = None
    totalBudget: Optional[float] = None
    maxPerTransaction: Optional[float] = None
    expiryType: str                  # fixed_date | duration
    expiryDate: Optional[str] = None
    validForDays: Optional[int] = None
    merchantRestrictionType: str     # specific | list | category
    merchantIds: List[str] = []
    merchantCategory: Optional[str] = None
    status: str = "active"


class IssueCouponItem(BaseModel):
    templateId: str
    templateName: str
    employeeId: str
    employeeName: str
    couponType: str
    originalValue: float
    remainingValue: float
    maxPerTransaction: Optional[float] = None
    merchantRestrictionType: str
    merchantIds: List[str] = []
    merchantCategory: Optional[str] = None
    issueDate: str
    expiryDate: str
    status: str = "active"
    notes: Optional[str] = None


class IssueCouponsRequest(BaseModel):
    coupons: List[IssueCouponItem]


class ExtendExpiryRequest(BaseModel):
    newExpiryDate: str


class RedemptionCreate(BaseModel):
    couponId: str
    employeeId: str
    employeeName: str
    couponType: str
    amount: float
    merchantId: str
    merchantName: str


# ─────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────

def _id(doc: dict) -> dict:
    """Convert MongoDB _id to string id."""
    if doc and "_id" in doc:
        doc["id"] = str(doc["_id"])
        del doc["_id"]
    return doc


def _serialize_redemption(doc: dict) -> dict:
    """Serialize a coupon_redemptions document for API responses."""
    doc = dict(doc)  # don't mutate original
    doc["id"] = str(doc.pop("_id", ""))
    return {
        "id": doc["id"],
        "companyId": doc.get("company_id", ""),
        "couponId": doc.get("coupon_id", ""),
        "employeeId": doc.get("employee_id", ""),
        "employeeName": doc.get("employee_name", ""),
        "couponType": doc.get("coupon_type", ""),
        "amount": doc.get("amount", 0),
        "merchantId": doc.get("merchant_id", ""),
        "merchantName": doc.get("merchant_name", ""),
        "redeemedAt": doc.get("redeemed_at", ""),
    }


def _serialize_merchant(doc: dict) -> dict:
    doc = _id(doc)
    return {
        "id": doc["id"],
        "name": doc.get("name", ""),
        "category": doc.get("category", ""),
        "merchantId": doc.get("merchant_id", ""),
        "location": doc.get("location", ""),
        "contactInfo": doc.get("contact_info"),
        "status": doc.get("status", "active"),
        "createdAt": doc.get("created_at", ""),
    }


def _serialize_template(doc: dict) -> dict:
    doc = _id(doc)
    return {
        "id": doc["id"],
        "name": doc.get("name", ""),
        "couponType": doc.get("coupon_type", ""),
        "description": doc.get("description"),
        "valueType": doc.get("value_type", "fixed"),
        "fixedAmount": doc.get("fixed_amount"),
        "totalBudget": doc.get("total_budget"),
        "maxPerTransaction": doc.get("max_per_transaction"),
        "expiryType": doc.get("expiry_type", "duration"),
        "expiryDate": doc.get("expiry_date"),
        "validForDays": doc.get("valid_for_days"),
        "merchantRestrictionType": doc.get("merchant_restriction_type", "category"),
        "merchantIds": doc.get("merchant_ids", []),
        "merchantCategory": doc.get("merchant_category"),
        "status": doc.get("status", "active"),
        "createdAt": doc.get("created_at", ""),
    }


def _serialize_issued(doc: dict) -> dict:
    doc = _id(doc)
    return {
        "id": doc["id"],
        "companyId": doc.get("company_id", ""),        # ← needed by PWA for redemptions
        "templateId": doc.get("template_id", ""),
        "templateName": doc.get("template_name", ""),
        "employeeId": doc.get("employee_id", ""),
        "employeeName": doc.get("employee_name", ""),
        "couponType": doc.get("coupon_type", ""),
        "originalValue": doc.get("original_value", 0),
        "remainingValue": doc.get("remaining_value", 0),
        "maxPerTransaction": doc.get("max_per_transaction"),
        "merchantRestrictionType": doc.get("merchant_restriction_type", "category"),
        "merchantIds": doc.get("merchant_ids", []),
        "merchantCategory": doc.get("merchant_category"),
        "issueDate": doc.get("issue_date", ""),
        "expiryDate": doc.get("expiry_date", ""),
        "status": doc.get("status", "active"),
        "notes": doc.get("notes"),
    }


def _serialize_redemption(doc: dict) -> dict:
    doc = _id(doc)
    return {
        "id": doc["id"],
        "couponId": doc.get("coupon_id", ""),
        "employeeId": doc.get("employee_id", ""),
        "employeeName": doc.get("employee_name", ""),
        "couponType": doc.get("coupon_type", ""),
        "amount": doc.get("amount", 0),
        "merchantId": doc.get("merchant_id", ""),
        "merchantName": doc.get("merchant_name", ""),
        "redeemedAt": doc.get("redeemed_at", ""),
    }


async def _notify(company_id: str, title: str, message: str, notif_type: str = "info"):
    await enterprise_notifications_collection.insert_one({
        "company_id": company_id,
        "title": title,
        "message": message,
        "type": notif_type,
        "read": False,
        "created_at": datetime.utcnow(),
    })


# ─────────────────────────────────────────────
# MERCHANT ENDPOINTS
# ─────────────────────────────────────────────

@coupon_router.get("/merchants/{company_id}")
async def list_merchants(company_id: str):
    """Return all merchants registered by this enterprise."""
    cursor = coupon_merchants_collection.find({"company_id": company_id})
    merchants = []
    async for doc in cursor:
        merchants.append(_serialize_merchant(doc))
    return {"success": True, "merchants": merchants}


@coupon_router.post("/merchants/{company_id}")
async def add_merchant(company_id: str, data: MerchantCreate):
    """Register a new merchant for this enterprise."""
    existing = await coupon_merchants_collection.find_one({
        "company_id": company_id,
        "merchant_id": data.merchantId,
    })
    if existing:
        raise HTTPException(status_code=400, detail="Merchant ID already registered")

    now = datetime.utcnow().strftime("%Y-%m-%d")
    doc = {
        "company_id": company_id,
        "name": data.name,
        "category": data.category,
        "merchant_id": data.merchantId,
        "location": data.location,
        "contact_info": data.contactInfo,
        "status": data.status,
        "created_at": now,
    }
    result = await coupon_merchants_collection.insert_one(doc)
    doc["_id"] = result.inserted_id

    await _notify(company_id, "Merchant Added", f"Merchant '{data.name}' has been added", "success")
    return {"success": True, "merchant": _serialize_merchant(doc)}


@coupon_router.patch("/merchants/{merchant_id}/toggle-status")
async def toggle_merchant_status(merchant_id: str):
    """Toggle a merchant between active and disabled."""
    try:
        doc = await coupon_merchants_collection.find_one({"_id": ObjectId(merchant_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid merchant ID")
    if not doc:
        raise HTTPException(status_code=404, detail="Merchant not found")

    new_status = "disabled" if doc.get("status") == "active" else "active"
    await coupon_merchants_collection.update_one(
        {"_id": ObjectId(merchant_id)},
        {"$set": {"status": new_status}}
    )
    return {"success": True, "new_status": new_status}


# ─────────────────────────────────────────────
# TEMPLATE ENDPOINTS
# ─────────────────────────────────────────────

@coupon_router.get("/templates/{company_id}")
async def list_templates(company_id: str):
    """Return all coupon templates for this enterprise."""
    cursor = coupon_templates_collection.find({"company_id": company_id})
    templates = []
    async for doc in cursor:
        templates.append(_serialize_template(doc))
    return {"success": True, "templates": templates}


@coupon_router.get("/templates/{company_id}/{template_id}")
async def get_template(company_id: str, template_id: str):
    """Return a single coupon template."""
    try:
        doc = await coupon_templates_collection.find_one({
            "_id": ObjectId(template_id),
            "company_id": company_id,
        })
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid template ID")
    if not doc:
        raise HTTPException(status_code=404, detail="Template not found")
    return {"success": True, "template": _serialize_template(doc)}


@coupon_router.post("/templates/{company_id}")
async def create_template(company_id: str, data: TemplateCreate):
    """Create a new coupon template."""
    now = datetime.utcnow().strftime("%Y-%m-%d")
    doc = {
        "company_id": company_id,
        "name": data.name,
        "coupon_type": data.couponType,
        "description": data.description,
        "value_type": data.valueType,
        "fixed_amount": data.fixedAmount,
        "total_budget": data.totalBudget,
        "max_per_transaction": data.maxPerTransaction,
        "expiry_type": data.expiryType,
        "expiry_date": data.expiryDate,
        "valid_for_days": data.validForDays,
        "merchant_restriction_type": data.merchantRestrictionType,
        "merchant_ids": data.merchantIds,
        "merchant_category": data.merchantCategory,
        "status": data.status,
        "created_at": now,
    }
    result = await coupon_templates_collection.insert_one(doc)
    doc["_id"] = result.inserted_id

    await _notify(company_id, "Template Created", f"Coupon template '{data.name}' created", "success")
    return {"success": True, "template": _serialize_template(doc)}


@coupon_router.patch("/templates/{template_id}/toggle-status")
async def toggle_template_status(template_id: str):
    """Toggle template between active and inactive."""
    try:
        doc = await coupon_templates_collection.find_one({"_id": ObjectId(template_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid template ID")
    if not doc:
        raise HTTPException(status_code=404, detail="Template not found")

    new_status = "inactive" if doc.get("status") == "active" else "active"
    await coupon_templates_collection.update_one(
        {"_id": ObjectId(template_id)},
        {"$set": {"status": new_status}}
    )
    return {"success": True, "new_status": new_status}


@coupon_router.delete("/templates/{template_id}")
async def delete_template(template_id: str):
    """Permanently delete a coupon template."""
    try:
        result = await coupon_templates_collection.delete_one({"_id": ObjectId(template_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid template ID")
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Template not found")
    return {"success": True, "message": "Template deleted"}


# ─────────────────────────────────────────────
# ISSUED COUPON ENDPOINTS
# ─────────────────────────────────────────────

@coupon_router.get("/issued/{company_id}")
async def list_issued_coupons(company_id: str, status: Optional[str] = None):
    """Return all issued coupons for an enterprise, optionally filtered by status."""
    # Auto-expire any coupons whose expiry date has passed
    today = datetime.utcnow().strftime("%Y-%m-%d")
    await issued_coupons_collection.update_many(
        {
            "company_id": company_id,
            "status": {"$in": ["active", "partially_used"]},
            "expiry_date": {"$lt": today},
        },
        {"$set": {"status": "expired"}}
    )

    query: dict = {"company_id": company_id}
    if status:
        query["status"] = status

    cursor = issued_coupons_collection.find(query).sort("issue_date", -1)
    coupons = []
    async for doc in cursor:
        coupons.append(_serialize_issued(doc))
    return {"success": True, "issued_coupons": coupons}


@coupon_router.post("/issued/{company_id}")
async def issue_coupons(company_id: str, req: IssueCouponsRequest):
    """Issue one or more coupons to employees."""
    if not req.coupons:
        raise HTTPException(status_code=400, detail="No coupons provided")

    docs = []
    for c in req.coupons:
        docs.append({
            "company_id": company_id,
            "template_id": c.templateId,
            "template_name": c.templateName,
            "employee_id": c.employeeId,
            "employee_name": c.employeeName,
            "coupon_type": c.couponType,
            "original_value": c.originalValue,
            "remaining_value": c.remainingValue,
            "max_per_transaction": c.maxPerTransaction,
            "merchant_restriction_type": c.merchantRestrictionType,
            "merchant_ids": c.merchantIds,
            "merchant_category": c.merchantCategory,
            "issue_date": c.issueDate,
            "expiry_date": c.expiryDate,
            "status": c.status,
            "notes": c.notes,
            "created_at": datetime.utcnow(),
        })

    result = await issued_coupons_collection.insert_many(docs)

    # Fetch and return the inserted coupons
    inserted = []
    for oid in result.inserted_ids:
        doc = await issued_coupons_collection.find_one({"_id": oid})
        if doc:
            inserted.append(_serialize_issued(doc))

    count = len(inserted)
    await _notify(
        company_id,
        "Coupons Issued",
        f"{count} coupon{'s' if count != 1 else ''} issued to employee{'s' if count != 1 else ''}",
        "success"
    )
    return {"success": True, "count": count, "issued_coupons": inserted}


@coupon_router.patch("/issued/{coupon_id}/cancel")
async def cancel_coupon(coupon_id: str):
    """Cancel an active or partially-used coupon."""
    try:
        doc = await issued_coupons_collection.find_one({"_id": ObjectId(coupon_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid coupon ID")
    if not doc:
        raise HTTPException(status_code=404, detail="Coupon not found")
    if doc.get("status") not in ("active", "partially_used"):
        raise HTTPException(status_code=400, detail="Only active or partially-used coupons can be cancelled")

    await issued_coupons_collection.update_one(
        {"_id": ObjectId(coupon_id)},
        {"$set": {"status": "cancelled"}}
    )
    return {"success": True, "message": "Coupon cancelled"}


@coupon_router.patch("/issued/{coupon_id}/extend")
async def extend_coupon_expiry(coupon_id: str, req: ExtendExpiryRequest):
    """Extend the expiry date of an issued coupon."""
    try:
        doc = await issued_coupons_collection.find_one({"_id": ObjectId(coupon_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid coupon ID")
    if not doc:
        raise HTTPException(status_code=404, detail="Coupon not found")

    await issued_coupons_collection.update_one(
        {"_id": ObjectId(coupon_id)},
        {"$set": {"expiry_date": req.newExpiryDate}}
    )
    return {"success": True, "new_expiry_date": req.newExpiryDate}


# ─────────────────────────────────────────────
# REDEMPTION ENDPOINTS
# ─────────────────────────────────────────────

@coupon_router.get("/redemptions/{company_id}")
async def list_redemptions(company_id: str):
    """List all coupon redemptions for an enterprise."""
    cursor = coupon_redemptions_collection.find({"company_id": company_id}).sort("redeemed_at", -1)
    redemptions = []
    async for doc in cursor:
        redemptions.append(_serialize_redemption(doc))
    return {"success": True, "redemptions": redemptions}


@coupon_router.post("/redemptions/{company_id}")
async def record_redemption(company_id: str, data: RedemptionCreate):
    """Record a coupon redemption and deduct from remaining value."""
    try:
        coupon = await issued_coupons_collection.find_one({"_id": ObjectId(data.couponId)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid coupon ID")
    if not coupon:
        raise HTTPException(status_code=404, detail="Coupon not found")
    if coupon.get("status") not in ("active", "partially_used"):
        raise HTTPException(status_code=400, detail="Coupon is not redeemable")

    remaining = coupon.get("remaining_value", 0)
    max_per_txn = coupon.get("max_per_transaction")

    if data.amount > remaining:
        raise HTTPException(status_code=400, detail="Redemption amount exceeds remaining coupon balance")
    if max_per_txn and data.amount > max_per_txn:
        raise HTTPException(status_code=400, detail=f"Amount exceeds max per transaction limit of ₹{max_per_txn}")

    new_remaining = remaining - data.amount
    new_status = "fully_redeemed" if new_remaining <= 0 else "partially_used"

    await issued_coupons_collection.update_one(
        {"_id": ObjectId(data.couponId)},
        {"$set": {"remaining_value": new_remaining, "status": new_status}}
    )

    now = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
    rdm_doc = {
        "company_id": company_id,
        "coupon_id": data.couponId,
        "employee_id": data.employeeId,
        "employee_name": data.employeeName,
        "coupon_type": data.couponType,
        "amount": data.amount,
        "merchant_id": data.merchantId,
        "merchant_name": data.merchantName,
        "redeemed_at": now,
    }
    result = await coupon_redemptions_collection.insert_one(rdm_doc)
    rdm_doc["_id"] = result.inserted_id

    return {"success": True, "redemption": _serialize_redemption(rdm_doc), "remaining_value": new_remaining}


# ─────────────────────────────────────────────
# PWA EMPLOYEE-FACING ENDPOINT
# ─────────────────────────────────────────────

@coupon_router.get("/employee/{user_id}/my-coupons")
async def get_my_coupons(user_id: str):
    """
    Called by the PWA app.  Returns all active/in-use coupons issued to the
    individual whose SurePay user_id is provided.

    Flow:
    1. Lookup the individual user to get their phone & email.
    2. Find all enterprise_employees records matching that phone/email.
    3. Collect all coupon documents issued to those employee record IDs.
    4. Auto-expire stale coupons.
    5. Return coupons + the relevant merchants (for merchant scope display).
    """
    # 1. Resolve phone & email from individual user record
    individual = None
    try:
        from bson import ObjectId as ObjId
        individual = await individualusers.find_one({"_id": ObjId(user_id)})
    except Exception:
        pass

    if not individual:
        # Try by user_id string field as fallback
        individual = await individualusers.find_one({"user_id": user_id})

    if not individual:
        # Return empty — user not found or not linked to an enterprise
        return {"success": True, "coupons": [], "merchants": []}

    phone = individual.get("phone", "")
    email = individual.get("email", "")

    # Normalise phone (strip country code variants)
    clean_phone = phone.strip().replace(" ", "").replace("-", "")
    if clean_phone.startswith("+91"):
        clean_phone = clean_phone[3:]
    if clean_phone.startswith("91") and len(clean_phone) > 10:
        clean_phone = clean_phone[2:]

    # 2. Find all matching employee records across all enterprises
    emp_query_or = []
    if email:
        emp_query_or.append({"email": email})
    if clean_phone:
        emp_query_or.append({"phone": {"$regex": f".*{clean_phone}$"}})

    if not emp_query_or:
        return {"success": True, "coupons": [], "merchants": []}

    employee_ids = []
    async for emp in enterprise_employees_collection.find({"$or": emp_query_or}):
        employee_ids.append(str(emp["_id"]))

    if not employee_ids:
        return {"success": True, "coupons": [], "merchants": []}

    # 3. Auto-expire stale coupons for these employees
    today = datetime.utcnow().strftime("%Y-%m-%d")
    await issued_coupons_collection.update_many(
        {
            "employee_id": {"$in": employee_ids},
            "status": {"$in": ["active", "partially_used"]},
            "expiry_date": {"$lt": today},
        },
        {"$set": {"status": "expired"}}
    )

    # 4. Fetch all coupons issued to these employee IDs
    coupon_cursor = issued_coupons_collection.find(
        {"employee_id": {"$in": employee_ids}}
    ).sort("issue_date", -1)

    coupons = []
    company_ids = set()
    merchant_ids_needed = set()

    async for doc in coupon_cursor:
        c = _serialize_issued(doc)
        coupons.append(c)
        if doc.get("company_id"):
            company_ids.add(doc["company_id"])
        for mid in doc.get("merchant_ids", []):
            merchant_ids_needed.add(mid)

    # 5. Fetch merchants that are referenced by these coupons (by MongoDB _id)
    merchants = []
    if merchant_ids_needed:
        valid_oids = []
        for mid in merchant_ids_needed:
            try:
                valid_oids.append(ObjectId(mid))
            except Exception:
                pass
        if valid_oids:
            async for mdoc in coupon_merchants_collection.find({"_id": {"$in": valid_oids}}):
                merchants.append(_serialize_merchant(mdoc))

    # Also fetch any redemptions for these coupons so the PWA detail page works
    coupon_ids = [c["id"] for c in coupons]
    redemptions = []
    if coupon_ids:
        valid_coupon_oids = []
        for cid in coupon_ids:
            try:
                valid_coupon_oids.append(ObjectId(cid))
            except Exception:
                pass
        if valid_coupon_oids:
            async for rdoc in coupon_redemptions_collection.find(
                {"_id": {"$nin": []}, "coupon_id": {"$in": coupon_ids}}
            ).sort("redeemed_at", -1):
                redemptions.append(_serialize_redemption(rdoc))

    return {
        "success": True,
        "coupons": coupons,
        "merchants": merchants,
        "redemptions": redemptions,
    }


# ─────────────────────────────────────────────
# PWA COUPON REDEMPTION (no company_id needed)
# ─────────────────────────────────────────────

class PWARedeemRequest(BaseModel):
    couponId: str
    employeeId: str
    employeeName: str
    couponType: str       # for validation — must match the coupon's type
    amount: float
    merchantId: str = ""
    merchantName: str = ""


@coupon_router.post("/employee/redeem")
async def pwa_redeem_coupon(req: PWARedeemRequest):
    """
    Called by the PWA after a successful transaction.
    Looks up the coupon by ID, validates it, deducts the balance, and logs the redemption.
    The company_id is resolved from the coupon document itself — the frontend doesn't need to pass it.
    """
    # 1. Fetch the coupon
    try:
        coupon = await issued_coupons_collection.find_one({"_id": ObjectId(req.couponId)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid coupon ID format")

    if not coupon:
        raise HTTPException(status_code=404, detail="Coupon not found")

    # 2. Validate it can be redeemed
    if coupon.get("status") not in ("active", "partially_used"):
        raise HTTPException(status_code=400, detail=f"Coupon is not redeemable (status: {coupon.get('status')})")

    today = datetime.utcnow().strftime("%Y-%m-%d")
    if coupon.get("expiry_date", "") < today:
        raise HTTPException(status_code=400, detail="Coupon has expired")

    # 3. Enforce type match (e.g. food coupon can't be used for fuel)
    if req.couponType and coupon.get("coupon_type") != req.couponType:
        raise HTTPException(
            status_code=400,
            detail=f"Coupon type mismatch: coupon is '{coupon.get('coupon_type')}' but payment is '{req.couponType}'"
        )

    # 4. Check amount against remaining balance and per-transaction limit
    remaining = coupon.get("remaining_value", 0)
    max_per_txn = coupon.get("max_per_transaction")

    if req.amount <= 0:
        raise HTTPException(status_code=400, detail="Redemption amount must be positive")
    if req.amount > remaining:
        raise HTTPException(status_code=400, detail=f"Amount ₹{req.amount} exceeds remaining balance ₹{remaining}")
    if max_per_txn and req.amount > max_per_txn:
        raise HTTPException(status_code=400, detail=f"Amount exceeds max per transaction ₹{max_per_txn}")

    # 5. Deduct and update status
    new_remaining = remaining - req.amount
    new_status = "fully_redeemed" if new_remaining <= 0 else "partially_used"

    await issued_coupons_collection.update_one(
        {"_id": ObjectId(req.couponId)},
        {"$set": {"remaining_value": new_remaining, "status": new_status}}
    )

    # 6. Log the redemption
    company_id = coupon.get("company_id", "unknown")
    now = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
    rdm_doc = {
        "company_id": company_id,
        "coupon_id": req.couponId,
        "employee_id": req.employeeId,
        "employee_name": req.employeeName,
        "coupon_type": req.couponType,
        "amount": req.amount,
        "merchant_id": req.merchantId,
        "merchant_name": req.merchantName,
        "redeemed_at": now,
    }
    result = await coupon_redemptions_collection.insert_one(rdm_doc)
    rdm_doc["_id"] = result.inserted_id

    return {
        "success": True,
        "remaining_value": new_remaining,
        "new_status": new_status,
        "redemption": _serialize_redemption(rdm_doc),
    }


# ─────────────────────────────────────────────
# ANALYTICS ENDPOINT
# ─────────────────────────────────────────────

@coupon_router.get("/analytics/{company_id}")
async def get_coupon_analytics(company_id: str):
    """Aggregate coupon stats for the enterprise analytics tab."""
    # Aggregate issued coupons
    issued_cursor = issued_coupons_collection.find({"company_id": company_id})
    issued_all = []
    async for doc in issued_cursor:
        issued_all.append(doc)

    # Aggregate redemptions
    rdm_cursor = coupon_redemptions_collection.find({"company_id": company_id})
    redemptions_all = []
    async for doc in rdm_cursor:
        redemptions_all.append(doc)

    total_issued_value = sum(d.get("original_value", 0) for d in issued_all)
    total_redeemed = sum(d.get("amount", 0) for d in redemptions_all)
    total_remaining = sum(d.get("remaining_value", 0) for d in issued_all)

    coupon_types = ["fuel", "food", "accommodation"]
    by_type = []
    for ct in coupon_types:
        by_type.append({
            "type": ct,
            "issued": sum(1 for d in issued_all if d.get("coupon_type") == ct),
            "redeemed": sum(1 for d in redemptions_all if d.get("coupon_type") == ct),
        })

    statuses = ["active", "partially_used", "fully_redeemed", "expired", "cancelled"]
    status_distribution = [
        {"status": s, "count": sum(1 for d in issued_all if d.get("status") == s)}
        for s in statuses
    ]

    return {
        "success": True,
        "analytics": {
            "totalIssuedValue": total_issued_value,
            "totalRedeemed": total_redeemed,
            "totalRemaining": total_remaining,
            "totalCouponsIssued": len(issued_all),
            "byType": by_type,
            "statusDistribution": status_distribution,
        }
    }
