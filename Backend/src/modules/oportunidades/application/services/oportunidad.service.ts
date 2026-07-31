// =================================================================
// CAPA: Application / Services
// Toda transicion de estado pasa PRIMERO por Oportunidad.puedeTransicionarA()
// (domain) antes de tocar la base de datos.
// =================================================================
import { CrearOportunidadDTO } from '../dtos/crear-oportunidad.dto';
import { OportunidadFactory } from '../../domain/factories/OportunidadFactory';
import { IOportunidadRepository } from '../../domain/repositories/IOportunidadRepository';
import { IOrganizacionValidacionRepository } from '../../domain/repositories/IOrganizacionValidacionRepository';
import { EstadoOportunidad } from '../../domain/entities/Oportunidad';

type Resultado<T = {}> = ({ ok: true } & T) | { ok: false; mensaje: string };

export class OportunidadService {
    constructor(
        private oportunidadRepository: IOportunidadRepository,
        private organizacionValidacionRepository: IOrganizacionValidacionRepository,
    ) {}

    async crear(dto: CrearOportunidadDTO, organizacionId: number): Promise<Resultado<{ oportunidadId: number }>> {
        if (new Date(dto.fechaFin) <= new Date(dto.fechaInicio)) {
            return { ok: false, mensaje: 'La fecha de fin debe ser posterior a la fecha de inicio' };
        }

        const nueva = OportunidadFactory.crear({
            organizacionId,
            titulo: dto.titulo,
            descripcion: dto.descripcion,
            lineaIntervencionId: dto.lineaIntervencionId,
            modalidad: dto.modalidad,
            ubicacionId: dto.ubicacionId,
            fechaInicio: new Date(dto.fechaInicio),
            fechaFin: new Date(dto.fechaFin),
            horasAcreditadas: dto.horasAcreditadas,
            cuposTotales: dto.cuposTotales,
            requisitos: dto.requisitos,
            imagenUrl: dto.imagenUrl,
            requiereAprobacion: dto.requiereAprobacion,
        });

        const guardada = await this.oportunidadRepository.crear(nueva);
        return { ok: true, oportunidadId: guardada.id! };
    }

    async enviarARevision(id: number, organizacionId: number): Promise<Resultado> {
        const oportunidad = await this.oportunidadRepository.buscarPorId(id);
        if (!oportunidad) return { ok: false, mensaje: 'Oportunidad no encontrada' };
        if (oportunidad.organizacionId !== organizacionId) {
            return { ok: false, mensaje: 'No tienes permiso sobre esta oportunidad' };
        }
        if (!oportunidad.puedeTransicionarA('pendiente_aprobacion')) {
            return { ok: false, mensaje: `No se puede enviar a revisión desde el estado "${oportunidad.estado}"` };
        }

        const aprobada = await this.organizacionValidacionRepository.estaAprobada(organizacionId);
        if (!aprobada) {
            return { ok: false, mensaje: 'Tu organización aún no está aprobada. No puedes publicar oportunidades todavía.' };
        }

        await this.oportunidadRepository.cambiarEstado(id, 'pendiente_aprobacion');
        return { ok: true };
    }

    async aprobar(id: number, adminId: number): Promise<Resultado> {
        const oportunidad = await this.oportunidadRepository.buscarPorId(id);
        if (!oportunidad) return { ok: false, mensaje: 'Oportunidad no encontrada' };
        if (!oportunidad.puedeTransicionarA('publicado')) {
            return { ok: false, mensaje: `No se puede aprobar desde el estado "${oportunidad.estado}"` };
        }
        await this.oportunidadRepository.cambiarEstado(id, 'publicado', undefined, adminId);
        return { ok: true };
    }

    async rechazar(id: number, adminId: number, motivo: string): Promise<Resultado> {
        const oportunidad = await this.oportunidadRepository.buscarPorId(id);
        if (!oportunidad) return { ok: false, mensaje: 'Oportunidad no encontrada' };
        if (!oportunidad.puedeTransicionarA('rechazado')) {
            return { ok: false, mensaje: `No se puede rechazar desde el estado "${oportunidad.estado}"` };
        }
        await this.oportunidadRepository.cambiarEstado(id, 'rechazado', motivo, adminId);
        return { ok: true };
    }

    async pausar(id: number, organizacionId: number): Promise<Resultado> {
        return this.transicionSimple(id, organizacionId, 'pausado');
    }

    async reanudar(id: number, organizacionId: number): Promise<Resultado> {
        return this.transicionSimple(id, organizacionId, 'publicado');
    }

    async cerrar(id: number, organizacionId: number): Promise<Resultado> {
        return this.transicionSimple(id, organizacionId, 'cerrado');
    }

    async cancelar(id: number, adminId: number, motivo: string): Promise<Resultado> {
        const oportunidad = await this.oportunidadRepository.buscarPorId(id);
        if (!oportunidad) return { ok: false, mensaje: 'Oportunidad no encontrada' };
        if (!oportunidad.puedeTransicionarA('cancelado')) {
            return { ok: false, mensaje: `No se puede cancelar desde el estado "${oportunidad.estado}"` };
        }
        await this.oportunidadRepository.cambiarEstado(id, 'cancelado', motivo, adminId);
        return { ok: true };
    }

    // RF-014: actualiza la imagen de portada. Devuelve la URL anterior (si existía)
    // para que el controller pueda borrar el archivo físico huérfano en disco.
    async subirImagen(
        id: number,
        organizacionId: number,
        imagenUrl: string,
    ): Promise<Resultado<{ imagenAnterior: string | null }>> {
        const oportunidad = await this.oportunidadRepository.buscarPorId(id);
        if (!oportunidad) return { ok: false, mensaje: 'Oportunidad no encontrada' };
        if (oportunidad.organizacionId !== organizacionId) {
            return { ok: false, mensaje: 'No tienes permiso sobre esta oportunidad' };
        }
        if (oportunidad.estado === 'cerrado' || oportunidad.estado === 'cancelado') {
            return { ok: false, mensaje: `No se puede modificar la imagen de una oportunidad en estado "${oportunidad.estado}"` };
        }

        const imagenAnterior = oportunidad.imagenUrl;
        await this.oportunidadRepository.actualizarImagen(id, imagenUrl);
        return { ok: true, imagenAnterior };
    }

    private async transicionSimple(id: number, organizacionId: number, destino: EstadoOportunidad): Promise<Resultado> {
        const oportunidad = await this.oportunidadRepository.buscarPorId(id);
        if (!oportunidad) return { ok: false, mensaje: 'Oportunidad no encontrada' };
        if (oportunidad.organizacionId !== organizacionId) {
            return { ok: false, mensaje: 'No tienes permiso sobre esta oportunidad' };
        }
        if (!oportunidad.puedeTransicionarA(destino)) {
            return { ok: false, mensaje: `No se puede pasar de "${oportunidad.estado}" a "${destino}"` };
        }
        await this.oportunidadRepository.cambiarEstado(id, destino);
        return { ok: true };
    }
}