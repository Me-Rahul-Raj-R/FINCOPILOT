# FinCopilot — AI Risk, Assistance & Payments Ledger

A full-stack AI banking platform built for Render deployment. One Node.js
service serves both the React SPA and the REST API — zero CORS issues, one
URL, the RAG pipeline runs fully in-process.

---

## PROJECT STRUCTURE

```
FINCOPILOT/
├── render.yaml                     ← Render Blueprint (one-click deploy)
├── package.json                    ← Root scripts: build, start, dev
├── .gitignore
├── README.md
│
├── backend/                        ← Express REST API
│   ├── server.js                   ← Entry point: middleware + routes + SPA serving
│   ├── ecosystem.config.js         ← PM2 cluster mode for self-hosted scaling
│   ├── package.json
│   ├── .env.example                ← Copy to .env and fill in values
│   │
│   ├── config/
│   │   └── db.js                   ← Sequelize/MySQL connect + in-memory fallback
│   │
│   ├── models/                     ← Sequelize models (MySQL tables)
│   │   ├── index.js                ← Registry + associations
│   │   ├── User.js                 ← id, name, email, passwordHash, role
│   │   ├── LoanApplication.js      ← Credit scoring results
│   │   ├── Transaction.js          ← Fraud detection results
│   │   ├── KycRecord.js            ← KYC + synthetic-identity results
│   │   ├── ClimateAssessment.js    ← Climate risk assessments
│   │   ├── WalletAccount.js        ← Per-user wallet balance
│   │   └── WalletTransaction.js    ← Wallet ledger entries
│   │
│   ├── ml/                         ← All algorithms (no external ML API)
│   │   ├── logisticRegression.js   ← Gradient-descent logistic regression
│   │   ├── creditScoringService.js ← Bureau model + alternative-data (thin-file)
│   │   ├── fraudDetectionService.js← z-score + velocity + fan-out + AML structuring
│   │   ├── climateRiskService.js   ← Exposure × hazard × tenure scoring
│   │   ├── tfidfIndex.js           ← TF-IDF vectorizer + cosine similarity
│   │   ├── ragService.js           ← RAG: retrieve → compose → cite sources
│   │   └── chatAssistantService.js ← Keyword-intent fallback
│   │
│   ├── data/
│   │   ├── syntheticCreditData.js  ← Borrower dataset for model training
│   │   ├── knowledgeBase.js        ← 25 RAG entries (12 problems + module facts)
│   │   └── seedAdmin.js            ← `npm run seed:admin`
│   │
│   ├── middleware/
│   │   ├── auth.js                 ← JWT authenticate + requireAdmin guards
│   │   └── errorHandler.js         ← 404 + 500 handlers
│   │
│   ├── controllers/
│   │   ├── authController.js       ← Signup + wallet create, login, /me
│   │   ├── creditController.js     ← Bureau + alternative-data scoring
│   │   ├── fraudController.js      ← Transaction evaluation
│   │   ├── kycController.js        ← Liveness + synthetic-identity linkage
│   │   ├── climateController.js    ← Climate risk assessment
│   │   ├── walletController.js     ← Wallet, send (via Fraud Shield), bill pay
│   │   ├── chatController.js       ← RAG assistant
│   │   ├── dashboardController.js  ← Per-user / all-user stats
│   │   ├── cyberController.js      ← Security posture + PQC checklist
│   │   └── adminController.js      ← Cross-user overview + paginated user/role mgmt
│   │
│   ├── routes/                     ← authRoutes, creditRoutes, fraudRoutes,
│   │                                  kycRoutes, climateRoutes, walletRoutes,
│   │                                  chatRoutes, dashboardRoutes, cyberRoutes,
│   │                                  adminRoutes
│   │
│   └── utils/
│       ├── authUtils.js            ← bcrypt hash/compare + JWT sign/verify
│       ├── memoryStore.js          ← In-memory store for demo mode
│       └── paginate.js             ← parsePagination + paginatedResponse
│
└── frontend/                       ← React 19 + Vite
    ├── index.html
    ├── vite.config.js              ← Dev proxy to :5000, code-split chunks
    ├── package.json
    └── src/
        ├── main.jsx                ← BrowserRouter + ToastProvider + AuthProvider
        ├── App.jsx                 ← Routes: public + protected + admin-only
        ├── index.css               ← Premium design system (tokens, glassmorphism)
        │
        ├── lib/
        │   ├── api.js              ← Fetch wrapper with JWT header injection
        │   ├── AuthContext.jsx     ← JWT session state (localStorage)
        │   ├── ToastContext.jsx    ← Animated toast notification system
        │   └── timeUtils.js        ← timeAgo() + dailyCountTrend()
        │
        ├── components/
        │   ├── Layout.jsx          ← Sidebar + Topbar + PageTransition
        │   ├── Sidebar.jsx         ← Off-canvas mobile drawer, admin link
        │   ├── Topbar.jsx          ← Greeting, notification bell, user menu
        │   ├── ProtectedRoute.jsx  ← Auth guard + admin guard
        │   ├── PageTransition.jsx  ← Framer Motion route animation
        │   ├── Card.jsx            ← Base card (glass, gold, teal variants)
        │   ├── Badge.jsx           ← Tone-to-CSS mapping (20+ status strings)
        │   ├── StatTile.jsx        ← Animated counter + sparkline trend
        │   ├── AnimatedNumber.jsx  ← RAF count-up with ease-out curve
        │   ├── Sparkline.jsx       ← Inline SVG trend line (no library)
        │   ├── TrustRadar.jsx      ← Gradient SVG semi-circular gauge
        │   └── EmptyState.jsx      ← Consistent empty-state placeholder
        │
        └── pages/
            ├── Login.jsx           ← Role-selector tabs, demo credential autofill
            ├── Signup.jsx          ← Two-column, feature panel, password strength
            ├── Dashboard.jsx       ← Hero, animated tiles, module grid, activity feed
            ├── CreditRisk.jsx      ← Bureau + thin-file mode toggle, explainability
            ├── FraudShield.jsx     ← 4-signal detection + mule + AML simulations
            ├── KycVault.jsx        ← 3-step flow + synthetic-identity linkage alert
            ├── ClimateLedger.jsx   ← Bar chart + risk delta + recommendation
            ├── CyberWatch.jsx      ← Animated tiles, 7-day chart, PQC checklist
            ├── Pay.jsx             ← Glassmorphic wallet + Framer modals + confetti
            ├── Assistant.jsx       ← RAG chat + source chips + topic panels
            ├── AdminPanel.jsx      ← Cross-user stats + paginated user table
            └── NotFound.jsx        ← 404 with quick-nav grid
```

---

## 1. DEPLOY ON RENDER (Recommended)

### Quick deploy (3 steps)

1. **Push to GitHub**
   ```bash
   git init && git add . && git commit -m "Initial FinCopilot"
   git remote add origin https://github.com/YOUR/fincopilot.git
   git push -u origin main
   ```

2. **Connect to Render**
   - Go to https://render.com → **New → Blueprint**
   - Connect your GitHub repo
   - Render reads `render.yaml` automatically

3. **Set environment variables** in the Render dashboard:

   | Variable | Value |
   |---|---|
   | `NODE_ENV` | `production` |
   | `JWT_SECRET` | (Render auto-generates, or paste 64 random hex chars) |
   | `ADMIN_EMAIL` | `admin@yourbank.com` |
   | `ADMIN_PASSWORD` | `YourStrongPassword!` |
   | `DB_HOST` | *(leave empty for Demo Mode, or set your MySQL host)* |

4. **Click Deploy** → Render runs:
   ```
   cd frontend && npm install && npm run build
   cp -r frontend/dist backend/public/dist
   cd backend && npm install
   node server.js
   ```

### What happens on Render
- One Node.js service at `https://fincopilot-xxxx.onrender.com`
- React SPA served from `/` via Express static
- All API calls go to `/api/*` on the **same origin** → zero CORS issues
- The RAG pipeline (TF-IDF + knowledge base) runs **inside Node.js** → works immediately, no external API needed
- On the free plan: the service sleeps after 15 min inactivity. Upgrade to **Starter ($7/mo)** for always-on.

---

## 2. CONNECT TO MySQL (Persistent Mode)

By default FinCopilot runs in **Demo Mode** (in-memory, resets on restart). To persist data, connect a real MySQL database.

### Option A — PlanetScale (Free, cloud MySQL, Render-friendly)

1. Go to https://planetscale.com → Create database → `fincopilot`
2. Go to **Connect** → Create password → copy the connection string
3. In Render dashboard, set:
   ```
   DB_HOST     = aws.connect.psdb.cloud
   DB_PORT     = 3306
   DB_NAME     = fincopilot
   DB_USER     = (from PlanetScale)
   DB_PASSWORD = (from PlanetScale)
   ```
4. PlanetScale uses SSL by default. Add to `config/db.js` dialect options if needed:
   ```js
   ssl: { rejectUnauthorized: true }
   ```

### Option B — Railway MySQL (Free starter)

1. https://railway.app → New Project → Add MySQL
2. Copy the MySQL connection variables from Railway's dashboard
3. Set `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` in Render

### Option C — Aiven MySQL (Free trial)

1. https://aiven.io → Create MySQL service (free trial)
2. Download CA certificate (add to dialextOptions if needed)
3. Copy connection details to Render env vars

### Option D — Local MySQL + MySQL Workbench (development)

1. **Install MySQL** (community server or MariaDB)
2. **Open MySQL Workbench** → New Connection:
   - Hostname: `127.0.0.1`
   - Port: `3306`
   - Username: `root`
3. **Create database and user** (run in Workbench SQL editor):
   ```sql
   CREATE DATABASE IF NOT EXISTS fincopilot CHARACTER SET utf8mb4;
   CREATE USER IF NOT EXISTS 'fincopilot_user'@'localhost'
     IDENTIFIED BY 'YourPassword123';
   GRANT ALL PRIVILEGES ON fincopilot.* TO 'fincopilot_user'@'localhost';
   FLUSH PRIVILEGES;
   ```
4. **Copy `backend/.env.example` to `backend/.env`** and fill in:
   ```env
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_NAME=fincopilot
   DB_USER=fincopilot_user
   DB_PASSWORD=YourPassword123
   JWT_SECRET=run-node-e-crypto-randomBytes-48-toString-hex
   ADMIN_EMAIL=admin@bank.com
   ADMIN_PASSWORD=Admin@12345
   ```
5. **Start the backend**: `npm run dev`
   You should see: `[db] Connected to MySQL (fincopilot) - running in PERSISTENT MODE.`
6. **Refresh Workbench** → Schemas panel shows 7 tables:
   `users · loan_applications · transactions · kyc_records ·
   climate_assessments · wallet_accounts · wallet_transactions`
7. **Create admin account**: `npm run seed:admin`
8. **Verify** in Workbench:
   ```sql
   SELECT id, email, role FROM users;
   ```

### How Sequelize auto-creates tables
FinCopilot calls `sequelize.sync()` on every startup. This creates any missing
tables automatically — you never need to run migrations manually. All columns
include performance indexes (userId, senderAccount, phone, deviceId, createdAt).

---

## 3. LOCAL DEVELOPMENT

```bash
# Terminal 1 — Backend (demo mode, zero setup)
cd backend
npm install
cp .env.example .env   # leave DB_HOST blank for demo mode
npm run dev            # http://localhost:5000
# Watch startup log for admin credentials

# Terminal 2 — Frontend
cd frontend
npm install
npm run dev            # http://localhost:5173
```

Vite proxies all `/api/*` calls to `:5000` during development.

---

## 4. ADMIN ACCOUNT

| Mode | How admin is created |
|---|---|
| Demo mode | Auto-seeded on every boot. Credentials printed in startup log. |
| Persistent (MySQL) | Run `npm run seed:admin` once. Reads `ADMIN_EMAIL` / `ADMIN_PASSWORD` from `.env`. Re-run to change password. |

**Admin can only be created via `seed:admin` or demo auto-seed — never through the public signup page.**

Admin sees cross-user data, a paginated user list, and can promote/demote roles.

---

## 5. API REFERENCE

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/health` | — | Service status + mode |
| POST | `/api/auth/signup` | — | Create account + wallet |
| POST | `/api/auth/login` | — | Returns JWT |
| GET | `/api/auth/me` | user | Current profile |
| GET | `/api/dashboard/summary` | user | Stats (own or all for admins) |
| POST | `/api/credit-score` | user | Score applicant (bureau or thin-file) |
| GET | `/api/credit-score` | user | Recent applications |
| POST | `/api/fraud/check` | user | Evaluate transaction |
| GET | `/api/fraud` | user | Recent transactions |
| GET | `/api/kyc/challenge` | user | Issue liveness code |
| POST | `/api/kyc` | user | Submit onboarding |
| GET | `/api/kyc` | user | Recent KYC attempts |
| GET | `/api/climate-risk/options` | user | Industry + region lists |
| POST | `/api/climate-risk/assess` | user | Climate risk assessment |
| GET | `/api/climate-risk` | user | Recent assessments |
| GET | `/api/cyber/posture` | user | Security posture snapshot |
| POST | `/api/chat` | — | RAG assistant reply + sources |
| GET | `/api/wallet` | user | Wallet balance + history |
| GET | `/api/wallet/contacts` | user | Contacts list |
| POST | `/api/wallet/send` | user | Send money (via Fraud Shield) |
| POST | `/api/wallet/bill-pay` | user | Pay a bill |
| GET | `/api/admin/overview` | admin | Cross-user totals |
| GET | `/api/admin/users` | admin | Paginated user list |
| PATCH | `/api/admin/users/:id/role` | admin | Promote / demote |

---

## 6. RESUME BULLETS

- Built **FinCopilot**, a full-stack AI banking risk platform (React 19, Node.js, Sequelize/MySQL) deployed on Render — credit scoring, fraud/AML detection, synthetic-identity KYC, climate risk, cyber posture, and a GPay-style wallet behind JWT auth with user/admin roles
- Implemented **four fraud/AML detection signals** from scratch (amount z-score, velocity, beneficiary fan-out, AML structuring/smurfing) applied live to every wallet transfer before funds move
- Built a **real RAG assistant** (TF-IDF + cosine-similarity over a 25-entry banking knowledge base) that returns grounded answers with source citations — no external LLM API required, works immediately after Render deploy
- Added **alternative-data credit scoring** for thin-file applicants and a **synthetic-identity linkage check** in KYC — directly addressing financial exclusion and cross-record identity fraud
- Architected for **1000+ concurrent users**: PM2 cluster mode, Sequelize connection pool (20 per worker), DB indexes on every high-frequency query column, rate limiting, helmet, gzip, and graceful shutdown

---

## 7. TECH STACK

| Layer | Stack |
|---|---|
| Frontend | React 19, Vite, Framer Motion, Recharts, canvas-confetti, lucide-react |
| Backend | Node.js, Express, Sequelize, MySQL2 |
| Auth | bcryptjs, jsonwebtoken |
| ML/AI | Logistic regression (from scratch), TF-IDF + cosine similarity RAG (from scratch) |
| Production | Helmet, compression, express-rate-limit, PM2 cluster mode, graceful shutdown |
| Deployment | Render (single Node.js web service) |
