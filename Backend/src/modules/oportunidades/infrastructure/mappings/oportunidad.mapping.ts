import { OportunidadModel } from '../models/oportunidad.model';
import { Oportunidad } from '../../domain/entities/Oportunidad';

export class OportunidadMapping {
    static toDomain(model: OportunidadModel): Oportunidad {
        return new Oportunidad(
            Number(model.id),
            Number(model.organizacion_id),
            model.titulo,
            model.descripcion,
            model.linea_intervencion_id,
            model.modalidad,
            model.fecha_inicio,
            model.fecha_fin,
            model.horas_acreditadas,
            model.cupos_totales,
            model.cupos_disponibles,
            model.estado,
            model.ubicacion,
            model.requisitos,
            model.imagen_url,
            model.motivo_rechazo,
            model.aprobado_por ? Number(model.aprobado_por) : null,
            model.fecha_publicacion,
            model.requiere_aprobacion,
        );
    }

    static toModel(oportunidad: Oportunidad): OportunidadModel {
        const model = new OportunidadModel();
        if (oportunidad.id) model.id = oportunidad.id;
        model.organizacion_id = oportunidad.organizacionId;
        model.titulo = oportunidad.titulo;
        model.descripcion = oportunidad.descripcion;
        model.linea_intervencion_id = oportunidad.lineaIntervencionId;
        model.modalidad = oportunidad.modalidad;
        model.ubicacion = oportunidad.ubicacion;
        model.fecha_inicio = oportunidad.fechaInicio;
        model.fecha_fin = oportunidad.fechaFin;
        model.horas_acreditadas = oportunidad.horasAcreditadas;
        model.cupos_totales = oportunidad.cuposTotales;
        model.cupos_disponibles = oportunidad.cuposDisponibles;
        model.estado = oportunidad.estado;
        model.requisitos = oportunidad.requisitos;
        model.imagen_url = oportunidad.imagenUrl;
        model.requiere_aprobacion = oportunidad.requiereAprobacion;
        return model;
    }
}