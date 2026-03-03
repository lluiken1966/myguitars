import { z } from "zod";

export const GUITAR_TYPES = ["electric", "acoustic", "bass", "classical", "other"] as const;
export const GUITAR_CONDITIONS = ["mint", "excellent", "good", "fair", "poor"] as const;

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
  purchasePrice: z.union([
    z.coerce.number().min(0, "Price must be positive"),
    z.literal("")
  ]).transform(v => v === "" ? null : v).nullable().optional(),
  currentValue: z.union([
    z.coerce.number().min(0, "Value must be positive"),
    z.literal("")
  ]).transform(v => v === "" ? null : v).nullable().optional(),
  notes: z.string().trim().nullable().optional().transform(v => v === "" ? null : v),
});

export type GuitarInput = z.infer<typeof GuitarSchema>;
export type GuitarType = typeof GUITAR_TYPES[number];
export type GuitarCondition = typeof GUITAR_CONDITIONS[number];
