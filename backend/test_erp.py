"""
Quick test script to simulate ERP calls to SurePay integration API.
Usage: python test_erp.py <your_api_key>
"""
import requests
import sys

BASE = "http://localhost:8000/api/v1/integrate"


def main():
    if len(sys.argv) < 2:
        print("Usage: python test_erp.py <your_api_key>")
        print("Example: python test_erp.py sp_live_abc123...")
        return

    API_KEY = sys.argv[1]
    headers = {"X-SurePay-API-Key": API_KEY, "Content-Type": "application/json"}

    print("\n Simulating ERP → SurePay sync...\n")

    # 1. Add a single employee
    print("1️ Adding employee: Rahul Sharma (Engineering)...")
    res = requests.post(f"{BASE}/employee/add", headers=headers, json={
        "employee_id": "ERP-001",
        "first_name": "Rahul",
        "last_name": "Sharma",
        "email": "rahul.sharma@erp.com",
        "phone": "+919876543210",
        "department": "Engineering",
        "designation": "Senior Developer",
        "salary": 120000
    })
    print(f"   → {res.status_code}: {res.json().get('message', res.json())}\n")

    # 2. Add another employee
    print(" Adding employee: Priya Patel (Marketing)...")
    res = requests.post(f"{BASE}/employee/add", headers=headers, json={
        "employee_id": "ERP-002",
        "first_name": "Priya",
        "last_name": "Patel",
        "email": "priya.patel@erp.com",
        "phone": "+919876543211",
        "department": "Marketing",
        "designation": "Marketing Manager",
        "salary": 95000
    })
    print(f"   → {res.status_code}: {res.json().get('message', res.json())}\n")

    # 3. Check employee status
    print(" Checking status of ERP-001...")
    res = requests.get(f"{BASE}/employee/status/ERP-001", headers=headers)
    data = res.json()
    print(f"   → Name: {data.get('name')}")
    print(f"   → KYC: {'Verified' if data.get('kyc_verified') else 'Pending'}")
    print(f"   → Wallet: ₹{data.get('wallet_balance', 0):,.0f}\n")

    # 4. List all synced employees
    print(" Listing all ERP-synced employees...")
    res = requests.get(f"{BASE}/employees/all", headers=headers)
    data = res.json()
    print(f"   → Total: {data.get('total', 0)} employees")
    for emp in data.get("employees", []):
        print(f"      • {emp['name']} ({emp['department']}) — KYC: {'Verified' if emp['kyc_verified'] else 'Pending'}")

    print("\n Done! Check your SurePay dashboard:")
    print("   • Employees page → new employees should appear")
    print("   • Bell icon → 'New Employee Synced from ERP' notification")
    print("   • webhook.site → event payloads should be visible")


if __name__ == "__main__":
    main()
