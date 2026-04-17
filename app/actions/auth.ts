"use server";

import crypto from "crypto";
import bcrypt from "bcryptjs";
import { getDataSource } from "@/lib/db";
import { User } from "@/entities/User";
import { PasswordResetToken } from "@/entities/PasswordResetToken";
import { forgotPasswordSchema, resetPasswordSchema } from "@/lib/schemas";
import { sendPasswordResetEmail } from "@/lib/email";
import { redirect } from "next/navigation";

export async function requestPasswordReset(formData: unknown) {
    const startTime = Date.now();

    const result = forgotPasswordSchema.safeParse(formData);
    if (!result.success) {
        return { success: false, message: "If an account with that email exists, we have sent a password reset link." };
    }

    const email = result.data.email.toLowerCase().trim();
    const genericResponse = {
        success: true,
        message: "If an account with that email exists, we have sent a password reset link.",
    };

    try {
        const ds = await getDataSource();
        const userRepo = ds.getRepository(User);
        const tokenRepo = ds.getRepository(PasswordResetToken);

        const user = await userRepo.findOne({ where: { email } });
        if (!user) {
            const elapsed = Date.now() - startTime;
            if (elapsed < 200) await new Promise((r) => setTimeout(r, 200 - elapsed));
            return genericResponse;
        }

        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        const recentTokenCount = await tokenRepo
            .createQueryBuilder("t")
            .where("t.USER_ID = :userId", { userId: user.id })
            .andWhere("t.CREATED_AT > :since", { since: oneHourAgo })
            .getCount();

        if (recentTokenCount >= 3) {
            const elapsed = Date.now() - startTime;
            if (elapsed < 200) await new Promise((r) => setTimeout(r, 200 - elapsed));
            return genericResponse;
        }

        await tokenRepo
            .createQueryBuilder()
            .update(PasswordResetToken)
            .set({ usedAt: () => "NOW()" })
            .where("USER_ID = :userId", { userId: user.id })
            .andWhere("USED_AT IS NULL")
            .execute();

        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        await tokenRepo
            .createQueryBuilder()
            .delete()
            .from(PasswordResetToken)
            .where("USER_ID = :userId", { userId: user.id })
            .andWhere("EXPIRES_AT < :cutoff", { cutoff: oneDayAgo })
            .execute();

        const rawToken = crypto.randomBytes(32).toString("hex");
        const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

        const token = tokenRepo.create({
            userId: user.id,
            tokenHash,
            expiresAt: new Date(Date.now() + 60 * 60 * 1000),
        });
        await tokenRepo.save(token);

        const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${rawToken}`;

        try {
            await sendPasswordResetEmail(email, resetUrl);
        } catch (err) {
            console.error("Failed to send password reset email:", err);
        }
    } catch (err) {
        console.error("Password reset request error:", err);
    }

    const elapsed = Date.now() - startTime;
    if (elapsed < 200) await new Promise((r) => setTimeout(r, 200 - elapsed));

    return genericResponse;
}

export async function resetPassword(formData: unknown) {
    const result = resetPasswordSchema.safeParse(formData);
    if (!result.success) {
        redirect("/auth/signin?reset=invalid");
    }

    const { token: rawToken, password } = result.data;
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

    const ds = await getDataSource();
    const tokenRepo = ds.getRepository(PasswordResetToken);

    const resetToken = await tokenRepo.findOne({ where: { tokenHash } });

    if (!resetToken || resetToken.usedAt !== null || resetToken.expiresAt < new Date()) {
        redirect("/auth/signin?reset=invalid");
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await ds.transaction(async (manager) => {
        await manager
            .createQueryBuilder()
            .update(User)
            .set({
                password: hashedPassword,
                tokenVersion: () => "TOKEN_VERSION + 1",
            })
            .where("id = :id", { id: resetToken.userId })
            .execute();

        await manager
            .createQueryBuilder()
            .update(PasswordResetToken)
            .set({ usedAt: () => "NOW()" })
            .where("id = :id", { id: resetToken.id })
            .execute();
    });

    redirect("/auth/signin?reset=success");
}
