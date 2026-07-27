export interface IIdentidadOAuthRepository {
    buscarPorProveedor(proveedor: string, proveedorUid: string): Promise<{ usuarioId: number } | null>;
    vincular(usuarioId: number, proveedor: string, proveedorUid: string, correoProveedor: string): Promise<void>;
}