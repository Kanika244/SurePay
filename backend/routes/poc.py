from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status
from database import company_poc_collection
from utils.ocr_utils import extract_text_async, parse_id_card
from utils.storage import save_upload_file
from datetime import datetime
from bson import ObjectId

poc_router = APIRouter(prefix="/api/v1/poc", tags=["Company POC"])

# --- Endpoint 1: OCR Extraction ---
@poc_router.post("/extract-ocr")
async def extract_ocr_data(file: UploadFile = File(...)):
    """
    Called when user uploads ID. Returns extracted Name/ID to frontend.
    """
    try:
        content = await file.read()
        is_pdf = file.filename.lower().endswith('.pdf')
        
        # 1. Run OCR (Async)
        raw_text = await extract_text_async(content, is_pdf)
        
        # 2. Parse Logic
        extracted_id, extracted_name = parse_id_card(raw_text)
        
        return {
            "success": True,
            "data": {
                "extractedIdNumber": extracted_id,
                "extractedName": extracted_name
            }
        }
    except Exception as e:
        print(f"OCR Error: {e}")
        raise HTTPException(status_code=500, detail="OCR processing failed")


# --- Endpoint 2: Submit POC Details ---
@poc_router.post("/submit")
async def submit_poc(
    # These match the keys in your Frontend 'formData.append()'
    full_name: str = Form(...),
    email: str = Form(...),
    mobile: str = Form(...),
    designation: str = Form(...),
    is_authorized: bool = Form(...),
    extracted_id_number: str = Form(None),
    company_id: str = Form(...), 
    
    # File Objects
    government_id: UploadFile = File(...),
    authorization_proof: UploadFile = File(...)
):
    """
    Final submission step. Uploads files -> Saves DB Entry.
    """
    # 1. Basic Validation
    if not is_authorized:
        raise HTTPException(status_code=400, detail="Authorization confirmation is required.")

    # 2. Upload Files
    try:
        gov_id_path = await save_upload_file(government_id, prefix=f"{company_id}_gov")
        auth_proof_path = await save_upload_file(authorization_proof, prefix=f"{company_id}_auth")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"File upload failed: {str(e)}")

    # 3. Create Document
    poc_doc = {
        "company_id": company_id, # Link to Company Collection
        "full_name": full_name,
        "email": email,
        "mobile": mobile,
        "designation": designation,
        "is_authorized": is_authorized,
        
        # Document Details
        "documents": {
            "gov_id_path": gov_id_path,
            "auth_proof_path": auth_proof_path,
            "extracted_aadhaar": extracted_id_number,
            "ocr_verified": bool(extracted_id_number)
        },
        
        "created_at": datetime.utcnow(),
        "status": "pending_review" # Ready for the "Review" step in your flow
    }

    # 4. Save to MongoDB
    result = await company_poc_collection.insert_one(poc_doc)

    return {
        "status": "success",
        "message": "POC details saved successfully",
        "poc_id": str(result.inserted_id),
        "next_step": "wallet"
    }