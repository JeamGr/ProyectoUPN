// =================================================================
// CAPA: Domain / Entities
// Objeto de negocio puro. NO conoce TypeORM ni la base de datos.
// =================================================================

export type EstadoUsuario = 'PENDIENTE_VERIFICACION' | 'ACTIVO' | 'INACTIVO';

export class Usuario {
    constructor(
        public id: number | null,
        public codigoEstudiante: string,
        public nombres: string,
        public apellidos: string,
        public email: string,
        public passwordHash: string,
        public carrera: string,
        public ciclo: number,
        public rolId: number,
        public estado: EstadoUsuario,
        public telefono: string | null = null,
        public fotoPerfil: string | null = null,
        public intereses: number[] = [], // ids de categorias seleccionadas
    ) {}

    /** Regla de negocio: solo un usuario ACTIVO puede iniciar sesión. */
    puedeIniciarSesion(): boolean {
        return this.estado === 'ACTIVO';
    }

    nombreCompleto(): string {
        return `${this.nombres} ${this.apellidos}`.trim();
    }
}