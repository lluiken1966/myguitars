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
        body: data.body ?? null,
        top: data.top ?? null,
        neck: data.neck ?? null,
        fretboard: data.fretboard ?? null,
        bridge: data.bridge ?? null,
        nut: data.nut ?? null,
        neckPickup: data.neckPickup ?? null,
        middlePickup: data.middlePickup ?? null,
        bridgePickup: data.bridgePickup ?? null,
        controls: data.controls ?? null,
        pickupSelector: data.pickupSelector ?? null,
        outputJack: data.outputJack ?? null,
        frets: data.frets ?? null,
        tuners: data.tuners ?? null,
        finishType: data.finishType ?? null,
        madeIn: data.madeIn ?? null,
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
    guitar.body = data.body ?? null;
    guitar.top = data.top ?? null;
    guitar.neck = data.neck ?? null;
    guitar.fretboard = data.fretboard ?? null;
    guitar.bridge = data.bridge ?? null;
    guitar.nut = data.nut ?? null;
    guitar.neckPickup = data.neckPickup ?? null;
    guitar.middlePickup = data.middlePickup ?? null;
    guitar.bridgePickup = data.bridgePickup ?? null;
    guitar.controls = data.controls ?? null;
    guitar.pickupSelector = data.pickupSelector ?? null;
    guitar.outputJack = data.outputJack ?? null;
    guitar.frets = data.frets ?? null;
    guitar.tuners = data.tuners ?? null;
    guitar.finishType = data.finishType ?? null;
    guitar.madeIn = data.madeIn ?? null;
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
