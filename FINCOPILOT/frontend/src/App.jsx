import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import { ProtectedRoute, AdminRoute } from "./components/ProtectedRoute.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import CreditRisk from "./pages/CreditRisk.jsx";
import FraudShield from "./pages/FraudShield.jsx";
import KycVault from "./pages/KycVault.jsx";
import ClimateLedger from "./pages/ClimateLedger.jsx";
import CyberWatch from "./pages/CyberWatch.jsx";
import Pay from "./pages/Pay.jsx";
import Assistant from "./pages/Assistant.jsx";
import AdminPanel from "./pages/AdminPanel.jsx";
import SolverHub from "./pages/SolverHub.jsx";
import NotFound from "./pages/NotFound.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="credit-risk" element={<CreditRisk />} />
          <Route path="fraud-shield" element={<FraudShield />} />
          <Route path="kyc-vault" element={<KycVault />} />
          <Route path="climate-ledger" element={<ClimateLedger />} />
          <Route path="cyber-watch" element={<CyberWatch />} />
          <Route path="pay" element={<Pay />} />
          <Route path="assistant" element={<Assistant />} />
          <Route path="solver-hub" element={<SolverHub />} />
          <Route element={<AdminRoute />}>
            <Route path="admin" element={<AdminPanel />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Route>
      </Route>
    </Routes>
  );
}
