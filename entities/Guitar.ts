import "reflect-metadata";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { GuitarImage } from "./GuitarImage";

import type { GuitarType, GuitarCondition } from "@/lib/schemas";
export type { GuitarType, GuitarCondition };

@Entity("GUITARS")
export class Guitar {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "USER_ID", type: "varchar", length: 36 })
  userId!: string;

  @Column({ name: "BRAND", type: "varchar", length: 100 })
  brand!: string;

  @Column({ name: "MODEL", type: "varchar", length: 100 })
  model!: string;

  @Column({ name: "YEAR", nullable: true, type: "int" })
  year!: number | null;

  @Column({ name: "TYPE", type: "varchar", length: 256 })
  type!: GuitarType;

  @Column({ name: "COLOR", type: "varchar", length: 100, nullable: true })
  color!: string | null;

  @Column({ name: "SERIAL_NUMBER", type: "varchar", length: 100, nullable: true })
  serialNumber!: string | null;

  @Column({ name: "CONDITION", type: "varchar", length: 256 })
  condition!: GuitarCondition;

  @Column({ name: "BODY", type: "varchar", length: 256, nullable: true })
  body!: string | null;

  @Column({ name: "TOP", type: "varchar", length: 256, nullable: true })
  top!: string | null;

  @Column({ name: "NECK", type: "varchar", length: 256, nullable: true })
  neck!: string | null;

  @Column({ name: "FRETBOARD", type: "varchar", length: 256, nullable: true })
  fretboard!: string | null;

  @Column({ name: "BRIDGE", type: "varchar", length: 256, nullable: true })
  bridge!: string | null;

  @Column({ name: "NUT", type: "varchar", length: 256, nullable: true })
  nut!: string | null;

  @Column({ name: "NECK_PICKUP", type: "varchar", length: 256, nullable: true })
  neckPickup!: string | null;

  @Column({ name: "MIDDLE_PICKUP", type: "varchar", length: 256, nullable: true })
  middlePickup!: string | null;

  @Column({ name: "BRIDGE_PICKUP", type: "varchar", length: 256, nullable: true })
  bridgePickup!: string | null;

  @Column({ name: "CONTROLS", type: "varchar", length: 256, nullable: true })
  controls!: string | null;

  @Column({ name: "PICKUP_SELECTOR", type: "varchar", length: 256, nullable: true })
  pickupSelector!: string | null;

  @Column({ name: "OUTPUT_JACK", type: "varchar", length: 256, nullable: true })
  outputJack!: string | null;

  @Column({ name: "FRETS", type: "varchar", length: 256, nullable: true })
  frets!: string | null;

  @Column({ name: "TUNERS", type: "varchar", length: 256, nullable: true })
  tuners!: string | null;

  @Column({ name: "FINISH_TYPE", type: "varchar", length: 256, nullable: true })
  finishType!: string | null;

  @Column({ name: "MADE_IN", type: "varchar", length: 256, nullable: true })
  madeIn!: string | null;

  @Column({ name: "NOTES", type: "longtext", nullable: true })
  notes!: string | null;

  @Column({ name: "IMAGE_DATA", type: "longtext", nullable: true, select: false })
  imageData!: string | null;

  @Column({ name: "IMAGE_MIME_TYPE", type: "varchar", length: 100, nullable: true })
  imageMimeType!: string | null;

  @CreateDateColumn({ name: "CREATED_AT" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "UPDATED_AT" })
  updatedAt!: Date;

  @OneToMany(() => GuitarImage, (image: any) => image.guitar, { cascade: true })
  images!: any[];
}
