import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDataSource } from "@/lib/db";
import { Guitar } from "@/entities/Guitar";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const ds = await getDataSource();

  const guitar = await ds
    .getRepository(Guitar)
    .createQueryBuilder("g")
    .select(["g.id", "g.imageData", "g.imageMimeType"])
    .where("g.id = :id AND g.userId = :userId", { id, userId: session.user.id })
    .getOne();

  if (!guitar || !guitar.imageData || !guitar.imageMimeType) {
    return new NextResponse(null, { status: 404 });
  }

  const buffer = Buffer.from(guitar.imageData, "base64");
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": guitar.imageMimeType,
      "Cache-Control": "private, max-age=3600",
    },
  });
}

export async function POST(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const ds = await getDataSource();
  const repo = ds.getRepository(Guitar);

  const guitar = await repo.findOne({ where: { id, userId: session.user.id } });
  if (!guitar) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const formData = await req.formData();
  const file = formData.get("image") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No image provided" }, { status: 400 });
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Unsupported file type. Use JPEG, PNG, WebP, or GIF." },
      { status: 400 }
    );
  }

  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json(
      { error: "Image must be smaller than 10 MB." },
      { status: 400 }
    );
  }

  const arrayBuffer = await file.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");

  guitar.imageData = base64;
  guitar.imageMimeType = file.type;
  await repo.save(guitar);

  return NextResponse.json({ success: true });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const ds = await getDataSource();
  const repo = ds.getRepository(Guitar);

  const guitar = await repo.findOne({ where: { id, userId: session.user.id } });
  if (!guitar) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  guitar.imageData = null;
  guitar.imageMimeType = null;
  await repo.save(guitar);

  return NextResponse.json({ success: true });
}
