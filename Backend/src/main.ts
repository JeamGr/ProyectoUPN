import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
dotenv.config();
import oportunidadRoutes from './modules/oportunidades/presentation/routes/oportunidad.routes';
import { AppDataSource } from './config/datasource';
import { errorHandler } from './shared/middlewares/error.handler';
import { authHandler } from './shared/middlewares/auth.handler';
import authRoutes from './modules/Autenticacion y Gestion de Cuentas/usuarios/presentation/routes/auth.routes';
import organizacionRoutes from './modules/Autenticacion y Gestion de Cuentas/Organizaciones/presentation/routes/organizacion.routes';
import { createPerfilRouter } from './modules/gestion de perfiles/presentation/PerfilRoutes';
import { createInscripcionRouter } from './modules/inscripciones y gestion de cupos/presentation/InscripcionRoutes';
const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use('/oportunidades', oportunidadRoutes);
app.use('/auth', authRoutes);
app.use('/organizacion', organizacionRoutes);
app.use('/perfiles', createPerfilRouter(AppDataSource, authHandler()));
app.use('/inscripciones', createInscripcionRouter(AppDataSource, authHandler));

// SIEMPRE al final, después de todas las rutas
app.use(errorHandler);

AppDataSource.initialize()
    .then(() => {
        console.log('Conectado a la base de datos MySQL');
        app.listen(PORT, () => {
            console.log(`Servidor corriendo en http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error('Error al conectar a la base de datos:', error);
    });