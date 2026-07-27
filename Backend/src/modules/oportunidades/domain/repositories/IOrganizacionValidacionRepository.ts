// =================================================================
// CAPA: Domain / Repositories (interfaz)
// Necesario para RN-01. Vive en su propio repositorio (no en
// IUsuarioRepository de M1) porque oportunidades solo necesita esta
// unica pregunta, no todo el modulo de usuarios acoplado.
// =================================================================

export interface IOrganizacionValidacionRepository {
    estaAprobada(organizacionId: number): Promise<boolean>;
}