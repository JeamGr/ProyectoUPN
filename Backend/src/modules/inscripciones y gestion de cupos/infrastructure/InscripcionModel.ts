import { Entity, PrimaryGeneratedColumn, PrimaryColumn, Column } from 'typeorm';

// --------------------------------------------------
// Referencias LIGERAS a tablas que pertenecen a otros módulos.
// Mismo patrón que usa "gestion de perfiles/infrastructure/PerfilModel.ts"
// con su propio UsuarioModel local: cada módulo declara solo las
// columnas que necesita leer/escribir de una tabla que no le pertenece.
// --------------------------------------------------

@Entity('usuarios')
export class UsuarioModel {
    @PrimaryColumn({ type: 'bigint', unsigned: true })
    id!: number;

    @Column({ type: 'varchar', length: 150 })
    correo!: string;
}

@Entity('perfiles_voluntario')
export class PerfilVoluntarioModel {
    @PrimaryColumn({ name: 'usuario_id', type: 'bigint', unsigned: true })
    usuario_id!: number;

    @Column({ type: 'varchar', length: 20 })
    codigo_estudiante!: string;

    @Column({ type: 'varchar', length: 100 })
    nombres!: string;

    @Column({ type: 'varchar', length: 100 })
    apellidos!: string;

    @Column({ type: 'varchar', length: 20, nullable: true })
    telefono!: string | null;

    @Column({ type: 'varchar', length: 150, nullable: true })
    ubicacion!: string | null;

    @Column({ type: 'varchar', length: 500, nullable: true })
    foto_url!: string | null;
}

// M3 (Gestión de Oportunidades) todavía no está construido en el backend,
// así que este es el único lugar del código donde existe, por ahora, un
// mapeo TypeORM de la tabla "oportunidades". Cuando se construya M3, sus
// desarrolladores probablemente creen su propio modelo más completo (igual
// que pasa hoy con UsuarioModel, repetido en varios módulos) — no hay
// conflicto porque cada clase es independiente.
@Entity('oportunidades')
export class OportunidadModel {
    @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
    id!: number;

    @Column({ type: 'bigint', unsigned: true })
    organizacion_id!: number;

    @Column({ type: 'varchar', length: 200 })
    titulo!: string;

    @Column({
        type: 'enum',
        enum: ['borrador', 'pendiente_aprobacion', 'publicado', 'pausado', 'cerrado', 'cancelado', 'rechazado']
    })
    estado!: string;

    @Column({ type: 'int', unsigned: true })
    cupos_totales!: number;

    @Column({ type: 'int', unsigned: true })
    cupos_disponibles!: number;

    @Column({ type: 'boolean', default: false })
    requiere_aprobacion!: boolean;
}

// --------------------------------------------------
// Tablas propias de M5
// --------------------------------------------------

@Entity('inscripciones')
export class InscripcionModel {
    @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
    id!: number;

    @Column({ type: 'bigint', unsigned: true })
    usuario_id!: number;

    @Column({ type: 'bigint', unsigned: true })
    oportunidad_id!: number;

    @Column({
        type: 'enum',
        enum: ['inscrito', 'confirmado', 'completado', 'no_asistio', 'cancelado', 'rechazado'],
        default: 'inscrito'
    })
    estado!: 'inscrito' | 'confirmado' | 'completado' | 'no_asistio' | 'cancelado' | 'rechazado';

    @Column({ type: 'datetime' })
    fecha_inscripcion!: Date;

    @Column({ type: 'datetime', nullable: true })
    fecha_cancelacion!: Date | null;

    @Column({ type: 'varchar', length: 255, nullable: true })
    motivo_cancelacion!: string | null;
}

@Entity('lista_espera')
export class ListaEsperaModel {
    @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
    id!: number;

    @Column({ type: 'bigint', unsigned: true })
    usuario_id!: number;

    @Column({ type: 'bigint', unsigned: true })
    oportunidad_id!: number;

    @Column({ type: 'int', unsigned: true })
    posicion!: number;

    @Column({ type: 'datetime' })
    fecha_registro!: Date;

    @Column({ type: 'boolean', default: false })
    notificado!: boolean;
}
