// ⚠️ TypeORM devuelve BIGINT como string en JS por defecto.
// Se castea con Number() aquí para que el domain siempre reciba number.
import { UsuarioModel } from '../models/usuario.model';
import { Usuario } from '../../domain/entities/Usuario';

export class UsuarioMapping {
    static toDomain(model: UsuarioModel): Usuario {
        return new Usuario(
            Number(model.id),
            model.correo,
            model.password_hash,
            model.rol_id,
            model.estado,
            model.intentos_fallidos,
            model.fecha_bloqueo,
        );
    }

    static toModel(usuario: Usuario): UsuarioModel {
        const model = new UsuarioModel();
        if (usuario.id) model.id = usuario.id;
        model.correo = usuario.correo;
        model.password_hash = usuario.passwordHash;
        model.rol_id = usuario.rolId;
        model.estado = usuario.estado;
        return model;
    }
}