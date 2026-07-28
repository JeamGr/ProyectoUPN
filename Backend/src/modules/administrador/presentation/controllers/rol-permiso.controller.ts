import { Request, Response } from 'express';
import { RolPermisoService } from '../../application/services/rol-permiso.service';
import { AsignarPermisoDTO, ActualizarRolDTO } from '../../application/dtos/rol-permiso.dto';
import { AccionPermiso } from '../../domain/entities/Permiso';

export class RolPermisoController {
    constructor(private readonly rolPermisoService: RolPermisoService) {}

    listarRoles = async (_req: Request, res: Response) => {
        const roles = await this.rolPermisoService.listarRoles();
        return res.status(200).json({ ok: true, roles });
    };

    actualizarRol = async (req: Request, res: Response) => {
        const rolId = Number(req.params.rolId);
        const dto = req.dto as ActualizarRolDTO;
        const resultado = await this.rolPermisoService.actualizarDescripcionRol(rolId, dto);
        return res.status(resultado.ok ? 200 : 404).json(resultado);
    };

    listarPermisos = async (req: Request, res: Response) => {
        const rolId = Number(req.params.rolId);
        const resultado = await this.rolPermisoService.listarPermisos(rolId);
        return res.status(resultado.ok ? 200 : 404).json(resultado);
    };

    asignarPermiso = async (req: Request, res: Response) => {
        const rolId = Number(req.params.rolId);
        const dto = req.dto as AsignarPermisoDTO;
        const resultado = await this.rolPermisoService.asignarPermiso(rolId, dto);
        return res.status(resultado.ok ? 201 : 400).json(resultado);
    };

    quitarPermiso = async (req: Request, res: Response) => {
        const rolId = Number(req.params.rolId);
        const modulo = String(req.params.modulo);
        const accion = req.params.accion as AccionPermiso;
        const resultado = await this.rolPermisoService.quitarPermiso(rolId, modulo, accion);
        return res.status(resultado.ok ? 200 : 400).json(resultado);
    };
}
