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
      purchasePrice: 18000,
      currentValue: 32000,
      notes: "All-original 1965 Strat. Three-bolt neck, maple fretboard. Minor checking on the finish.",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/6/63/Fender_Stratocaster_004-2.jpg",
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
      purchasePrice: 45000,
      currentValue: 95000,
      notes: "Holy grail burst. PAF humbuckers, Brazilian rosewood fretboard. Some buckle rash on back.",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/a/ab/Gibson_Les_Paul_Classic_--_2024_--_0429.jpg",
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
      purchasePrice: 3200,
      currentValue: 3000,
      notes: "Barely played. Sitka spruce top, East Indian rosewood back and sides. Comes with original case.",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/0/0c/Martin_D-28_Acoustic_Guitar.jpg",
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
      purchasePrice: 4500,
      currentValue: 6800,
      notes: "Ash body, maple neck. Replaced bridge pickup (original included). Great player.",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/0/0c/Fender_Telecaster_American_Vintage_52.JPG",
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
      purchasePrice: 3800,
      currentValue: 3600,
      notes: "Grand Auditorium body, Sitka spruce top, Indian rosewood back. Expression System 2 pickup.",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/2/2b/WTB_Acoustic_Guitars_1.jpg",
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
      purchasePrice: 2200,
      currentValue: 4100,
      notes: "Walnut neck, volute headstock. Heavy play wear but sounds incredible. Needs a refret.",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/4/41/Gibson_SG_Special.JPG",
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
      purchasePrice: 900,
      currentValue: 1400,
      notes: "Made in Japan. Original Edge tremolo, DiMarzio pickups. Fujigen factory, great example of the era.",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/e/ed/Ibanez_RG350EXZ_BK_Electric_Guitar_c.a._2011.jpg",
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
      purchasePrice: 250,
      currentValue: 240,
      notes: "Beginner/loaner guitar. Solid spruce top, nato back and sides. Kept in studio for guests.",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/0/0e/Yamaha_Acoustic_Guitar_FG-331v2.jpg",
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

// PATCH /api/seed — update imageUrls on existing seeded guitars
export async function PATCH() {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Only available in development" }, { status: 403 });
  }

  try {
  const imageMap: Record<string, string> = {
    "Fender|Stratocaster": "https://upload.wikimedia.org/wikipedia/commons/6/63/Fender_Stratocaster_004-2.jpg",
    "Gibson|Les Paul Standard": "https://upload.wikimedia.org/wikipedia/commons/a/ab/Gibson_Les_Paul_Classic_--_2024_--_0429.jpg",
    "Martin|D-28": "https://upload.wikimedia.org/wikipedia/commons/0/0c/Martin_D-28_Acoustic_Guitar.jpg",
    "Fender|Telecaster": "https://upload.wikimedia.org/wikipedia/commons/0/0c/Fender_Telecaster_American_Vintage_52.JPG",
    "Taylor|814ce": "https://upload.wikimedia.org/wikipedia/commons/2/2b/WTB_Acoustic_Guitars_1.jpg",
    "Gibson|SG Standard": "https://upload.wikimedia.org/wikipedia/commons/4/41/Gibson_SG_Special.JPG",
    "Ibanez|RG550": "https://upload.wikimedia.org/wikipedia/commons/e/ed/Ibanez_RG350EXZ_BK_Electric_Guitar_c.a._2011.jpg",
    "Yamaha|FG800": "https://upload.wikimedia.org/wikipedia/commons/0/0e/Yamaha_Acoustic_Guitar_FG-331v2.jpg",
  };

  const ds = await getDataSource();
  const userRepo = ds.getRepository(User);
  const guitarRepo = ds.getRepository(Guitar);

  const user = await userRepo.findOne({ where: { email: "leon@myguitar.com" } });
  if (!user) {
    return NextResponse.json({ error: "Seed user not found" }, { status: 404 });
  }

  const guitars = await guitarRepo.find({ where: { userId: user.id } });
  let updated = 0;

  for (const guitar of guitars) {
    const key = `${guitar.brand}|${guitar.model}`;
    const url = imageMap[key];
    if (url && guitar.imageUrl !== url) {
      guitar.imageUrl = url;
      await guitarRepo.save(guitar);
      updated++;
    }
  }

  return NextResponse.json({ message: "Images updated", updated });
  } catch (err) {
    console.error("[seed] PATCH error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
