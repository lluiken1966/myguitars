import "reflect-metadata";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { AmpImage } from "./AmpImage";

import type { AmpType, AmpCondition } from "@/lib/schemas";
export type { AmpType, AmpCondition };

@Entity("AMPS")
export class Amp {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "USER_ID", type: "varchar", length: 36 })
  userId!: string;

  // ── Basic Info ────────────────────────────────────────────────────────────
  @Column({ name: "BRAND", type: "varchar", length: 100 })
  brand!: string;

  @Column({ name: "MODEL", type: "varchar", length: 100 })
  model!: string;

  @Column({ name: "YEAR", nullable: true, type: "int" })
  year!: number | null;

  @Column({ name: "TYPE", type: "varchar", length: 256 })
  type!: AmpType;

  @Column({ name: "COLOR", type: "varchar", length: 100, nullable: true })
  color!: string | null;

  @Column({ name: "SERIAL_NUMBER", type: "varchar", length: 100, nullable: true })
  serialNumber!: string | null;

  @Column({ name: "CONDITION", type: "varchar", length: 256 })
  condition!: AmpCondition;

  // ── Power & Electronics ───────────────────────────────────────────────────
  @Column({ name: "WATTAGE", type: "varchar", length: 256, nullable: true })
  wattage!: string | null;

  @Column({ name: "CHANNELS", type: "varchar", length: 256, nullable: true })
  channels!: string | null;

  @Column({ name: "PREAMP_TUBES", type: "varchar", length: 256, nullable: true })
  preampTubes!: string | null;

  @Column({ name: "POWER_TUBES", type: "varchar", length: 256, nullable: true })
  powerTubes!: string | null;

  @Column({ name: "RECTIFIER", type: "varchar", length: 256, nullable: true })
  rectifier!: string | null;

  @Column({ name: "OUTPUT_TRANSFORMER", type: "varchar", length: 256, nullable: true })
  outputTransformer!: string | null;

  // ── Speaker ───────────────────────────────────────────────────────────────
  @Column({ name: "SPEAKER_BRAND", type: "varchar", length: 256, nullable: true })
  speakerBrand!: string | null;

  @Column({ name: "SPEAKER_MODEL", type: "varchar", length: 256, nullable: true })
  speakerModel!: string | null;

  @Column({ name: "SPEAKER_SIZE", type: "varchar", length: 256, nullable: true })
  speakerSize!: string | null;

  @Column({ name: "SPEAKER_COUNT", type: "varchar", length: 256, nullable: true })
  speakerCount!: string | null;

  @Column({ name: "IMPEDANCE", type: "varchar", length: 256, nullable: true })
  impedance!: string | null;

  // ── Cabinet ───────────────────────────────────────────────────────────────
  @Column({ name: "CABINET_MATERIAL", type: "varchar", length: 256, nullable: true })
  cabinetMaterial!: string | null;

  @Column({ name: "BAFFLE", type: "varchar", length: 256, nullable: true })
  baffle!: string | null;

  @Column({ name: "FINISH_TYPE", type: "varchar", length: 256, nullable: true })
  finishType!: string | null;

  @Column({ name: "MADE_IN", type: "varchar", length: 256, nullable: true })
  madeIn!: string | null;

  // ── Controls & Effects ────────────────────────────────────────────────────
  @Column({ name: "CONTROLS", type: "varchar", length: 256, nullable: true })
  controls!: string | null;

  @Column({ name: "BUILT_IN_EFFECTS", type: "varchar", length: 256, nullable: true })
  builtInEffects!: string | null;

  @Column({ name: "EFFECTS_LOOP", type: "varchar", length: 256, nullable: true })
  effectsLoop!: string | null;

  @Column({ name: "FOOTSWITCH", type: "varchar", length: 256, nullable: true })
  footswitch!: string | null;

  // ── Connections ───────────────────────────────────────────────────────────
  @Column({ name: "INPUTS", type: "varchar", length: 256, nullable: true })
  inputs!: string | null;

  @Column({ name: "OUTPUTS", type: "varchar", length: 256, nullable: true })
  outputs!: string | null;

  @Column({ name: "NOTES", type: "longtext", nullable: true })
  notes!: string | null;

  @CreateDateColumn({ name: "CREATED_AT" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "UPDATED_AT" })
  updatedAt!: Date;

  @OneToMany(() => AmpImage, (image: any) => image.amp, { cascade: true })
  images!: any[];
}
