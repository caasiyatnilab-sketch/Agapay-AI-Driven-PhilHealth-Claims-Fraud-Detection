# Agapay: AI-Powered Blockchain PhilHealth Claims & Fraud Detection System

**Philippine Edition**

A fully functional Next.js 14 web platform that simulates the Philippine PhilHealth claims process. It utilizes Machine Learning (Isolation Forest via Python/Flask) for fraud detection, and a local Blockchain (Hardhat/Solidity) for immutable claim recording.

## Features
- **3-Role Dashboard:** Patient (PhilHealth Member), Hospital Representative, and PhilHealth Auditor.
- **AI Fraud Detection:** Synthetic data modeling detects anomalous claims based on hospital type, duration of stay, amount, and region.
- **Blockchain Ledger:** Approved claims are written to a local Ethereum blockchain to prevent record tampering.
- **Philippine Aesthetic:** True to local government styling with a secure, simple UI.
- **Graceful Fallbacks:** If the ML service or Blockchain node are offline, the system uses a deterministic rule-engine fraud score and simulated blockchain hashes so the workflow continues safely.
- **Operational Controls:** Input validation, role-aware claim access, CSV-safe reporting, enforced claim status transitions, notifications, and an auditor-only fraud analytics API support more realistic production scenarios.

## Setup Instructions

**1. Install Web Dependencies**
```bash
npm install
```

**2. Run ML Microservice (Terminal 1)**
```bash
cd ml
pip install -r requirements.txt
python app.py
```
*(The Flask app will run on port 5000 and auto-train a dummy model on first start).*

**3. Run Blockchain Node (Terminal 2)**
```bash
cd blockchain
npm install
npx hardhat node
```

**4. Deploy Smart Contract (Terminal 3)**
```bash
cd blockchain
npx hardhat run scripts/deploy.js --network localhost
```
*(Copy the contract address from the output into your `.env.local` file under `CONTRACT_ADDRESS`).*

**5. Start Next.js App (Terminal 4)**
```bash
# Back in the project root
npm run dev
# Open http://localhost:3000
```

## Test Accounts
The SQLite database will automatically seed upon first successful API call.
- **Patient 1:** patient@test.com / password123
- **Patient 2:** patient2@test.com / password123
- **Hospital 1 (PGH):** hospital@test.com / password123
- **Hospital 2 (St. Luke's):** hospital2@test.com / password123
- **Auditor:** auditor@test.com / password123


## Production Hardening Notes
- Set a strong `JWT_SECRET` in `.env.local` before using non-demo data.
- Run the ML service and blockchain node for live scoring and on-chain writes; the app will fall back to local rules/simulated transaction hashes when those services are unavailable.
- Auditor analytics are available at `GET /api/analytics/fraud` with an auditor bearer token.
