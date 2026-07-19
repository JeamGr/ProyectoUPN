import { PerfilVoluntarioModel } from '../models/perfil-voluntario.model';
import { PerfilVoluntario } from '../../domain/entities/PerfilVoluntario';

export class PerfilVoluntarioMapping {
    static toDomain(model: PerfilVoluntarioModel, intereses: number[] = []): PerfilVoluntario {
        return new PerfilVoluntario(
            Number(model.usuario_id),
            model.codigo_estudiante,
            model.nombres,
            model.apellidos,
            model.carrera,
            model.ciclo,
            model.telefono,
            model.ubicacion,
            model.habilidades,
            model.disponibilidad,
            model.foto_url,
            intereses,
        );
    }

    static toModel(perfil: PerfilVoluntario): PerfilVoluntarioModel {
        const model = new PerfilVoluntarioModel();
        model.usuario_id = perfil.usuarioId;
        model.codigo_estudiante = perfil.codigoEstudiante;
        model.nombres = perfil.nombres;
        model.apellidos = perfil.apellidos;
        model.carrera = perfil.carrera;
        model.ciclo = perfil.ciclo;
        model.telefono = perfil.telefono;
        model.ubicacion = perfil.ubicacion;
        model.habilidades = perfil.habilidades;
        model.disponibilidad = perfil.disponibilidad;
        model.foto_url = perfil.fotoUrl;
        return model;
    }
}