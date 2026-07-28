import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('lineas_intervencion')
export class LineaIntervencionModel {
    @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
    id!: number;

    @Column({ type: 'varchar', length: 100, unique: true })
    nombre!: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    icono!: string | null;

    @Column({ type: 'enum', enum: ['activo', 'inactivo'], default: 'activo' })
    estado!: 'activo' | 'inactivo';
}

@Entity('categorias_organizacion')
export class CategoriaOrganizacionModel {
    @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
    id!: number;

    @Column({ type: 'varchar', length: 100, unique: true })
    nombre!: string;

    @Column({ type: 'enum', enum: ['activo', 'inactivo'], default: 'activo' })
    estado!: 'activo' | 'inactivo';
}

@Entity('ubicaciones')
export class UbicacionModel {
    @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
    id!: number;

    @Column({ type: 'varchar', length: 150, unique: true })
    nombre!: string;

    @Column({ type: 'enum', enum: ['activo', 'inactivo'], default: 'activo' })
    estado!: 'activo' | 'inactivo';
}
