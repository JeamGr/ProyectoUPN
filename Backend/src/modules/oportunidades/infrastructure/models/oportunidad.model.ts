import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('oportunidades')
export class OportunidadModel {
    @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
    id!: number;

    @Column({ type: 'bigint', unsigned: true })
    organizacion_id!: number;

    @Column({ type: 'varchar', length: 200 })
    titulo!: string;

    @Column({ type: 'text' })
    descripcion!: string;

    @Column({ type: 'int', unsigned: true })
    linea_intervencion_id!: number;

    @Column({ type: 'enum', enum: ['presencial', 'virtual', 'mixta'] })
    modalidad!: 'presencial' | 'virtual' | 'mixta';

    @Column({ type: 'int', unsigned: true })
    ubicacion_id!: number;

    @Column({ type: 'datetime' })
    fecha_inicio!: Date;

    @Column({ type: 'datetime' })
    fecha_fin!: Date;

    @Column({ type: 'int', unsigned: true, default: 0 })
    horas_acreditadas!: number;

    @Column({ type: 'int', unsigned: true })
    cupos_totales!: number;

    @Column({ type: 'int', unsigned: true })
    cupos_disponibles!: number;

    @Column({ type: 'text', nullable: true })
    requisitos!: string | null;

    @Column({ type: 'varchar', length: 500, nullable: true })
    imagen_url!: string | null;

    @Column({
        type: 'enum',
        enum: ['borrador', 'pendiente_aprobacion', 'publicado', 'pausado', 'cerrado', 'cancelado', 'rechazado'],
        default: 'borrador',
    })
    estado!: 'borrador' | 'pendiente_aprobacion' | 'publicado' | 'pausado' | 'cerrado' | 'cancelado' | 'rechazado';

    @Column({ type: 'varchar', length: 500, nullable: true })
    motivo_rechazo!: string | null;

    @Column({ type: 'bigint', unsigned: true, nullable: true })
    aprobado_por!: number | null;

    @Column({ type: 'datetime', nullable: true })
    fecha_publicacion!: Date | null;

    @Column({ type: 'boolean', default: false })
    requiere_aprobacion!: boolean;

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;
}