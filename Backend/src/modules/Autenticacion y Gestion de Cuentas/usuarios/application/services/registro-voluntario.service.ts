// ⚠️ Aquí vive la validación de dominio institucional, detrás de un
// flag de entorno (VALIDAR_DOMINIO_INSTITUCIONAL), tal como acordamos.
import bcrypt from 'bcryptjs';

import { RegistroVoluntarioDTO } from '../dtos/registro-voluntario.dto';
import { RegistroVoluntarioFactory } from '../../domain/factories/RegistroVoluntarioFactory';
import { IUsuarioRepository } from '../../domain/repositories/IUsuarioRepository';
import { IRolRepository } from '../../domain/repositories/IRolRepository';
import { VerificacionService } from './verificacion.service';
import { Usuario } from '../../domain/entities/Usuario';
import { PerfilVoluntario } from '../../domain/entities/PerfilVoluntario';
const DOMINIO_INSTITUCIONAL = '@upn.edu.pe';

export class RegistroVoluntarioService {
    constructor(
        private usuarioRepository: IUsuarioRepository,
        private rolRepository: IRolRepository,
        private verificacionService: VerificacionService,
    ) {}

    async registrar(dto: RegistroVoluntarioDTO) {
    if (dto.password !== dto.confirmarPassword) {
        return { ok: false as const, mensaje: 'Las contraseñas no coinciden' };
    }

    if (process.env.VALIDAR_DOMINIO_INSTITUCIONAL === 'true' && !dto.correo.endsWith(DOMINIO_INSTITUCIONAL)) {
        return { ok: false as const, mensaje: `El correo debe ser institucional (${DOMINIO_INSTITUCIONAL})` };
    }

    const correoExistente = await this.usuarioRepository.buscarPorEmail(dto.correo);

    // Cuenta ACTIVA con ese correo -> sí es un duplicado real, se bloquea.
    if (correoExistente && correoExistente.estado === 'activo') {
        return { ok: false as const, mensaje: 'Ya existe una cuenta con ese correo' };
    }

    const perfilExistente = await this.usuarioRepository.buscarPerfilPorCodigoEstudiante(dto.codigoEstudiante);
    // El código de estudiante pertenece a OTRA persona (no es el mismo reintento) -> se bloquea.
    if (perfilExistente && (!correoExistente || perfilExistente.usuarioId !== correoExistente.id)) {
        return { ok: false as const, mensaje: 'Ya existe una cuenta con ese código de estudiante' };
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    // CASO REINTENTO: existe pero nunca se verificó -> se sobrescribe, no se bloquea.
    if (correoExistente && correoExistente.estado === 'pendiente_verificacion') {
        const usuario = new Usuario(correoExistente.id, dto.correo, passwordHash, correoExistente.rolId, 'pendiente_verificacion');
        const perfil = new PerfilVoluntario(
            correoExistente.id!, dto.codigoEstudiante, dto.nombres, dto.apellidos,
            dto.carrera, dto.ciclo, null, null, null, null, null, dto.intereses,
        );

        const guardado = await this.usuarioRepository.actualizarRegistroPendiente(usuario, perfil);
        await this.verificacionService.generarYEnviar(guardado.usuario.id!, guardado.usuario.correo, guardado.perfil.nombres);

        return { ok: true as const, usuarioId: guardado.usuario.id, mensaje: 'Cuenta creada. Revisa tu correo para verificar tu cuenta.' };
    }

    // CASO NORMAL: no existe nada todavía -> flujo de creación de siempre.
    const rolVoluntario = await this.rolRepository.buscarPorNombre('VOLUNTARIO');
    if (!rolVoluntario) {
        throw { status: 500, mensaje: 'No se encontró el rol VOLUNTARIO. Revisa el seed de la tabla roles.' };
    }

    const { usuario, perfil } = RegistroVoluntarioFactory.crear(
        {
            correo: dto.correo, passwordHash, codigoEstudiante: dto.codigoEstudiante,
            nombres: dto.nombres, apellidos: dto.apellidos, carrera: dto.carrera,
            ciclo: dto.ciclo, intereses: dto.intereses,
        },
        rolVoluntario.id,
    );

    const guardado = await this.usuarioRepository.registrarVoluntario(usuario, perfil);
    await this.verificacionService.generarYEnviar(guardado.usuario.id!, guardado.usuario.correo, guardado.perfil.nombres);

    return { ok: true as const, usuarioId: guardado.usuario.id, mensaje: 'Cuenta creada. Revisa tu correo para verificar tu cuenta.' };
}
}