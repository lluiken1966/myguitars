"use client";

import { useTransition } from "react";
import { deleteAmp } from "@/app/actions/amps";
import { useRouter } from "next/navigation";

export default function DeleteAmpButton({ id }: { id: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm("Delete this amp? This cannot be undone.")) return;

    startTransition(async () => {
      const res = await deleteAmp(id);
      if (res.error) {
        alert(res.error || "Failed to delete amp. Please try again.");
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
