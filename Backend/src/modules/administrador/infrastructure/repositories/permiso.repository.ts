import { Repository } from 'typeorm';
import { AppDataSource } from '../../../../config/datasource';

import { IPermisoRepository } from '../../domain/repositories/IPermisoRepository';
import { Permiso, AccionPermiso } from '../../domain/entities/Permiso';
import { PermisoModel } from '../models/permiso.model';

export class PermisoRepository implements IPermisoRepository {
    private repo: Repository<PermisoModel>;

    constructor() {
        this.repo = AppDataSource.getRepository(PermisoModel);
    }

    private toDomain(model: PermisoModel): Permiso {
        return new Permiso(model.id, model.rolId, model.modulo, model.accion);
    }

    async listarPorRol(rolId: number): Promise<Permiso[]> {
        const modelos = await this.repo.find({
            where: { rolId },
            order: { modulo: 'ASC', accion: 'ASC' },
        });
        return modelos.map((m) => this.toDomain(m));
    }

    async buscar(rolId: number, modulo: string, accion: AccionPermiso): Promise<Permiso | null> {
        const modelo = await this.repo.findOne({ where: { rolId, modulo, accion } });
        return modelo ? this.toDomain(modelo) : null;
    }

    async crear(permiso: Permiso): Promise<Permiso> {
        const guardado = await this.repo.save(
            this.repo.create({ rolId: permiso.rolId, modulo: permiso.modulo, accion: permiso.accion }),
        );
        return this.toDomain(guardado);
    }

    async eliminar(rolId: number, modulo: string, accion: AccionPermiso): Promise<void> {
        await this.repo.delete({ rolId, modulo, accion });
    }
}
