import { DataSource, Repository } from 'typeorm';
import { InscripcionRepository } from '../domain/InscripcionRepository';
import { Inscripcion } from '../domain/Inscripcion';
import { SinCupoError } from '../domain/InscripcionErrors';
import {
    InscripcionModel,
    ListaEsperaModel,
    OportunidadModel,
    UsuarioModel,
    PerfilVoluntarioModel
} from './InscripcionModel';
import { InscripcionMapper } from './InscripcionMapper';
import {
    InscritoListadoDTO,
    ListaEsperaItemDTO,
    OportunidadParaInscripcionDTO
} from '../application/InscripcionDTO';

export class MysqlInscripcionRepository implements InscripcionRepository {
    private readonly inscripcionRepo: Repository<InscripcionModel>;
    private readonly listaEsperaRepo: Repository<ListaEsperaModel>;
    private readonly oportunidadRepo: Repository<OportunidadModel>;
    private readonly perfilVoluntarioRepo: Repository<PerfilVoluntarioModel>;

    constructor(private readonly dataSource: DataSource) {
        this.inscripcionRepo = dataSource.getRepository(InscripcionModel);
        this.listaEsperaRepo = dataSource.getRepository(ListaEsperaModel);
        this.oportunidadRepo = dataSource.getRepository(OportunidadModel);
        this.perfilVoluntarioRepo = dataSource.getRepository(PerfilVoluntarioModel);
    }

    // --------------------------------------------------
    // Lecturas de apoyo
    // --------------------------------------------------
    async obtenerOportunidadParaInscripcion(oportunidadId: number): Promise<OportunidadParaInscripcionDTO | null> {
        const oportunidad = await this.oportunidadRepo.findOne({ where: { id: oportunidadId } });
        if (!oportunidad) return null;
        return {
            id: Number(oportunidad.id),
            organizacion_id: Number(oportunidad.organizacion_id),
            estado: oportunidad.estado,
            cupos_disponibles: oportunidad.cupos_disponibles,
            cupos_totales: oportunidad.cupos_totales,
            requiere_aprobacion: oportunidad.requiere_aprobacion
        };
    }

    async existeInscripcionActiva(usuarioId: number, oportunidadId: number): Promise<boolean> {
        const count = await this.inscripcionRepo
            .createQueryBuilder('i')
            .where('i.usuario_id = :usuarioId', { usuarioId })
            .andWhere('i.oportunidad_id = :oportunidadId', { oportunidadId })
            .andWhere('i.estado IN (:...estados)', { estados: ['inscrito', 'confirmado'] })
            .getCount();
        return count > 0;
    }

    // RN-02, mismo criterio que "gestion de perfiles/domain/Voluntario.ts::tienePerfilCompleto()"
    async perfilVoluntarioCompleto(usuarioId: number): Promise<boolean> {
        const perfil = await this.perfilVoluntarioRepo.findOne({ where: { usuario_id: usuarioId } });
        if (!perfil) return false;
        return Boolean(perfil.telefono && perfil.ubicacion && perfil.foto_url);
    }

    async obtenerInscripcionPorId(id: number): Promise<Inscripcion | null> {
        const model = await this.inscripcionRepo.findOne({ where: { id } });
        if (!model) return null;
        return InscripcionMapper.toDomain(model);
    }

    // --------------------------------------------------
    // RF-026 / RF-028
    // --------------------------------------------------
    async crearInscripcionConCupo(usuarioId: number, oportunidadId: number): Promise<Inscripcion> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            // Decremento atómico: solo tiene efecto si TODAVÍA hay cupo en
            // este instante exacto. Esto es lo que evita el sobrecupo (RN-03)
            // cuando dos voluntarios se inscriben casi simultáneamente.
            const resultado = await queryRunner.manager
                .createQueryBuilder()
                .update(OportunidadModel)
                .set({ cupos_disponibles: () => 'cupos_disponibles - 1' })
                .where('id = :id AND cupos_disponibles > 0', { id: oportunidadId })
                .execute();

            if (resultado.affected === 0) {
                await queryRunner.rollbackTransaction();
                throw new SinCupoError();
            }

            const nueva = queryRunner.manager.create(InscripcionModel, {
                usuario_id: usuarioId,
                oportunidad_id: oportunidadId,
                estado: 'inscrito',
                fecha_inscripcion: new Date()
            });
            const guardada = await queryRunner.manager.save(nueva);

            await queryRunner.commitTransaction();
            return InscripcionMapper.toDomain(guardada);
        } catch (error) {
            if (queryRunner.isTransactionActive) await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    async agregarAListaEspera(usuarioId: number, oportunidadId: number): Promise<{ posicion: number }> {
        const { max } = await this.listaEsperaRepo
            .createQueryBuilder('le')
            .select('MAX(le.posicion)', 'max')
            .where('le.oportunidad_id = :oportunidadId', { oportunidadId })
            .getRawOne();

        const siguientePosicion = (max ?? 0) + 1;

        await this.listaEsperaRepo.save(
            this.listaEsperaRepo.create({
                usuario_id: usuarioId,
                oportunidad_id: oportunidadId,
                posicion: siguientePosicion,
                fecha_registro: new Date(),
                notificado: false
            })
        );

        return { posicion: siguientePosicion };
    }

    // --------------------------------------------------
    // RF-027 (+ RN-04)
    // --------------------------------------------------
    async cancelarInscripcionYPromoverListaEspera(inscripcionId: number, motivo: string | null): Promise<void> {
        await this.finalizarInscripcionYPromover(inscripcionId, 'cancelado', motivo);
    }

    // --------------------------------------------------
    // RF-031
    // --------------------------------------------------
    async aprobarInscripcion(inscripcionId: number): Promise<void> {
        await this.inscripcionRepo.update({ id: inscripcionId }, { estado: 'confirmado' });
    }

    async rechazarInscripcionYPromoverListaEspera(inscripcionId: number, motivo: string): Promise<void> {
        // Nota: el schema no tiene una columna "motivo_rechazo" separada en
        // "inscripciones" (solo existe en "oportunidades", para RF-017). Por
        // eso el motivo de rechazo de RF-031 se guarda en la misma columna
        // "motivo_cancelacion". Si más adelante se quiere distinguir un
        // rechazo de una cancelación por texto, habría que agregar una
        // columna nueva a la tabla.
        await this.finalizarInscripcionYPromover(inscripcionId, 'rechazado', motivo);
    }

    // --------------------------------------------------
    // Privado: comparte la lógica entre cancelar y rechazar, porque en
    // ambos casos hay que: 1) cerrar la inscripción, 2) liberar su cupo,
    // 3) promover al primero de la lista de espera si existe (RN-04).
    // --------------------------------------------------
    private async finalizarInscripcionYPromover(
        inscripcionId: number,
        nuevoEstado: 'cancelado' | 'rechazado',
        motivo: string | null
    ): Promise<void> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const inscripcion = await queryRunner.manager.findOne(InscripcionModel, {
                where: { id: inscripcionId }
            });
            if (!inscripcion) throw new Error('Inscripción no encontrada');

            inscripcion.estado = nuevoEstado;
            inscripcion.fecha_cancelacion = new Date();
            inscripcion.motivo_cancelacion = motivo;
            await queryRunner.manager.save(inscripcion);

            // Libera el cupo que ocupaba
            await queryRunner.manager.increment(
                OportunidadModel,
                { id: inscripcion.oportunidad_id },
                'cupos_disponibles',
                1
            );

            // RN-04: promueve al primero en lista de espera, si existe
            const siguiente = await queryRunner.manager.findOne(ListaEsperaModel, {
                where: { oportunidad_id: inscripcion.oportunidad_id },
                order: { posicion: 'ASC' }
            });

            if (siguiente) {
                const nuevaInscripcion = queryRunner.manager.create(InscripcionModel, {
                    usuario_id: siguiente.usuario_id,
                    oportunidad_id: siguiente.oportunidad_id,
                    estado: 'inscrito',
                    fecha_inscripcion: new Date()
                });
                await queryRunner.manager.save(nuevaInscripcion);

                // Vuelve a tomar el cupo que se acaba de liberar
                await queryRunner.manager.decrement(
                    OportunidadModel,
                    { id: siguiente.oportunidad_id },
                    'cupos_disponibles',
                    1
                );

                await queryRunner.manager.delete(ListaEsperaModel, { id: siguiente.id });

                // Reacomoda las posiciones de quienes quedaron detrás del promovido
                await queryRunner.manager
                    .createQueryBuilder()
                    .update(ListaEsperaModel)
                    .set({ posicion: () => 'posicion - 1' })
                    .where('oportunidad_id = :oid AND posicion > :pos', {
                        oid: siguiente.oportunidad_id,
                        pos: siguiente.posicion
                    })
                    .execute();

                // TODO (M8 - Notificaciones): cuando exista el disparador de
                // eventos de M8, aquí se debe notificar al voluntario
                // promovido ("Cupo disponible", ver Sección 17 del SRS).
            }

            await queryRunner.commitTransaction();
        } catch (error) {
            if (queryRunner.isTransactionActive) await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    // --------------------------------------------------
    // RF-029 / RF-030
    // --------------------------------------------------
    async obtenerInscritosPorOportunidad(oportunidadId: number): Promise<InscritoListadoDTO[]> {
        const filas = await this.inscripcionRepo
            .createQueryBuilder('i')
            .innerJoin(PerfilVoluntarioModel, 'pv', 'pv.usuario_id = i.usuario_id')
            .innerJoin(UsuarioModel, 'u', 'u.id = i.usuario_id')
            .select([
                'i.id AS inscripcion_id',
                'i.usuario_id AS usuario_id',
                'pv.nombres AS nombres',
                'pv.apellidos AS apellidos',
                'u.correo AS correo',
                'pv.telefono AS telefono',
                'pv.codigo_estudiante AS codigo_estudiante',
                'i.estado AS estado',
                'i.fecha_inscripcion AS fecha_inscripcion'
            ])
            .where('i.oportunidad_id = :oportunidadId', { oportunidadId })
            .andWhere('i.estado != :cancelado', { cancelado: 'cancelado' })
            .orderBy('i.fecha_inscripcion', 'ASC')
            .getRawMany();

        return filas.map((f) => ({
            inscripcion_id: Number(f.inscripcion_id),
            usuario_id: Number(f.usuario_id),
            nombres: f.nombres,
            apellidos: f.apellidos,
            correo: f.correo,
            telefono: f.telefono,
            codigo_estudiante: f.codigo_estudiante,
            estado: f.estado,
            fecha_inscripcion: f.fecha_inscripcion
        }));
    }

    async obtenerListaEsperaPorOportunidad(oportunidadId: number): Promise<ListaEsperaItemDTO[]> {
        const filas = await this.listaEsperaRepo
            .createQueryBuilder('le')
            .innerJoin(PerfilVoluntarioModel, 'pv', 'pv.usuario_id = le.usuario_id')
            .innerJoin(UsuarioModel, 'u', 'u.id = le.usuario_id')
            .select([
                'le.usuario_id AS usuario_id',
                'pv.nombres AS nombres',
                'pv.apellidos AS apellidos',
                'u.correo AS correo',
                'le.posicion AS posicion',
                'le.fecha_registro AS fecha_registro'
            ])
            .where('le.oportunidad_id = :oportunidadId', { oportunidadId })
            .orderBy('le.posicion', 'ASC')
            .getRawMany();

        return filas.map((f) => ({
            usuario_id: Number(f.usuario_id),
            nombres: f.nombres,
            apellidos: f.apellidos,
            correo: f.correo,
            posicion: Number(f.posicion),
            fecha_registro: f.fecha_registro
        }));
    }
    // Add to MysqlInscripcionRepository.ts
async obtenerInscripcionesPorUsuario(usuarioId: number): Promise<any[]> {
    const filas = await this.inscripcionRepo
        .createQueryBuilder('i')
        .innerJoin(OportunidadModel, 'op', 'op.id = i.oportunidad_id')
        .select([
            'i.id AS id',
            'i.estado AS estado',
            'i.fecha_inscripcion AS fecha_inscripcion',
            'op.id AS oportunidad_id',
            'op.titulo AS titulo',
            'op.modalidad AS modalidad',
            'op.fecha_inicio AS fecha_inicio',
            'op.ubicacion AS ubicacion',
            'op.organizacion_nombre AS organizacion_nombre'
        ])
        .where('i.usuario_id = :usuarioId', { usuarioId })
        .orderBy('i.fecha_inscripcion', 'DESC')
        .getRawMany();

    return filas.map(f => ({
        id: Number(f.id),
        estado: f.estado,
        fechaInscripcion: f.fecha_inscripcion,
        oportunidad: {
            id: Number(f.oportunidad_id),
            titulo: f.titulo,
            modalidad: f.modalidad,
            fecha: f.fecha_inicio,
            ubicacion: f.ubicacion,
            organizacionNombre: f.organizacion_nombre
        }
    }));
}
}
