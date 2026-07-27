import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('identidades_oauth')
export class IdentidadOAuthModel {
    @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
    id!: number;

    @Column({ type: 'bigint', unsigned: true })
    usuario_id!: number;

    @Column({ type: 'varchar', length: 30 })
    proveedor!: string;

    @Column({ type: 'varchar', length: 255 })
    proveedor_uid!: string;

    @Column({ type: 'varchar', length: 150 })
    correo_proveedor!: string;

    @CreateDateColumn()
    created_at!: Date;
}