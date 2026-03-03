"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDataSource } from "@/lib/db";
import { Guitar } from "@/entities/Guitar";
import { GuitarSchema } from "@/lib/schemas";
import { revalidatePath } from "next/cache";

export async function createGuitar(formData: unknown) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return { error: "Unauthorized" };
    }

    const result = GuitarSchema.safeParse(formData);
    if (!result.success) {
        return { error: "Invalid data", details: result.error.flatten().fieldErrors };
    }

    const data = result.data;
    const ds = await getDataSource();
    const repo = ds.getRepository(Guitar);

    const guitar = repo.create({
        userId: session.user.id,
        brand: data.brand,
        model: data.model,
        year: data.year ?? null,
        type: data.type,
        color: data.color ?? null,
        serialNumber: data.serialNumber ?? null,
        condition: data.condition,
        purchasePrice: data.purchasePrice ?? null,
        currentValue: data.currentValue ?? null,
        notes: data.notes ?? null,
    });

    const saved = await repo.save(guitar);
    revalidatePath("/");
    revalidatePath(`/users/${session.user.id}`);
    return { success: true, id: saved.id };
}

export async function updateGuitar(id: string, formData: unknown) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return { error: "Unauthorized" };
    }

    const result = GuitarSchema.safeParse(formData);
    if (!result.success) {
        return { error: "Invalid data", details: result.error.flatten().fieldErrors };
    }

    const ds = await getDataSource();
    const repo = ds.getRepository(Guitar);

    const guitar = await repo.findOne({ where: { id, userId: session.user.id } });
    if (!guitar) {
        return { error: "Not found" };
    }

    const data = result.data;
    guitar.brand = data.brand;
    guitar.model = data.model;
    guitar.year = data.year ?? null;
    guitar.type = data.type;
    guitar.color = data.color ?? null;
    guitar.serialNumber = data.serialNumber ?? null;
    guitar.condition = data.condition;
    guitar.purchasePrice = data.purchasePrice ?? null;
    guitar.currentValue = data.currentValue ?? null;
    guitar.notes = data.notes ?? null;

    await repo.save(guitar);
    revalidatePath("/");
    revalidatePath(`/users/${session.user.id}`);
    revalidatePath(`/guitars/${id}`);

    return { success: true };
}

export async function deleteGuitar(id: string) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return { error: "Unauthorized" };
    }

    const ds = await getDataSource();
    const repo = ds.getRepository(Guitar);

    const guitar = await repo.findOne({ where: { id, userId: session.user.id } });
    if (!guitar) {
        return { error: "Not found" };
    }

    await repo.remove(guitar);
    revalidatePath("/");
    revalidatePath(`/users/${session.user.id}`);

    return { success: true };
}
