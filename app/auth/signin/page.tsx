"use client";

import { useState, Suspense } from "react";
import { signIn, getSession } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

function SignInContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";
  const resetStatus = searchParams.get("reset");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [flashDismissed, setFlashDismissed] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid email or password");
    } else {
      if (callbackUrl === "/") {
        const session = await getSession();
        if (session?.user?.id) {
          router.push(`/users/${session.user.id}`);
        } else {
          router.push(callbackUrl);
        }
      } else {
        router.push(callbackUrl);
      }
      router.refresh();
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">🎸 My Guitars</h1>
        <p className="auth-subtitle">Sign in to your account</p>

        {!flashDismissed && resetStatus === "success" && (
          <div className="flash-message flash-success" onClick={() => setFlashDismissed(true)}>
            Your password has been reset. Please sign in with your new password.
          </div>
        )}
        {!flashDismissed && resetStatus === "invalid" && (
          <div className="flash-message flash-warning" onClick={() => setFlashDismissed(true)}>
            This reset link is invalid or has expired. Please request a new one.
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <p className="form-error">{error}</p>}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="you@example.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="••••••••"
            />
          </div>

          <div className="forgot-password-link">
            <Link href="/auth/forgot-password" className="auth-link">
              Forgot password?
            </Link>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="auth-footer">
          Don&apos;t have an account?{" "}
          <Link href="/auth/register" className="auth-link">
            Create one
          </Link>
        </p>
      </div>
    </main>
  );
}

export default function SignInPage() {
  return (
    <Suspense>
      <SignInContent />
    </Suspense>
  );
}
