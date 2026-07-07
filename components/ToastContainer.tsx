"use client";

import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import Toast from "@/components/Toast";
import { subscribe, type ToastMessage } from "@/lib/toast";

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const unsub = subscribe((toast) => {
      setToasts((prev) => [...prev, toast]);
    });
    return unsub;
  }, []);

  function removeToast(id: number) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
      <AnimatePresence>
        {toasts.map((t) => (
          <Toast key={t.id} toast={t} onClose={() => removeToast(t.id)} />
        ))}
      </AnimatePresence>
    </div>
  );
}
