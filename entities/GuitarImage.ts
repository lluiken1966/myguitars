import "reflect-metadata";
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
} from "typeorm";
import { Guitar } from "./Guitar";

@Entity("GUITAR_IMAGES")
export class GuitarImage {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ name: "GUITAR_ID", type: "varchar2", length: 36 })
    guitarId!: string;

    @Column({ name: "IMAGE_DATA", type: "clob", select: false })
    imageData!: string;

    @Column({ name: "IMAGE_MIME_TYPE", type: "varchar2", length: 100 })
    imageMimeType!: string;

    @Column({ name: "DISPLAY_ORDER", type: "int", default: 0 })
    displayOrder!: number;

    @CreateDateColumn({ name: "CREATED_AT" })
    createdAt!: Date;

    @ManyToOne(() => Guitar, (guitar: any) => guitar.images, { onDelete: "CASCADE" })
    @JoinColumn({ name: "GUITAR_ID" })
    guitar!: any;
}
