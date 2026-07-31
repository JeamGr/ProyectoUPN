// =================================================================
// CAPA: Application / Services
// =================================================================
import { IRolAdminRepository } from '../../domain/repositories/IRolAdminRepository';
import { IPermisoRepository } from '../../domain/repositories/IPermisoRepository';
import { RolSistema } from '../../domain/entities/RolSistema';
import { Permiso } from '../../domain/entities/Permiso';
import { AsignarPermisoDTO, ActualizarRolDTO } from '../dtos/rol-permiso.dto';

type Resultado<T = {}> = ({ ok: true } & T) | { ok: false; mensaje: string };

export class RolPermisoService {
    constructor(
        private rolRepository: IRolAdminRepository,
        private permisoRepository: IPermisoRepository,
    ) {}

    async listarRoles(): Promise<RolSistema[]> {
        return this.rolRepository.listarTodos();
    }

    async actualizarDescripcionRol(rolId: number, dto: ActualizarRolDTO): Promise<Resultado<{ rol: RolSistema }>> {
        const rol = await this.rolRepository.buscarPorId(rolId);
        if (!rol) return { ok: false, mensaje: 'Rol no encontrado' };

        await this.rolRepository.actualizarDescripcion(rolId, dto.descripcion?.trim() ?? null);
        rol.actualizarDescripcion(dto.descripcion?.trim() ?? null);
        return { ok: true, rol };
    }

    async listarPermisos(rolId: number): Promise<Resultado<{ permisos: Permiso[] }>> {
        const rol = await this.rolRepository.buscarPorId(rolId);
        if (!rol) return { ok: false, mensaje: 'Rol no encontrado' };

        const permisos = await this.permisoRepository.listarPorRol(rolId);
        return { ok: true, permisos };
    }

    async asignarPermiso(rolId: number, dto: AsignarPermisoDTO): Promise<Resultado<{ permiso: Permiso }>> {
        const rol = await this.rolRepository.buscarPorId(rolId);
        if (!rol) return { ok: false, mensaje: 'Rol no encontrado' };

        const existente = await this.permisoRepository.buscar(rolId, dto.modulo, dto.accion);
        if (existente) return { ok: false, mensaje: 'El rol ya tiene ese permiso asignado' };

        const nuevo = new Permiso(null, rolId, dto.modulo.trim(), dto.accion);
        const guardado = await this.permisoRepository.crear(nuevo);
        return { ok: true, permiso: guardado };
    }

    async quitarPermiso(rolId: number, modulo: string, accion: Permiso['accion']): Promise<Resultado> {
        const rol = await this.rolRepository.buscarPorId(rolId);
        if (!rol) return { ok: false, mensaje: 'Rol no encontrado' };

        const existente = await this.permisoRepository.buscar(rolId, modulo, accion);
        if (!existente) return { ok: false, mensaje: 'El rol no tiene ese permiso asignado' };

        await this.permisoRepository.eliminar(rolId, modulo, accion);
        return { ok: true };
    }
}
