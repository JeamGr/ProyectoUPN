import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config();

export const AppDataSource = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'voluntariado_upn',

    // NUNCA en true en este proyecto: la BD ya la creamos a mano con
    // schema_final.sql. 'synchronize: true' haría que TypeORM intente
    // generar/alterar tablas solo, y puede romper lo que ya diseñamos.
    synchronize: false,

    logging: process.env.NODE_ENV === 'development',

    // Recoge TODOS los *.model.ts de cualquier módulo, sin importar
    // cuántas carpetas de profundidad tenga (funciona con tu carpeta
    // "Autenticación y Gestión de Cuentas" igual que con las demás).
    entities: [__dirname + '/../modules/**/infrastructure/models/*.model.ts'],
});