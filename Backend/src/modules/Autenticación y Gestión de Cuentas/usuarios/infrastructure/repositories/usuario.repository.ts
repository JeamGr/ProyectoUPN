// =================================================================
// CAPA: Infrastructure / Repositories
// Implementación concreta de IUsuarioRepository usando TypeORM.
//
// Flujo:
//   RegistroService (Application) -> IUsuarioRepository (Domain)
//        -> UsuarioRepository (esta clase)
//        -> UsuarioMapping (transformación)
//        -> UsuarioModel / UsuarioInteresModel (TypeORM)
//        -> MySQL
// =================================================================
import { Repository } from 'typeorm';

import { AppDataSource } from '../../../../config/datasource';
import { UsuarioModel } from '../models/usuario.model';
import { UsuarioInteresModel } from '../models/usuario-interes.model';
import { IUsuarioRepository } from '../../domain/repositories/IUsuarioRepository';
import { Usuario } from '../../domain/entities/Usuario';
import { UsuarioMapping } from '../mappings/usuario.mapping';

export class UsuarioRepository implements IUsuarioRepository {
    private repo: Repository<UsuarioModel>;
    private interesRepo: Repository<UsuarioInteresModel>;

    constructor() {
        this.repo = AppDataSource.getRepository(UsuarioModel);
        this.interesRepo = AppDataSource.getRepository(UsuarioInteresModel);
    }

    async buscarPorEmail(email: string): Promise<Usuario | null> {
        const model = await this.repo.findOne({ where: { email } });
        if (!model) return null;
        return UsuarioMapping.toDomain(model, await this.obtenerIntereses(model.id));
    }

    async buscarPorCodigoEstudiante(codigoEstudiante: string): Promise<Usuario | null> {
        const model = await this.repo.findOne({ where: { codigo_estudiante: codigoEstudiante } });
        if (!model) return null;
        return UsuarioMapping.toDomain(model, await this.obtenerIntereses(model.id));
    }

    async buscarPorId(id: number): Promise<Usuario | null> {
        const model = await this.repo.findOne({ where: { id } });
        if (!model) return null;
        return UsuarioMapping.toDomain(model, await this.obtenerIntereses(model.id));
    }

    // Crea usuario + intereses en UNA sola transacción.
    // Si algo falla a mitad de camino, se revierte todo: nunca queda
    // un usuario huérfano sin sus categorías.
    async crearConIntereses(usuario: Usuario): Promise<Usuario> {
        return await AppDataSource.transaction(async (manager) => {
            const model = UsuarioMapping.toModel(usuario);
            const guardado = await manager.save(UsuarioModel, model);

            if (usuario.intereses.length > 0) {
                const filas = usuario.intereses.map((categoriaId) => {
                    const interes = new UsuarioInteresModel();
                    interes.usuario_id = guardado.id;
                    interes.categoria_id = categoriaId;
                    return interes;
                });
                await manager.save(UsuarioInteresModel, filas);
            }

            return UsuarioMapping.toDomain(guardado, usuario.intereses);
        });
    }

    async activarCuenta(usuarioId: number): Promise<void> {
        await this.repo.update({ id: usuarioId }, { estado: 'ACTIVO' });
    }

    private async obtenerIntereses(usuarioId: number): Promise<number[]> {
        const filas = await this.interesRepo.find({ where: { usuario_id: usuarioId } });
        return filas.map((f) => f.categoria_id);
    }
}