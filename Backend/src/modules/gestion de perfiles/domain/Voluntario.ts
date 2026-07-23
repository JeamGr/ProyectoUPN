export interface InteresDominio {
    id: number;
    nombre: string;
}

export class Voluntario {
    constructor(
        public readonly usuarioId: number,
        public readonly codigoEstudiante: string,
        public readonly nombres: string,
        public readonly apellidos: string,
        public readonly carrera: string,
        public readonly ciclo: number,
        public telefono: string | null,
        public ubicacion: string | null,
        public habilidades: string | null,
        public disponibilidad: string | null,
        public fotoUrl: string | null,
        public intereses: InteresDominio[] = []
    ) {}

    // Método de dominio de ejemplo
    public tienePerfilCompleto(): boolean {
        return Boolean(this.telefono && this.ubicacion && this.fotoUrl);
    }
}