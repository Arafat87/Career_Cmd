"use client";

import Modal from "@/components/Modal";
import ElectricBorder from "@/components/ElectricBorder";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  confirmColor?: string;
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "DELETE",
  confirmColor = "neon-red",
}: ConfirmDialogProps) {
  const colorMap: Record<string, { border: string; text: string; bg: string; hoverBg: string }> = {
    "neon-red":    { border: "#FF2D55", text: "text-neon-red",    bg: "bg-neon-red/10",    hoverBg: "hover:bg-neon-red/20" },
    "neon-cyan":   { border: "#00F5FF", text: "text-neon-cyan",   bg: "bg-neon-cyan/10",   hoverBg: "hover:bg-neon-cyan/20" },
    "neon-purple": { border: "#BF00FF", text: "text-neon-purple", bg: "bg-neon-purple/10", hoverBg: "hover:bg-neon-purple/20" },
    "neon-green":  { border: "#00FF88", text: "text-neon-green",  bg: "bg-neon-green/10",  hoverBg: "hover:bg-neon-green/20" },
  };

  const c = colorMap[confirmColor] || colorMap["neon-red"];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-4">
        <p className="text-sm font-mono text-foreground/70">{message}</p>
        <div className="flex gap-3 pt-2">
          <ElectricBorder color={c.border} speed={1} chaos={0.15} borderRadius={10}>
            <button
              onClick={() => { onConfirm(); onClose(); }}
              className={`px-6 py-2 ${c.bg} border rounded-lg font-mono text-sm ${c.text} ${c.hoverBg} transition-colors`}
              style={{ borderColor: `${c.border}30` }}
            >
              {confirmLabel}
            </button>
          </ElectricBorder>
          <button
            onClick={onClose}
            className="px-6 py-2 border border-[rgba(0,245,255,0.1)] rounded-lg font-mono text-sm text-muted hover:text-foreground transition-colors"
          >
            CANCEL
          </button>
        </div>
      </div>
    </Modal>
  );
}
