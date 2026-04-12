import "reflect-metadata";
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
} from "typeorm";
import { Amp } from "./Amp";

@Entity("AMP_IMAGES")
export class AmpImage {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ name: "AMP_ID", type: "varchar", length: 36 })
    ampId!: string;

    @Column({ name: "IMAGE_DATA", type: "longtext", select: false })
    imageData!: string;

    @Column({ name: "IMAGE_MIME_TYPE", type: "varchar", length: 100 })
    imageMimeType!: string;

    @Column({ name: "DISPLAY_ORDER", type: "int", default: 0 })
    displayOrder!: number;

    @CreateDateColumn({ name: "CREATED_AT" })
    createdAt!: Date;

    @ManyToOne(() => Amp, (amp: any) => amp.images, { onDelete: "CASCADE" })
    @JoinColumn({ name: "AMP_ID" })
    amp!: any;
}
