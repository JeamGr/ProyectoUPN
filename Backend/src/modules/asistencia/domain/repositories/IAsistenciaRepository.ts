import { Asistencia, EstadoAsistencia } from '../entities/Asistencia';

export interface AsistenciaConDetalle extends Asistencia {
    nombreVoluntario: string;
    tituloOportunidad: string;
}

export interface IAsistenciaRepository {
    registrar(asistencia: Asistencia): Promise<Asistencia>;
    buscarPorInscripcion(inscripcionId: number): Promise<Asistencia | null>;
    listarPorOportunidad(oportunidadId: number): Promise<AsistenciaConDetalle[]>;

    // RF-036: horas acumuladas = SUM de horas_acreditadas donde estado='presente'.
    // Nunca se persiste, siempre se calcula al vuelo.
    calcularHorasAcumuladas(voluntarioId: number): Promise<number>;
}