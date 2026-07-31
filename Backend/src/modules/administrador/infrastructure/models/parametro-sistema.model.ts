import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('configuracion_sistema')
export class ConfiguracionSistemaModel {
    @PrimaryColumn({ type: 'varchar', length: 100 })
    clave!: string;

    @Column({ type: 'varchar', length: 500 })
    valor!: string;

    @Column({ type: 'varchar', length: 300, nullable: true })
    descripcion!: string | null;

    @Column({ type: 'bigint', unsigned: true, nullable: true })
    actualizado_por!: number | null;

    @Column({ type: 'datetime' })
    fecha_actualizacion!: Date;
}
