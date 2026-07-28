// ⚠️ Metodo mas sensible: descontarCupo(). UPDATE atomico con la condicion
// en el WHERE, no un "leer -> restar en memoria -> guardar".
import { Repository } from 'typeorm';
import { AppDataSource } from '../../../../config/datasource';

import { OportunidadModel } from '../models/oportunidad.model';
import {
    IOportunidadRepository,
    FiltrosBusqueda,
    OportunidadConOrganizacion,
} from '../../domain/repositories/IOportunidadRepository';
import { Oportunidad, EstadoOportunidad } from '../../domain/entities/Oportunidad';
import { OportunidadMapping } from '../mappings/oportunidad.mapping';

export class OportunidadRepository implements IOportunidadRepository {
    private repo: Repository<OportunidadModel>;

    constructor() {
        this.repo = AppDataSource.getRepository(OportunidadModel);
    }

    async buscarPorId(id: number): Promise<Oportunidad | null> {
        const model = await this.repo.findOne({ where: { id } });
        return model ? OportunidadMapping.toDomain(model) : null;
    }

    async crear(oportunidad: Oportunidad): Promise<Oportunidad> {
        const model = OportunidadMapping.toModel(oportunidad);
        const guardado = await this.repo.save(model);
        return OportunidadMapping.toDomain(guardado);
    }

    async cambiarEstado(
        id: number,
        nuevoEstado: EstadoOportunidad,
        motivoRechazo?: string,
        aprobadoPor?: number,
    ): Promise<void> {
        const anterior = await this.buscarPorId(id);

        const cambios: Partial<OportunidadModel> = { estado: nuevoEstado };
        if (motivoRechazo) cambios.motivo_rechazo = motivoRechazo;
        if (aprobadoPor) cambios.aprobado_por = aprobadoPor;
        if (nuevoEstado === 'publicado') cambios.fecha_publicacion = new Date();
        await this.repo.update({ id }, cambios);

        // Auditoria de la transicion (historial_estados, tabla del schema consolidado)
        await AppDataSource.query(
            `INSERT INTO historial_estados (entidad_tipo, entidad_id, estado_anterior, estado_nuevo, cambiado_por)
             VALUES ('oportunidad', ?, ?, ?, ?)`,
            [id, anterior?.estado ?? null, nuevoEstado, aprobadoPor ?? null],
        );
    }

    // RN-03: decremento atomico. Si affected === 0, alguien mas se
    // gano el ultimo cupo justo antes -> el caller debe rechazar la inscripcion.
    async descontarCupo(id: number): Promise<boolean> {
        const resultado = await this.repo
            .createQueryBuilder()
            .update(OportunidadModel)
            .set({ cupos_disponibles: () => 'cupos_disponibles - 1' })
            .where('id = :id AND cupos_disponibles > 0', { id })
            .execute();
        return (resultado.affected ?? 0) > 0;
    }

    async liberarCupo(id: number): Promise<void> {
        await this.repo
            .createQueryBuilder()
            .update(OportunidadModel)
            .set({ cupos_disponibles: () => 'cupos_disponibles + 1' })
            .where('id = :id AND cupos_disponibles < cupos_totales', { id })
            .execute();
    }

    // RF-022 a RF-024: texto libre + tolerancia leve a typos (NATURAL LANGUAGE
    // MODE + fallback LIKE), filtros combinables, y 3 modos de orden.
    async buscarPublicadas(filtros: FiltrosBusqueda): Promise<{ datos: OportunidadConOrganizacion[]; total: number }> {
        const qb = this.repo
            .createQueryBuilder('o')
            .leftJoin('organizaciones', 'org', 'org.usuario_id = o.organizacion_id')
            .addSelect('org.nombre_ong', 'nombre_organizacion')
            // RF-024: popularidad = inscritos no cancelados. La tabla ya existe
            // en BD (M5), aunque el codigo de M5 aun no este listo.
            .leftJoin(
                '(SELECT oportunidad_id, COUNT(*) as total FROM inscripciones WHERE estado != \'cancelado\' GROUP BY oportunidad_id)',
                'insc',
                'insc.oportunidad_id = o.id',
            )
            .addSelect('COALESCE(insc.total, 0)', 'total_inscritos')
            .where('o.estado = :estado', { estado: 'publicado' });

        if (filtros.lineaIntervencionId) {
            qb.andWhere('o.linea_intervencion_id = :lineaId', { lineaId: filtros.lineaIntervencionId });
        }
        if (filtros.modalidad) {
            qb.andWhere('o.modalidad = :modalidad', { modalidad: filtros.modalidad });
        }
        if (filtros.fechaDesde) {
            qb.andWhere('o.fecha_inicio >= :fechaDesde', { fechaDesde: filtros.fechaDesde });
        }
        if (filtros.fechaHasta) {
            qb.andWhere('o.fecha_inicio <= :fechaHasta', { fechaHasta: filtros.fechaHasta });
        }
        // RF-023: ubicacion como catalogo administrable (M12/RF-057), filtro por igualdad
        if (filtros.ubicacionId) {
            qb.andWhere('o.ubicacion_id = :ubicacionId', { ubicacionId: filtros.ubicacionId });
        }
        // RF-023: duracion en horas
        if (filtros.horasMin !== undefined) {
            qb.andWhere('o.horas_acreditadas >= :horasMin', { horasMin: filtros.horasMin });
        }
        if (filtros.horasMax !== undefined) {
            qb.andWhere('o.horas_acreditadas <= :horasMax', { horasMax: filtros.horasMax });
        }

        const textoBusqueda = filtros.textoBusqueda?.trim();
        if (textoBusqueda) {
            // NATURAL LANGUAGE MODE da un puntaje de relevancia usable para ordenar.
            // El OR con LIKE es el "colchon" de tolerancia: cubre palabras cortas
            // que el FULLTEXT ignora por defecto, y coincidencias parciales.
            qb.addSelect('MATCH(o.titulo, o.descripcion) AGAINST (:texto)', 'relevancia_score')
                .andWhere(
                    '(MATCH(o.titulo, o.descripcion) AGAINST (:texto IN NATURAL LANGUAGE MODE) OR o.titulo LIKE :textoLike)',
                    { texto: textoBusqueda, textoLike: `%${textoBusqueda}%` },
                );
        } else {
            qb.addSelect('0', 'relevancia_score');
        }

        // RF-024: ordenamiento configurable
        switch (filtros.ordenarPor) {
            case 'relevancia':
                if (textoBusqueda) qb.orderBy('relevancia_score', 'DESC');
                else qb.orderBy('o.fecha_inicio', 'ASC'); // sin texto, no hay relevancia que ordenar
                break;
            case 'popularidad':
                qb.orderBy('total_inscritos', 'DESC');
                break;
            case 'fecha':
            default:
                qb.orderBy('o.fecha_inicio', 'ASC');
        }

        const pagina = filtros.pagina ?? 1;
        const porPagina = Math.min(filtros.porPagina ?? 10, 50);
        qb.skip((pagina - 1) * porPagina).take(porPagina);

        const total = await qb.getCount();
        const { entities, raw } = await qb.getRawAndEntities();

        const datos: OportunidadConOrganizacion[] = entities.map((e, i) => ({
            ...OportunidadMapping.toDomain(e),
            nombreOrganizacion: raw[i].nombre_organizacion,
        })) as OportunidadConOrganizacion[];

        return { datos, total };
    }

   // RF-025: intereses explicitos + lineas donde ya participo (historial).
    // Ambas fuentes se unen sin duplicar oportunidades ya recomendadas por interes.
    async buscarRecomendadasPara(usuarioId: number): Promise<OportunidadConOrganizacion[]> {
        const qb = this.repo
            .createQueryBuilder('o')
            .leftJoin('organizaciones', 'org', 'org.usuario_id = o.organizacion_id')
            .addSelect('org.nombre_ong', 'nombre_organizacion')
            .where('o.estado = :estado', { estado: 'publicado' })
            .andWhere(
                `(
                    o.linea_intervencion_id IN (
                        SELECT linea_intervencion_id FROM usuario_intereses WHERE usuario_id = :usuarioId
                    )
                    OR o.linea_intervencion_id IN (
                        SELECT o2.linea_intervencion_id FROM inscripciones i2
                        INNER JOIN oportunidades o2 ON o2.id = i2.oportunidad_id
                        WHERE i2.usuario_id = :usuarioId AND i2.estado = 'completado'
                    )
                )`,
                { usuarioId },
            )
            .orderBy('o.fecha_inicio', 'ASC');

        const { entities, raw } = await qb.getRawAndEntities();
        return entities.map((e, i) => ({
            ...OportunidadMapping.toDomain(e),
            nombreOrganizacion: raw[i].nombre_organizacion,
        })) as OportunidadConOrganizacion[];
    }

    async buscarPorOrganizacion(organizacionId: number): Promise<Oportunidad[]> {
        const modelos = await this.repo.find({
            where: { organizacion_id: organizacionId },
            order: { created_at: 'DESC' },
        });
        return modelos.map(OportunidadMapping.toDomain);
    }
}