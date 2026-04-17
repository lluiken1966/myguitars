import "reflect-metadata";
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
} from "typeorm";
import { User } from "./User";

@Entity("PASSWORD_RESET_TOKENS")
export class PasswordResetToken {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ name: "USER_ID", type: "varchar", length: 36 })
    userId!: string;

    @Column({ name: "TOKEN_HASH", type: "varchar", length: 64 })
    tokenHash!: string;

    @Column({ name: "EXPIRES_AT", type: "datetime" })
    expiresAt!: Date;

    @Column({ name: "USED_AT", type: "datetime", nullable: true })
    usedAt!: Date | null;

    @CreateDateColumn({ name: "CREATED_AT" })
    createdAt!: Date;

    @ManyToOne(() => User, { onDelete: "CASCADE" })
    @JoinColumn({ name: "USER_ID" })
    user!: User;
}
