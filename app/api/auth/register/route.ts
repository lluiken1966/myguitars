import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getDataSource } from "@/lib/db";
import { User } from "@/entities/User";

export async function POST(req: NextRequest) {
  const { email: rawEmail, password, name } = await req.json();

  if (!rawEmail || !password) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }

  const email = rawEmail.toLowerCase().trim();

  const ds = await getDataSource();
  const repo = ds.getRepository(User);

  const existing = await repo.findOne({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "An account with that email already exists" }, { status: 409 });
  }

  const hashed = await bcrypt.hash(password, 12);
  const user = repo.create({ email, password: hashed, name: name || null });
  await repo.save(user);

  return NextResponse.json({ success: true }, { status: 201 });
}
