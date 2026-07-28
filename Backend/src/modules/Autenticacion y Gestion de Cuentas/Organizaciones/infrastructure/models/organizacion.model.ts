import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('organizaciones')
export class OrganizacionModel {
    @PrimaryColumn({ type: 'bigint', unsigned: true })
    usuario_id!: number;

    @Column({ type: 'varchar', length: 200 })
    nombre_ong!: string;

    @Column({ type: 'text', nullable: true })
    descripcion_actividad!: string | null;

    @Column({ type: 'int', unsigned: true, nullable: true })
    linea_intervencion_id!: number | null;

    @Column({ type: 'int', unsigned: true, nullable: true })
    categoria_id!: number | null;

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

    @Column({ type: 'enum', enum: ['pendiente_validacion', 'aprobado', 'rechazado'], default: 'pendiente_validacion' })
    estado_validacion!: 'pendiente_validacion' | 'aprobado' | 'rechazado';
}