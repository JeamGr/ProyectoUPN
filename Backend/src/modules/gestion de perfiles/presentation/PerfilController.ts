import { Request, Response } from 'express';
import { PerfilService } from '../application/PerfilService';

export class PerfilController {
    constructor(private readonly perfilService: PerfilService) {}

    // --------------------------------------------------
    // VOLUNTARIO
    // --------------------------------------------------
    obtenerPerfilVoluntario = async (req: Request, res: Response): Promise<void> => {
        try {
            const usuarioId = (req as any).user.id;
            const perfil = await this.perfilService.obtenerPerfilVoluntario(usuarioId);
            res.status(200).json({ status: 'success', data: perfil });
        } catch (error: any) {
            res.status(404).json({ status: 'error', message: error.message });
        }
    };

    actualizarPerfilVoluntario = async (req: Request, res: Response): Promise<void> => {
        try {
            const usuarioId = (req as any).user.id;
            const perfilActualizado = await this.perfilService.actualizarPerfilVoluntario(
                usuarioId,
                req.body
            );
            res.status(200).json({ status: 'success', data: perfilActualizado });
        } catch (error: any) {
            res.status(400).json({ status: 'error', message: error.message });
        }
    };

    // --------------------------------------------------
    // ORGANIZACIÓN
    // --------------------------------------------------
    obtenerPerfilOrganizacion = async (req: Request, res: Response): Promise<void> => {
        try {
            const usuarioId = (req as any).user.id;
            const perfil = await this.perfilService.obtenerPerfilOrganizacion(usuarioId);
            res.status(200).json({ status: 'success', data: perfil });
        } catch (error: any) {
            res.status(404).json({ status: 'error', message: error.message });
        }
    };

    actualizarPerfilOrganizacion = async (req: Request, res: Response): Promise<void> => {
        try {
            const usuarioId = (req as any).user.id;
            const perfilActualizado = await this.perfilService.actualizarPerfilOrganizacion(
                usuarioId,
                req.body
            );
            res.status(200).json({ status: 'success', data: perfilActualizado });
        } catch (error: any) {
            res.status(400).json({ status: 'error', message: error.message });
        }
    };

    // --------------------------------------------------
    // PREFERENCIAS DE NOTIFICACIÓN (RF-012)
    // --------------------------------------------------
    obtenerPreferencias = async (req: Request, res: Response): Promise<void> => {
        try {
            const usuarioId = (req as any).user.id;
            const preferencias = await this.perfilService.obtenerPreferencias(usuarioId);
            res.status(200).json({ status: 'success', data: preferencias });
        } catch (error: any) {
            res.status(500).json({ status: 'error', message: error.message });
        }
    };

    actualizarPreferencias = async (req: Request, res: Response): Promise<void> => {
        try {
            const usuarioId = (req as any).user.id;
            const preferencias = await this.perfilService.actualizarPreferencias(usuarioId, req.body);
            res.status(200).json({ status: 'success', data: preferencias });
        } catch (error: any) {
            res.status(400).json({ status: 'error', message: error.message });
        }
    };

    // --------------------------------------------------
    // BAJA LÓGICA DE CUENTA (RF-013)
    // --------------------------------------------------
    darDeBajaCuenta = async (req: Request, res: Response): Promise<void> => {
        try {
            const usuarioId = (req as any).user.id;
            await this.perfilService.darDeBajaCuenta(usuarioId);
            res.status(200).json({
                status: 'success',
                message: 'La cuenta ha sido desactivada correctamente'
            });
        } catch (error: any) {
            res.status(400).json({ status: 'error', message: error.message });
        }
    };
}