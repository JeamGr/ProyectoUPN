import { Repository } from 'typeorm';
import { AppDataSource } from '../../../../config/datasource';
import { EvidenciaModel } from '../models/evidencia.model';
import { IEvidenciaRepository } from '../../domain/repositories/IEvidenciaRepository';
import { Evidencia } from '../../domain/entities/Evidencia';

export class EvidenciaRepository implements IEvidenciaRepository {
    private repo: Repository<EvidenciaModel>;

    constructor() {
        this.repo = AppDataSource.getRepository(EvidenciaModel);
    }

    async crear(evidencia: Evidencia): Promise<Evidencia> {
        const model = new EvidenciaModel();
        model.inscripcion_id = evidencia.inscripcionId;
        model.tipo = evidencia.tipo;
        model.contenido_sensible = evidencia.contenidoSensible;
        model.url = evidencia.url;
        model.descripcion = evidencia.descripcion;
        model.subido_por = evidencia.subidoPor;
        const guardado = await this.repo.save(model);
        return new Evidencia(guardado.id, Number(guardado.inscripcion_id), guardado.tipo, guardado.url, Number(guardado.subido_por), guardado.contenido_sensible, guardado.descripcion, guardado.fecha_subida);
    }

    // RNF-17: si NO incluirSensible (vista publica), se excluyen las marcadas
    async listarPorOportunidad(oportunidadId: number, incluirSensible: boolean): Promise<Evidencia[]> {
        const condicionSensible = incluirSensible ? '' : 'AND e.contenido_sensible = FALSE';
        const filas = await AppDataSource.query(
            `SELECT e.* FROM evidencias e
             INNER JOIN inscripciones i ON i.id = e.inscripcion_id
             WHERE i.oportunidad_id = ? ${condicionSensible}
             ORDER BY e.fecha_subida DESC`,
            [oportunidadId],
        );
        return filas.map((f: any) => new Evidencia(f.id, f.inscripcion_id, f.tipo, f.url, f.subido_por, !!f.contenido_sensible, f.descripcion, f.fecha_subida));
    }
}