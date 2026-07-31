import { Request, Response } from 'express';
import { InscripcionService } from '../application/InscripcionService';
import { ExcelExportBuilder } from '../infrastructure/ExcelExportBuilder';

// Nota importante sobre autenticación: a diferencia de
// "gestion de perfiles/presentation/PerfilController.ts" (que lee
// `(req as any).user.id`), aquí se usa `req.jwt` porque así es como el
// middleware REAL que está conectado hoy en main.ts
// (shared/middlewares/auth.handler.ts -> authHandler()) deja los datos
// del token: `req.jwt = { id, rol }`. Ese middleware NUNCA setea
// `req.user`, así que PerfilController probablemente tiene ahí un bug
// pendiente ajeno a M5; en M5 no se repite ese supuesto.
export class InscripcionController {
    constructor(private readonly service: InscripcionService) {}

    // RF-026 / RF-028
    inscribirse = async (req: Request, res: Response): Promise<void> => {
        try {
            const usuarioId = req.jwt!.id;
            const oportunidadId = Number(req.body.oportunidad_id);
            const resultado = await this.service.inscribirse(usuarioId, oportunidadId);
            res.status(201).json({ status: 'success', data: resultado });
        } catch (error: any) {
            res.status(400).json({ status: 'error', message: error.message });
        }
    };

    // RF-027
    cancelarInscripcion = async (req: Request, res: Response): Promise<void> => {
        try {
            const usuarioId = req.jwt!.id;
            const inscripcionId = Number(req.params.id);
            await this.service.cancelarInscripcion(usuarioId, inscripcionId, req.body?.motivo_cancelacion);
            res.status(200).json({ status: 'success', message: 'Inscripción cancelada correctamente' });
        } catch (error: any) {
            res.status(400).json({ status: 'error', message: error.message });
        }
    };

    // RF-029
    obtenerInscritos = async (req: Request, res: Response): Promise<void> => {
        try {
            const organizacionUsuarioId = req.jwt!.id;
            const oportunidadId = Number(req.params.oportunidadId);
            const inscritos = await this.service.obtenerInscritos(organizacionUsuarioId, oportunidadId);
            res.status(200).json({ status: 'success', data: inscritos });
        } catch (error: any) {
            res.status(400).json({ status: 'error', message: error.message });
        }
    };

    // RF-028 (consulta de la lista de espera por parte de la organización)
    obtenerListaEspera = async (req: Request, res: Response): Promise<void> => {
        try {
            const organizacionUsuarioId = req.jwt!.id;
            const oportunidadId = Number(req.params.oportunidadId);
            const lista = await this.service.obtenerListaEspera(organizacionUsuarioId, oportunidadId);
            res.status(200).json({ status: 'success', data: lista });
        } catch (error: any) {
            res.status(400).json({ status: 'error', message: error.message });
        }
    };

    // RF-031
    aprobarInscripcion = async (req: Request, res: Response): Promise<void> => {
        try {
            const organizacionUsuarioId = req.jwt!.id;
            const inscripcionId = Number(req.params.id);
            await this.service.aprobarInscripcion(organizacionUsuarioId, inscripcionId);
            res.status(200).json({ status: 'success', message: 'Inscripción aprobada correctamente' });
        } catch (error: any) {
            res.status(400).json({ status: 'error', message: error.message });
        }
    };

    rechazarInscripcion = async (req: Request, res: Response): Promise<void> => {
        try {
            const organizacionUsuarioId = req.jwt!.id;
            const inscripcionId = Number(req.params.id);
            await this.service.rechazarInscripcion(organizacionUsuarioId, inscripcionId, req.body.motivo);
            res.status(200).json({ status: 'success', message: 'Inscripción rechazada correctamente' });
        } catch (error: any) {
            res.status(400).json({ status: 'error', message: error.message });
        }
    };

    // RF-030
    exportarInscritos = async (req: Request, res: Response): Promise<void> => {
        try {
            const organizacionUsuarioId = req.jwt!.id;
            const oportunidadId = Number(req.params.oportunidadId);
            const inscritos = await this.service.obtenerInscritos(organizacionUsuarioId, oportunidadId);
            const buffer = await ExcelExportBuilder.construirListadoInscritos(
                `oportunidad_${oportunidadId}`,
                inscritos
            );

            res.setHeader(
                'Content-Type',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            );
            res.setHeader(
                'Content-Disposition',
                `attachment; filename="inscritos_oportunidad_${oportunidadId}.xlsx"`
            );
            res.status(200).send(buffer);
        } catch (error: any) {
            res.status(400).json({ status: 'error', message: error.message });
        }
    };
    // En InscripcionController.ts
obtenerMisInscripciones = async (req: Request, res: Response): Promise<void> => {
    try {
        const usuarioId = req.jwt!.id; // 👈 Usar req.jwt igual que los otros métodos
        const inscripciones = await this.service.obtenerMisInscripciones(usuarioId);
        res.status(200).json({ status: 'success', data: inscripciones });
    } catch (error: any) {
        res.status(400).json({ status: 'error', message: error.message });
    }
};
}
