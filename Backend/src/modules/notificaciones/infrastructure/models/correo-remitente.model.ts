// =================================================================
// CAPA: Infrastructure / Models
// Entidad TypeORM -> tabla `correo_remitente`.
// Para el MVP basta con UNA fila activa (tu Gmail); el diseño ya
// soporta varias con 'prioridad' para cuando escalen con failover.
// =================================================================
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('correo_remitente')
export class CorreoRemitenteModel {
    @PrimaryGeneratedColumn()
    id_remitente!: number;

    @Column()
    correo!: string;

    @Column()
    app_password!: string;

    @Column({ type: 'varchar', nullable: true })
    nombre_remitente!: string | null;

    @Column({ type: 'varchar', default: 'smtp.gmail.com' })
    host!: string;

    @Column({ type: 'int', default: 587 })
    puerto!: number;

    @Column({ default: true })
    activo!: boolean;

    @Column({ default: 0 })
    prioridad!: number;
}