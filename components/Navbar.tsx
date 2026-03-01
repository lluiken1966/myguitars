"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="navbar">
      <Link href={session ? "/collection" : "/"} className="navbar-brand">
        🎸 My Guitars
      </Link>
      <div className="navbar-actions">
        {session && (
          <>
            <Link href="/collection/new" className="btn btn-primary btn-sm">
              + Add Guitar
            </Link>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              Sign out
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
