import { Repository } from 'typeorm';
import { AppDataSource } from '../../../../../config/datasource';
import { TokenRecuperacionModel } from '../models/token-recuperacion.model';
import { ITokenRecuperacionRepository } from '../../domain/repositories/ITokenRecuperacionRepository';
import { TokenRecuperacion } from '../../domain/entities/TokenRecuperacion';

export class TokenRecuperacionRepository implements ITokenRecuperacionRepository {
    private repo: Repository<TokenRecuperacionModel>;

    constructor() {
        this.repo = AppDataSource.getRepository(TokenRecuperacionModel);
    }

    async crear(token: TokenRecuperacion): Promise<void> {
        const model = new TokenRecuperacionModel();
        model.usuario_id = token.usuarioId;
        model.token_hash = token.tokenHash;
        model.expira_en = token.expiraEn;
        model.usado = token.usado;
        await this.repo.save(model);
    }

    async invalidarAnteriores(usuarioId: number): Promise<void> {
        await this.repo.update({ usuario_id: usuarioId, usado: false }, { usado: true });
    }

    async buscarVigentePorUsuario(usuarioId: number): Promise<TokenRecuperacion | null> {
        const model = await this.repo.findOne({ where: { usuario_id: usuarioId, usado: false }, order: { id: 'DESC' } });
        return model ? new TokenRecuperacion(model.id, Number(model.usuario_id), model.token_hash, model.expira_en, model.usado) : null;
    }

    async marcarUsado(id: number): Promise<void> {
        await this.repo.update({ id }, { usado: true });
    }
}