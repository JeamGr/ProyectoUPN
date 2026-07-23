import { PerfilRepository } from '../domain/PerfilRepository';
import {
    ActualizarPerfilVoluntarioDTO,
    ActualizarPerfilOrganizacionDTO,
    ActualizarPreferenciasDTO,
    PerfilVoluntarioResponseDTO,
    PerfilOrganizacionResponseDTO,
    PreferenciasResponseDTO
} from './PerfilDTO';

export class PerfilService {
    constructor(private readonly perfilRepository: PerfilRepository) {}

    // ==========================================
    // CASOS DE USO: VOLUNTARIO
    // ==========================================

    async obtenerPerfilVoluntario(usuarioId: number): Promise<PerfilVoluntarioResponseDTO> {
        const perfil = await this.perfilRepository.obtenerVoluntarioPorUsuarioId(usuarioId);
        if (!perfil) {
            throw new Error('Perfil de voluntario no encontrado');
        }
        return perfil;
    }

    async actualizarPerfilVoluntario(
        usuarioId: number,
        dto: ActualizarPerfilVoluntarioDTO
    ): Promise<PerfilVoluntarioResponseDTO> {
        const perfilExistente = await this.perfilRepository.obtenerVoluntarioPorUsuarioId(usuarioId);
        if (!perfilExistente) {
            throw new Error('Perfil de voluntario no encontrado para actualizar');
        }
        await this.perfilRepository.actualizarVoluntario(usuarioId, dto);

        return await this.obtenerPerfilVoluntario(usuarioId);
    }

    // ==========================================
    // CASOS DE USO: ORGANIZACIÓN
    // ==========================================

    async obtenerPerfilOrganizacion(usuarioId: number): Promise<PerfilOrganizacionResponseDTO> {
        const perfil = await this.perfilRepository.obtenerOrganizacionPorUsuarioId(usuarioId);
        if (!perfil) {
            throw new Error('Perfil de organización no encontrado');
        }
        return perfil;
    }

    async actualizarPerfilOrganizacion(
        usuarioId: number,
        dto: ActualizarPerfilOrganizacionDTO
    ): Promise<PerfilOrganizacionResponseDTO> {
        // 1. Verificar existencia
        const perfilExistente = await this.perfilRepository.obtenerOrganizacionPorUsuarioId(usuarioId);
        if (!perfilExistente) {
            throw new Error('Perfil de organización no encontrado para actualizar');
        }

        // 2. Ejecutar actualización
        await this.perfilRepository.actualizarOrganizacion(usuarioId, dto);

        // 3. Retornar actualizado
        return await this.obtenerPerfilOrganizacion(usuarioId);
    }

    // ==========================================
    // CASOS DE USO: PREFERENCIAS
    // ==========================================

    async obtenerPreferencias(usuarioId: number): Promise<PreferenciasResponseDTO> {
        const prefs = await this.perfilRepository.obtenerPreferenciasPorUsuarioId(usuarioId);
        if (!prefs) {
            // Si por algún motivo no existen aún sus preferencias, retornar valores por defecto (RF-012)
            return {
                usuario_id: usuarioId,
                notificar_confirmacion: true,
                notificar_recordatorio: true,
                notificar_certificado: true,
                notificar_nuevas_oportunidades: true
            };
        }
        return prefs;
    }

    async actualizarPreferencias(
        usuarioId: number,
        dto: ActualizarPreferenciasDTO
    ): Promise<PreferenciasResponseDTO> {
        await this.perfilRepository.guardarOActualizarPreferencias(usuarioId, dto);
        return await this.obtenerPreferencias(usuarioId);
    }

    // ==========================================
    // CASO DE USO: BAJA LÓGICA DE CUENTA (RF-013)
    // ==========================================

    async darDeBajaCuenta(usuarioId: number): Promise<void> {
        const usuarioValido = await this.perfilRepository.existeUsuario(usuarioId);
        if (!usuarioValido) {
            throw new Error('El usuario especificado no existe');
        }

        // RF-013: Marca estado = 'eliminado' y registra fecha_baja = NOW()
        await this.perfilRepository.desactivarCuenta(usuarioId);
    }
}