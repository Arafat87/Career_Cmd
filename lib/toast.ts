export type ToastType = "success" | "error" | "info";

export interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
}

type Listener = (toast: ToastMessage) => void;

let nextId = 0;
const listeners: Set<Listener> = new Set();

export function showToast(message: string, type: ToastType = "info") {
  const toast: ToastMessage = { id: nextId++, message, type };
  listeners.forEach((listener) => listener(toast));
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}
