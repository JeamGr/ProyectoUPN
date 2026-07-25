import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('tokens_recuperacion_password')
export class TokenRecuperacionModel {
    @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
    id!: number;

    @Column({ type: 'bigint', unsigned: true })
    usuario_id!: number;

    @Column({ type: 'varchar', length: 255 })
    token_hash!: string;

    @Column({ type: 'datetime' })
    expira_en!: Date;

    @Column({ type: 'boolean', default: false })
    usado!: boolean;

    @CreateDateColumn()
    created_at!: Date;
}