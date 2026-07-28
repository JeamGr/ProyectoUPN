// =================================================================
// CAPA: Domain / Repositories (interfaz)
// Repositorio de administración de roles, distinto de IRolRepository
// (usuarios/domain/repositories) que solo resuelve rol por nombre/id
// para el login. Este es para el panel de Super Administrador.
// =================================================================

import { RolSistema } from '../entities/RolSistema';

export interface IRolAdminRepository {
    listarTodos(): Promise<RolSistema[]>;
    buscarPorId(id: number): Promise<RolSistema | null>;
    actualizarDescripcion(id: number, descripcion: string | null): Promise<void>;
}
