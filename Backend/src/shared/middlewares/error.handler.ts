// =================================================================
// CAPA: Shared / Middlewares
// Red de seguridad final. Solo atrapa errores INESPERADOS (los de
// negocio ya se resuelven con { ok:false, mensaje } en cada service,
// no llegan hasta aquí). Por eso el mensaje al cliente es genérico:
// si llegó aquí, es algo que no supimos prever.
// =================================================================
import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('[ERROR]', err);
    const status = typeof err?.status === 'number' ? err.status : 500;
    res.status(status).json({
        ok: false,
        mensaje: 'Ocurrió un error inesperado. Intenta nuevamente.',
    });
};