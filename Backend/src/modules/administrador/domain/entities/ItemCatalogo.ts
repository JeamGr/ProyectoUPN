// =================================================================
// CAPA: Domain / Entities
// RF-057: los 3 catálogos administrables (líneas de intervención,
// categorías de organización, ubicaciones) comparten la misma forma:
// id, nombre, estado. Solo "icono" aplica a línea de intervención.
// No hay borrado físico: desactivar() es la única forma de "eliminar",
// para no violar las FK de organizaciones/oportunidades que los usan.
// =================================================================

export type TipoCatalogo = 'linea_intervencion' | 'categoria_organizacion' | 'ubicacion';
export type EstadoCatalogo = 'activo' | 'inactivo';

export class ItemCatalogo {
    constructor(
        public id: number | null,
        public readonly tipo: TipoCatalogo,
        public nombre: string,
        public estado: EstadoCatalogo = 'activo',
        public icono: string | null = null, // solo aplica a linea_intervencion
    ) {}

    activar(): void {
        this.estado = 'activo';
    }

    desactivar(): void {
        this.estado = 'inactivo';
    }

    estaActivo(): boolean {
        return this.estado === 'activo';
    }
}
