import { z } from "zod";

export const GUITAR_TYPES = ["electric", "acoustic", "bass", "classical", "other"] as const;
export const GUITAR_CONDITIONS = ["mint", "excellent", "good", "fair", "poor"] as const;

export const AMP_TYPES = ["combo", "head", "cabinet", "mini", "preamp", "other"] as const;
export const AMP_CONDITIONS = ["mint", "excellent", "good", "fair", "poor"] as const;

export const GuitarSchema = z.object({
  brand: z.string().trim().min(1, "Brand is required").max(100, "Brand is too long"),
  model: z.string().trim().min(1, "Model is required").max(100, "Model is too long"),
  year: z.union([
    z.coerce.number().int().min(1900, "Year must be \u2265 1900").max(2100, "Year must be \u2264 2100"),
    z.literal("")
  ]).transform(v => v === "" ? null : v).nullable().optional(),
  type: z.enum(GUITAR_TYPES, { message: "Invalid type" }),
  color: z.string().trim().max(100, "Color is too long").nullable().optional().transform(v => v === "" ? null : v),
  serialNumber: z.string().trim().max(100, "Serial is too long").nullable().optional().transform(v => v === "" ? null : v),
  condition: z.enum(GUITAR_CONDITIONS, { message: "Invalid condition" }),
  body: z.string().trim().max(256, "Body is too long").nullable().optional().transform(v => v === "" ? null : v),
  top: z.string().trim().max(256, "Top is too long").nullable().optional().transform(v => v === "" ? null : v),
  neck: z.string().trim().max(256, "Neck is too long").nullable().optional().transform(v => v === "" ? null : v),
  fretboard: z.string().trim().max(256, "Fretboard is too long").nullable().optional().transform(v => v === "" ? null : v),
  bridge: z.string().trim().max(256, "Bridge is too long").nullable().optional().transform(v => v === "" ? null : v),
  nut: z.string().trim().max(256, "Nut is too long").nullable().optional().transform(v => v === "" ? null : v),
  neckPickup: z.string().trim().max(256, "Pickup is too long").nullable().optional().transform(v => v === "" ? null : v),
  middlePickup: z.string().trim().max(256, "Pickup is too long").nullable().optional().transform(v => v === "" ? null : v),
  bridgePickup: z.string().trim().max(256, "Pickup is too long").nullable().optional().transform(v => v === "" ? null : v),
  controls: z.string().trim().max(256, "Controls is too long").nullable().optional().transform(v => v === "" ? null : v),
  pickupSelector: z.string().trim().max(256, "Pickup selector is too long").nullable().optional().transform(v => v === "" ? null : v),
  outputJack: z.string().trim().max(256, "Output jack is too long").nullable().optional().transform(v => v === "" ? null : v),
  frets: z.string().trim().max(256, "Frets is too long").nullable().optional().transform(v => v === "" ? null : v),
  tuners: z.string().trim().max(256, "Tuners is too long").nullable().optional().transform(v => v === "" ? null : v),
  finishType: z.string().trim().max(256, "Finish type is too long").nullable().optional().transform(v => v === "" ? null : v),
  madeIn: z.string().trim().max(256, "Origin is too long").nullable().optional().transform(v => v === "" ? null : v),
  notes: z.string().trim().nullable().optional().transform(v => v === "" ? null : v),
});

export type GuitarInput = z.infer<typeof GuitarSchema>;
export type GuitarType = typeof GUITAR_TYPES[number];
export type GuitarCondition = typeof GUITAR_CONDITIONS[number];

const optStr = (max: number, label: string) =>
  z.string().trim().max(max, `${label} is too long`).nullable().optional().transform(v => v === "" ? null : v);

export const AmpSchema = z.object({
  brand: z.string().trim().min(1, "Brand is required").max(100, "Brand is too long"),
  model: z.string().trim().min(1, "Model is required").max(100, "Model is too long"),
  year: z.union([
    z.coerce.number().int().min(1900, "Year must be ≥ 1900").max(2100, "Year must be ≤ 2100"),
    z.literal("")
  ]).transform(v => v === "" ? null : v).nullable().optional(),
  type: z.enum(AMP_TYPES, { message: "Invalid type" }),
  color: z.string().trim().max(100, "Color is too long").nullable().optional().transform(v => v === "" ? null : v),
  serialNumber: z.string().trim().max(100, "Serial is too long").nullable().optional().transform(v => v === "" ? null : v),
  condition: z.enum(AMP_CONDITIONS, { message: "Invalid condition" }),
  // Power & Electronics
  wattage: optStr(256, "Wattage"),
  channels: optStr(256, "Channels"),
  preampTubes: optStr(256, "Preamp tubes"),
  powerTubes: optStr(256, "Power tubes"),
  rectifier: optStr(256, "Rectifier"),
  outputTransformer: optStr(256, "Output transformer"),
  // Speaker
  speakerBrand: optStr(256, "Speaker brand"),
  speakerModel: optStr(256, "Speaker model"),
  speakerSize: optStr(256, "Speaker size"),
  speakerCount: optStr(256, "Speaker count"),
  impedance: optStr(256, "Impedance"),
  // Cabinet
  cabinetMaterial: optStr(256, "Cabinet material"),
  baffle: optStr(256, "Baffle"),
  finishType: optStr(256, "Finish type"),
  madeIn: optStr(256, "Origin"),
  // Controls & Effects
  controls: optStr(256, "Controls"),
  builtInEffects: optStr(256, "Built-in effects"),
  effectsLoop: optStr(256, "Effects loop"),
  footswitch: optStr(256, "Footswitch"),
  // Connections
  inputs: optStr(256, "Inputs"),
  outputs: optStr(256, "Outputs"),
  notes: z.string().trim().nullable().optional().transform(v => v === "" ? null : v),
});

export type AmpInput = z.infer<typeof AmpSchema>;
export type AmpType = typeof AMP_TYPES[number];
export type AmpCondition = typeof AMP_CONDITIONS[number];
