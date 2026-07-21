// ⚠️ El punto más sensible de todo el bloque: la transacción de 3 tablas.
import { Repository } from 'typeorm';
import { AppDataSource } from '../../../../../config/datasource';
import { UsuarioModel } from '../models/usuario.model';
import { PerfilVoluntarioModel } from '../models/perfil-voluntario.model';
import { UsuarioInteresModel } from '../models/usuario-interes.model';

import { IUsuarioRepository } from '../../domain/repositories/IUsuarioRepository';
import { Usuario } from '../../domain/entities/Usuario';
import { PerfilVoluntario } from '../../domain/entities/PerfilVoluntario';

import { UsuarioMapping } from '../mappings/usuario.mapping';
import { PerfilVoluntarioMapping } from '../mappings/perfil-voluntario.mapping';

export class UsuarioRepository implements IUsuarioRepository {
    private usuarioRepo: Repository<UsuarioModel>;
    private perfilRepo: Repository<PerfilVoluntarioModel>;
    private interesRepo: Repository<UsuarioInteresModel>;

    constructor() {
        this.usuarioRepo = AppDataSource.getRepository(UsuarioModel);
        this.perfilRepo = AppDataSource.getRepository(PerfilVoluntarioModel);
        this.interesRepo = AppDataSource.getRepository(UsuarioInteresModel);
    }

    async buscarPorEmail(correo: string): Promise<Usuario | null> {
        const model = await this.usuarioRepo.findOne({ where: { correo } });
        return model ? UsuarioMapping.toDomain(model) : null;
    }

    async buscarPorId(id: number): Promise<Usuario | null> {
        const model = await this.usuarioRepo.findOne({ where: { id } });
        return model ? UsuarioMapping.toDomain(model) : null;
    }

    async buscarPerfilPorCodigoEstudiante(codigoEstudiante: string): Promise<PerfilVoluntario | null> {
        const model = await this.perfilRepo.findOne({ where: { codigo_estudiante: codigoEstudiante } });
        if (!model) return null;
        const intereses = await this.interesRepo.find({ where: { usuario_id: model.usuario_id } });
        return PerfilVoluntarioMapping.toDomain(model, intereses.map((i) => i.linea_intervencion_id));
    }

    // Crea usuarios + perfiles_voluntario + usuario_intereses en UNA transacción.
    async registrarVoluntario(
        usuario: Usuario,
        perfil: PerfilVoluntario,
    ): Promise<{ usuario: Usuario; perfil: PerfilVoluntario }> {
        return AppDataSource.transaction(async (manager) => {
            const usuarioModel = UsuarioMapping.toModel(usuario);
            const usuarioGuardado = await manager.save(UsuarioModel, usuarioModel);

            const perfilModel = PerfilVoluntarioMapping.toModel(perfil);
            perfilModel.usuario_id = usuarioGuardado.id; // recién aquí se conoce el id real
            const perfilGuardado = await manager.save(PerfilVoluntarioModel, perfilModel);

            if (perfil.intereses.length > 0) {
                const filas = perfil.intereses.map((lineaId) => {
                    const fila = new UsuarioInteresModel();
                    fila.usuario_id = usuarioGuardado.id;
                    fila.linea_intervencion_id = lineaId;
                    return fila;
                });
                await manager.save(UsuarioInteresModel, filas);
            }

            return {
                usuario: UsuarioMapping.toDomain(usuarioGuardado),
                perfil: PerfilVoluntarioMapping.toDomain(perfilGuardado, perfil.intereses),
            };
        });
    }

    async activarCuenta(usuarioId: number): Promise<void> {
        await this.usuarioRepo.update({ id: usuarioId }, { estado: 'activo', fecha_verificacion: new Date() });
    }
    async actualizarRegistroPendiente(
    usuario: Usuario,
    perfil: PerfilVoluntario,
): Promise<{ usuario: Usuario; perfil: PerfilVoluntario }> {
    return AppDataSource.transaction(async (manager) => {
        await manager.update(UsuarioModel, { id: usuario.id }, { password_hash: usuario.passwordHash });

        const perfilModel = PerfilVoluntarioMapping.toModel(perfil);
        await manager.save(PerfilVoluntarioModel, perfilModel); // upsert por PK (usuario_id)

        // Reemplaza los intereses viejos por los nuevos que mandó en este intento
        await manager.delete(UsuarioInteresModel, { usuario_id: usuario.id });
        if (perfil.intereses.length > 0) {
            const filas = perfil.intereses.map((lineaId) => {
                const fila = new UsuarioInteresModel();
                fila.usuario_id = usuario.id!;
                fila.linea_intervencion_id = lineaId;
                return fila;
            });
            await manager.save(UsuarioInteresModel, filas);
        }

        const usuarioActualizado = await manager.findOneByOrFail(UsuarioModel, { id: usuario.id! });
        return {
            usuario: UsuarioMapping.toDomain(usuarioActualizado),
            perfil: PerfilVoluntarioMapping.toDomain(perfilModel, perfil.intereses),
        };
    });
}
async buscarPerfilPorUsuarioId(usuarioId: number): Promise<PerfilVoluntario | null> {
    const model = await this.perfilRepo.findOne({ where: { usuario_id: usuarioId } });
    if (!model) return null;
    const intereses = await this.interesRepo.find({ where: { usuario_id: usuarioId } });
    return PerfilVoluntarioMapping.toDomain(model, intereses.map((i) => i.linea_intervencion_id));
}
}