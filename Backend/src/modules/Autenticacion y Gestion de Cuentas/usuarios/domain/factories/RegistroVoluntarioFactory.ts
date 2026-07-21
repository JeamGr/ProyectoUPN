// =================================================================
// CAPA: Domain / Factories
// Crea el par Usuario + PerfilVoluntario listos para el registro,
// con los defaults correctos (estado pendiente de verificar).
// =================================================================

import { Usuario } from '../entities/Usuario';
import { PerfilVoluntario } from '../entities/PerfilVoluntario';

interface DatosRegistroVoluntario {
    correo: string;
    passwordHash: string;
    codigoEstudiante: string;
    nombres: string;
    apellidos: string;
    carrera: string;
    ciclo: number;
    intereses: number[];
}

export class RegistroVoluntarioFactory {
    static crear(datos: DatosRegistroVoluntario, rolVoluntarioId: number): {
        usuario: Usuario;
        perfil: PerfilVoluntario;
    } {
        const usuario = new Usuario(
            null,
            datos.correo,
            datos.passwordHash,
            rolVoluntarioId,
            'pendiente_verificacion',
        );

        // usuarioId se completa despues, cuando el usuario ya tenga id (post-insert)
        const perfil = new PerfilVoluntario(
            0, // placeholder, el repository lo reemplaza con el id real tras crear `usuario`
            datos.codigoEstudiante,
            datos.nombres,
            datos.apellidos,
            datos.carrera,
            datos.ciclo,
            null, null, null, null, null,
            datos.intereses,
        );

        return { usuario, perfil };
    }
}