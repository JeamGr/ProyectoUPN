// =================================================================
// CAPA: Domain / Entities
// RF-059: un permiso es la combinación (rol, módulo, acción) que la
// tabla `permisos` guarda como UNIQUE (rol_id, modulo, accion).
// No hay estado activo/inactivo: un permiso existe o no existe;
// "quitarlo" es eliminar la fila (ver RolPermisoService en el paso 3).
// =================================================================

export type AccionPermiso = 'crear' | 'leer' | 'actualizar' | 'eliminar';

export class Permiso {
    constructor(
        public id: number | null,
        public readonly rolId: number,
        public readonly modulo: string,
        public readonly accion: AccionPermiso,
    ) {}
}
