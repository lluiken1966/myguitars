import "reflect-metadata";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

import type { GuitarType, GuitarCondition } from "@/lib/schemas";
export type { GuitarType, GuitarCondition };

@Entity("GUITARS")
export class Guitar {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "USER_ID", type: "varchar2", length: 36 })
  userId!: string;

  @Column({ name: "BRAND", type: "varchar2", length: 100 })
  brand!: string;

  @Column({ name: "MODEL", type: "varchar2", length: 100 })
  model!: string;

  @Column({ name: "YEAR", nullable: true, type: "int" })
  year!: number | null;

  @Column({ name: "TYPE", type: "varchar2", length: 256 })
  type!: GuitarType;

  @Column({ name: "COLOR", type: "varchar2", length: 100, nullable: true })
  color!: string | null;

  @Column({ name: "SERIAL_NUMBER", type: "varchar2", length: 100, nullable: true })
  serialNumber!: string | null;

  @Column({ name: "CONDITION", type: "varchar2", length: 256 })
  condition!: GuitarCondition;

  @Column({ name: "PURCHASE_PRICE", type: "decimal", nullable: true })
  purchasePrice!: number | null;

  @Column({ name: "CURRENT_VALUE", type: "decimal", nullable: true })
  currentValue!: number | null;

  @Column({ name: "NOTES", type: "clob", nullable: true })
  notes!: string | null;

  @Column({ name: "IMAGE_DATA", type: "clob", nullable: true, select: false })
  imageData!: string | null;

  @Column({ name: "IMAGE_MIME_TYPE", type: "varchar2", length: 100, nullable: true })
  imageMimeType!: string | null;

  @CreateDateColumn({ name: "CREATED_AT" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "UPDATED_AT" })
  updatedAt!: Date;
}
