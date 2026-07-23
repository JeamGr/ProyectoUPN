// =================================================================
// CAPA: Shared / Middlewares
// Reutilizado tal cual de tu proyecto de citas médicas.
// Único cambio: el tipo Rol, adaptado a los 4 roles de este proyecto.
// =================================================================
import { Request, Response, NextFunction, RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import { Rol } from '../builders/token.builder';

declare global {
    namespace Express {
        interface Request {
            jwt?: {
                id: number;
                rol: Rol;
            };
        }
    }
}

interface AuthHandlerOptions {
    roles?: Rol[];
    dto?: any;
    source?: 'body' | 'query';
}

export const authHandler = (opts: AuthHandlerOptions = {}): RequestHandler => {
    return async (req: Request, res: Response, next: NextFunction) => {
        const header = req.headers.authorization;

        if (!header || !header.startsWith('Bearer ')) {
            return res.status(401).json({ ok: false, mensaje: 'Token no proporcionado' });
        }

        const token = header.split(' ')[1];

        let payload: { id: number; rol: Rol };
        try {
            payload = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { id: number; rol: Rol };
        } catch (error) {
            return res.status(401).json({ ok: false, mensaje: 'Token inválido o expirado' });
        }

        req.jwt = { id: payload.id, rol: payload.rol };

        if (opts.roles && opts.roles.length > 0) {
            if (!opts.roles.includes(payload.rol)) {
                return res.status(403).json({ ok: false, mensaje: 'No tienes permisos para acceder a este recurso' });
            }
        }

        if (opts.dto) {
            const source = opts.source || 'body';
            const rawData = source === 'query' ? req.query : req.body;

            const instance = plainToInstance(opts.dto, rawData, { enableImplicitConversion: true });
            const errors: ValidationError[] = await validate(instance, {
                whitelist: true,
                forbidNonWhitelisted: false,
                stopAtFirstError: false,
            });

            if (errors.length > 0) {
                const detalle = errors.map((e) => ({ campo: e.property, errores: Object.values(e.constraints || {}) }));
                return res.status(400).json({ ok: false, mensaje: 'Datos inválidos', detalle });
            }

            req.dto = instance;
        }

        next();
    };
};