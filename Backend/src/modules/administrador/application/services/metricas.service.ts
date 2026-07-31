import { AppDataSource } from '../../../../config/datasource';

export class MetricasService {
    async obtenerMetricasGlobales() {
        const [usuarios] = await AppDataSource.query(
            `SELECT COUNT(*) AS total FROM usuarios WHERE estado = 'activo'`,
        );
        const [organizaciones] = await AppDataSource.query(
            `SELECT COUNT(*) AS total FROM organizaciones WHERE estado_validacion = 'aprobado'`,
        );
        const [oportunidades] = await AppDataSource.query(
            `SELECT COUNT(*) AS total FROM oportunidades`,
        );
        const [horas] = await AppDataSource.query(
            `SELECT COALESCE(SUM(o.horas_acreditadas), 0) AS total
             FROM asistencias a
             INNER JOIN inscripciones i ON i.id = a.inscripcion_id
             INNER JOIN oportunidades o ON o.id = i.oportunidad_id
             WHERE a.estado = 'presente'`,
        );
        const usuariosNuevos = await AppDataSource.query(
            `SELECT DATE(fecha_registro) AS dia, COUNT(*) AS total
             FROM usuarios
             WHERE fecha_registro >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
             GROUP BY DATE(fecha_registro) ORDER BY dia ASC`,
        );

        return {
            usuariosActivos: Number(usuarios.total),
            organizacionesActivas: Number(organizaciones.total),
            oportunidadesTotales: Number(oportunidades.total),
            horasTotales: Number(horas.total),
            usuariosNuevosUltimos7Dias: usuariosNuevos,
        };
    }
}