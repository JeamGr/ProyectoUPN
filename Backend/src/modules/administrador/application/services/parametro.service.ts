// =================================================================
// CAPA: Application / Services
// =================================================================
import { IParametroRepository } from '../../domain/repositories/IParametroRepository';
import { ParametroSistema } from '../../domain/entities/ParametroSistema';
import { GuardarParametroDTO } from '../dtos/parametro.dto';

type Resultado<T = {}> = ({ ok: true } & T) | { ok: false; mensaje: string };

export class ParametroService {
    constructor(private parametroRepository: IParametroRepository) {}

    async listar(): Promise<ParametroSistema[]> {
        return this.parametroRepository.listar();
    }

    async obtener(clave: string): Promise<Resultado<{ parametro: ParametroSistema }>> {
        const parametro = await this.parametroRepository.buscarPorClave(clave);
        if (!parametro) return { ok: false, mensaje: 'Parámetro no encontrado' };
        return { ok: true, parametro };
    }

    // Upsert deliberado: RF-058 no exige un alta separada de "crear
    // parámetro nuevo" vs "editar uno existente" — el admin simplemente
    // fija el valor de una clave, exista o no todavía.
    async guardar(clave: string, dto: GuardarParametroDTO, adminId: number): Promise<Resultado<{ parametro: ParametroSistema }>> {
        const parametro = await this.parametroRepository.guardarOActualizar(
            clave.trim(),
            dto.valor.trim(),
            dto.descripcion?.trim() ?? null,
            adminId,
        );
        return { ok: true, parametro };
    }
}
