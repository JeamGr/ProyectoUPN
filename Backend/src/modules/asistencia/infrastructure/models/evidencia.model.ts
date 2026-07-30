import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('evidencias')
export class EvidenciaModel {
    @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
    id!: number;

    @Column({ type: 'bigint', unsigned: true })
    inscripcion_id!: number;

    @Column({ type: 'enum', enum: ['foto', 'video', 'documento'] })
    tipo!: 'foto' | 'video' | 'documento';

    @Column({ type: 'boolean', default: false })
    contenido_sensible!: boolean;

    @Column({ type: 'varchar', length: 500 })
    url!: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    descripcion!: string | null;

    @Column({ type: 'bigint', unsigned: true })
    subido_por!: number;

    @CreateDateColumn()
    fecha_subida!: Date;
}