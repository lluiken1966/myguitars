import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDataSource } from "@/lib/db";
import { GuitarImage } from "@/entities/GuitarImage";
import { Guitar } from "@/entities/Guitar";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
    const { id } = await params;
    const ds = await getDataSource();

    // Return a list of image metadata (no blob data)
    const images = await ds
        .getRepository(GuitarImage)
        .find({
            where: { guitarId: id },
            select: ["id", "displayOrder"],
            order: { displayOrder: "ASC", createdAt: "ASC" },
        });

    return NextResponse.json(images);
}

export async function POST(req: NextRequest, { params }: Params) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const ds = await getDataSource();

    // Verify ownership
    const guitar = await ds.getRepository(Guitar).findOne({ where: { id, userId: session.user.id } });
    if (!guitar) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const formData = await req.formData();

    // They can upload multiple images sharing the 'image' key
    const files = formData.getAll("image") as File[];
    if (!files || files.length === 0) {
        return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const repo = ds.getRepository(GuitarImage);
    const existingCount = await repo.count({ where: { guitarId: id } });

    const newImages: GuitarImage[] = [];

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!ALLOWED_MIME_TYPES.includes(file.type) || file.size > MAX_SIZE_BYTES) {
            continue; // Skip invalid files
        }

        const arrayBuffer = await file.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString("base64");

        const img = repo.create({
            guitarId: id,
            imageData: base64,
            imageMimeType: file.type,
            displayOrder: existingCount + i,
        });
        newImages.push(img);
    }

    if (newImages.length > 0) {
        await repo.save(newImages);
    }

    return NextResponse.json({ success: true, uploaded: newImages.length });
}
