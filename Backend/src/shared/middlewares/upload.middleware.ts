import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request, Response, NextFunction, RequestHandler } from 'express';

function crearUploader(carpeta: string, formatosPermitidos: string[], tamanoMaxMB: number) {
    const destino = path.join(process.cwd(), 'uploads', carpeta);
    if (!fs.existsSync(destino)) fs.mkdirSync(destino, { recursive: true });

    return multer({
        storage: multer.diskStorage({
            destination: (req, file, cb) => cb(null, destino),
            filename: (req, file, cb) => {
                const nombreUnico = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
                cb(null, nombreUnico);
            },
        }),
        limits: { fileSize: tamanoMaxMB * 1024 * 1024 },
        fileFilter: (req, file, cb) => {
            if (!formatosPermitidos.includes(file.mimetype)) {
                return cb(new Error(`Formato no permitido. Solo: ${formatosPermitidos.join(', ')}`));
            }
            cb(null, true);
        },
    });
}

// RF-034: JPG, PNG, MP4, PDF para evidencias
export const uploadEvidencia = crearUploader(
    'evidencias',
    ['image/jpeg', 'image/png', 'video/mp4', 'application/pdf'],
    50, // 50MB, videos pesan mas
);

// Solo imagenes para la portada de oportunidad
export const uploadImagenOportunidad = crearUploader('oportunidades', ['image/jpeg', 'image/png'], 5);
// Foto de perfil del voluntario. 2MB basta para un avatar y evita que
// alguien suba una imagen de 5MB que luego hay que reescalar en el cliente.
export const uploadFotoPerfil = crearUploader('perfiles', ['image/jpeg', 'image/png', 'image/webp'], 2);

// Envuelve un middleware .single(campo) de multer para responder 400 con un
// mensaje claro (formato no permitido, archivo muy pesado, etc.) en vez de
// dejar que el error caiga en el errorHandler genérico como un 500.
export function manejarSubida(uploader: multer.Multer, campo: string): RequestHandler {
    const middleware = uploader.single(campo);
    return (req: Request, res: Response, next: NextFunction) => {
        middleware(req, res, (err: unknown) => {
            if (!err) return next();

            if (err instanceof multer.MulterError) {
                const mensaje =
                    err.code === 'LIMIT_FILE_SIZE'
                        ? 'El archivo supera el tamaño máximo permitido'
                        : `Error al subir el archivo: ${err.message}`;
                return res.status(400).json({ ok: false, mensaje });
            }

            if (err instanceof Error) {
                // Errores lanzados desde fileFilter (formato no permitido)
                return res.status(400).json({ ok: false, mensaje: err.message });
            }

            return next(err);
        });
    };
}