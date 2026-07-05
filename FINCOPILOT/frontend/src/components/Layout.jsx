import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Sidebar from "./Sidebar.jsx";
import Topbar from "./Topbar.jsx";
import PageTransition from "./PageTransition.jsx";

export default function Layout() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => { setOpen(false); }, [location.pathname]);

  return (
    <div className="app-shell">
      {/* Mobile overlay */}
      <div className={`sidebar-overlay${open ? " open" : ""}`} onClick={() => setOpen(false)} />

      <Sidebar mobileOpen={open} onClose={() => setOpen(false)} />

      <div className="main-wrapper">
        <Topbar onMenuClick={() => setOpen(true)} />
        <main className="main-area">
          <AnimatePresence mode="wait">
            <PageTransition key={location.pathname}>
              <Outlet />
            </PageTransition>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
