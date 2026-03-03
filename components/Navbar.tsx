"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import ThemeSwitcher from "./ThemeSwitcher";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="navbar">
      <Link href="/" className="navbar-brand">
        🎸 My Guitars
      </Link>
      <div className="navbar-actions">
        {session ? (
          <>
            <Link href={`/users/${session.user.id}`} className="btn btn-ghost btn-sm">
              My Collection
            </Link>
            <Link href="/guitars/new" className="btn btn-primary btn-sm">
              + Add Guitar
            </Link>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              Sign out
            </button>
          </>
        ) : (
          <>
            <Link href="/auth/signin" className="btn btn-ghost btn-sm">
              Sign in
            </Link>
            <Link href="/auth/register" className="btn btn-primary btn-sm">
              Register
            </Link>
          </>
        )}
        <ThemeSwitcher />
      </div>
    </nav>
  );
}
