import { Repository } from 'typeorm';
import { AppDataSource } from '../../../../config/datasource';
import { IncidenciaModel } from '../models/incidencia.model';
import { IIncidenciaRepository } from '../../domain/repositories/IIncidenciaRepository';
import { Incidencia, EstadoIncidencia } from '../../domain/entities/Incidencia';

export class IncidenciaRepository implements IIncidenciaRepository {
    private repo: Repository<IncidenciaModel>;

    constructor() {
        this.repo = AppDataSource.getRepository(IncidenciaModel);
    }

    async crear(incidencia: Incidencia): Promise<Incidencia> {
        const model = new IncidenciaModel();
        model.oportunidad_id = incidencia.oportunidadId;
        model.inscripcion_id = incidencia.inscripcionId;
        model.reportado_por = incidencia.reportadoPor;
        model.severidad = incidencia.severidad;
        model.categoria = incidencia.categoria;
        model.descripcion = incidencia.descripcion;
        const guardado = await this.repo.save(model);
        return this.mapear(guardado);
    }

    async buscarPorId(id: number): Promise<Incidencia | null> {
        const model = await this.repo.findOne({ where: { id } });
        return model ? this.mapear(model) : null;
    }

    async listarPorOportunidad(oportunidadId: number): Promise<Incidencia[]> {
        const modelos = await this.repo.find({ where: { oportunidad_id: oportunidadId }, order: { created_at: 'DESC' } });
        return modelos.map(this.mapear);
    }

    async actualizarEstado(id: number, estado: EstadoIncidencia, resueltoPor?: number): Promise<void> {
        const cambios: any = { estado };
        if (resueltoPor) {
            cambios.resuelto_por = resueltoPor;
            cambios.fecha_resolucion = new Date();
        }
        await this.repo.update({ id }, cambios);
    }

    private mapear(m: IncidenciaModel): Incidencia {
        return new Incidencia(
            m.id, Number(m.oportunidad_id), Number(m.reportado_por), m.categoria, m.descripcion,
            m.severidad, m.estado, m.inscripcion_id ? Number(m.inscripcion_id) : null,
            m.resuelto_por ? Number(m.resuelto_por) : null, m.fecha_resolucion,
        );
    }
}