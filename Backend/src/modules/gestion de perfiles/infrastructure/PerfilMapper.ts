import { PerfilVoluntarioModel, OrganizacionModel, PreferenciasNotificacionModel } from './PerfilModel';
import {
    PerfilVoluntarioResponseDTO,
    PerfilOrganizacionResponseDTO,
    PreferenciasResponseDTO
} from '../application/PerfilDTO';

export class PerfilMapper {
    static toVoluntarioResponseDTO(model: PerfilVoluntarioModel): PerfilVoluntarioResponseDTO {
        return {
            usuario_id: Number(model.usuario_id),
            codigo_estudiante: model.codigo_estudiante,
            nombres: model.nombres,
            apellidos: model.apellidos,
            carrera: model.carrera,
            ciclo: model.ciclo,
            telefono: model.telefono,
            ubicacion: model.ubicacion,
            habilidades: model.habilidades,
            disponibilidad: model.disponibilidad,
            foto_url: model.foto_url,
            correo: model.usuario?.correo || '',
            intereses: (model.intereses || []).map((i) => ({
                id: i.id,
                nombre: i.nombre
            }))
        };
    }

    static toOrganizacionResponseDTO(model: OrganizacionModel): PerfilOrganizacionResponseDTO {
        return {
            usuario_id: Number(model.usuario_id),
            nombre_ong: model.nombre_ong,
            descripcion_actividad: model.descripcion_actividad,
            linea_intervencion_id: model.linea_intervencion_id,
            linea_intervencion_nombre: model.linea_intervencion?.nombre,
            pais: model.pais,
            direccion: model.direccion,
            persona_contacto: model.persona_contacto,
            tipo_documento_contacto: model.tipo_documento_contacto,
            numero_documento_contacto: model.numero_documento_contacto,
            celular_contacto: model.celular_contacto,
            link_web: model.link_web,
            link_redes_sociales: model.link_redes_sociales,
            constituida_legalmente: model.constituida_legalmente,
            ruc: model.ruc,
            razon_social: model.razon_social,
            numero_beneficiarios_anual: model.numero_beneficiarios_anual,
            tiene_certificado_donacion: model.tiene_certificado_donacion,
            tiene_programa_voluntariado_corporativo: model.tiene_programa_voluntariado_corporativo,
            estado_validacion: model.estado_validacion,
            correo: model.usuario?.correo || ''
        };
    }

    static toPreferenciasResponseDTO(model: PreferenciasNotificacionModel): PreferenciasResponseDTO {
        return {
            usuario_id: Number(model.usuario_id),
            notificar_confirmacion: model.notificar_confirmacion,
            notificar_recordatorio: model.notificar_recordatorio,
            notificar_certificado: model.notificar_certificado,
            notificar_nuevas_oportunidades: model.notificar_nuevas_oportunidades
        };
    }
}