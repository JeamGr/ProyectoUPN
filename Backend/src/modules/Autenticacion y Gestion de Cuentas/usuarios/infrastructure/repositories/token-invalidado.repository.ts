import { Repository } from 'typeorm';
import { AppDataSource } from '../../../../../config/datasource';
import { TokenInvalidadoModel } from '../models/token-invalidado.model';
import { ITokenInvalidadoRepository } from '../../domain/repositories/ITokenInvalidadoRepository';

export class TokenInvalidadoRepository implements ITokenInvalidadoRepository {
    private repo: Repository<TokenInvalidadoModel>;

    constructor() {
        this.repo = AppDataSource.getRepository(TokenInvalidadoModel);
    }

    async invalidar(tokenHash: string, expiraEn: Date): Promise<void> {
        const model = new TokenInvalidadoModel();
        model.token_hash = tokenHash;
        model.expira_en = expiraEn;
        await this.repo.save(model);
    }

    async estaInvalidado(tokenHash: string): Promise<boolean> {
        return !!(await this.repo.findOne({ where: { token_hash: tokenHash } }));
    }
}