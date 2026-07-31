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
import { crearCatalogoRouter } from './modules/administrador/presentation/routes/catalogo.routes';
import { crearParametroRouter } from './modules/administrador/presentation/routes/parametro.routes';
import { crearRolPermisoRouter } from './modules/administrador/presentation/routes/rol-permiso.routes';
import asistenciaRoutes from './modules/asistencia/presentation/routes/asistencia.routes';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use('/oportunidades', oportunidadRoutes);
app.use('/auth', authRoutes);
app.use('/organizacion', organizacionRoutes);
app.use('/perfiles', createPerfilRouter(AppDataSource, authHandler()));
app.use('/inscripciones', createInscripcionRouter(AppDataSource, authHandler));

// M12 — RF-057: catálogos administrables
app.use('/administrador/catalogos/lineas-intervencion', crearCatalogoRouter('linea_intervencion'));
app.use('/administrador/catalogos/categorias-organizacion', crearCatalogoRouter('categoria_organizacion'));
app.use('/administrador/catalogos/ubicaciones', crearCatalogoRouter('ubicacion'));

// M12 — RF-058: parámetros generales del sistema
app.use('/administrador/parametros', crearParametroRouter());

// M12 — RF-059: gestión de roles y permisos granular (exclusivo Super Admin)
app.use('/administrador/roles', crearRolPermisoRouter());

// M6 — Asistencia, evidencias y cumplimiento
app.use('/asistencia', asistenciaRoutes);

// Sirve las imágenes/evidencias como archivos públicos
app.use('/uploads', express.static('uploads'));

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