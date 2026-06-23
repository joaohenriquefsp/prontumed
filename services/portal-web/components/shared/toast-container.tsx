"use client";

import { X } from "lucide-react";
import { useToastStore, type ToastVariant } from "@/lib/toast-store";

const variantClass: Record<ToastVariant, string> = {
  info:    "bg-blue-50 border-blue-200 text-blue-900",
  success: "bg-pm-green-subtle border-pm-green text-green-900",
  warning: "bg-amber-50 border-amber-200 text-amber-900",
  error:   "bg-red-50 border-red-200 text-red-900",
};

const dotClass: Record<ToastVariant, string> = {
  info:    "bg-blue-400",
  success: "bg-pm-green",
  warning: "bg-amber-400",
  error:   "bg-red-400",
};

export function ToastContainer() {
  const { toasts, dismiss } = useToastStore();

  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 w-80">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-start gap-3 rounded-lg border px-4 py-3 shadow-md text-sm animate-in slide-in-from-right-4 ${variantClass[t.variant]}`}
        >
          <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${dotClass[t.variant]}`} />
          <div className="flex-1">
            <p className="font-semibold leading-snug">{t.title}</p>
            {t.description && <p className="mt-0.5 opacity-80">{t.description}</p>}
          </div>
          <button
            onClick={() => dismiss(t.id)}
            className="ml-1 shrink-0 opacity-50 hover:opacity-80 transition-opacity"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
