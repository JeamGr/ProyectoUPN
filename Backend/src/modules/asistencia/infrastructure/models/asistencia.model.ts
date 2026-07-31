import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('asistencias')
export class AsistenciaModel {
    @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
    id!: number;

    @Column({ type: 'bigint', unsigned: true, unique: true })
    inscripcion_id!: number;

    @Column({ type: 'enum', enum: ['presente', 'ausente', 'tardanza'] })
    estado!: 'presente' | 'ausente' | 'tardanza';

    @Column({ type: 'enum', enum: ['manual', 'qr'], default: 'manual' })
    metodo_registro!: 'manual' | 'qr';

    @Column({ type: 'bigint', unsigned: true, nullable: true })
    registrado_por!: number | null;

    @CreateDateColumn()
    fecha_registro!: Date;
}