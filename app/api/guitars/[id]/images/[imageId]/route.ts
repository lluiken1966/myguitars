import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDataSource } from "@/lib/db";
import { GuitarImage } from "@/entities/GuitarImage";
import { Guitar } from "@/entities/Guitar";

type Params = { params: Promise<{ id: string; imageId: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
    const { id, imageId } = await params;
    const ds = await getDataSource();

    const image = await ds
        .getRepository(GuitarImage)
        .createQueryBuilder("img")
        .select(["img.id", "img.imageData", "img.imageMimeType"])
        .where("img.id = :imageId AND img.guitarId = :id", { imageId, id })
        .getOne();

    if (!image || !image.imageData || !image.imageMimeType) {
        return new NextResponse(null, { status: 404 });
    }

    const buffer = Buffer.from(image.imageData, "base64");
    return new NextResponse(buffer, {
        headers: {
            "Content-Type": image.imageMimeType,
            "Cache-Control": "public, max-age=86400", // cache for 1 day
        },
    });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, imageId } = await params;
    const ds = await getDataSource();

    // Verify ownership
    const guitar = await ds.getRepository(Guitar).findOne({ where: { id, userId: session.user.id } });
    if (!guitar) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const repo = ds.getRepository(GuitarImage);
    const image = await repo.findOne({ where: { id: imageId, guitarId: id } });

    if (image) {
        await repo.remove(image);
    }

    return NextResponse.json({ success: true });
}
