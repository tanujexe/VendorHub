import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react";

// Create context for Toast notifications
const ToastContext = createContext(null);

/**
 * Premium Luxury Toast Notification System
 * Implements smooth sliding animations, gold-and-obsidian themes,
 * and standard event listeners to intercept global HTTP error alerts.
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  // Add toast notification
  const addToast = useCallback((message, type = "info", duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type, duration }]);
  }, []);

  // Remove toast by id
  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Expose simplified toast commands
  const toast = {
    success: (msg, dur) => addToast(msg, "success", dur),
    error: (msg, dur) => addToast(msg, "error", dur),
    warning: (msg, dur) => addToast(msg, "warning", dur),
    info: (msg, dur) => addToast(msg, "info", dur),
  };

  // Centralized Custom Event Handlers for Global Listening (Axios, etc.)
  useEffect(() => {
    const handleApiError = (event) => {
      const message = event.detail?.message || "An unexpected system error occurred.";
      addToast(message, "error", 5000);
    };

    const handleAppToast = (event) => {
      const { message, type = "info", duration } = event.detail || {};
      if (message) {
        addToast(message, type, duration);
      }
    };

    window.addEventListener("api-error", handleApiError);
    window.addEventListener("app-toast", handleAppToast);

    return () => {
      window.removeEventListener("api-error", handleApiError);
      window.removeEventListener("app-toast", handleAppToast);
    };
  }, [addToast]);

  return (
    <ToastContext.Provider value={{ toast, addToast, removeToast }}>
      {children}
      
      {/* Toast Notification Container in Portal Portal */}
      <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3.5 max-w-sm w-full pointer-events-none p-4 sm:p-0">
        <AnimatePresence mode="popLayout">
          {toasts.map((t) => (
            <ToastItem key={t.id} toast={t} onClose={removeToast} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

/**
 * Individual Toast Card component.
 */
function ToastItem({ toast, onClose }) {
  const { id, message, type, duration } = toast;

  // Auto-expire timer
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, duration);
    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  // Accent Styles and Icons based on notification type
  let accentColor, bgColor, borderColor, Icon;
  switch (type) {
    case "success":
      Icon = CheckCircle;
      accentColor = "text-[#d4af37]"; // Classic gold accent
      bgColor = "bg-[#0f0a06]/95";
      borderColor = "border-[#d4af37]/30 shadow-[0_4px_24px_rgba(212,175,55,0.08)]";
      break;
    case "error":
      Icon = AlertCircle;
      accentColor = "text-red-500";
      bgColor = "bg-[#140606]/95";
      borderColor = "border-red-500/25 shadow-[0_4px_24px_rgba(239,68,68,0.08)]";
      break;
    case "warning":
      Icon = AlertTriangle;
      accentColor = "text-amber-500";
      bgColor = "bg-[#140b06]/95";
      borderColor = "border-amber-500/25 shadow-[0_4px_24px_rgba(245,158,11,0.08)]";
      break;
    default:
      Icon = Info;
      accentColor = "text-[#e1dcc9]";
      bgColor = "bg-[#0c0704]/95";
      borderColor = "border-[#e1dcc9]/15 shadow-[0_4px_24px_rgba(225,220,201,0.05)]";
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 80, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.9, transition: { duration: 0.2 } }}
      transition={{ type: "spring", stiffness: 350, damping: 28 }}
      className={`pointer-events-auto flex items-start gap-3 w-full p-4 sm:p-5 rounded-2xl border ${bgColor} ${borderColor} backdrop-blur-xl relative overflow-hidden select-none group`}
    >
      {/* Dynamic Golden Corner Accent */}
      <div className={`absolute top-0 right-0 w-12 h-[1px] bg-gradient-to-l from-[#e1dcc9]/30 to-transparent`} />
      <div className={`absolute top-0 right-0 w-[1px] h-12 bg-gradient-to-b from-[#e1dcc9]/30 to-transparent`} />

      {/* Dynamic Icon */}
      <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${accentColor} animate-pulse`} />

      {/* Main message */}
      <div className="flex-1 space-y-1">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-[#e1dcc9]/50">
          {type === "info" ? "Platform Intel" : `${type} transmission`}
        </p>
        <p className="text-xs text-[#e1dcc9] leading-relaxed font-medium">
          {message}
        </p>
      </div>

      {/* Close button */}
      <button
        onClick={() => onClose(id)}
        className="w-6 h-6 rounded-lg flex items-center justify-center bg-[#e1dcc9]/2 hover:bg-[#e1dcc9]/8 border border-[#e1dcc9]/5 hover:border-[#e1dcc9]/15 text-[#e1dcc9]/55 hover:text-white transition-all cursor-pointer"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
}

/**
 * Custom hook to trigger premium notifications in functional React components.
 */
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
