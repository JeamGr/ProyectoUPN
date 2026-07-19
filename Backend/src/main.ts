import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
dotenv.config();

import { AppDataSource } from './config/datasource';
import { errorHandler } from './shared/middlewares/error.handler';
import authRoutes from './modules/Autenticacion y Gestion de Cuentas/usuarios/presentation/routes/auth.routes';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);

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