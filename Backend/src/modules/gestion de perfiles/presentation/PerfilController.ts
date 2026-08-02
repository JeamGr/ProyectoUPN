import { Request, Response } from 'express';
import { PerfilService } from '../application/PerfilService';
import fs from 'fs';
import path from 'path';

export class PerfilController {
    constructor(private readonly perfilService: PerfilService) {}

    // --------------------------------------------------
    // VOLUNTARIO
    // --------------------------------------------------
    obtenerPerfilVoluntario = async (req: Request, res: Response): Promise<void> => {
        try {
            const usuarioId = req.jwt!.id;
            const perfil = await this.perfilService.obtenerPerfilVoluntario(usuarioId);
            res.status(200).json({ status: 'success', data: perfil });
        } catch (error: any) {
            res.status(404).json({ status: 'error', message: error.message });
        }
    };

    actualizarPerfilVoluntario = async (req: Request, res: Response): Promise<void> => {
        try {
            const usuarioId = req.jwt!.id;
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
            const usuarioId = req.jwt!.id;
            const perfil = await this.perfilService.obtenerPerfilOrganizacion(usuarioId);
            res.status(200).json({ status: 'success', data: perfil });
        } catch (error: any) {
            res.status(404).json({ status: 'error', message: error.message });
        }
    };

    actualizarPerfilOrganizacion = async (req: Request, res: Response): Promise<void> => {
        try {
            const usuarioId = req.jwt!.id;
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
            const usuarioId = req.jwt!.id;
            const preferencias = await this.perfilService.obtenerPreferencias(usuarioId);
            res.status(200).json({ status: 'success', data: preferencias });
        } catch (error: any) {
            res.status(500).json({ status: 'error', message: error.message });
        }
    };

    actualizarPreferencias = async (req: Request, res: Response): Promise<void> => {
        try {
            const usuarioId = req.jwt!.id;
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
            const usuarioId = req.jwt!.id;
            await this.perfilService.darDeBajaCuenta(usuarioId);
            res.status(200).json({
                status: 'success',
                message: 'La cuenta ha sido desactivada correctamente'
            });
        } catch (error: any) {
            res.status(400).json({ status: 'error', message: error.message });
        }
    };
    // POST /perfiles/voluntario/me/foto  (RF-012)
    // Antes NO existía ningún endpoint para subir la foto: el DTO solo
    // aceptaba `foto_url` como texto, así que el <input type="file"> del
    // onboarding hacía un preview con FileReader y nunca enviaba nada.
    subirFotoVoluntario = async (req: any, res: any) => {
        if (!req.file) {
            return res.status(400).json({ status: 'error', message: 'No se recibió ninguna imagen' });
        }

        const url = `/uploads/perfiles/${req.file.filename}`;

        try {
            const anterior = await this.perfilService.obtenerPerfilVoluntario(req.jwt.id);
            const perfil = await this.perfilService.actualizarPerfilVoluntario(req.jwt.id, { foto_url: url });

            // Se borra la foto anterior para no acumular huérfanos en disco.
            if (anterior?.foto_url && anterior.foto_url.startsWith('/uploads/perfiles/')) {
                const ruta = path.join(process.cwd(), anterior.foto_url.replace(/^\//, ''));
                fs.promises.unlink(ruta).catch(() => { /* ya no existía */ });
            }

            return res.status(200).json({ status: 'success', data: perfil });
        } catch (error) {
            // Si el negocio falla, se limpia el archivo recién escrito por multer.
            fs.promises
                .unlink(path.join(process.cwd(), 'uploads', 'perfiles', req.file.filename))
                .catch(() => {});
            throw error;
        }
    };
}