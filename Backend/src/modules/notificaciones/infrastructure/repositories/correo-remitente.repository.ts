// =================================================================
// CAPA: Infrastructure / Repositories
// =================================================================
import { Repository } from 'typeorm';
import { AppDataSource } from '../../../../config/datasource';
import { CorreoRemitenteModel } from '../models/correo-remitente.model';

export class CorreoRemitenteRepository {
    private repo: Repository<CorreoRemitenteModel>;

    constructor() {
        this.repo = AppDataSource.getRepository(CorreoRemitenteModel);
    }

    // Trae los remitentes activos en orden de failover (menor prioridad = primero).
    // Con el seed actual será solo tu Gmail, pero queda listo para agregar más.
    async listarActivosOrdenados(): Promise<CorreoRemitenteModel[]> {
        return this.repo.find({
            where: { activo: true },
            order: { prioridad: 'ASC', id_remitente: 'ASC' },
        });
    }
}