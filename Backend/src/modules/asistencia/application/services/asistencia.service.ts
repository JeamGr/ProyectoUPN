import { RegistrarAsistenciaDTO } from '../dtos/registrar-asistencia.dto';
import { Asistencia } from '../../domain/entities/Asistencia';
import { IAsistenciaRepository } from '../../domain/repositories/IAsistenciaRepository';
import { IInscripcionConsultaRepository } from '../../domain/repositories/IInscripcionConsultaRepository';

type Resultado<T = {}> = ({ ok: true } & T) | { ok: false; mensaje: string };

export class AsistenciaService {
    constructor(
        private asistenciaRepository: IAsistenciaRepository,
        private inscripcionRepository: IInscripcionConsultaRepository,
    ) {}

    // RF-032 (registro manual) + RF-036 (horas efectivas = simple presente/ausente)
    async registrarManual(dto: RegistrarAsistenciaDTO, organizacionId: number): Promise<Resultado> {
        const datos = await this.inscripcionRepository.buscarPorId(dto.inscripcionId);
        if (!datos) return { ok: false, mensaje: 'Inscripción no encontrada' };
        if (datos.organizacionId !== organizacionId) {
            return { ok: false, mensaje: 'No tienes permiso sobre esta inscripción' };
        }

        const existente = await this.asistenciaRepository.buscarPorInscripcion(dto.inscripcionId);
        if (existente) {
            return { ok: false, mensaje: 'Ya se registró la asistencia de este voluntario para esta oportunidad' };
        }

        await this.asistenciaRepository.registrar(
            new Asistencia(null, dto.inscripcionId, dto.estado, organizacionId, new Date(), 'manual'),
        );
        return { ok: true };
    }

    async listarPorOportunidad(oportunidadId: number, organizacionId: number): Promise<Resultado<{ datos: any[] }>> {
        const dueño = await this.inscripcionRepository.obtenerOrganizacionDeOportunidad(oportunidadId);
        if (dueño !== organizacionId) return { ok: false, mensaje: 'No tienes permiso sobre esta oportunidad' };

        const datos = await this.asistenciaRepository.listarPorOportunidad(oportunidadId);
        return { ok: true, datos };
    }

    // RF-036 para el dashboard del voluntario (M9), pero ya lo dejamos listo aquí
    async horasAcumuladas(voluntarioId: number): Promise<number> {
        return this.asistenciaRepository.calcularHorasAcumuladas(voluntarioId);
    }
}