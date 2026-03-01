import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDataSource } from "@/lib/db";
import { Guitar } from "@/entities/Guitar";

const VALID_TYPES = ["electric", "acoustic", "bass", "classical", "other"];
const VALID_CONDITIONS = ["mint", "excellent", "good", "fair", "poor"];

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const ds = await getDataSource();
  const guitar = await ds.getRepository(Guitar).findOne({
    where: { id, userId: session.user.id },
  });

  if (!guitar) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(guitar);
}

export async function PUT(req: NextRequest, { params }: Params) {
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

  const body = await req.json();
  const { brand, model, year, type, color, serialNumber, condition, purchasePrice, currentValue, notes } = body;

  if (brand !== undefined) {
    if (!brand) return NextResponse.json({ error: "brand cannot be empty" }, { status: 400 });
    guitar.brand = brand;
  }
  if (model !== undefined) {
    if (!model) return NextResponse.json({ error: "model cannot be empty" }, { status: 400 });
    guitar.model = model;
  }
  if (type !== undefined) {
    if (!VALID_TYPES.includes(type)) return NextResponse.json({ error: "Invalid guitar type" }, { status: 400 });
    guitar.type = type;
  }
  if (condition !== undefined) {
    if (!VALID_CONDITIONS.includes(condition)) return NextResponse.json({ error: "Invalid condition" }, { status: 400 });
    guitar.condition = condition;
  }
  if (year !== undefined) guitar.year = year;
  if (color !== undefined) guitar.color = color;
  if (serialNumber !== undefined) guitar.serialNumber = serialNumber;
  if (purchasePrice !== undefined) guitar.purchasePrice = purchasePrice;
  if (currentValue !== undefined) guitar.currentValue = currentValue;
  if (notes !== undefined) guitar.notes = notes;

  const updated = await repo.save(guitar);
  return NextResponse.json(updated);
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

  await repo.remove(guitar);
  return NextResponse.json({ success: true });
}
