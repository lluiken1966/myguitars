import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getDataSource } from "@/lib/db";
import { User } from "@/entities/User";
import { Guitar } from "@/entities/Guitar";

// Dev-only seed endpoint — remove or protect before deploying
export async function POST() {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Only available in development" }, { status: 403 });
  }

  try {
    const ds = await getDataSource();
    const userRepo = ds.getRepository(User);
    const guitarRepo = ds.getRepository(Guitar);

    // ── Create user Leon ──────────────────────────────────────────────────────
    let user = await userRepo.findOne({ where: { email: "leon@myguitar.com" } });

    if (!user) {
      const hashed = await bcrypt.hash("Guitar123!", 12);
      user = userRepo.create({
        email: "leon@myguitar.com",
        password: hashed,
        name: "Leon",
      });
      await userRepo.save(user);
    }

    // ── Seed guitars (skip if already seeded) ────────────────────────────────
    const existing = await guitarRepo.count({ where: { userId: user.id } });
    if (existing > 0) {
      return NextResponse.json({
        message: "Already seeded",
        user: { email: user.email, name: user.name },
        guitars: existing,
      });
    }

    const guitars = guitarRepo.create([
      {
        userId: user.id,
        brand: "Fender",
        model: "Stratocaster",
        year: 1965,
        type: "electric",
        color: "Olympic White",
        serialNumber: "L55432",
        condition: "excellent",
        notes: "All-original 1965 Strat. Three-bolt neck, maple fretboard. Minor checking on the finish.",
      },
      {
        userId: user.id,
        brand: "Gibson",
        model: "Les Paul Standard",
        year: 1959,
        type: "electric",
        color: "Tobacco Burst",
        serialNumber: "9-1234",
        condition: "good",
        notes: "Holy grail burst. PAF humbuckers, Brazilian rosewood fretboard. Some buckle rash on back.",
      },
      {
        userId: user.id,
        brand: "Martin",
        model: "D-28",
        year: 2020,
        type: "acoustic",
        color: "Natural",
        serialNumber: "2394872",
        condition: "mint",
        notes: "Barely played. Sitka spruce top, East Indian rosewood back and sides. Comes with original case.",
      },
      {
        userId: user.id,
        brand: "Fender",
        model: "Telecaster",
        year: 1972,
        type: "electric",
        color: "Butterscotch Blonde",
        serialNumber: "348921",
        condition: "good",
        notes: "Ash body, maple neck. Replaced bridge pickup (original included). Great player.",
      },
      {
        userId: user.id,
        brand: "Taylor",
        model: "814ce",
        year: 2019,
        type: "acoustic",
        color: "Natural",
        serialNumber: "1109199083",
        condition: "excellent",
        notes: "Grand Auditorium body, Sitka spruce top, Indian rosewood back. Expression System 2 pickup.",
      },
      {
        userId: user.id,
        brand: "Gibson",
        model: "SG Standard",
        year: 1971,
        type: "electric",
        color: "Cherry Red",
        serialNumber: "918432",
        condition: "fair",
        notes: "Walnut neck, volute headstock. Heavy play wear but sounds incredible. Needs a refret.",
      },
      {
        userId: user.id,
        brand: "Ibanez",
        model: "RG550",
        year: 1989,
        type: "electric",
        color: "Desert Yellow",
        serialNumber: "F890432",
        condition: "excellent",
        notes: "Made in Japan. Original Edge tremolo, DiMarzio pickups. Fujigen factory, great example of the era.",
      },
      {
        userId: user.id,
        brand: "Yamaha",
        model: "FG800",
        year: 2022,
        type: "acoustic",
        color: "Natural",
        serialNumber: null,
        condition: "mint",
        notes: "Beginner/loaner guitar. Solid spruce top, nato back and sides. Kept in studio for guests.",
      },
    ]);

    await guitarRepo.save(guitars);

    return NextResponse.json({
      message: "Seed complete",
      user: { email: user.email, name: user.name, password: "Guitar123!" },
      guitarsCreated: guitars.length,
    });
  } catch (err) {
    console.error("[seed] POST error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

