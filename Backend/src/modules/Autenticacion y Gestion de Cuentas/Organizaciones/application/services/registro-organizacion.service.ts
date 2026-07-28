import bcrypt from 'bcryptjs';

import { RegistroOrganizacionDTO } from '../dtos/registro-organizacion.dto';
import { Usuario } from '../../../usuarios/domain/entities/Usuario';
import { Organizacion } from '../../domain/entities/Organizacion';
import { IUsuarioRepository } from '../../../usuarios/domain/repositories/IUsuarioRepository';
import { IOrganizacionRepository } from '../../domain/repositories/IOrganizacionRepository';
import { IRolRepository } from '../../../usuarios/domain/repositories/IRolRepository';
import { VerificacionService } from '../../../usuarios/application/services/verificacion.service';

export class RegistroOrganizacionService {
    constructor(
        private usuarioRepository: IUsuarioRepository,
        private organizacionRepository: IOrganizacionRepository,
        private rolRepository: IRolRepository,
        private verificacionService: VerificacionService,
    ) {}

    async registrar(dto: RegistroOrganizacionDTO) {
        if (dto.password !== dto.confirmarPassword) {
            return { ok: false as const, mensaje: 'Las contraseñas no coinciden' };
        }

        const correoExistente = await this.usuarioRepository.buscarPorEmail(dto.correo);
        if (correoExistente) {
            return { ok: false as const, mensaje: 'Ya existe una cuenta con ese correo' };
        }

        const rucExistente = await this.organizacionRepository.buscarPorRuc(dto.ruc);
        if (rucExistente) {
            return { ok: false as const, mensaje: 'Ya existe una organización registrada con ese RUC' };
        }

        const rolOrganizacion = await this.rolRepository.buscarPorNombre('ORGANIZACION');
        if (!rolOrganizacion) {
            throw { status: 500, mensaje: 'No se encontró el rol ORGANIZACION. Revisa el seed de la tabla roles.' };
        }

        const passwordHash = await bcrypt.hash(dto.password, 10);
        const usuario = new Usuario(null, dto.correo, passwordHash, rolOrganizacion.id, 'pendiente_verificacion');
        const organizacion = new Organizacion(
            0, dto.nombreOng, dto.direccion, dto.personaContacto, dto.tipoDocumentoContacto,
            dto.numeroDocumentoContacto, dto.celularContacto, dto.linkRedesSociales,
            dto.constituidaLegalmente, dto.ruc, dto.razonSocial, dto.tieneCertificadoDonacion,
            dto.descripcionActividad, dto.lineaIntervencionId, dto.categoriaId ?? null, dto.pais ?? 'Perú', dto.linkWeb,
            dto.numeroBeneficiariosAnual, dto.tieneProgramaVoluntariadoCorporativo,
        );

        const guardado = await this.organizacionRepository.crearConUsuario(usuario, organizacion);
        await this.verificacionService.generarYEnviar(
            guardado.usuario.id!,
            guardado.usuario.correo,
            guardado.organizacion.personaContacto,
        );

        return {
            ok: true as const,
            usuarioId: guardado.usuario.id,
            mensaje: 'Cuenta creada. Revisa tu correo para verificar tu cuenta. Tu organización quedará pendiente de aprobación por el equipo administrador.',
        };
    }
}