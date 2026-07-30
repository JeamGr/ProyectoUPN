import { Evidencia } from '../../domain/entities/Evidencia';
import { IEvidenciaRepository } from '../../domain/repositories/IEvidenciaRepository';
import { IInscripcionConsultaRepository } from '../../domain/repositories/IInscripcionConsultaRepository';

type Resultado<T = {}> = ({ ok: true } & T) | { ok: false; mensaje: string };

export class EvidenciaService {
    constructor(
        private evidenciaRepository: IEvidenciaRepository,
        private inscripcionRepository: IInscripcionConsultaRepository,
    ) {}

    async subir(
        inscripcionId: number,
        tipo: 'foto' | 'video' | 'documento',
        url: string,
        organizacionId: number,
        contenidoSensible = false,
        descripcion?: string,
    ): Promise<Resultado<{ evidenciaId: number }>> {
        const datos = await this.inscripcionRepository.buscarPorId(inscripcionId);
        if (!datos) return { ok: false, mensaje: 'Inscripción no encontrada' };
        if (datos.organizacionId !== organizacionId) {
            return { ok: false, mensaje: 'No tienes permiso sobre esta inscripción' };
        }

        const guardada = await this.evidenciaRepository.crear(
            new Evidencia(null, inscripcionId, tipo, url, organizacionId, contenidoSensible, descripcion ?? null),
        );
        return { ok: true, evidenciaId: guardada.id! };
    }

    // RF-035, actor "Todos" -> vista publica, sin sensibles
    async listarPublicas(oportunidadId: number) {
        return this.evidenciaRepository.listarPorOportunidad(oportunidadId, false);
    }

    async listarCompleta(oportunidadId: number, organizacionId: number): Promise<Resultado<{ datos: Evidencia[] }>> {
        const dueño = await this.inscripcionRepository.obtenerOrganizacionDeOportunidad(oportunidadId);
        if (dueño !== organizacionId) return { ok: false, mensaje: 'No tienes permiso sobre esta oportunidad' };

        const datos = await this.evidenciaRepository.listarPorOportunidad(oportunidadId, true);
        return { ok: true, datos };
    }
}