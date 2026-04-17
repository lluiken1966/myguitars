"use client";

import { Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordSchema, type ResetPasswordInput } from "@/lib/schemas";
import { resetPassword } from "@/app/actions/auth";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

function ResetPasswordContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get("token");

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<ResetPasswordInput>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: { token: token ?? "" },
    });

    if (!token) {
        router.push("/auth/signin");
        return null;
    }

    async function onSubmit(data: ResetPasswordInput) {
        await resetPassword(data);
    }

    return (
        <main className="auth-page">
            <div className="auth-card">
                <h1 className="auth-title">🎸 My Guitars</h1>
                <p className="auth-subtitle">Set a new password</p>

                <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
                    <input type="hidden" {...register("token")} />

                    <div className="form-group">
                        <label htmlFor="password">New password</label>
                        <input
                            id="password"
                            type="password"
                            {...register("password")}
                            autoComplete="new-password"
                            placeholder="••••••••"
                        />
                        {errors.password && (
                            <p className="form-error">{errors.password.message}</p>
                        )}
                        <ul className="password-hints">
                            <li>At least 8 characters</li>
                            <li>One uppercase letter</li>
                            <li>One lowercase letter</li>
                            <li>One digit</li>
                            <li>One special character</li>
                        </ul>
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirm password</label>
                        <input
                            id="confirmPassword"
                            type="password"
                            {...register("confirmPassword")}
                            autoComplete="new-password"
                            placeholder="••••••••"
                        />
                        {errors.confirmPassword && (
                            <p className="form-error">{errors.confirmPassword.message}</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Resetting..." : "Reset password"}
                    </button>
                </form>

                <p className="auth-footer">
                    <Link href="/auth/signin" className="auth-link">
                        Back to sign in
                    </Link>
                </p>
            </div>
        </main>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense>
            <ResetPasswordContent />
        </Suspense>
    );
}
