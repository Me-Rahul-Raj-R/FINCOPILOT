import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../lib/AuthContext.jsx";

export function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:16 }}>
        <svg width="40" height="40" viewBox="0 0 64 64">
          <rect width="64" height="64" rx="14" fill="#0d1729" />
          <path d="M32 10 L50 18 V32 C50 44 42 52 32 56 C22 52 14 44 14 32 V18 Z" fill="none" stroke="#e8b84b" strokeWidth="2.5" />
          <path d="M24 33 L29 38 L40 26" fill="none" stroke="#38d9c8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <div style={{ fontFamily:"var(--font-mono)", fontSize:12, color:"var(--text-muted)" }}>Loading FinCopilot…</div>
      </div>
    </div>
  );
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return <Outlet />;
}

export function AdminRoute() {
  const { user, loading, isAdmin } = useAuth();
  if (loading) return null;
  if (!user)    return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/"     replace />;
  return <Outlet />;
}
