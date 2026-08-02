import { Request, Response } from 'express';
import { OrganizacionAdminService } from '../../application/services/organizacion-admin.service';
import { RechazarOrganizacionDTO } from '../../application/dtos/moderar-organizacion.dto';

export class OrganizacionAdminController {
    constructor(private readonly service: OrganizacionAdminService) {}

    listar = async (req: Request, res: Response) => {
        const estado = req.query.estado ? String(req.query.estado) : undefined;
        const resultado = await this.service.listar(estado);
        return res.status(resultado.ok ? 200 : 400).json(resultado);
    };

    resumen = async (_req: Request, res: Response) => {
        const resultado = await this.service.resumen();
        return res.status(200).json(resultado);
    };

    obtener = async (req: Request, res: Response) => {
        const resultado = await this.service.obtener(Number(req.params.id));
        return res.status(resultado.ok ? 200 : 404).json(resultado);
    };

    aprobar = async (req: Request, res: Response) => {
        const resultado = await this.service.aprobar(Number(req.params.id));
        return res.status(resultado.ok ? 200 : 400).json(resultado);
    };

    rechazar = async (req: Request, res: Response) => {
        const dto = req.dto as RechazarOrganizacionDTO;
        const resultado = await this.service.rechazar(Number(req.params.id), dto.motivoRechazo);
        return res.status(resultado.ok ? 200 : 400).json(resultado);
    };
}