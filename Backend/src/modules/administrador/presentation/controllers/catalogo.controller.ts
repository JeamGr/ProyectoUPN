import { Request, Response } from 'express';
import { CatalogoService } from '../../application/services/catalogo.service';
import { CrearItemCatalogoDTO, ActualizarItemCatalogoDTO } from '../../application/dtos/catalogo.dto';
import { TipoCatalogo } from '../../domain/entities/ItemCatalogo';

export class CatalogoController {
    // "tipo" queda fijo por instancia: un router = un catálogo. Así el
    // cliente nunca decide a qué tabla escribe, elimina esa clase de bug.
    constructor(
        private readonly tipo: TipoCatalogo,
        private readonly catalogoService: CatalogoService,
    ) {}

    listar = async (req: Request, res: Response) => {
        const soloActivos = req.query.soloActivos === 'true';
        const items = await this.catalogoService.listar(this.tipo, soloActivos);
        return res.status(200).json({ ok: true, items });
    };

    crear = async (req: Request, res: Response) => {
        const dto = req.dto as CrearItemCatalogoDTO;
        const resultado = await this.catalogoService.crear(this.tipo, dto);
        return res.status(resultado.ok ? 201 : 400).json(resultado);
    };

    actualizar = async (req: Request, res: Response) => {
        const id = Number(req.params.id);
        const dto = req.dto as ActualizarItemCatalogoDTO;
        const resultado = await this.catalogoService.actualizar(this.tipo, id, dto);
        return res.status(resultado.ok ? 200 : 400).json(resultado);
    };

    activar = async (req: Request, res: Response) => {
        const id = Number(req.params.id);
        const resultado = await this.catalogoService.activar(this.tipo, id);
        return res.status(resultado.ok ? 200 : 400).json(resultado);
    };

    desactivar = async (req: Request, res: Response) => {
        const id = Number(req.params.id);
        const resultado = await this.catalogoService.desactivar(this.tipo, id);
        return res.status(resultado.ok ? 200 : 400).json(resultado);
    };
}
