// =================================================================
// CAPA: Infrastructure / Models
// Entidad TypeORM -> tabla `codigos_verificacion`.
// =================================================================
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
} from 'typeorm';

@Entity('codigos_verificacion')
export class CodigoVerificacionModel {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'int' })
    usuario_id!: number;

    @Column({ type: 'varchar', length: 255 })
    codigo_hash!: string;

    @Column({ type: 'int', default: 0 })
    intentos!: number;

    @Column({ type: 'datetime' })
    expira_en!: Date;

    @Column({ type: 'boolean', default: false })
    usado!: boolean;

    @CreateDateColumn()
    created_at!: Date;
}