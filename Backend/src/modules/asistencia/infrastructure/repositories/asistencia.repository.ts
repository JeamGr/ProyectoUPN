import { Repository } from 'typeorm';
import { AppDataSource } from '../../../../config/datasource';
import { AsistenciaModel } from '../models/asistencia.model';
import { IAsistenciaRepository, AsistenciaConDetalle } from '../../domain/repositories/IAsistenciaRepository';
import { Asistencia } from '../../domain/entities/Asistencia';

export class AsistenciaRepository implements IAsistenciaRepository {
    private repo: Repository<AsistenciaModel>;

    constructor() {
        this.repo = AppDataSource.getRepository(AsistenciaModel);
    }

    async registrar(asistencia: Asistencia): Promise<Asistencia> {
        const model = new AsistenciaModel();
        model.inscripcion_id = asistencia.inscripcionId;
        model.estado = asistencia.estado;
        model.metodo_registro = asistencia.metodoRegistro;
        model.registrado_por = asistencia.registradoPor;
        const guardado = await this.repo.save(model);
        return new Asistencia(guardado.id, Number(guardado.inscripcion_id), guardado.estado, Number(guardado.registrado_por), guardado.fecha_registro, guardado.metodo_registro);
    }

    async buscarPorInscripcion(inscripcionId: number): Promise<Asistencia | null> {
        const model = await this.repo.findOne({ where: { inscripcion_id: inscripcionId } });
        if (!model) return null;
        return new Asistencia(model.id, Number(model.inscripcion_id), model.estado, Number(model.registrado_por), model.fecha_registro, model.metodo_registro);
    }

    // JOIN crudo: asistencias -> inscripciones -> usuarios/perfiles_voluntario/oportunidades
    async listarPorOportunidad(oportunidadId: number): Promise<AsistenciaConDetalle[]> {
        const filas = await AppDataSource.query(
            `SELECT a.*, pv.nombres AS nombre_voluntario, o.titulo AS titulo_oportunidad
             FROM asistencias a
             INNER JOIN inscripciones i ON i.id = a.inscripcion_id
             INNER JOIN oportunidades o ON o.id = i.oportunidad_id
             INNER JOIN perfiles_voluntario pv ON pv.usuario_id = i.usuario_id
             WHERE o.id = ?
             ORDER BY a.fecha_registro DESC`,
            [oportunidadId],
        );
        return filas.map((f: any) => ({
            id: f.id, inscripcionId: f.inscripcion_id, estado: f.estado,
            metodoRegistro: f.metodo_registro, registradoPor: f.registrado_por,
            fechaRegistro: f.fecha_registro, nombreVoluntario: f.nombre_voluntario,
            tituloOportunidad: f.titulo_oportunidad,
            cuentaComoHorasCompletas: () => f.estado === 'presente',
        })) as any;
    }

    async calcularHorasAcumuladas(voluntarioId: number): Promise<number> {
        const resultado = await AppDataSource.query(
            `SELECT COALESCE(SUM(o.horas_acreditadas), 0) AS total
             FROM asistencias a
             INNER JOIN inscripciones i ON i.id = a.inscripcion_id
             INNER JOIN oportunidades o ON o.id = i.oportunidad_id
             WHERE i.usuario_id = ? AND a.estado = 'presente'`,
            [voluntarioId],
        );
        return Number(resultado[0]?.total ?? 0);
    }
}