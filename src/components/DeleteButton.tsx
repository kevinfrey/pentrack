"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ConfirmModal from "@/components/ConfirmModal";

export default function DeleteButton({ penId }: { penId: number }) {
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    const res = await fetch(`/api/pens/${penId}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/collection");
      router.refresh();
    }
  };

  return (
    <div className="pb-8">
      <button
        onClick={() => setShowModal(true)}
        className="w-full px-5 py-2.5 border border-red-200 text-red-400 hover:text-red-600 hover:border-red-300 hover:bg-red-50 rounded-xl text-sm font-medium transition-colors"
      >
        Delete Pen
      </button>
      <ConfirmModal
        isOpen={showModal}
        title="Delete Pen"
        message="Are you sure you want to delete this pen? This action cannot be undone."
        confirmLabel="Delete Pen"
        onConfirm={handleDelete}
        onCancel={() => setShowModal(false)}
        danger
      />
    </div>
  );
}
