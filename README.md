# FinCopilot – AI Banking Super App
### Cognizant Technoverse Hackathon 2026

A proactive AI financial guardian that transforms banking from a passive utility into an active life-partner.

---

## Project Structure

```
fincopliot/
├── backend/
│   ├── main.py            ← FastAPI backend (all AI logic & APIs)
│   └── requirements.txt   ← Python dependencies
├── frontend/
│   └── index.html         ← Complete frontend (no build step needed)
└── README.md
```

---

## Quick Start (5 minutes)

### Step 1 — Backend

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Start the API server
uvicorn main:app --reload --port 8000
```

API will be live at: http://localhost:8000  
Swagger docs at:   http://localhost:8000/docs

---

### Step 2 — Frontend

Open `frontend/index.html` directly in your browser.  
No build step, no npm, no configuration.

> The frontend auto-connects to `http://localhost:8000`.  
> If the backend is not running, it gracefully falls back to built-in mock data — the demo still works perfectly.

---

## API Endpoints

| Method | Endpoint                     | Description                          |
|--------|------------------------------|--------------------------------------|
| GET    | /api/dashboard               | Balance, metrics, cash flow forecast |
| GET    | /api/transactions            | Recent transactions with risk flags  |
| GET    | /api/fraud/alerts            | High & medium risk transactions      |
| POST   | /api/fraud/action            | Block card or mark transaction safe  |
| GET    | /api/subscriptions           | All recurring payments               |
| POST   | /api/subscriptions/cancel    | Cancel a subscription                |
| GET    | /api/budget                  | Budget vs actual spend per category  |
| POST   | /api/chat                    | AI assistant natural language query  |

---

## Core Features (5 Modules)

| Module                | What it does                                              |
|-----------------------|-----------------------------------------------------------|
| AI Fraud Shield       | Detects suspicious transactions by IP, pattern, amount    |
| Smart Money Coach     | Budget bars, 15-day cash flow forecast, savings nudges    |
| Loan & Credit         | CIBIL score display, loan eligibility calculator          |
| Subscription Tracker  | Recurring payment list with cancel & hike detection       |
| AI Chat Assistant     | Natural language answers about spending, fraud, savings   |

---

## Tech Stack

| Layer    | Technology                        |
|----------|-----------------------------------|
| Frontend | HTML5, CSS3, Vanilla JavaScript   |
| Backend  | Python 3.10+, FastAPI, Uvicorn    |
| AI/ML    | Rule-based NLP (prototype), ready for scikit-learn / HuggingFace |
| Data     | Mock data (replace with Open Banking API / bank transaction feeds) |

---

## Demo Script (for judges)

1. **Open the dashboard** — Show balance, 15-day cash flow dip prediction, recent transactions
2. **Go to Fraud Shield** — Click "Block card" → show instant response + model feedback loop
3. **Go to Money Coach** — Show budget overspend bars + CIBIL score + loan eligibility
4. **Go to Subscriptions** — Cancel Netflix → show confirmation
5. **Go to AI Assistant** — Type "Can I afford a ₹50K laptop?" → show intelligent response

---

## Architecture (for judges)

```
User (Browser)
      │
      ▼
  index.html
  (React-ready JS)
      │
      ▼ REST API calls
  FastAPI Backend (main.py)
      │
      ├── /api/fraud/alerts   → Anomaly detection engine
      ├── /api/budget         → Spending classifier
      ├── /api/subscriptions  → Recurring payment detector
      └── /api/chat           → NLP intent resolver
            │
            ▼
  Open Banking APIs / Transaction Feeds
  (ISO 20022 standard — production ready)
```

---

## Team
Built for Cognizant Technoverse Hackathon 2026  
Project: FinCopilot — AI Banking Super App
