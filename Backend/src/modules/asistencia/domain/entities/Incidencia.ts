export type SeveridadIncidencia = 'baja' | 'media' | 'alta' | 'critica';
export type EstadoIncidencia = 'abierta' | 'en_seguimiento' | 'resuelta' | 'cerrada';

export class Incidencia {
    constructor(
        public id: number | null,
        public oportunidadId: number,
        public reportadoPor: number,
        public categoria: string,
        public descripcion: string,
        public severidad: SeveridadIncidencia = 'media',
        public estado: EstadoIncidencia = 'abierta',
        public inscripcionId: number | null = null,
        public resueltoPor: number | null = null,
        public fechaResolucion: Date | null = null,
    ) {}

    puedeResolverse(): boolean {
        return this.estado === 'abierta' || this.estado === 'en_seguimiento';
    }
}