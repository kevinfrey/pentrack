"use client";

import { useEffect, useRef } from "react";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  danger = false,
}: ConfirmModalProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) cancelRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") { onCancel(); return; }
      if (e.key === "Tab") {
        const focusable = [cancelRef.current, confirmRef.current].filter(Boolean) as HTMLElement[];
        if (focusable.length === 0) return;
        if (e.shiftKey) {
          if (document.activeElement === focusable[0]) { e.preventDefault(); focusable[focusable.length - 1].focus(); }
        } else {
          if (document.activeElement === focusable[focusable.length - 1]) { e.preventDefault(); focusable[0].focus(); }
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onCancel}
      aria-modal="true"
      role="dialog"
      aria-labelledby="confirm-modal-title"
    >
      <div
        className="bg-white max-w-md w-full rounded-xl shadow-xl p-6 flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="confirm-modal-title" className="text-lg font-bold text-stone-900">{title}</h2>
        <p className="text-stone-600 text-sm">{message}</p>
        <div className="flex gap-3 justify-end pt-2">
          <button ref={cancelRef} onClick={onCancel} className="btn-secondary">
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            onClick={onConfirm}
            className={danger
              ? "bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              : "btn-primary px-4 py-2"
            }
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
