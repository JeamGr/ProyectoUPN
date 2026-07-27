import { Repository } from 'typeorm';
import { AppDataSource } from '../../../../../config/datasource';
import { IdentidadOAuthModel } from '../models/identidad-oauth.model';
import { IIdentidadOAuthRepository } from '../../domain/repositories/IIdentidadOAuthRepository';

export class IdentidadOAuthRepository implements IIdentidadOAuthRepository {
    private repo: Repository<IdentidadOAuthModel>;

    constructor() {
        this.repo = AppDataSource.getRepository(IdentidadOAuthModel);
    }

    async buscarPorProveedor(proveedor: string, proveedorUid: string) {
        const model = await this.repo.findOne({ where: { proveedor, proveedor_uid: proveedorUid } });
        return model ? { usuarioId: Number(model.usuario_id) } : null;
    }

    async vincular(usuarioId: number, proveedor: string, proveedorUid: string, correoProveedor: string) {
        const model = new IdentidadOAuthModel();
        model.usuario_id = usuarioId;
        model.proveedor = proveedor;
        model.proveedor_uid = proveedorUid;
        model.correo_proveedor = correoProveedor;
        await this.repo.save(model);
    }
}