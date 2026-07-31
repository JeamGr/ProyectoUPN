// Nota: aqui SI podemos importar el UsuarioModel real de usuarios/,
// porque ambas carpetas son hermanas dentro de "Autenticacion y Gestion
// de Cuentas" — no cruzamos la carpeta con tilde, ya estamos dentro.
import { Repository } from 'typeorm';
import { AppDataSource } from '../../../../../config/datasource';

import { UsuarioModel } from '../../../usuarios/infrastructure/models/usuario.model';
import { UsuarioMapping } from '../../../usuarios/infrastructure/mappings/usuario.mapping';
import { Usuario } from '../../../usuarios/domain/entities/Usuario';

import { OrganizacionModel } from '../models/organizacion.model';
import { IOrganizacionRepository } from '../../domain/repositories/IOrganizacionRepository';
import { Organizacion } from '../../domain/entities/Organizacion';

export class OrganizacionRepository implements IOrganizacionRepository {
    private repo: Repository<OrganizacionModel>;

    constructor() {
        this.repo = AppDataSource.getRepository(OrganizacionModel);
    }

    async buscarPorRuc(ruc: string): Promise<Organizacion | null> {
        const model = await this.repo.findOne({ where: { ruc } });
        return model ? this.mapear(model) : null;
    }

    async buscarPorUsuarioId(usuarioId: number): Promise<Organizacion | null> {
        const model = await this.repo.findOne({ where: { usuario_id: usuarioId } });
        return model ? this.mapear(model) : null;
    }

    async crearConUsuario(usuario: Usuario, organizacion: Organizacion) {
        return AppDataSource.transaction(async (manager) => {
            const usuarioModel = UsuarioMapping.toModel(usuario);
            const usuarioGuardado = await manager.save(UsuarioModel, usuarioModel);

            const orgModel = new OrganizacionModel();
            orgModel.usuario_id = usuarioGuardado.id;
            orgModel.nombre_ong = organizacion.nombreOng;
            orgModel.descripcion_actividad = organizacion.descripcionActividad;
            orgModel.linea_intervencion_id = organizacion.lineaIntervencionId;
            orgModel.categoria_id = organizacion.categoriaId;
            orgModel.pais = organizacion.pais;
            orgModel.direccion = organizacion.direccion;
            orgModel.persona_contacto = organizacion.personaContacto;
            orgModel.tipo_documento_contacto = organizacion.tipoDocumentoContacto;
            orgModel.numero_documento_contacto = organizacion.numeroDocumentoContacto;
            orgModel.celular_contacto = organizacion.celularContacto;
            orgModel.link_web = organizacion.linkWeb;
            orgModel.link_redes_sociales = organizacion.linkRedesSociales;
            orgModel.constituida_legalmente = organizacion.constituidaLegalmente;
            orgModel.ruc = organizacion.ruc;
            orgModel.razon_social = organizacion.razonSocial;
            orgModel.numero_beneficiarios_anual = organizacion.numeroBeneficiariosAnual;
            orgModel.tiene_certificado_donacion = organizacion.tieneCertificadoDonacion;
            orgModel.tiene_programa_voluntariado_corporativo = organizacion.tieneProgramaVoluntariadoCorporativo;

            const orgGuardada = await manager.save(OrganizacionModel, orgModel);

            return {
                usuario: UsuarioMapping.toDomain(usuarioGuardado),
                organizacion: this.mapear(orgGuardada),
            };
        });
    }

    private mapear(m: OrganizacionModel): Organizacion {
        return new Organizacion(
            Number(m.usuario_id), m.nombre_ong, m.direccion, m.persona_contacto,
            m.tipo_documento_contacto, m.numero_documento_contacto, m.celular_contacto,
            m.link_redes_sociales, m.constituida_legalmente, m.ruc, m.razon_social,
            m.tiene_certificado_donacion, m.descripcion_actividad, m.linea_intervencion_id,
            m.categoria_id, m.pais, m.link_web, m.numero_beneficiarios_anual,
            m.tiene_programa_voluntariado_corporativo, m.estado_validacion,
        );
    }
}