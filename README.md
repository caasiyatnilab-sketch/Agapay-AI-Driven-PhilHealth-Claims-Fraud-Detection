# Agapay — AI-Driven PhilHealth Claims Fraud Detection

Agapay is a professional, full-stack prototype for screening Philippine PhilHealth claims with role-based workflows, AI-assisted fraud scoring, audit-friendly reporting, and optional blockchain-backed claim attestations.

> **Important:** This project is intended for demonstration, research, and portfolio use. It is not connected to PhilHealth production systems and must not be used to process real patient data without security, privacy, compliance, and clinical governance reviews.

## Repository description

**Suggested GitHub description:**

> AI-assisted PhilHealth claims fraud screening platform with patient, hospital, and auditor workflows, Flask ML scoring, SQLite persistence, and optional Hardhat blockchain audit trails.

## What the project does

- **Patients** submit claims with hospital, diagnosis, ICD-10, admission duration, and amount details.
- **Hospitals** review pending claims and approve or reject claims assigned to their facility.
- **Auditors** review all claims by fraud risk, export CSV reports, mark approved claims as paid, and inspect top-risk hospitals.
- **ML service** scores claims through a Flask Isolation Forest model when available.
- **Rule engine fallback** provides deterministic risk scoring when the ML service is offline.
- **Blockchain module** writes claim decisions to a local Hardhat chain when configured and falls back to simulated transaction hashes for demos.

## Core capabilities

| Area | Capability |
| --- | --- |
| Authentication | JWT-based auth with patient, hospital, and auditor roles. |
| Claims | Submission, role-filtered listing, single-claim access control, and timeline history. |
| Fraud screening | ML scoring plus rule-based fallback for high amounts, short stays, long admissions, duplicate claims, and recent claim volume. |
| Workflow controls | Guardrails for valid state transitions: pending → approved/rejected, approved → paid. |
| Auditor analytics | Auditor-only fraud summary endpoint and top-risk hospital cards. |
| Reporting | CSV export with escaped fields and patient/hospital/risk context. |
| Blockchain | Optional local Ethereum/Hardhat claim recording and paid-status marking. |
| Resilience | Demo continues when ML or blockchain services are unavailable. |

## Tech stack

- **Frontend:** Next.js 14 App Router, React 18, Tailwind CSS, Recharts
- **Backend:** Next.js API routes, Sequelize, SQLite
- **ML service:** Python, Flask, scikit-learn Isolation Forest
- **Blockchain:** Solidity, Hardhat, ethers.js
- **Auth:** bcrypt password hashes and JSON Web Tokens

## Project structure

```text
app/                  Next.js pages and API routes
components/           Role dashboards and shared UI components
lib/                  Auth, database, blockchain, and claim-rule helpers
ml/                   Flask ML service for fraud scoring and OCR simulation
blockchain/           Hardhat Solidity contract and deployment script
scripts/              Local health and syntax-check utilities
```

## Prerequisites

- Node.js **18.17+** and npm **9+**
- Python **3.10+**
- SQLite-compatible runtime, bundled through `sqlite3`
- Optional: a local Hardhat JSON-RPC node for live blockchain writes

## Installation

### 1. Clone and install web dependencies

```bash
git clone <your-repo-url>
cd Agapay-AI-Driven-PhilHealth-Claims-Fraud-Detection
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env.local
```

Then set at least:

```env
JWT_SECRET=replace-with-a-strong-secret
ML_API_URL=http://127.0.0.1:5000
RPC_URL=http://127.0.0.1:8545
CONTRACT_ADDRESS=
```

Generate a strong JWT secret with:

```bash
openssl rand -base64 32
```

### 3. Install and run the ML service

```bash
cd ml
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

The ML service runs at `http://127.0.0.1:5000` and trains a local demo model on first start.

### 4. Optional: run the local blockchain

Open a second terminal:

```bash
npm run chain:install
npm run chain:node
```

Open a third terminal and deploy the smart contract:

```bash
npm run chain:deploy
```

Copy the deployed contract address into `.env.local` as `CONTRACT_ADDRESS`.

### 5. Run the web app

```bash
npm run dev
```

Open `http://localhost:3000`.

## Demo accounts

The SQLite database seeds demo users on first API/database initialization.

| Role | Email | Password |
| --- | --- | --- |
| Patient | `patient@test.com` | `password123` |
| Patient | `patient2@test.com` | `password123` |
| Hospital | `hospital@test.com` | `password123` |
| Hospital | `hospital2@test.com` | `password123` |
| Auditor | `auditor@test.com` | `password123` |

## Useful commands

```bash
npm run dev            # Start the Next.js app
npm run build          # Build for production
npm run start          # Start a production build
npm run check          # Run server-side syntax checks
npm run doctor         # Check local setup readiness
npm run ml:dev         # Start the Flask ML service
npm run chain:node     # Start local Hardhat blockchain
npm run chain:deploy   # Deploy the claims smart contract
```

## API overview

| Endpoint | Method | Role | Purpose |
| --- | --- | --- | --- |
| `/api/auth/register` | POST | Public | Register a patient, hospital user, or auditor. |
| `/api/auth/login` | POST | Public | Login and receive a JWT. |
| `/api/claims` | GET | Authenticated | List claims scoped to the user role. |
| `/api/claims` | POST | Patient | Submit and fraud-screen a claim. |
| `/api/claims/:id` | GET | Owner/hospital/auditor | Read a claim with access control. |
| `/api/claims/:id/timeline` | GET | Owner/hospital/auditor | Read claim timeline entries. |
| `/api/claims/:id/approve-hospital` | PUT | Hospital | Approve or reject pending hospital claims. |
| `/api/claims/:id/audit` | PUT | Auditor | Approve, reject, or mark approved claims as paid. |
| `/api/analytics/fraud` | GET | Auditor | Get fraud summary and top-risk hospitals. |
| `/api/reports` | GET | Auditor | Download CSV report. |
| `/api/blockchain/explore` | GET | Public | View local chain events or simulated demo events. |

## Real-world readiness notes

Before using this with real data, implement and review:

- Encrypted production database and migrations instead of SQLite sync.
- Strong secret management and JWT rotation policies.
- PHI/PII minimization, consent, audit logging, and retention controls.
- Formal model validation, drift monitoring, explainability, and bias review.
- Role provisioning, MFA, approval queues, and separation of duties.
- Production-grade observability, rate limiting, backup/restore, and incident response.
- Blockchain key management and a decision on whether on-chain records should contain only non-sensitive attestations.

## Development notes

- Local `database.sqlite`, ML model files, `.env.local`, and dependency folders are intentionally ignored by Git.
- If the ML service is unavailable, the claim API uses `lib/claimRules.js` for deterministic fallback scoring.
- If the blockchain node or contract address is unavailable, blockchain writes return simulated transaction hashes to keep demos flowing.
