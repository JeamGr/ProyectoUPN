import { Evidencia } from '../entities/Evidencia';

export interface IEvidenciaRepository {
    crear(evidencia: Evidencia): Promise<Evidencia>;
    listarPorOportunidad(oportunidadId: number, incluirSensible: boolean): Promise<Evidencia[]>;
}