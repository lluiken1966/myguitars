import "reflect-metadata";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from "typeorm";

@Entity("USERS")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "EMAIL", type: "varchar2", length: 255, unique: true })
  email!: string;

  @Column({ name: "PASSWORD", type: "varchar2", length: 255 })
  password!: string; // bcrypt hash

  @Column({ name: "NAME", type: "varchar2", length: 100, nullable: true })
  name!: string | null;

  @CreateDateColumn({ name: "CREATED_AT" })
  createdAt!: Date;
}
