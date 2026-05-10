from fastapi import FastAPI # pyright: ignore[reportMissingImports]
from fastapi.middleware.cors import CORSMiddleware # pyright: ignore[reportMissingImports]
from pydantic import BaseModel # pyright: ignore[reportMissingImports]
from typing import List, Optional
import random
from datetime import datetime, timedelta

app = FastAPI(title="FinCopilot API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Mock data ────────────────────────────────────────────────────────────────

TRANSACTIONS = [
    {"id": "t1", "name": "Swiggy", "category": "Food & Dining", "amount": -840,
     "date": "2026-04-24", "risk_score": 15, "flag": "price_hike", "note": "+20% price hike detected"},
    {"id": "t2", "name": "Netflix", "category": "Entertainment", "amount": -649,
     "date": "2026-04-23", "risk_score": 94, "flag": "fraud", "note": "Charged from New Zealand IP"},
    {"id": "t3", "name": "HDFC Home Loan EMI", "category": "EMI", "amount": -12800,
     "date": "2026-04-22", "risk_score": 2, "flag": None, "note": None},
    {"id": "t4", "name": "Salary Credit", "category": "Income", "amount": 68000,
     "date": "2026-04-20", "risk_score": 0, "flag": None, "note": None},
    {"id": "t5", "name": "Amazon", "category": "Shopping", "amount": -3200,
     "date": "2026-04-18", "risk_score": 8, "flag": None, "note": None},
    {"id": "t6", "name": "Zomato", "category": "Food & Dining", "amount": -1800,
     "date": "2026-04-15", "risk_score": 62, "flag": "unusual", "note": "3x normal spend"},
    {"id": "t7", "name": "PayPal Transfer", "category": "Transfer", "amount": -5000,
     "date": "2026-04-10", "risk_score": 45, "flag": "new_recipient", "note": "New recipient"},
    {"id": "t8", "name": "Cult.fit Gym", "category": "Health", "amount": -1499,
     "date": "2026-04-08", "risk_score": 3, "flag": None, "note": None},
]

SUBSCRIPTIONS = [
    {"id": "s1", "name": "Netflix", "amount": 649, "renews_on": "2026-04-28",
     "category": "Entertainment", "hike": 50, "status": "active"},
    {"id": "s2", "name": "Amazon Prime", "amount": 299, "renews_on": "2026-05-02",
     "category": "Entertainment", "hike": 0, "status": "active"},
    {"id": "s3", "name": "Disney+ Hotstar", "amount": 499, "renews_on": "2026-05-10",
     "category": "Entertainment", "hike": 0, "status": "active"},
    {"id": "s4", "name": "Cult.fit Gym", "amount": 1499, "renews_on": "2026-05-01",
     "category": "Health", "hike": 0, "status": "active"},
    {"id": "s5", "name": "Spotify", "amount": 119, "renews_on": "2026-05-05",
     "category": "Music", "hike": 0, "status": "active"},
    {"id": "s6", "name": "HDFC Home Loan EMI", "amount": 12800, "renews_on": "2026-04-25",
     "category": "EMI", "hike": 0, "status": "active"},
]

BUDGET = {
    "food_dining":      {"spent": 14200, "limit": 12000},
    "transport":        {"spent": 4800,  "limit": 6000},
    "entertainment":    {"spent": 3200,  "limit": 3000},
    "shopping":         {"spent": 8900,  "limit": 10000},
    "health":           {"spent": 1499,  "limit": 2000},
}

CASHFLOW = [
    {"day": "Today", "balance": 284530},
    {"day": "+2",    "balance": 271730},
    {"day": "+4",    "balance": 258930},
    {"day": "+6",    "balance": 242130},
    {"day": "+8",    "balance": 215530},
    {"day": "+10",   "balance": 197330},
    {"day": "+12",   "balance": 219730},
    {"day": "+15",   "balance": 241530},
]

AI_RESPONSES = {
    "afford laptop":  "Based on your current balance of ₹2,84,530 and upcoming EMIs of ₹12,800, you CAN afford ₹50,000 without stress. However your cash flow dips around day +8. Buying after salary credit next month ensures zero impact on savings.",
    "netflix":        "Netflix was charged from a New Zealand IP. Your last 6 months show all activity from Chennai. Risk score: 94/100. Change your Netflix password immediately and decide if this charge is authorised.",
    "save":           "You've already saved ₹9,400 this month. Cutting dining by ₹2,000 and pausing one streaming app could push savings to ₹13,000+ — 19% of salary, above the recommended 15%.",
    "loan":           "CIBIL score: 748 (Good). You're eligible for: Home Loan up to ₹45L @ 8.5% p.a. and Personal Loan up to ₹5L @ 11.5% p.a. Pay credit card 5 days early to push score to 760+ for better rates.",
    "subscription":   "You have 3 overlapping streaming services costing ₹1,447/month. Rotating them saves ₹17,364/year. I recommend keeping only one at a time.",
    "fraud":          "I've flagged 1 high-risk transaction (Netflix · NZ IP · risk 94%) and 2 medium-risk ones this month. Your card is still active — tap 'Block card' in the Fraud Shield tab if needed.",
    "balance":        "Your total balance is ₹2,84,530 across 2 accounts. Monthly income: ₹68,000. Monthly spend so far: ₹48,200. Net saving this month: ₹9,400.",
    "emi":            "Your current EMIs total ₹12,800/month (HDFC Home Loan). This is 18.8% of your salary, within the safe 40% EMI-to-income ratio. You're in a healthy position.",
}


# ── Models ────────────────────────────────────────────────────────────────────

class ChatMessage(BaseModel):
    message: str

class FraudAction(BaseModel):
    transaction_id: str
    action: str  # "block" | "safe"

class CancelSubscription(BaseModel):
    subscription_id: str


# ── Endpoints ─────────────────────────────────────────────────────────────────

@app.get("/")
def root():
    return {"status": "FinCopilot API running", "version": "1.0.0"}


@app.get("/api/dashboard")
def get_dashboard():
    fraud_count = sum(1 for t in TRANSACTIONS if t.get("flag") == "fraud")
    bills_due   = sum(1 for s in SUBSCRIPTIONS if s["status"] == "active")
    monthly_spend = sum(abs(t["amount"]) for t in TRANSACTIONS if t["amount"] < 0)
    monthly_income = sum(t["amount"] for t in TRANSACTIONS if t["amount"] > 0)
    return {
        "balance":       284530,
        "monthly_spend": monthly_spend,
        "monthly_saved": 9400,
        "emis_due":      12800,
        "fraud_alerts":  fraud_count,
        "bills_due":     bills_due,
        "cashflow":      CASHFLOW,
        "cibil_score":   748,
    }


@app.get("/api/transactions")
def get_transactions(limit: int = 10):
    return {"transactions": TRANSACTIONS[:limit]}


@app.get("/api/fraud/alerts")
def get_fraud_alerts():
    flagged = [t for t in TRANSACTIONS if t.get("flag") == "fraud"]
    history = [t for t in TRANSACTIONS if t.get("flag") in ("unusual", "new_recipient")]
    return {
        "high_risk":         flagged,
        "medium_risk":       history,
        "detection_accuracy": 94,
        "false_positive_rate": 4,
    }


@app.post("/api/fraud/action")
def fraud_action(body: FraudAction):
    if body.action == "block":
        return {"status": "success", "message": "Card blocked. Fraud report raised. New card arrives in 3 working days.", "action": "blocked"}
    elif body.action == "safe":
        return {"status": "success", "message": "Transaction marked safe. Model updated — similar transactions won't be flagged.", "action": "verified"}
    return {"status": "error", "message": "Invalid action"}


@app.get("/api/subscriptions")
def get_subscriptions():
    total = sum(s["amount"] for s in SUBSCRIPTIONS if s["status"] == "active")
    annual_saving = 1447 * 12
    return {
        "subscriptions":   SUBSCRIPTIONS,
        "total_monthly":   total,
        "annual_saving_tip": annual_saving,
    }


@app.post("/api/subscriptions/cancel")
def cancel_subscription(body: CancelSubscription):
    for s in SUBSCRIPTIONS:
        if s["id"] == body.subscription_id:
            s["status"] = "cancelled"
            return {"status": "success", "message": f"Cancellation request sent for {s['name']}."}
    return {"status": "error", "message": "Subscription not found"}


@app.get("/api/budget")
def get_budget():
    tips = []
    for cat, data in BUDGET.items():
        pct = round((data["spent"] / data["limit"]) * 100)
        if pct > 100:
            tips.append({"category": cat.replace("_", " ").title(),
                         "severity": "danger", "pct": pct,
                         "message": f"Over budget by ₹{data['spent'] - data['limit']:,}"})
        elif pct > 85:
            tips.append({"category": cat.replace("_", " ").title(),
                         "severity": "warning", "pct": pct,
                         "message": f"{100 - pct}% budget remaining"})
    return {"budget": BUDGET, "tips": tips, "cibil_score": 748, "loan_eligibility": {"home_loan": 4500000, "personal_loan": 500000}}


@app.post("/api/chat")
def chat(body: ChatMessage):
    msg = body.message.lower()
    reply = "I'm analysing your financial data. Try asking: 'Can I afford a laptop?', 'Why was Netflix flagged?', 'How much can I save?' or 'What is my loan eligibility?'"
    for keyword, response in AI_RESPONSES.items():
        if keyword in msg:
            reply = response
            break
    return {
        "reply": reply,
        "timestamp": datetime.now().isoformat(),
        "confidence": round(random.uniform(0.87, 0.99), 2),
    }
