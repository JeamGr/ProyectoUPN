import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('perfiles_voluntario')
export class PerfilVoluntarioModel {
    @PrimaryColumn({ type: 'bigint', unsigned: true })
    usuario_id!: number;

    @Column({ type: 'varchar', length: 20, unique: true })
    codigo_estudiante!: string;

    @Column({ type: 'varchar', length: 100 })
    nombres!: string;

    @Column({ type: 'varchar', length: 100 })
    apellidos!: string;

    @Column({ type: 'varchar', length: 100 })
    carrera!: string;

    @Column({ type: 'tinyint', unsigned: true })
    ciclo!: number;

    @Column({ type: 'varchar', length: 20, nullable: true })
    telefono!: string | null;

    @Column({ type: 'varchar', length: 150, nullable: true })
    ubicacion!: string | null;

    @Column({ type: 'text', nullable: true })
    habilidades!: string | null;

    @Column({ type: 'varchar', length: 255, nullable: true })
    disponibilidad!: string | null;

    @Column({ type: 'varchar', length: 500, nullable: true })
    foto_url!: string | null;
}