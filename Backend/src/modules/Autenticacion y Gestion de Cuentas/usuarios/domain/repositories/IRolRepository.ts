// =================================================================
// CAPA: Domain / Repositories (interfaz)
// Con 4 roles reales en la tabla `roles`, ya no podemos "adivinar"
// que VOLUNTARIO siempre es el id 1 — hay que resolverlo por nombre.
// =================================================================

export interface IRolRepository {
    buscarPorNombre(nombre: string): Promise<{ id: number; nombre: string } | null>;
}