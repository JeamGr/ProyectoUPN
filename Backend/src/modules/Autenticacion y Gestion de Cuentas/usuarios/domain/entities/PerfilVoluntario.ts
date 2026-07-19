// =================================================================
// CAPA: Domain / Entities
// Identidad y datos académicos del Voluntario. 1:1 con Usuario,
// pero SIEMPRE existe uno por cada usuario con rol VOLUNTARIO.
// =================================================================

export class PerfilVoluntario {
    constructor(
        public usuarioId: number,
        public codigoEstudiante: string,
        public nombres: string,
        public apellidos: string,
        public carrera: string,
        public ciclo: number,
        public telefono: string | null = null,
        public ubicacion: string | null = null,
        public habilidades: string | null = null,
        public disponibilidad: string | null = null,
        public fotoUrl: string | null = null,
        public intereses: number[] = [], // ids de lineas_intervencion
    ) {}

    nombreCompleto(): string {
        return `${this.nombres} ${this.apellidos}`.trim();
    }
}