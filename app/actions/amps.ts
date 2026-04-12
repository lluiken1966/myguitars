"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDataSource } from "@/lib/db";
import { Amp } from "@/entities/Amp";
import { AmpSchema } from "@/lib/schemas";
import { revalidatePath } from "next/cache";

export async function createAmp(formData: unknown) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return { error: "Unauthorized" };
    }

    const result = AmpSchema.safeParse(formData);
    if (!result.success) {
        return { error: "Invalid data", details: result.error.flatten().fieldErrors };
    }

    const data = result.data;
    const ds = await getDataSource();
    const repo = ds.getRepository(Amp);

    const amp = repo.create({
        userId: session.user.id,
        brand: data.brand,
        model: data.model,
        year: data.year ?? null,
        type: data.type,
        color: data.color ?? null,
        serialNumber: data.serialNumber ?? null,
        condition: data.condition,
        wattage: data.wattage ?? null,
        channels: data.channels ?? null,
        preampTubes: data.preampTubes ?? null,
        powerTubes: data.powerTubes ?? null,
        rectifier: data.rectifier ?? null,
        outputTransformer: data.outputTransformer ?? null,
        speakerBrand: data.speakerBrand ?? null,
        speakerModel: data.speakerModel ?? null,
        speakerSize: data.speakerSize ?? null,
        speakerCount: data.speakerCount ?? null,
        impedance: data.impedance ?? null,
        cabinetMaterial: data.cabinetMaterial ?? null,
        baffle: data.baffle ?? null,
        finishType: data.finishType ?? null,
        madeIn: data.madeIn ?? null,
        controls: data.controls ?? null,
        builtInEffects: data.builtInEffects ?? null,
        effectsLoop: data.effectsLoop ?? null,
        footswitch: data.footswitch ?? null,
        inputs: data.inputs ?? null,
        outputs: data.outputs ?? null,
        notes: data.notes ?? null,
    });

    const saved = await repo.save(amp);
    revalidatePath("/");
    revalidatePath(`/users/${session.user.id}`);
    return { success: true, id: saved.id };
}

export async function updateAmp(id: string, formData: unknown) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return { error: "Unauthorized" };
    }

    const result = AmpSchema.safeParse(formData);
    if (!result.success) {
        return { error: "Invalid data", details: result.error.flatten().fieldErrors };
    }

    const ds = await getDataSource();
    const repo = ds.getRepository(Amp);

    const amp = await repo.findOne({ where: { id, userId: session.user.id } });
    if (!amp) {
        return { error: "Not found" };
    }

    const data = result.data;
    amp.brand = data.brand;
    amp.model = data.model;
    amp.year = data.year ?? null;
    amp.type = data.type;
    amp.color = data.color ?? null;
    amp.serialNumber = data.serialNumber ?? null;
    amp.condition = data.condition;
    amp.wattage = data.wattage ?? null;
    amp.channels = data.channels ?? null;
    amp.preampTubes = data.preampTubes ?? null;
    amp.powerTubes = data.powerTubes ?? null;
    amp.rectifier = data.rectifier ?? null;
    amp.outputTransformer = data.outputTransformer ?? null;
    amp.speakerBrand = data.speakerBrand ?? null;
    amp.speakerModel = data.speakerModel ?? null;
    amp.speakerSize = data.speakerSize ?? null;
    amp.speakerCount = data.speakerCount ?? null;
    amp.impedance = data.impedance ?? null;
    amp.cabinetMaterial = data.cabinetMaterial ?? null;
    amp.baffle = data.baffle ?? null;
    amp.finishType = data.finishType ?? null;
    amp.madeIn = data.madeIn ?? null;
    amp.controls = data.controls ?? null;
    amp.builtInEffects = data.builtInEffects ?? null;
    amp.effectsLoop = data.effectsLoop ?? null;
    amp.footswitch = data.footswitch ?? null;
    amp.inputs = data.inputs ?? null;
    amp.outputs = data.outputs ?? null;
    amp.notes = data.notes ?? null;

    await repo.save(amp);
    revalidatePath("/");
    revalidatePath(`/users/${session.user.id}`);
    revalidatePath(`/amps/${id}`);

    return { success: true };
}

export async function deleteAmp(id: string) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return { error: "Unauthorized" };
    }

    const ds = await getDataSource();
    const repo = ds.getRepository(Amp);

    const amp = await repo.findOne({ where: { id, userId: session.user.id } });
    if (!amp) {
        return { error: "Not found" };
    }

    await repo.remove(amp);
    revalidatePath("/");
    revalidatePath(`/users/${session.user.id}`);

    return { success: true };
}
