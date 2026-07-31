import { Incidencia, EstadoIncidencia } from '../entities/Incidencia';

export interface IIncidenciaRepository {
    crear(incidencia: Incidencia): Promise<Incidencia>;
    buscarPorId(id: number): Promise<Incidencia | null>;
    listarPorOportunidad(oportunidadId: number): Promise<Incidencia[]>;
    actualizarEstado(id: number, estado: EstadoIncidencia, resueltoPor?: number): Promise<void>;
}