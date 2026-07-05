import { createContext, useCallback, useContext, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";

const ToastContext = createContext(null);

const ICONS = { success: CheckCircle2, error: XCircle, info: Info };
const ACCENTS = { success: "var(--teal)", error: "var(--coral)", info: "var(--gold)" };

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const push = useCallback(
    (message, type = "info", duration = 4000) => {
      const id = Math.random().toString(36).slice(2);
      setToasts((t) => [...t, { id, message, type }]);
      if (duration) setTimeout(() => dismiss(id), duration);
      return id;
    },
    [dismiss]
  );

  const toast = {
    success: (msg, d) => push(msg, "success", d),
    error: (msg, d) => push(msg, "error", d),
    info: (msg, d) => push(msg, "info", d),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div
        style={{
          position: "fixed",
          top: 18,
          right: 18,
          zIndex: 200,
          display: "flex",
          flexDirection: "column",
          gap: 10,
          maxWidth: 360,
        }}
      >
        <AnimatePresence>
          {toasts.map((t) => {
            const Icon = ICONS[t.type];
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, x: 40, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 40, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className="card"
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                  padding: "12px 14px",
                  borderColor: ACCENTS[t.type],
                  boxShadow: `0 8px 24px -8px ${ACCENTS[t.type]}55, var(--shadow-card)`,
                }}
              >
                <Icon size={18} color={ACCENTS[t.type]} style={{ flexShrink: 0, marginTop: 1 }} />
                <div style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.5, flex: 1 }}>{t.message}</div>
                <button
                  onClick={() => dismiss(t.id)}
                  style={{ background: "none", border: "none", color: "var(--muted-2)", cursor: "pointer", padding: 0 }}
                >
                  <X size={14} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
