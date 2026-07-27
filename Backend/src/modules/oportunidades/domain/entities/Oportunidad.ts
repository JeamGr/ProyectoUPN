// =================================================================
// CAPA: Domain / Entities
// La maquina de estados vive AQUI, no en el controller ni el service.
// Ninguna ruta puede saltarse una transicion invalida.
// =================================================================

export type EstadoOportunidad =
    | 'borrador'
    | 'pendiente_aprobacion'
    | 'publicado'
    | 'pausado'
    | 'cerrado'
    | 'cancelado'
    | 'rechazado';

export type Modalidad = 'presencial' | 'virtual' | 'mixta';

const TRANSICIONES_VALIDAS: Record<EstadoOportunidad, EstadoOportunidad[]> = {
    borrador: ['pendiente_aprobacion'],
    pendiente_aprobacion: ['publicado', 'rechazado'],
    rechazado: ['pendiente_aprobacion'],
    publicado: ['pausado', 'cerrado', 'cancelado'],
    pausado: ['publicado', 'cancelado'],
    cerrado: [],
    cancelado: [],
};

export class Oportunidad {
    constructor(
        public id: number | null,
        public organizacionId: number,
        public titulo: string,
        public descripcion: string,
        public lineaIntervencionId: number,
        public modalidad: Modalidad,
        public fechaInicio: Date,
        public fechaFin: Date,
        public horasAcreditadas: number,
        public cuposTotales: number,
        public cuposDisponibles: number,
        public estado: EstadoOportunidad = 'borrador',
        public ubicacion: string | null = null,
        public requisitos: string | null = null,
        public imagenUrl: string | null = null,
        public motivoRechazo: string | null = null,
        public aprobadoPor: number | null = null,
        public fechaPublicacion: Date | null = null,
        public requiereAprobacion: boolean = false, // RF-031
    ) {}

    puedeTransicionarA(nuevoEstado: EstadoOportunidad): boolean {
        return TRANSICIONES_VALIDAS[this.estado].includes(nuevoEstado);
    }

    tieneCuposDisponibles(): boolean {
        return this.cuposDisponibles > 0;
    }

    estaVisiblePublicamente(): boolean {
        return this.estado === 'publicado';
    }
}