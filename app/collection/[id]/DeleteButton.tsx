"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteButton({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm("Delete this guitar? This cannot be undone.")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/guitars/${id}`, { method: "DELETE" });
      if (!res.ok) {
        alert("Failed to delete guitar. Please try again.");
        setLoading(false);
        return;
      }
    } catch {
      alert("Network error. Please check your connection and try again.");
      setLoading(false);
      return;
    }
    router.push("/collection");
    router.refresh();
  }

  return (
    <button className="btn btn-danger btn-sm" onClick={handleDelete} disabled={loading}>
      {loading ? "Deleting..." : "Delete"}
    </button>
  );
}
