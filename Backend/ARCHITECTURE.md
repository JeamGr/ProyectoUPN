# Arquitectura de Yanantin-Backend

Este backend implementa una **arquitectura en capas (layered architecture)**,
tal como lo exige la Sección 4 ("Arquitectura funcional de la plataforma")
del SRS de la Plataforma de Gestión de Voluntariado. **No es una
arquitectura MVC.**

## Por qué no es MVC

MVC (Model-View-Controller) es un patrón pensado para aplicaciones que
renderizan una interfaz de usuario: el *Controller* recibe la entrada, el
*Model* guarda el estado y la *View* la dibuja en pantalla. Este backend no
tiene View: es una API REST que solo devuelve JSON. Además, en MVC clásico
la lógica de negocio suele terminar mezclada dentro del Controller o del
Model, porque no existe una capa intermedia dedicada a las reglas de
negocio.

Aquí sí existe esa capa intermedia (`service/`), y el acceso a datos está
aislado en su propia capa (`repository/`). Eso es, por definición,
arquitectura en capas.

## Capas del proyecto

Cada módulo de negocio (`src/modules/<nombre>/`) se organiza en las mismas
siete carpetas, cada una correspondiente a una capa o responsabilidad:

| Carpeta        | Capa (según SRS §4)          | Responsabilidad                                                      | Equivalente en el proyecto Spring de referencia |
|----------------|-------------------------------|------------------------------------------------------------------------|---------------------------------------------------|
| `routes/`      | Presentación / API             | Define los endpoints HTTP y qué handler atiende cada uno.              | `@RequestMapping`                                  |
| `handler/`     | Presentación / API             | Recibe el `request`, delega en `service/` y arma la respuesta HTTP. Sin lógica de negocio. | `@RestController`                                  |
| `service/`     | Servicios / lógica de negocio  | Reglas de negocio, validaciones complejas, orquestación entre repositorios. | `@Service`                                         |
| `repository/`  | Acceso a datos                 | Consultas contra la base de datos vía Sequelize. Nada de lógica de negocio aquí. | `@Repository`                                      |
| `entity/`      | Persistencia                   | Definición de las tablas/entidades (modelos Sequelize).                | `@Entity`                                          |
| `validators/`  | Transversal                    | Esquemas Joi que validan el `body`/`params` antes de llegar al handler. | Bean Validation (`@Valid`)                         |
| `dto/`         | Transversal                    | Da forma a los datos de entrada/salida entre capas.                    | DTO                                                |
| `middleware/`  | Transversal                    | Lógica específica del módulo que se engancha al pipeline de Express.   | Interceptor/Filter                                 |

Flujo de una petición típica:

```
Cliente → routes/ → handler/ → service/ → repository/ → entity/ (Sequelize) → MySQL
```

El `handler` nunca llama directo al `repository`, y el `repository` nunca
contiene reglas de negocio: cada capa solo conoce a la capa inmediatamente
inferior. Middlewares transversales (`src/middlewares/`: autenticación,
manejo de errores, validación) están disponibles para todos los módulos.

## Nota sobre el nombrado (por qué "entity" y "handler", no "model" y "controller")

Antes, las carpetas se llamaban `model/` y `controller/`. Funcionalmente
nunca fueron MVC (la lógica de negocio siempre vivió en `service/`), pero
esos nombres se prestaban a confusión porque coinciden con dos de las tres
letras de "MVC". Se renombraron a `entity/` y `handler/` para eliminar esa
ambigüedad visual, alineándose además con la nomenclatura de Spring
(`@Entity`, y el rol de un `@RestController` como manejador de peticiones)
que usa el proyecto de referencia (Soweb) citado en el SRS.

Este cambio es puramente de nombres de carpetas/archivos: ninguna
tecnología, dependencia ni lógica de negocio fue modificada. Login,
registro y el resto de los RF-001 a RF-008 ya implementados siguen
funcionando exactamente igual.
