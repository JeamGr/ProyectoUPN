import { AppDataSource } from '../../../../config/datasource';
import { IInscripcionConsultaRepository, DatosInscripcion } from '../../domain/repositories/IInscripcionConsultaRepository';

export class InscripcionConsultaRepository implements IInscripcionConsultaRepository {
    async buscarPorId(inscripcionId: number): Promise<DatosInscripcion | null> {
        const filas = await AppDataSource.query(
            `SELECT i.id AS inscripcion_id, i.usuario_id AS voluntario_id, i.oportunidad_id,
                    o.organizacion_id, o.horas_acreditadas, pv.nombres AS nombre_voluntario, o.titulo AS titulo_oportunidad
             FROM inscripciones i
             INNER JOIN oportunidades o ON o.id = i.oportunidad_id
             INNER JOIN perfiles_voluntario pv ON pv.usuario_id = i.usuario_id
             WHERE i.id = ? LIMIT 1`,
            [inscripcionId],
        );
        if (filas.length === 0) return null;
        const f = filas[0];
        return {
            inscripcionId: f.inscripcion_id, voluntarioId: f.voluntario_id, oportunidadId: f.oportunidad_id,
            organizacionId: f.organizacion_id, horasAcreditadas: f.horas_acreditadas,
            nombreVoluntario: f.nombre_voluntario, tituloOportunidad: f.titulo_oportunidad,
        };
    }

    async buscarInscripcionDe(voluntarioId: number, oportunidadId: number): Promise<DatosInscripcion | null> {
        const filas = await AppDataSource.query(
            `SELECT i.id FROM inscripciones i WHERE i.usuario_id = ? AND i.oportunidad_id = ? LIMIT 1`,
            [voluntarioId, oportunidadId],
        );
        if (filas.length === 0) return null;
        return this.buscarPorId(filas[0].id);
    }

    async obtenerOrganizacionDeOportunidad(oportunidadId: number): Promise<number | null> {
        const filas = await AppDataSource.query('SELECT organizacion_id FROM oportunidades WHERE id = ? LIMIT 1', [oportunidadId]);
        return filas.length > 0 ? filas[0].organizacion_id : null;
    }
}