import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('roles')
export class RolModel {
    @PrimaryGeneratedColumn({ type: 'tinyint', unsigned: true })
    id!: number;

    @Column({ type: 'varchar', length: 50, unique: true })
    nombre!: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    descripcion!: string | null;
}