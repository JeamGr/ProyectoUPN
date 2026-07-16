// =================================================================
// CAPA: Shared / Middlewares
// Middleware LIGERO solo para validar el body con un DTO, cuando
// la ruta NO requiere JWT (registro, login, verificación de código).
// authHandler no sirve aquí porque siempre exige Authorization header.
// =================================================================
import { Request, Response, NextFunction } from 'express';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

export const validateBody = (dtoClass: any) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        const instance = plainToInstance(dtoClass, req.body, {
            enableImplicitConversion: true,
        });

        const errors = await validate(instance, { whitelist: true });

        if (errors.length > 0) {
            const detalle = errors.map((e) => ({
                campo: e.property,
                errores: Object.values(e.constraints || {}),
            }));
            return res.status(400).json({ ok: false, mensaje: 'Datos inválidos', detalle });
        }

        req.dto = instance;
        next();
    };
};