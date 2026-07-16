// =================================================================
// CAPA: Application / Services
// Orquesta el caso de uso completo de registro:
//   1. Verifica que correo y código de estudiante no existan
//   2. Verifica que las contraseñas coincidan
//   3. Hashea el password
//   4. Crea el usuario + sus intereses (transacción)
//   5. Dispara la generación y envío del código de verificación
// =================================================================
import bcrypt from 'bcrypt';

import { RegistroDTO } from '../dtos/registro.dto';
import { UsuarioFactory } from '../../domain/factories/UsuarioFactory';
import { IUsuarioRepository } from '../../domain/repositories/IUsuarioRepository';
import { VerificacionService } from './verificacion.service';

const ROL_ESTUDIANTE_ID = 1; // fila 'ESTUDIANTE' del seed de la tabla roles

export class RegistroService {
    constructor(
        private usuarioRepository: IUsuarioRepository,
        private verificacionService: VerificacionService,
    ) {}

    // registro.service.ts — SOLO el método registrar() corregido
async registrar(dto: RegistroDTO) {
    if (dto.password !== dto.confirmarPassword) {
        return { ok: false as const, mensaje: 'Las contraseñas no coinciden' };
    }

    const correoExistente = await this.usuarioRepository.buscarPorEmail(dto.email);
    if (correoExistente) {
        return { ok: false as const, mensaje: 'Ya existe una cuenta con ese correo' };
    }

    const codigoExistente = await this.usuarioRepository.buscarPorCodigoEstudiante(dto.codigoEstudiante);
    if (codigoExistente) {
        return { ok: false as const, mensaje: 'Ya existe una cuenta con ese código de estudiante' };
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const usuarioNuevo = UsuarioFactory.crearParaRegistro(
        { codigoEstudiante: dto.codigoEstudiante, nombres: dto.nombres, apellidos: dto.apellidos,
          email: dto.email, passwordHash, carrera: dto.carrera, ciclo: dto.ciclo, intereses: dto.intereses },
        ROL_ESTUDIANTE_ID,
    );

    const usuarioGuardado = await this.usuarioRepository.crearConIntereses(usuarioNuevo);
    await this.verificacionService.generarYEnviar(usuarioGuardado.id!, usuarioGuardado.email, usuarioGuardado.nombres);

    return { ok: true as const, usuarioId: usuarioGuardado.id, mensaje: 'Cuenta creada. Revisa tu correo para verificar tu cuenta.' };
}
}