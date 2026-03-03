"use client";

import { useTransition } from "react";
import { deleteGuitar } from "@/app/actions/guitars";
import { useRouter } from "next/navigation";

export default function DeleteButton({ id }: { id: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm("Delete this guitar? This cannot be undone.")) return;

    startTransition(async () => {
      const res = await deleteGuitar(id);
      if (res.error) {
        alert(res.error || "Failed to delete guitar. Please try again.");
      } else {
        router.push("/");
      }
    });
  }

  return (
    <button className="btn btn-danger btn-sm" onClick={handleDelete} disabled={isPending}>
      {isPending ? "Deleting..." : "Delete"}
    </button>
  );
}
