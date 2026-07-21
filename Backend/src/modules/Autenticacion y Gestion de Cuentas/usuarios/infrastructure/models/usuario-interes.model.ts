import { Entity, PrimaryColumn } from 'typeorm';

@Entity('usuario_intereses')
export class UsuarioInteresModel {
    @PrimaryColumn({ type: 'bigint', unsigned: true })
    usuario_id!: number;

    @PrimaryColumn({ type: 'int', unsigned: true })
    linea_intervencion_id!: number;
}