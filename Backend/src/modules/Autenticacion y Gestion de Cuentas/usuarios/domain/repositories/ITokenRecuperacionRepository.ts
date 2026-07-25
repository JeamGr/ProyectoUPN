import { TokenRecuperacion } from '../entities/TokenRecuperacion';

export interface ITokenRecuperacionRepository {
    crear(token: TokenRecuperacion): Promise<void>;
    invalidarAnteriores(usuarioId: number): Promise<void>;
    buscarVigentePorUsuario(usuarioId: number): Promise<TokenRecuperacion | null>;
    marcarUsado(id: number): Promise<void>;
}