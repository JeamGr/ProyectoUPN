import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('usuarios')
export class UsuarioModel {
    @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
    id!: number;

    @Column({ type: 'varchar', length: 150, unique: true })
    correo!: string;

    @Column({ type: 'varchar', length: 255 })
    password_hash!: string;

    @Column({ type: 'tinyint', unsigned: true })
    rol_id!: number;

    @Column({
        type: 'enum',
        enum: ['pendiente_verificacion', 'activo', 'bloqueado', 'eliminado'],
        default: 'pendiente_verificacion',
    })
    estado!: 'pendiente_verificacion' | 'activo' | 'bloqueado' | 'eliminado';

    @Column({ type: 'tinyint', unsigned: true, default: 0 })
    intentos_fallidos!: number;

    @Column({ type: 'datetime', nullable: true })
    fecha_bloqueo!: Date | null;

    @CreateDateColumn()
    fecha_registro!: Date;

    @Column({ type: 'datetime', nullable: true })
    fecha_verificacion!: Date | null;
}