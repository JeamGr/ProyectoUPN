// =================================================================
// CAPA: Infrastructure / Mappings
// Traduce entre UsuarioModel (TypeORM) y Usuario (Domain puro).
// Los intereses se manejan aparte (llegan de una tabla distinta),
// por eso toDomain() recibe el array ya resuelto.
// =================================================================
import { UsuarioModel } from '../models/usuario.model';
import { Usuario } from '../../domain/entities/Usuario';

export class UsuarioMapping {
    static toDomain(model: UsuarioModel, intereses: number[] = []): Usuario {
        return new Usuario(
            model.id,
            model.codigo_estudiante,
            model.nombres,
            model.apellidos,
            model.email,
            model.password_hash,
            model.carrera,
            model.ciclo,
            model.rol_id,
            model.estado,
            model.telefono,
            model.foto_perfil,
            intereses,
        );
    }

    static toModel(usuario: Usuario): UsuarioModel {
        const model = new UsuarioModel();
        if (usuario.id) model.id = usuario.id;
        model.codigo_estudiante = usuario.codigoEstudiante;
        model.nombres           = usuario.nombres;
        model.apellidos         = usuario.apellidos;
        model.email             = usuario.email;
        model.password_hash     = usuario.passwordHash;
        model.carrera           = usuario.carrera;
        model.ciclo             = usuario.ciclo;
        model.telefono          = usuario.telefono;
        model.foto_perfil       = usuario.fotoPerfil;
        model.rol_id            = usuario.rolId;
        model.estado            = usuario.estado;
        return model;
    }
}