import { Inscripcion } from './Inscripcion';
import {
    InscritoListadoDTO,
    ListaEsperaItemDTO,
    OportunidadParaInscripcionDTO
} from '../application/InscripcionDTO';

export interface InscripcionRepository {
    // --------------------------------------------------
    // Lecturas de apoyo para validar reglas de negocio
    // --------------------------------------------------
    obtenerOportunidadParaInscripcion(oportunidadId: number): Promise<OportunidadParaInscripcionDTO | null>;
    existeInscripcionActiva(usuarioId: number, oportunidadId: number): Promise<boolean>;
    // RN-02: perfil de voluntario 100% completo (mismo criterio que M2:
    // teléfono + ubicación + foto de perfil, todos no nulos)
    perfilVoluntarioCompleto(usuarioId: number): Promise<boolean>;
    obtenerInscripcionPorId(id: number): Promise<Inscripcion | null>;

    // --------------------------------------------------
    // RF-026 / RF-028: inscripción y lista de espera
    // --------------------------------------------------
    // Decrementa el cupo de forma atómica y crea la inscripción en la misma
    // transacción. Lanza SinCupoError si, justo en ese instante, el cupo ya
    // se agotó (condición de carrera).
    crearInscripcionConCupo(usuarioId: number, oportunidadId: number): Promise<Inscripcion>;
    agregarAListaEspera(usuarioId: number, oportunidadId: number): Promise<{ posicion: number }>;

    // --------------------------------------------------
    // RF-027: cancelación (+ RN-04: promoción automática desde lista de espera)
    // --------------------------------------------------
    cancelarInscripcionYPromoverListaEspera(inscripcionId: number, motivo: string | null): Promise<void>;

    // --------------------------------------------------
    // RF-029: listado de inscritos por la organización
    // --------------------------------------------------
    obtenerInscritosPorOportunidad(oportunidadId: number): Promise<InscritoListadoDTO[]>;
    obtenerListaEsperaPorOportunidad(oportunidadId: number): Promise<ListaEsperaItemDTO[]>;

    // --------------------------------------------------
    // RF-031: aprobación / rechazo
    // --------------------------------------------------
    aprobarInscripcion(inscripcionId: number): Promise<void>;
    // Rechazar libera el cupo y promueve lista de espera, igual que cancelar.
    rechazarInscripcionYPromoverListaEspera(inscripcionId: number, motivo: string): Promise<void>;
    // Add to InscripcionRepository.ts

    // --------------------------------------------------
    // RF-028: Mis Eventos (Vista Voluntario)
    // --------------------------------------------------
    obtenerInscripcionesPorUsuario(usuarioId: number): Promise<any[]>;
}
