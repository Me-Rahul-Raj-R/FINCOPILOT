// In production the React app and Express API share the same origin,
// so /api resolves correctly with no CORS or proxy needed.
// In development, Vite's proxy (vite.config.js) forwards /api to :5000.
const BASE = "/api";

let onUnauthorized = () => {};
export function setUnauthorizedHandler(fn) { onUnauthorized = fn; }

function getToken() {
  try { return localStorage.getItem("fincopilot_token"); }
  catch { return null; }
}

async function request(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  });
  if (res.status === 401) { onUnauthorized(); }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed: ${res.status}`);
  return data;
}

export const api = {
  health: () => request("/health"),

  signup: (p) => request("/auth/signup", { method:"POST", body:JSON.stringify(p) }),
  login:  (p) => request("/auth/login",  { method:"POST", body:JSON.stringify(p) }),
  me:     () => request("/auth/me"),

  dashboardSummary:     () => request("/dashboard/summary"),

  scoreCredit:          (p) => request("/credit-score", { method:"POST", body:JSON.stringify(p) }),
  listCreditApplications:() => request("/credit-score"),

  checkTransaction:     (p) => request("/fraud/check", { method:"POST", body:JSON.stringify(p) }),
  listTransactions:     () => request("/fraud"),

  getKycChallenge:      () => request("/kyc/challenge"),
  submitKyc:            (p) => request("/kyc", { method:"POST", body:JSON.stringify(p) }),
  listKyc:              () => request("/kyc"),

  climateOptions:       () => request("/climate-risk/options"),
  assessClimate:        (p) => request("/climate-risk/assess", { method:"POST", body:JSON.stringify(p) }),
  listClimate:          () => request("/climate-risk"),

  cyberPosture:         () => request("/cyber/posture"),

  chat:                 (message) => request("/chat", { method:"POST", body:JSON.stringify({ message }) }),

  getWallet:            () => request("/wallet"),
  walletContacts:       () => request("/wallet/contacts"),
  sendMoney:            (p) => request("/wallet/send",     { method:"POST", body:JSON.stringify(p) }),
  payBill:              (p) => request("/wallet/bill-pay", { method:"POST", body:JSON.stringify(p) }),

  adminOverview:        () => request("/admin/overview"),
  adminUsers:           (page=1,pageSize=10) => request(`/admin/users?page=${page}&pageSize=${pageSize}`),
  setUserRole:          (id,role) => request(`/admin/users/${id}/role`, { method:"PATCH", body:JSON.stringify({ role }) }),
};
