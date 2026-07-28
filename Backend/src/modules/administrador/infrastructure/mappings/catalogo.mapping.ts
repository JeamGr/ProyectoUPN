import { ItemCatalogo, TipoCatalogo } from '../../domain/entities/ItemCatalogo';
import { LineaIntervencionModel, CategoriaOrganizacionModel, UbicacionModel } from '../models/catalogo.model';

type CatalogoModelAny = LineaIntervencionModel | CategoriaOrganizacionModel | UbicacionModel;

export class CatalogoMapping {
    static toDomain(tipo: TipoCatalogo, model: CatalogoModelAny): ItemCatalogo {
        const icono = 'icono' in model ? (model as LineaIntervencionModel).icono : null;
        return new ItemCatalogo(model.id, tipo, model.nombre, model.estado, icono);
    }
}
