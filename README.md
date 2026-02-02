# SurePay 
### The Unified Digital Wallet & Enterprise Financial Platform

![Status](https://img.shields.io/badge/Status-Development-orange?style=flat-square)
![Frontend](https://img.shields.io/badge/Frontend-React_TypeScript-blue?style=flat-square&logo=react)
![Backend](https://img.shields.io/badge/Backend-FastAPI_Python-009688?style=flat-square&logo=fastapi)
![Database](https://img.shields.io/badge/Database-MongoDB-47A248?style=flat-square&logo=mongodb)


SurePay is a comprehensive fintech platform designed to bridge the gap between **Corporate Financial Management** and **Individual Digital Payments**. It features a dual-interface architecture: a robust dashboard for enterprises to manage funds and teams, and a seamless mobile-first wallet for individual users with complete KYC compliance.

---

##  Key Features

###  Enterprise Portal
* **Secure Authentication:** Company login with email/password and secure session management.
* **Financial Dashboard:** Real-time visualization of wallet balances, transaction trends, and cash flow (Credit/Debit).
* **Team Management:** Overview of authorized personnel and team size.
* **Quick Actions:** One-click access to add money, send payments, or request funds.

### Individual User Wallet
* **OTP-Based Onboarding:** Secure password-less login using phone number verification.
* **KYC Workflow:** Multi-step Know Your Customer (KYC) process including:
    * Phone Verification (Mock OTP).
    * Personal Details (PAN/Aadhaar sync logic).
    * Document Uploads.
* **Smart Navigation:** State-persisted navigation ensures data isn't lost during the onboarding flow.

---

## Tech Stack

### Frontend (Client)
* **Framework:** [React](https://react.dev/) (Vite)
* **Icons:** [Lucide React](https://lucide.dev/)
* **State Management:** React Hooks (`useState`, `useEffect`, `useContext`)

### Backend (Server)
* **Framework:** [FastAPI](https://fastapi.tiangolo.com/) (Python)
* **Database:** [MongoDB](https://www.mongodb.com/)
* **ODM:** [Motor](https://motor.readthedocs.io/) (Async MongoDB driver)
* **Validation:** [Pydantic](https://docs.pydantic.dev/)
* **Security:** JWT (JSON Web Tokens), BCrypt password hashing.

---

## Project Structure

```bash
surepay/
├── backend/
│   ├── main.py              # Application entry point
│   ├── database.py          # MongoDB connection & collections
│   ├── models.py            # Pydantic data models
│   ├── routes/
│   │   ├── auth.py          # Authentication (Login/OTP)
│   │   ├── kyc.py           # KYC & Onboarding endpoints
│   │   └── company.py       # Enterprise endpoints
│   └── utils/               # Helper functions (Hashing, JWT)
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Full page views (Dashboard, Login, KYC)
│   │   ├── lib/             # Utilities (cn, validators)
│   │   └── App.tsx          # Main Router logic
│   └── package.json
└── README.md
