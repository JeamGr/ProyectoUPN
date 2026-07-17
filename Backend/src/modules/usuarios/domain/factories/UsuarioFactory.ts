// =================================================================
// CAPA: Domain / Factories
// Centraliza la creación de un Usuario nuevo en estado de registro,
// para que ningún service tenga que "adivinar" los valores por defecto.
// =================================================================

import { Usuario } from '../entities/Usuario';

interface DatosRegistro {
    codigoEstudiante: string;
    nombres: string;
    apellidos: string;
    email: string;
    passwordHash: string;
    carrera: string;
    ciclo: number;
    intereses: number[];
}

export class UsuarioFactory {
    /**
     * Crea un Usuario recién registrado.
     * @param rolEstudianteId  id de la fila 'ESTUDIANTE' en la tabla roles
     *                         (se resuelve en el service, el domain no consulta BD).
     */
    static crearParaRegistro(datos: DatosRegistro, rolEstudianteId: number): Usuario {
        return new Usuario(
            null,
            datos.codigoEstudiante,
            datos.nombres,
            datos.apellidos,
            datos.email,
            datos.passwordHash,
            datos.carrera,
            datos.ciclo,
            rolEstudianteId,
            'PENDIENTE_VERIFICACION', // toda cuenta nueva nace sin verificar
            null,
            null,
            datos.intereses,
        );
    }
}