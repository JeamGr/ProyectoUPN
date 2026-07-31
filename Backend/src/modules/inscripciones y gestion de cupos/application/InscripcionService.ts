import { InscripcionRepository } from '../domain/InscripcionRepository';
import { SinCupoError } from '../domain/InscripcionErrors';
import {
    InscripcionResponseDTO,
    InscritoListadoDTO,
    ListaEsperaItemDTO
} from './InscripcionDTO';

export class InscripcionService {
    constructor(private readonly repo: InscripcionRepository) {}

    // ==========================================
    // RF-026 (+ flujo alterno RF-028)
    // ==========================================
    async inscribirse(usuarioId: number, oportunidadId: number): Promise<InscripcionResponseDTO> {
        const oportunidad = await this.repo.obtenerOportunidadParaInscripcion(oportunidadId);
        if (!oportunidad) {
            throw new Error('La oportunidad indicada no existe');
        }
        if (oportunidad.estado !== 'publicado') {
            throw new Error('Esta oportunidad no está publicada y no admite inscripciones');
        }

        const yaInscrito = await this.repo.existeInscripcionActiva(usuarioId, oportunidadId);
        if (yaInscrito) {
            throw new Error('Ya estás inscrito en esta oportunidad');
        }

        // RN-02
        const perfilCompleto = await this.repo.perfilVoluntarioCompleto(usuarioId);
        if (!perfilCompleto) {
            throw new Error(
                'Debes completar tu perfil (teléfono, ubicación y foto de perfil) antes de inscribirte'
            );
        }

        // Camino feliz: hay cupo
        if (oportunidad.cupos_disponibles > 0) {
            try {
                const inscripcion = await this.repo.crearInscripcionConCupo(usuarioId, oportunidadId);
                return {
                    id: inscripcion.id,
                    usuario_id: inscripcion.usuarioId,
                    oportunidad_id: inscripcion.oportunidadId,
                    estado: inscripcion.estado,
                    fecha_inscripcion: inscripcion.fechaInscripcion,
                    fecha_cancelacion: null,
                    motivo_cancelacion: null,
                    en_lista_espera: false
                };
            } catch (error) {
                // RF-026 flujo alternativo 1: si perdimos la carrera por el
                // último cupo justo en este instante, no es un error para el
                // usuario: simplemente cae a lista de espera (RF-028).
                if (!(error instanceof SinCupoError)) throw error;
            }
        }

        // Cupos llenos (o se agotaron en la carrera de arriba) -> RF-028
        const { posicion } = await this.repo.agregarAListaEspera(usuarioId, oportunidadId);
        return {
            id: 0,
            usuario_id: usuarioId,
            oportunidad_id: oportunidadId,
            estado: 'lista_espera',
            fecha_inscripcion: new Date(),
            fecha_cancelacion: null,
            motivo_cancelacion: null,
            en_lista_espera: true,
            posicion_lista_espera: posicion
        };
    }

    // ==========================================
    // RF-027 (+ RN-04 vía el repositorio)
    // ==========================================
    async cancelarInscripcion(usuarioId: number, inscripcionId: number, motivo?: string): Promise<void> {
        const inscripcion = await this.repo.obtenerInscripcionPorId(inscripcionId);
        if (!inscripcion) {
            throw new Error('La inscripción indicada no existe');
        }
        if (inscripcion.usuarioId !== usuarioId) {
            throw new Error('No puedes cancelar una inscripción que no es tuya');
        }
        if (!inscripcion.puedeCancelarse()) {
            throw new Error(`Esta inscripción está en estado '${inscripcion.estado}' y ya no puede cancelarse`);
        }

        // Nota RN-08 (plazo mínimo de cancelación antes de la actividad):
        // el valor de ese plazo vive en RF-058 (Configuración de parámetros
        // generales), módulo M12 que todavía no está construido. Mientras
        // tanto no se valida ese plazo aquí; queda pendiente para cuando
        // M12 exponga el parámetro configurable.

        await this.repo.cancelarInscripcionYPromoverListaEspera(inscripcionId, motivo ?? null);
    }

    // ==========================================
    // RF-029
    // ==========================================
    async obtenerInscritos(organizacionUsuarioId: number, oportunidadId: number): Promise<InscritoListadoDTO[]> {
        await this.validarOportunidadPropia(organizacionUsuarioId, oportunidadId);
        return this.repo.obtenerInscritosPorOportunidad(oportunidadId);
    }

    async obtenerListaEspera(organizacionUsuarioId: number, oportunidadId: number): Promise<ListaEsperaItemDTO[]> {
        await this.validarOportunidadPropia(organizacionUsuarioId, oportunidadId);
        return this.repo.obtenerListaEsperaPorOportunidad(oportunidadId);
    }

    // ==========================================
    // RF-031
    // ==========================================
    async aprobarInscripcion(organizacionUsuarioId: number, inscripcionId: number): Promise<void> {
        const inscripcion = await this.repo.obtenerInscripcionPorId(inscripcionId);
        if (!inscripcion) throw new Error('La inscripción indicada no existe');

        await this.validarOportunidadPropia(organizacionUsuarioId, inscripcion.oportunidadId);

        if (!inscripcion.puedeSerRevisada()) {
            throw new Error(`Esta inscripción está en estado '${inscripcion.estado}' y ya fue revisada`);
        }

        await this.repo.aprobarInscripcion(inscripcionId);
    }

    async rechazarInscripcion(organizacionUsuarioId: number, inscripcionId: number, motivo: string): Promise<void> {
        if (!motivo || motivo.trim().length === 0) {
            throw new Error('El motivo de rechazo es obligatorio');
        }

        const inscripcion = await this.repo.obtenerInscripcionPorId(inscripcionId);
        if (!inscripcion) throw new Error('La inscripción indicada no existe');

        await this.validarOportunidadPropia(organizacionUsuarioId, inscripcion.oportunidadId);

        if (!inscripcion.puedeSerRevisada()) {
            throw new Error(`Esta inscripción está en estado '${inscripcion.estado}' y ya fue revisada`);
        }

        await this.repo.rechazarInscripcionYPromoverListaEspera(inscripcionId, motivo);
    }

    // ==========================================
    // Privado: aislamiento multitenant (RF-029, criterio de aceptación 2)
    // ==========================================
    private async validarOportunidadPropia(organizacionUsuarioId: number, oportunidadId: number): Promise<void> {
        const oportunidad = await this.repo.obtenerOportunidadParaInscripcion(oportunidadId);
        if (!oportunidad) {
            throw new Error('La oportunidad indicada no existe');
        }
        if (oportunidad.organizacion_id !== organizacionUsuarioId) {
            throw new Error('No tienes permiso sobre esta oportunidad');
        }
    }
    async obtenerMisInscripciones(usuarioId: number): Promise<any[]> {
        return await this.repo.obtenerInscripcionesPorUsuario(usuarioId);
    }
}
