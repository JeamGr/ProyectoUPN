import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('permisos')
export class PermisoModel {
    @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
    id!: number;

    @Column({ type: 'tinyint', unsigned: true, name: 'rol_id' })
    rolId!: number;

    @Column({ type: 'varchar', length: 80 })
    modulo!: string;

    @Column({ type: 'enum', enum: ['crear', 'leer', 'actualizar', 'eliminar'] })
    accion!: 'crear' | 'leer' | 'actualizar' | 'eliminar';
}
