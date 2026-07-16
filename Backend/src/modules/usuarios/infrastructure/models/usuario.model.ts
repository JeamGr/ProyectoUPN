// =================================================================
// CAPA: Infrastructure / Models
// Entidad TypeORM -> tabla `usuarios`. Aqui SI viven los decoradores.
// =================================================================
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity('usuarios')
export class UsuarioModel {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'varchar', length: 20, unique: true })
    codigo_estudiante!: string;

    @Column({ type: 'varchar', length: 100 })
    nombres!: string;

    @Column({ type: 'varchar', length: 100 })
    apellidos!: string;

    @Column({ type: 'varchar', length: 150, unique: true })
    email!: string;

    @Column({ type: 'varchar', length: 255 })
    password_hash!: string;

    @Column({ type: 'varchar', length: 100 })
    carrera!: string;

    @Column({ type: 'tinyint', unsigned: true })
    ciclo!: number;

    @Column({ type: 'varchar', length: 20, nullable: true })
    telefono!: string | null;

    @Column({ type: 'varchar', length: 255, nullable: true })
    foto_perfil!: string | null;

    @Column({ type: 'int' })
    rol_id!: number;

    @Column({
        type: 'enum',
        enum: ['PENDIENTE_VERIFICACION', 'ACTIVO', 'INACTIVO'],
        default: 'PENDIENTE_VERIFICACION',
    })
    estado!: 'PENDIENTE_VERIFICACION' | 'ACTIVO' | 'INACTIVO';

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;
}