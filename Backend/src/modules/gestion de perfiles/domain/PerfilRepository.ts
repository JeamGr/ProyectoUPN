import {
    ActualizarPerfilVoluntarioDTO,
    ActualizarPerfilOrganizacionDTO,
    ActualizarPreferenciasDTO,
    PerfilVoluntarioResponseDTO,
    PerfilOrganizacionResponseDTO,
    PreferenciasResponseDTO
} from '../application/PerfilDTO';

export interface PerfilRepository {
    // Voluntario
    obtenerVoluntarioPorUsuarioId(usuarioId: number): Promise<PerfilVoluntarioResponseDTO | null>;
    actualizarVoluntario(usuarioId: number, dto: ActualizarPerfilVoluntarioDTO): Promise<void>;

    // Organización
    obtenerOrganizacionPorUsuarioId(usuarioId: number): Promise<PerfilOrganizacionResponseDTO | null>;
    actualizarOrganizacion(usuarioId: number, dto: ActualizarPerfilOrganizacionDTO): Promise<void>;

    // Preferencias de Notificación (RF-012)
    obtenerPreferenciasPorUsuarioId(usuarioId: number): Promise<PreferenciasResponseDTO | null>;
    guardarOActualizarPreferencias(usuarioId: number, dto: ActualizarPreferenciasDTO): Promise<void>;

    // Usuario & Baja Lógica (RF-013)
    existeUsuario(usuarioId: number): Promise<boolean>;
    desactivarCuenta(usuarioId: number): Promise<void>;
}