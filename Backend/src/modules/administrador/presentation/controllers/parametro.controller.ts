import { Request, Response } from 'express';
import { ParametroService } from '../../application/services/parametro.service';
import { GuardarParametroDTO } from '../../application/dtos/parametro.dto';

export class ParametroController {
    constructor(private readonly parametroService: ParametroService) {}

    listar = async (_req: Request, res: Response) => {
        const parametros = await this.parametroService.listar();
        return res.status(200).json({ ok: true, parametros });
    };

    obtener = async (req: Request, res: Response) => {
        const resultado = await this.parametroService.obtener(String(req.params.clave));
        return res.status(resultado.ok ? 200 : 404).json(resultado);
    };

    guardar = async (req: Request, res: Response) => {
        const dto = req.dto as GuardarParametroDTO;
        const adminId = req.jwt!.id;
        const resultado = await this.parametroService.guardar(String(req.params.clave), dto, adminId);
        return res.status(resultado.ok ? 200 : 400).json(resultado);
    };
}
