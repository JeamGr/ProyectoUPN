// Reutiliza RolModel de "usuarios" porque es la misma tabla `roles`
// (single source of truth); aquí solo se agrega la operación de
// administración (actualizar descripción) que el módulo de login no
// necesita.
import { Repository } from 'typeorm';
import { AppDataSource } from '../../../../config/datasource';

import { IRolAdminRepository } from '../../domain/repositories/IRolAdminRepository';
import { RolSistema } from '../../domain/entities/RolSistema';
import { RolModel } from '../../../Autenticacion y Gestion de Cuentas/usuarios/infrastructure/models/rol.model';

export class RolAdminRepository implements IRolAdminRepository {
    private repo: Repository<RolModel>;

    constructor() {
        this.repo = AppDataSource.getRepository(RolModel);
    }

    private toDomain(model: RolModel): RolSistema {
        return new RolSistema(model.id, model.nombre, model.descripcion);
    }

    async listarTodos(): Promise<RolSistema[]> {
        const modelos = await this.repo.find({ order: { id: 'ASC' } });
        return modelos.map((m) => this.toDomain(m));
    }

    async buscarPorId(id: number): Promise<RolSistema | null> {
        const modelo = await this.repo.findOne({ where: { id } });
        return modelo ? this.toDomain(modelo) : null;
    }

    async actualizarDescripcion(id: number, descripcion: string | null): Promise<void> {
        await this.repo.update({ id }, { descripcion });
    }
}
