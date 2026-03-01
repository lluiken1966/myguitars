import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDataSource } from "@/lib/db";
import { Guitar } from "@/entities/Guitar";

const VALID_TYPES = ["electric", "acoustic", "bass", "classical", "other"];
const VALID_CONDITIONS = ["mint", "excellent", "good", "fair", "poor"];

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ds = await getDataSource();
  const repo = ds.getRepository(Guitar);
  const guitars = await repo.find({
    where: { userId: session.user.id },
    order: { createdAt: "DESC" },
  });

  return NextResponse.json(guitars);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { brand, model, year, type, color, serialNumber, condition, purchasePrice, currentValue, notes } = body;

  if (!brand || !model || !type || !condition) {
    return NextResponse.json({ error: "brand, model, type, and condition are required" }, { status: 400 });
  }

  if (!VALID_TYPES.includes(type)) {
    return NextResponse.json({ error: "Invalid guitar type" }, { status: 400 });
  }

  if (!VALID_CONDITIONS.includes(condition)) {
    return NextResponse.json({ error: "Invalid condition" }, { status: 400 });
  }

  const ds = await getDataSource();
  const repo = ds.getRepository(Guitar);

  const guitar = repo.create({
    userId: session.user.id,
    brand,
    model,
    year: year ?? null,
    type,
    color: color ?? null,
    serialNumber: serialNumber ?? null,
    condition,
    purchasePrice: purchasePrice ?? null,
    currentValue: currentValue ?? null,
    notes: notes ?? null,
  });

  const saved = await repo.save(guitar);
  return NextResponse.json(saved, { status: 201 });
}
