"use client";

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { CircleCheck, TriangleAlert } from "lucide-react";

type Toast = { id: number; message: string; tone: "success" | "error" };
const ToastContext = createContext<((message: string, tone?: Toast["tone"]) => void) | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<Toast | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const show = useCallback((message: string, tone: Toast["tone"] = "success") => {
    clearTimeout(timer.current);
    setToast({ id: Date.now(), message, tone });
    timer.current = setTimeout(() => setToast(null), 2200);
  }, []);
  return (
    <ToastContext.Provider value={show}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 top-[calc(env(safe-area-inset-top)+12px)] z-50 flex justify-center px-4">
        {toast && (
          <div key={toast.id} className="animate-drop flex w-full max-w-md items-center gap-3 rounded-2xl bg-green px-4 py-3.5 text-[15px] font-medium text-white shadow-float">
            {toast.tone === "success" ? <CircleCheck className="size-5 shrink-0 text-orange" /> : <TriangleAlert className="size-5 shrink-0 text-peach" />}
            {toast.message}
          </div>
        )}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}
