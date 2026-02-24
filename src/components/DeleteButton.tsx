"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteButton({ penId }: { penId: number }) {
  const [confirming, setConfirming] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    const res = await fetch(`/api/pens/${penId}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/");
      router.refresh();
    }
  };

  if (confirming) {
    return (
      <div className="flex gap-3 pb-8">
        <button onClick={() => setConfirming(false)} className="btn-secondary flex-1">
          Cancel
        </button>
        <button
          onClick={handleDelete}
          className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium px-5 py-2.5 rounded-xl text-sm transition-colors"
        >
          Delete Pen
        </button>
      </div>
    );
  }

  return (
    <div className="pb-8">
      <button
        onClick={() => setConfirming(true)}
        className="w-full px-5 py-2.5 border border-red-200 text-red-400 hover:text-red-600 hover:border-red-300 hover:bg-red-50 rounded-xl text-sm font-medium transition-colors"
      >
        Delete Pen
      </button>
    </div>
  );
}
