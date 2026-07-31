import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('incidencias')
export class IncidenciaModel {
    @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
    id!: number;

    @Column({ type: 'bigint', unsigned: true })
    oportunidad_id!: number;

    @Column({ type: 'bigint', unsigned: true, nullable: true })
    inscripcion_id!: number | null;

    @Column({ type: 'bigint', unsigned: true })
    reportado_por!: number;

    @Column({ type: 'enum', enum: ['baja', 'media', 'alta', 'critica'], default: 'media' })
    severidad!: 'baja' | 'media' | 'alta' | 'critica';

    @Column({ type: 'varchar', length: 100 })
    categoria!: string;

    @Column({ type: 'text' })
    descripcion!: string;

    @Column({ type: 'enum', enum: ['abierta', 'en_seguimiento', 'resuelta', 'cerrada'], default: 'abierta' })
    estado!: 'abierta' | 'en_seguimiento' | 'resuelta' | 'cerrada';

    @Column({ type: 'bigint', unsigned: true, nullable: true })
    resuelto_por!: number | null;

    @Column({ type: 'datetime', nullable: true })
    fecha_resolucion!: Date | null;

    @CreateDateColumn()
    created_at!: Date;
}