import { Incidencia, EstadoIncidencia } from '../../domain/entities/Incidencia';
import { IIncidenciaRepository } from '../../domain/repositories/IIncidenciaRepository';
import { IInscripcionConsultaRepository } from '../../domain/repositories/IInscripcionConsultaRepository';

type Resultado<T = {}> = ({ ok: true } & T) | { ok: false; mensaje: string };

export class IncidenciaService {
    constructor(
        private incidenciaRepository: IIncidenciaRepository,
        private inscripcionRepository: IInscripcionConsultaRepository,
    ) {}

    // RF-037: Voluntario u Organización pueden reportar
    async reportar(
        oportunidadId: number,
        categoria: string,
        descripcion: string,
        reportanteId: number,
        esOrganizacion: boolean,
        severidad?: 'baja' | 'media' | 'alta' | 'critica',
        inscripcionId?: number,
    ): Promise<Resultado<{ incidenciaId: number }>> {
        if (esOrganizacion) {
            const dueño = await this.inscripcionRepository.obtenerOrganizacionDeOportunidad(oportunidadId);
            if (dueño !== reportanteId) return { ok: false, mensaje: 'No tienes permiso sobre esta oportunidad' };
        } else if (inscripcionId) {
            const datos = await this.inscripcionRepository.buscarPorId(inscripcionId);
            if (!datos || datos.voluntarioId !== reportanteId) {
                return { ok: false, mensaje: 'No puedes reportar sobre una inscripción que no es tuya' };
            }
        }

        const guardada = await this.incidenciaRepository.crear(
            new Incidencia(null, oportunidadId, reportanteId, categoria, descripcion, severidad ?? 'media', 'abierta', inscripcionId ?? null),
        );
        return { ok: true, incidenciaId: guardada.id! };
    }

    async listarPorOportunidad(oportunidadId: number) {
        return this.incidenciaRepository.listarPorOportunidad(oportunidadId);
    }

    async actualizarEstado(incidenciaId: number, nuevoEstado: EstadoIncidencia, resolutorId: number): Promise<Resultado> {
        const incidencia = await this.incidenciaRepository.buscarPorId(incidenciaId);
        if (!incidencia) return { ok: false, mensaje: 'Incidencia no encontrada' };
        if (!incidencia.puedeResolverse() && nuevoEstado !== 'cerrada') {
            return { ok: false, mensaje: `No se puede pasar de "${incidencia.estado}" a "${nuevoEstado}"` };
        }
        await this.incidenciaRepository.actualizarEstado(incidenciaId, nuevoEstado, resolutorId);
        return { ok: true };
    }
}