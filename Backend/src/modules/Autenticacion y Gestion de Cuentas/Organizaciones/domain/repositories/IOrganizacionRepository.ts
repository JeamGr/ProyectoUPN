import { Usuario } from '../../../usuarios/domain/entities/Usuario';
import { Organizacion } from '../entities/Organizacion';

export interface IOrganizacionRepository {
    buscarPorRuc(ruc: string): Promise<Organizacion | null>;
    buscarPorUsuarioId(usuarioId: number): Promise<Organizacion | null>;
    crearConUsuario(usuario: Usuario, organizacion: Organizacion): Promise<{ usuario: Usuario; organizacion: Organizacion }>;
}