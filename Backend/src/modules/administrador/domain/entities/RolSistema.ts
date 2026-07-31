// =================================================================
// CAPA: Domain / Entities
// RF-059: vista administrable de un rol. Los 4 roles del sistema son
// fijos (atados al tipo `Rol` usado por el JWT y el authHandler — ver
// shared/builders/token.builder.ts), por lo que esta entidad NO
// permite crear ni eliminar roles, solo editar su descripción y
// consultar/gestionar sus permisos asociados (ver Permiso.ts).
// =================================================================

export class RolSistema {
    constructor(
        public readonly id: number,
        public readonly nombre: string,
        public descripcion: string | null,
    ) {}

    actualizarDescripcion(descripcion: string | null): void {
        this.descripcion = descripcion;
    }
}
