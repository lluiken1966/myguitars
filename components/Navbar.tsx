"use client";

import Link from "next/link";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import ThemeSwitcher from "./ThemeSwitcher";

export default function Navbar() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  const close = () => setMenuOpen(false);

  return (
    <nav className="navbar">
      <Link href="/" className="navbar-brand" onClick={close}>
        🎸 My <span className="brand-accent">Guitars</span>
      </Link>

      {/* Desktop actions */}
      <div className="navbar-actions">
        {session ? (
          <>
            <Link href={`/users/${session.user.id}`} className="btn btn-ghost btn-sm">
              My Collection
            </Link>
            <Link href="/guitars/new" className="btn btn-primary btn-sm">
              + Guitar
            </Link>
            <Link href="/amps/new" className="btn btn-primary btn-sm">
              + Amp
            </Link>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => signOut({ callbackUrl: window.location.origin + "/" })}
            >
              Sign out
            </button>
          </>
        ) : (
          <>
            <Link href="/auth/signin" className="btn btn-ghost btn-sm">Sign in</Link>
            <Link href="/auth/register" className="btn btn-primary btn-sm">Register</Link>
          </>
        )}
        <ThemeSwitcher />
      </div>

      {/* Mobile controls: theme switcher + hamburger */}
      <div className="navbar-mobile-controls">
        <ThemeSwitcher />
        <button
          className="btn btn-ghost btn-sm navbar-hamburger"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="navbar-mobile-menu">
          {session ? (
            <>
              <Link href={`/users/${session.user.id}`} className="navbar-mobile-link" onClick={close}>
                My Collection
              </Link>
              <Link href="/guitars/new" className="navbar-mobile-link" onClick={close}>
                + Add Guitar
              </Link>
              <Link href="/amps/new" className="navbar-mobile-link" onClick={close}>
                + Add Amp
              </Link>
              <button
                className="navbar-mobile-link"
                onClick={() => { signOut({ callbackUrl: window.location.origin + "/" }); close(); }}
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/signin" className="navbar-mobile-link" onClick={close}>Sign in</Link>
              <Link href="/auth/register" className="navbar-mobile-link navbar-mobile-primary" onClick={close}>Register</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
