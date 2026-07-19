// =================================================================
// CAPA: Infrastructure / Repositories
// Implementación concreta de ICodigoVerificacionRepository con TypeORM.
// =================================================================
import { Repository } from 'typeorm';

import { AppDataSource } from '../../../../../config/datasource';
import { CodigoVerificacionModel } from '../models/codigo-verificacion.model';
import { ICodigoVerificacionRepository } from '../../domain/repositories/ICodigoVerificacionRepository';
import { CodigoVerificacion } from '../../domain/entities/CodigoVerificacion';

export class CodigoVerificacionRepository implements ICodigoVerificacionRepository {
    private repo: Repository<CodigoVerificacionModel>;

    constructor() {
        this.repo = AppDataSource.getRepository(CodigoVerificacionModel);
    }

    async crear(codigo: CodigoVerificacion): Promise<void> {
        const model = new CodigoVerificacionModel();
        model.usuario_id = codigo.usuarioId;
        model.codigo_hash = codigo.codigoHash;
        model.intentos = codigo.intentos;
        model.expira_en = codigo.expiraEn;
        model.usado = codigo.usado;
        await this.repo.save(model);
    }

    async invalidarAnteriores(usuarioId: number): Promise<void> {
        await this.repo.update({ usuario_id: usuarioId, usado: false }, { usado: true });
    }

    async buscarVigente(usuarioId: number): Promise<CodigoVerificacion | null> {
        const model = await this.repo.findOne({
            where: { usuario_id: usuarioId, usado: false },
            order: { id: 'DESC' },
        });
        if (!model) return null;
        return new CodigoVerificacion(
            model.id,
            model.usuario_id,
            model.codigo_hash,
            model.intentos,
            model.expira_en,
            model.usado,
        );
    }

    async incrementarIntentos(codigoId: number): Promise<void> {
        await this.repo.increment({ id: codigoId }, 'intentos', 1);
    }

    async marcarUsado(codigoId: number): Promise<void> {
        await this.repo.update({ id: codigoId }, { usado: true });
    }
}