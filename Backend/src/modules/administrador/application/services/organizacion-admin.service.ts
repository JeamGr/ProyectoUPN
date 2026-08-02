import {
    IOrganizacionAdminRepository,
    EstadoValidacionOrganizacion,
    OrganizacionAdminItem,
} from '../../domain/repositories/IOrganizacionAdminRepository';
import { MailerService } from '../../../notificaciones/application/services/mailer.service';

type Resultado<T = {}> = ({ ok: true } & T) | { ok: false; mensaje: string };

export class OrganizacionAdminService {
    constructor(
        private readonly repository: IOrganizacionAdminRepository,
        private readonly mailerService: MailerService,
    ) {}

    async listar(estado?: string): Promise<Resultado<{ organizaciones: OrganizacionAdminItem[] }>> {
        const validos: EstadoValidacionOrganizacion[] = ['pendiente_validacion', 'aprobado', 'rechazado'];
        if (estado && !validos.includes(estado as EstadoValidacionOrganizacion)) {
            return { ok: false, mensaje: `Estado inválido. Usa uno de: ${validos.join(', ')}` };
        }
        const organizaciones = await this.repository.listar(estado as EstadoValidacionOrganizacion | undefined);
        return { ok: true, organizaciones };
    }

    async obtener(usuarioId: number): Promise<Resultado<{ organizacion: OrganizacionAdminItem }>> {
        const organizacion = await this.repository.buscarPorId(usuarioId);
        if (!organizacion) return { ok: false, mensaje: 'Organización no encontrada' };
        return { ok: true, organizacion };
    }

    async resumen(): Promise<Resultado<{ resumen: Record<string, number> }>> {
        const resumen = await this.repository.contarPorEstado();
        return { ok: true, resumen };
    }

    async aprobar(usuarioId: number): Promise<Resultado<{ mensaje: string }>> {
        const organizacion = await this.repository.buscarPorId(usuarioId);
        if (!organizacion) return { ok: false, mensaje: 'Organización no encontrada' };
        if (organizacion.estadoValidacion === 'aprobado') {
            return { ok: false, mensaje: 'Esta organización ya está aprobada.' };
        }

        await this.repository.cambiarEstadoValidacion(usuarioId, 'aprobado');
        await this.notificar(
            organizacion.correo,
            'Tu organización fue aprobada — YANANTIN',
            `<p>Hola, <strong>${organizacion.nombreOng}</strong>.</p>
             <p>Tu organización fue <strong>aprobada</strong> en YANANTIN. Ya puedes publicar
             oportunidades de voluntariado y enviarlas a revisión desde tu panel.</p>`,
        );

        return { ok: true, mensaje: 'Organización aprobada. Ya puede publicar oportunidades.' };
    }

    async rechazar(usuarioId: number, motivo: string): Promise<Resultado<{ mensaje: string }>> {
        const organizacion = await this.repository.buscarPorId(usuarioId);
        if (!organizacion) return { ok: false, mensaje: 'Organización no encontrada' };
        if (organizacion.estadoValidacion === 'rechazado') {
            return { ok: false, mensaje: 'Esta organización ya está rechazada.' };
        }

        await this.repository.cambiarEstadoValidacion(usuarioId, 'rechazado');
        await this.notificar(
            organizacion.correo,
            'Revisión de tu registro — YANANTIN',
            `<p>Hola, <strong>${organizacion.nombreOng}</strong>.</p>
             <p>Tu registro necesita ajustes antes de ser aprobado.</p>
             <p><strong>Motivo:</strong> ${motivo}</p>`,
        );

        return { ok: true, mensaje: 'Organización rechazada y notificada.' };
    }

    // Un fallo de correo NO debe revertir la decisión del administrador:
    // el cambio de estado ya está persistido y es lo que gobierna el acceso.
    private async notificar(correo: string, asunto: string, html: string): Promise<void> {
        try {
            await this.mailerService.enviarInmediato(correo, asunto, html);
        } catch (error) {
            console.error('[OrganizacionAdminService] No se pudo enviar el correo:', error);
        }
    }
}