export interface ITokenInvalidadoRepository {
    invalidar(tokenHash: string, expiraEn: Date): Promise<void>;
    estaInvalidado(tokenHash: string): Promise<boolean>;
}