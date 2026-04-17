"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/lib/schemas";
import { requestPasswordReset } from "@/app/actions/auth";
import Link from "next/link";

export default function ForgotPasswordPage() {
    const [submitted, setSubmitted] = useState(false);
    const [message, setMessage] = useState("");

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<ForgotPasswordInput>({
        resolver: zodResolver(forgotPasswordSchema),
    });

    async function onSubmit(data: ForgotPasswordInput) {
        const result = await requestPasswordReset(data);
        setMessage(result.message);
        setSubmitted(true);
    }

    return (
        <main className="auth-page">
            <div className="auth-card">
                <h1 className="auth-title">🎸 My Guitars</h1>
                <p className="auth-subtitle">Reset your password</p>

                {submitted ? (
                    <>
                        <p className="auth-message">{message}</p>
                        <p className="auth-footer">
                            <Link href="/auth/signin" className="auth-link">
                                Back to sign in
                            </Link>
                        </p>
                    </>
                ) : (
                    <>
                        <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
                            <div className="form-group">
                                <label htmlFor="email">Email</label>
                                <input
                                    id="email"
                                    type="email"
                                    {...register("email")}
                                    autoComplete="email"
                                    placeholder="you@example.com"
                                />
                                {errors.email && (
                                    <p className="form-error">{errors.email.message}</p>
                                )}
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? "Sending..." : "Send reset link"}
                            </button>
                        </form>

                        <p className="auth-footer">
                            <Link href="/auth/signin" className="auth-link">
                                Back to sign in
                            </Link>
                        </p>
                    </>
                )}
            </div>
        </main>
    );
}
