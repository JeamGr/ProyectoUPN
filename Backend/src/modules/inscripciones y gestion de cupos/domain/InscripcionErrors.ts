// =================================================================
// CAPA: Domain
// Errores de negocio propios de M5. El Service los captura para
// decidir un flujo alternativo (ej. mandar a lista de espera) en
// vez de simplemente fallar; el Controller los captura para
// traducirlos a un código HTTP claro.
// =================================================================

// Se lanza cuando, justo al momento de intentar tomar un cupo de forma
// atómica, otro voluntario ya lo tomó primero (condición de carrera).
// El Service atrapa este error y redirige al voluntario a lista de espera.
export class SinCupoError extends Error {
    constructor() {
        super('No quedan cupos disponibles en este momento');
        this.name = 'SinCupoError';
    }
}
