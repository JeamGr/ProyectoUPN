// =================================================================
// CAPA: Application / Services
// Envío SÍNCRONO (para el código de verificación, el usuario está
// esperando en pantalla). El envío por cola/cron para recordatorios
// se agrega después, cuando lleguemos al módulo de actividades.
// =================================================================
import * as nodemailer from 'nodemailer';
import { CorreoRemitenteModel } from '../../infrastructure/models/correo-remitente.model';
import { CorreoRemitenteRepository } from '../../infrastructure/repositories/correo-remitente.repository';
import { NOMBRE_PLATAFORMA } from './mailer.template';

export class MailerService {
    private remitenteRepo = new CorreoRemitenteRepository();

    private crearTransporter(r: CorreoRemitenteModel) {
        return nodemailer.createTransport({
            host: r.host,
            port: r.puerto,
            secure: r.puerto === 465, // 465 = SSL directo; 587 = STARTTLS
            auth: { user: r.correo, pass: r.app_password },
        });
    }

    // Failover: intenta con cada remitente activo hasta que uno funcione.
    // Con un solo remitente en el seed, simplemente lo usa directo.
    async enviarInmediato(destinatario: string, asunto: string, html: string): Promise<void> {
        const remitentes = await this.remitenteRepo.listarActivosOrdenados();

        if (remitentes.length === 0) {
            throw { status: 500, mensaje: 'No hay una cuenta de correo remitente activa configurada' };
        }

        let enviado = false;
        for (const r of remitentes) {
            try {
                const transporter = this.crearTransporter(r);
                await transporter.sendMail({
                    from: `"${r.nombre_remitente || NOMBRE_PLATAFORMA}" <${r.correo}>`,
                    to: destinatario,
                    subject: asunto,
                    html,
                });
                enviado = true;
                break;
            } catch (err: any) {
                console.error(`[MAILER] Falló remitente ${r.correo}: ${err?.message}`);
            }
        }

        if (!enviado) {
            throw { status: 502, mensaje: 'No se pudo enviar el correo. Intenta nuevamente.' };
        }
    }
}