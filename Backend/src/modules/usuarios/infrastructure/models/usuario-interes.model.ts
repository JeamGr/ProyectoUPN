// =================================================================
// CAPA: Infrastructure / Models
// Entidad TypeORM -> tabla `usuario_intereses` (muchos-a-muchos,
// reutiliza `categorias`, no crea catalogo nuevo).
// =================================================================
import { Entity, PrimaryColumn } from 'typeorm';

@Entity('usuario_intereses')
export class UsuarioInteresModel {
    @PrimaryColumn()
    usuario_id!: number;

    @PrimaryColumn()
    categoria_id!: number;
}