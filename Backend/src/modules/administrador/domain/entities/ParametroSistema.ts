// =================================================================
// CAPA: Domain / Entities
// RF-058: par de clave/valor libre. La validez de "rango permitido"
// por clave es una regla que hoy vive fuera de este dominio (no hay
// un catálogo de rangos definido en el schema); se deja como límite
// de longitud + no-vacío, que es lo que sí es exigible sin inventar
// reglas de negocio no especificadas.
// =================================================================

export class ParametroSistema {
    constructor(
        public readonly clave: string,
        public valor: string,
        public descripcion: string | null = null,
        public actualizadoPor: number | null = null,
        public fechaActualizacion: Date | null = null,
    ) {}
}
