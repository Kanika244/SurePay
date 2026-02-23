import requests
import random
import string

BASE_URL = "http://localhost:8000"

def generate_email():
    return f"test_company_{''.join(random.choices(string.ascii_lowercase, k=5))}@example.com"

def run_verification():
    email = generate_email()
    password = "securepassword123"
    print(f"Testing with Email: {email}")

    # 1. Create Company
    print("\n[1] Creating Company...")
    create_payload = {
        "user_email": email,
        "legal_name": "Test Corp",
        "company_type": "LLC",
        "country": "India",
        "registered_address": "123 Test St",
        "industry_category": "Tech",
        "password": password
    }
    try:
        res = requests.post(f"{BASE_URL}/company/create", json=create_payload)
        res.raise_for_status()
        data = res.json()
        print("Success:", data)
        company_id = data.get("company_id")
    except Exception as e:
        print("Failed to create company:", e)
        print(res.text)
        return

    # 2. Login
    print("\n[2] Logging in...")
    login_payload = {
        "email": email,
        "password": password,
        "login_type": "company"
    }
    try:
        res = requests.post(f"{BASE_URL}/login/", json=login_payload)
        res.raise_for_status()
        data = res.json()
        print("Success:", data)
        token = data.get("access_token")
        login_company_id = data.get("company_id")
        
        if login_company_id != company_id:
             print(f"WARNING: Login returned different company ID: {login_company_id} vs {company_id}")

    except Exception as e:
        print("Failed to login:", e)
        print(res.text)
        return

    # 3. Create Wallet
    print("\n[3] Creating Wallet...")
    wallet_payload = {"company_id": company_id}
    try:
        res = requests.post(f"{BASE_URL}/api/v1/wallet/create", json=wallet_payload, headers={"Authorization": f"Bearer {token}"})
        # Note: wallet create endpoint currently doesn't require auth but good practice
        res.raise_for_status()
        print("Success:", res.json())
    except Exception as e:
        print("Failed to create wallet:", e)
        print(res.text)
        return

    # 4. Fetch Company Details
    print("\n[4] Fetching Company Details...")
    try:
        res = requests.get(f"{BASE_URL}/company/{company_id}")
        res.raise_for_status()
        print("Success:", res.json())
    except Exception as e:
        print("Failed to fetch details:", e)
        print(res.text)
        return

    print("\nFull Flow Verified Successfully!")

if __name__ == "__main__":
    run_verification()
