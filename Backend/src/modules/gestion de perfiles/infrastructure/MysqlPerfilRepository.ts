import { DataSource, Repository } from 'typeorm';
import { PerfilRepository } from '../domain/PerfilRepository';
import {
    PerfilVoluntarioModel,
    OrganizacionModel,
    PreferenciasNotificacionModel,
    UsuarioModel,
    LineaIntervencionModel
} from './PerfilModel';
import { PerfilMapper } from './PerfilMapper';
import {
    ActualizarPerfilVoluntarioDTO,
    ActualizarPerfilOrganizacionDTO,
    ActualizarPreferenciasDTO,
    PerfilVoluntarioResponseDTO,
    PerfilOrganizacionResponseDTO,
    PreferenciasResponseDTO
} from '../application/PerfilDTO';

export class MysqlPerfilRepository implements PerfilRepository {
    private readonly voluntarioRepo: Repository<PerfilVoluntarioModel>;
    private readonly organizacionRepo: Repository<OrganizacionModel>;
    private readonly preferenciasRepo: Repository<PreferenciasNotificacionModel>;
    private readonly usuarioRepo: Repository<UsuarioModel>;
    private readonly lineaIntervencionRepo: Repository<LineaIntervencionModel>;

    constructor(dataSource: DataSource) {
        this.voluntarioRepo = dataSource.getRepository(PerfilVoluntarioModel);
        this.organizacionRepo = dataSource.getRepository(OrganizacionModel);
        this.preferenciasRepo = dataSource.getRepository(PreferenciasNotificacionModel);
        this.usuarioRepo = dataSource.getRepository(UsuarioModel);
        this.lineaIntervencionRepo = dataSource.getRepository(LineaIntervencionModel);
    }

    // --------------------------------------------------
    // VOLUNTARIO
    // --------------------------------------------------
    async obtenerVoluntarioPorUsuarioId(usuarioId: number): Promise<PerfilVoluntarioResponseDTO | null> {
        const model = await this.voluntarioRepo.findOne({
            where: { usuario_id: usuarioId },
            relations: ['usuario', 'intereses']
        });

        if (!model) return null;
        return PerfilMapper.toVoluntarioResponseDTO(model);
    }

    async actualizarVoluntario(usuarioId: number, dto: ActualizarPerfilVoluntarioDTO): Promise<void> {
        const perfil = await this.voluntarioRepo.findOne({
            where: { usuario_id: usuarioId },
            relations: ['intereses']
        });

        if (!perfil) return;

        // Actualizar campos simples
        if (dto.telefono !== undefined) perfil.telefono = dto.telefono;
        if (dto.ubicacion !== undefined) perfil.ubicacion = dto.ubicacion;
        if (dto.habilidades !== undefined) perfil.habilidades = dto.habilidades;
        if (dto.disponibilidad !== undefined) perfil.disponibilidad = dto.disponibilidad;
        if (dto.foto_url !== undefined) perfil.foto_url = dto.foto_url;

        // Actualizar relación Muchos a Muchos (usuario_intereses)
        if (dto.intereses_ids !== undefined) {
            if (dto.intereses_ids.length > 0) {
                const nuevosIntereses = await this.lineaIntervencionRepo.findByIds(dto.intereses_ids);
                perfil.intereses = nuevosIntereses;
            } else {
                perfil.intereses = [];
            }
        }

        await this.voluntarioRepo.save(perfil);
    }

    // --------------------------------------------------
    // ORGANIZACIÓN
    // --------------------------------------------------
    async obtenerOrganizacionPorUsuarioId(usuarioId: number): Promise<PerfilOrganizacionResponseDTO | null> {
        const model = await this.organizacionRepo.findOne({
            where: { usuario_id: usuarioId },
            relations: ['usuario', 'linea_intervencion']
        });

        if (!model) return null;
        return PerfilMapper.toOrganizacionResponseDTO(model);
    }

    async actualizarOrganizacion(usuarioId: number, dto: ActualizarPerfilOrganizacionDTO): Promise<void> {
        await this.organizacionRepo.update({ usuario_id: usuarioId }, dto);
    }

    // --------------------------------------------------
    // PREFERENCIAS
    // --------------------------------------------------
    async obtenerPreferenciasPorUsuarioId(usuarioId: number): Promise<PreferenciasResponseDTO | null> {
        const model = await this.preferenciasRepo.findOne({ where: { usuario_id: usuarioId } });
        if (!model) return null;
        return PerfilMapper.toPreferenciasResponseDTO(model);
    }

    async guardarOActualizarPreferencias(usuarioId: number, dto: ActualizarPreferenciasDTO): Promise<void> {
        let prefs = await this.preferenciasRepo.findOne({ where: { usuario_id: usuarioId } });

        if (!prefs) {
            prefs = this.preferenciasRepo.create({
                usuario_id: usuarioId,
                ...dto
            });
        } else {
            Object.assign(prefs, dto);
        }

        await this.preferenciasRepo.save(prefs);
    }

    // --------------------------------------------------
    // USUARIO & BAJA LÓGICA (RF-013)
    // --------------------------------------------------
    async existeUsuario(usuarioId: number): Promise<boolean> {
        const count = await this.usuarioRepo.count({ where: { id: usuarioId } });
        return count > 0;
    }

    async desactivarCuenta(usuarioId: number): Promise<void> {
        await this.usuarioRepo.update(
            { id: usuarioId },
            {
                estado: 'eliminado',
                fecha_baja: new Date()
            }
        );
    }
}