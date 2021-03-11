import { BaseEntity, Column, Entity, PrimaryGeneratedColumn, Unique } from "typeorm";

@Entity()
export class Task extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        unique: true
    })
    sampleId: number;

    @Column()
    pigment: string;

    @Column("double")
    pigmentWeight: number;

    @Column("double")
    sampleWeight: number;

    @Column()
    resultFilename: string;

    @Column("longtext")
    resultContent: string;

    @Column()
    addTime: Date;

    @Column()
    finishTime: Date;

    @Column()
    status: string;
}