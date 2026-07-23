import {
    Entity,
    PrimaryColumn,
    Column,
    ManyToOne,
    JoinColumn,
    ManyToMany,
    JoinTable,
    OneToOne
} from 'typeorm';

// --------------------------------------------------
// Entidad auxiliar de Usuario (para relaciones / baja lógica)
// --------------------------------------------------
@Entity('usuarios')
export class UsuarioModel {
    @PrimaryColumn({ type: 'bigint', unsigned: true })
    id!: number;

    @Column({ type: 'varchar', length: 150, unique: true })
    correo!: string;

    @Column({ type: 'enum', enum: ['pendiente_verificacion', 'activo', 'bloqueado', 'eliminado'] })
    estado!: string;

    @Column({ type: 'datetime', nullable: true })
    fecha_baja!: Date | null;
}

// --------------------------------------------------
// Entidad de Líneas de Intervención (para Intereses)
// --------------------------------------------------
@Entity('lineas_intervencion')
export class LineaIntervencionModel {
    @PrimaryColumn({ type: 'int', unsigned: true })
    id!: number;

    @Column({ type: 'varchar', length: 100 })
    nombre!: string;
}

// --------------------------------------------------
// Entidad de Perfil Voluntario
// --------------------------------------------------
@Entity('perfiles_voluntario')
export class PerfilVoluntarioModel {
    @PrimaryColumn({ name: 'usuario_id', type: 'bigint', unsigned: true })
    usuario_id!: number;

    @Column({ type: 'varchar', length: 20, unique: true })
    codigo_estudiante!: string;

    @Column({ type: 'varchar', length: 100 })
    nombres!: string;

    @Column({ type: 'varchar', length: 100 })
    apellidos!: string;

    @Column({ type: 'varchar', length: 100 })
    carrera!: string;

    @Column({ type: 'tinyint', unsigned: true })
    ciclo!: number;

    @Column({ type: 'varchar', length: 20, nullable: true })
    telefono!: string | null;

    @Column({ type: 'varchar', length: 150, nullable: true })
    ubicacion!: string | null;

    @Column({ type: 'text', nullable: true })
    habilidades!: string | null;

    @Column({ type: 'varchar', length: 255, nullable: true })
    disponibilidad!: string | null;

    @Column({ type: 'varchar', length: 500, nullable: true })
    foto_url!: string | null;

    @OneToOne(() => UsuarioModel)
    @JoinColumn({ name: 'usuario_id' })
    usuario!: UsuarioModel;

    // Relación Muchos a Muchos con lineas_intervencion a través de usuario_intereses
    @ManyToMany(() => LineaIntervencionModel)
    @JoinTable({
        name: 'usuario_intereses',
        joinColumn: { name: 'usuario_id', referencedColumnName: 'usuario_id' },
        inverseJoinColumn: { name: 'linea_intervencion_id', referencedColumnName: 'id' }
    })
    intereses!: LineaIntervencionModel[];
}

// --------------------------------------------------
// Entidad de Organización
// --------------------------------------------------
@Entity('organizaciones')
export class OrganizacionModel {
    @PrimaryColumn({ name: 'usuario_id', type: 'bigint', unsigned: true })
    usuario_id!: number;

    @Column({ type: 'varchar', length: 200 })
    nombre_ong!: string;

    @Column({ type: 'text', nullable: true })
    descripcion_actividad!: string | null;

    @Column({ type: 'int', unsigned: true, nullable: true })
    linea_intervencion_id!: number | null;

    @Column({ type: 'varchar', length: 100, default: 'Perú' })
    pais!: string;

    @Column({ type: 'varchar', length: 255 })
    direccion!: string;

    @Column({ type: 'varchar', length: 200 })
    persona_contacto!: string;

    @Column({ type: 'enum', enum: ['DNI', 'CE', 'PASAPORTE'] })
    tipo_documento_contacto!: 'DNI' | 'CE' | 'PASAPORTE';

    @Column({ type: 'varchar', length: 20 })
    numero_documento_contacto!: string;

    @Column({ type: 'varchar', length: 20 })
    celular_contacto!: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    link_web!: string | null;

    @Column({ type: 'varchar', length: 255 })
    link_redes_sociales!: string;

    @Column({ type: 'enum', enum: ['SI', 'NO', 'EN_PROCESO'] })
    constituida_legalmente!: 'SI' | 'NO' | 'EN_PROCESO';

    @Column({ type: 'varchar', length: 20, unique: true })
    ruc!: string;

    @Column({ type: 'varchar', length: 200 })
    razon_social!: string;

    @Column({ type: 'varchar', length: 50, nullable: true })
    numero_beneficiarios_anual!: string | null;

    @Column({ type: 'enum', enum: ['SI', 'NO', 'EN_PROCESO'] })
    tiene_certificado_donacion!: 'SI' | 'NO' | 'EN_PROCESO';

    @Column({ type: 'enum', enum: ['SI', 'NO', 'EN_PROCESO'], nullable: true })
    tiene_programa_voluntariado_corporativo!: 'SI' | 'NO' | 'EN_PROCESO' | null;

    @Column({
        type: 'enum',
        enum: ['pendiente_validacion', 'aprobado', 'rechazado'],
        default: 'pendiente_validacion'
    })
    estado_validacion!: 'pendiente_validacion' | 'aprobado' | 'rechazado';

    @OneToOne(() => UsuarioModel)
    @JoinColumn({ name: 'usuario_id' })
    usuario!: UsuarioModel;

    @ManyToOne(() => LineaIntervencionModel)
    @JoinColumn({ name: 'linea_intervencion_id' })
    linea_intervencion?: LineaIntervencionModel;
}

// --------------------------------------------------
// Entidad de Preferencias de Notificación
// --------------------------------------------------
@Entity('preferencias_notificacion')
export class PreferenciasNotificacionModel {
    @PrimaryColumn({ name: 'usuario_id', type: 'bigint', unsigned: true })
    usuario_id!: number;

    @Column({ type: 'boolean', default: true })
    notificar_confirmacion!: boolean;

    @Column({ type: 'boolean', default: true })
    notificar_recordatorio!: boolean;

    @Column({ type: 'boolean', default: true })
    notificar_certificado!: boolean;

    @Column({ type: 'boolean', default: true })
    notificar_nuevas_oportunidades!: boolean;
}