import { Repository } from 'typeorm';
import { AppDataSource } from '../../../../../config/datasource';
import { RolModel } from '../models/rol.model';
import { IRolRepository } from '../../domain/repositories/IRolRepository';

export class RolRepository implements IRolRepository {
    private repo: Repository<RolModel>;

    constructor() {
        this.repo = AppDataSource.getRepository(RolModel);
    }

    async buscarPorNombre(nombre: string): Promise<{ id: number; nombre: string } | null> {
        const model = await this.repo.findOne({ where: { nombre } });
        if (!model) return null;
        return { id: model.id, nombre: model.nombre };
    }
}