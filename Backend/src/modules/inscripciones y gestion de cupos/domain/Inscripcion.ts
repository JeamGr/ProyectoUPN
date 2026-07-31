// =================================================================
// CAPA: Domain
// Entidad de dominio de Inscripción. No conoce TypeORM ni HTTP.
// =================================================================

export type EstadoInscripcion =
    | 'inscrito'    // recién creada. Si la oportunidad NO requiere aprobación,
                     // ya cuenta el cupo y es una inscripción "activa" normal.
                     // Si la oportunidad SÍ requiere aprobación (RF-031), este es
                     // el estado "pendiente de revisión" (el ENUM de la tabla no
                     // tiene un valor propio para "pendiente", así que se reutiliza).
    | 'confirmado'   // la organización aprobó la inscripción (RF-031).
    | 'completado'   // fuera del alcance de M5 (lo usa M6, tras registrar asistencia).
    | 'no_asistio'   // fuera del alcance de M5 (lo usa M6).
    | 'cancelado'    // el propio voluntario canceló (RF-027).
    | 'rechazado';   // la organización rechazó la postulación (RF-031).

export class Inscripcion {
    constructor(
        public readonly id: number,
        public readonly usuarioId: number,
        public readonly oportunidadId: number,
        public estado: EstadoInscripcion,
        public readonly fechaInscripcion: Date,
        public fechaCancelacion: Date | null,
        public motivoCancelacion: string | null
    ) {}

    // RN: solo se puede cancelar una inscripción que sigue "viva"
    public puedeCancelarse(): boolean {
        return this.estado === 'inscrito' || this.estado === 'confirmado';
    }

    // RF-031: solo tiene sentido aprobar/rechazar algo que sigue pendiente
    public puedeSerRevisada(): boolean {
        return this.estado === 'inscrito';
    }

    // Indica si esta inscripción actualmente ocupa un cupo real
    // (para saber si al cancelarla/rechazarla hay que liberar uno)
    public ocupaCupo(): boolean {
        return this.estado === 'inscrito' || this.estado === 'confirmado';
    }
}
