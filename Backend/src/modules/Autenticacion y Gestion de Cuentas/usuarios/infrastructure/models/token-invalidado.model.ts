import { Entity, PrimaryColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('tokens_invalidados')
export class TokenInvalidadoModel {
    @PrimaryColumn({ type: 'varchar', length: 64 })
    token_hash!: string;

    @Column({ type: 'datetime' })
    expira_en!: Date;

    @CreateDateColumn()
    created_at!: Date;
}