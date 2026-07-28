// =================================================================
// CAPA: Domain / Repositories (interfaz)
// =================================================================

import { Permiso, AccionPermiso } from '../entities/Permiso';

export interface IPermisoRepository {
    listarPorRol(rolId: number): Promise<Permiso[]>;
    buscar(rolId: number, modulo: string, accion: AccionPermiso): Promise<Permiso | null>;
    crear(permiso: Permiso): Promise<Permiso>;
    eliminar(rolId: number, modulo: string, accion: AccionPermiso): Promise<void>;
}
