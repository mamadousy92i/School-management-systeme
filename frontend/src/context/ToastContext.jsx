import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const ToastContext = createContext(null);

let idCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback((type, message, options = {}) => {
    const id = ++idCounter;
    const duration = options.duration ?? 3500;
    setToasts((prev) => [...prev, { id, type, message }]);
    if (duration > 0) {
      setTimeout(() => remove(id), duration);
    }
    return id;
  }, [remove]);

  const api = useMemo(() => ({
    success: (msg, opts) => push('success', msg, opts),
    error: (msg, opts) => push('error', msg, opts),
    info: (msg, opts) => push('info', msg, opts),
    remove,
  }), [push, remove]);

  // Patch global alert to route to toasts (temporary migration aid)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.__toast = api;
      const original = window.alert;
      window.alert = (msg) => api.error(String(msg));
      return () => { window.alert = original; };
    }
  }, [api]);

  const value = useMemo(() => ({ toasts, api }), [toasts, api]);

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx.api;
}

export function useToastsState() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToastsState must be used within ToastProvider');
  return ctx.toasts;
}
