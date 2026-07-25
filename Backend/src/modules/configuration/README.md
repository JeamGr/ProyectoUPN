# Módulo `configuration`

Arquitectura en capas (no MVC) — ver [`/ARCHITECTURE.md`](../../../ARCHITECTURE.md) en la raíz del backend para el detalle completo.

| Carpeta | Capa | Contiene |
|---|---|---|
| `routes/` | Presentación | Endpoints HTTP de este módulo |
| `handler/` | Presentación | Recibe el request y llama a `service/` |
| `service/` | Lógica de negocio | Reglas de negocio del módulo |
| `repository/` | Acceso a datos | Consultas Sequelize |
| `entity/` | Persistencia | Modelos/tablas Sequelize |
| `validators/` | Transversal | Esquemas Joi |
| `dto/` | Transversal | Forma de entrada/salida |
| `middleware/` | Transversal | Middlewares propios del módulo |
