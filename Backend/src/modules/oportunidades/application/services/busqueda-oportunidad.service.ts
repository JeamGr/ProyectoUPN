import { IOportunidadRepository, FiltrosBusqueda } from '../../domain/repositories/IOportunidadRepository';

export class BusquedaOportunidadService {
    constructor(private oportunidadRepository: IOportunidadRepository) {}

    async buscarPublicadas(filtros: FiltrosBusqueda) {
        return this.oportunidadRepository.buscarPublicadas(filtros); // ya devuelve { datos, total }
    }

    async buscarRecomendadas(usuarioId: number) {
        return this.oportunidadRepository.buscarRecomendadasPara(usuarioId);
    }

    async buscarPorOrganizacion(organizacionId: number) {
        return this.oportunidadRepository.buscarPorOrganizacion(organizacionId);
    }
}