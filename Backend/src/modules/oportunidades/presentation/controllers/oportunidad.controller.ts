import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

import { CrearOportunidadDTO } from '../../application/dtos/crear-oportunidad.dto';
import { RechazarOportunidadDTO } from '../../application/dtos/rechazar-oportunidad.dto';
import { BuscarOportunidadesDTO } from '../../application/dtos/buscar-oportunidades.dto';
import { OportunidadService } from '../../application/services/oportunidad.service';
import { BusquedaOportunidadService } from '../../application/services/busqueda-oportunidad.service';

import { OportunidadRepository } from '../../infrastructure/repositories/oportunidad.repository';
import { OrganizacionValidacionRepository } from '../../infrastructure/repositories/organizacion-validacion.repository';

export class OportunidadController {
    private oportunidadService: OportunidadService;
    private busquedaService: BusquedaOportunidadService;
    private oportunidadRepository: OportunidadRepository;

    constructor() {
        this.oportunidadRepository = new OportunidadRepository();
        const organizacionValidacionRepository = new OrganizacionValidacionRepository();

        this.oportunidadService = new OportunidadService(this.oportunidadRepository, organizacionValidacionRepository);
        this.busquedaService = new BusquedaOportunidadService(this.oportunidadRepository);
    }

    crear = async (req: Request, res: Response) => {
        const dto = req.dto as CrearOportunidadDTO;
        const organizacionId = req.jwt!.id;
        const resultado = await this.oportunidadService.crear(dto, organizacionId);
        return res.status(resultado.ok ? 201 : 400).json(resultado);
    };

    enviarARevision = async (req: Request, res: Response) => {
        const id = Number(req.params.id);
        const resultado = await this.oportunidadService.enviarARevision(id, req.jwt!.id);
        return res.status(resultado.ok ? 200 : 400).json(resultado);
    };

    aprobar = async (req: Request, res: Response) => {
        const id = Number(req.params.id);
        const resultado = await this.oportunidadService.aprobar(id, req.jwt!.id);
        return res.status(resultado.ok ? 200 : 400).json(resultado);
    };

    rechazar = async (req: Request, res: Response) => {
        const id = Number(req.params.id);
        const dto = req.dto as RechazarOportunidadDTO;
        const resultado = await this.oportunidadService.rechazar(id, req.jwt!.id, dto.motivoRechazo);
        return res.status(resultado.ok ? 200 : 400).json(resultado);
    };

    pausar = async (req: Request, res: Response) => {
        const resultado = await this.oportunidadService.pausar(Number(req.params.id), req.jwt!.id);
        return res.status(resultado.ok ? 200 : 400).json(resultado);
    };

    reanudar = async (req: Request, res: Response) => {
        const resultado = await this.oportunidadService.reanudar(Number(req.params.id), req.jwt!.id);
        return res.status(resultado.ok ? 200 : 400).json(resultado);
    };

    cerrar = async (req: Request, res: Response) => {
        const resultado = await this.oportunidadService.cerrar(Number(req.params.id), req.jwt!.id);
        return res.status(resultado.ok ? 200 : 400).json(resultado);
    };

    cancelar = async (req: Request, res: Response) => {
        const dto = req.dto as RechazarOportunidadDTO;
        const resultado = await this.oportunidadService.cancelar(Number(req.params.id), req.jwt!.id, dto.motivoRechazo);
        return res.status(resultado.ok ? 200 : 400).json(resultado);
    };

    buscarPublicadas = async (req: Request, res: Response) => {
        const q = req.query as any;
        const filtros = {
            lineaIntervencionId: q.lineaIntervencionId ? Number(q.lineaIntervencionId) : undefined,
            modalidad: q.modalidad,
            fechaDesde: q.fechaDesde ? new Date(q.fechaDesde) : undefined,
            fechaHasta: q.fechaHasta ? new Date(q.fechaHasta) : undefined,
            textoBusqueda: q.texto,
            ubicacionId: q.ubicacionId ? Number(q.ubicacionId) : undefined,
            horasMin: q.horasMin ? Number(q.horasMin) : undefined,
            horasMax: q.horasMax ? Number(q.horasMax) : undefined,
            ordenarPor: q.ordenarPor,
            pagina: q.pagina ? Number(q.pagina) : 1,
            porPagina: q.porPagina ? Number(q.porPagina) : 10,
        };
        const { datos, total } = await this.busquedaService.buscarPublicadas(filtros);
        return res.status(200).json({ ok: true, oportunidades: datos, total, pagina: filtros.pagina });
    };

    buscarRecomendadas = async (req: Request, res: Response) => {
        const resultados = await this.busquedaService.buscarRecomendadas(req.jwt!.id);
        return res.status(200).json({ ok: true, oportunidades: resultados });
    };

    buscarMias = async (req: Request, res: Response) => {
        const resultados = await this.busquedaService.buscarPorOrganizacion(req.jwt!.id);
        return res.status(200).json({ ok: true, oportunidades: resultados });
    };

    obtenerPorId = async (req: Request, res: Response) => {
        const id = Number(req.params.id);
        const oportunidad = await this.oportunidadRepository.buscarPorId(id);
        if (!oportunidad) return res.status(404).json({ ok: false, mensaje: 'Oportunidad no encontrada' });
        return res.status(200).json({ ok: true, oportunidad });
    };
    subirImagen = async (req: Request, res: Response) => {
        const id = Number(req.params.id);
        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({ ok: false, mensaje: 'Id de oportunidad inválido' });
        }
        if (!req.file) {
            return res.status(400).json({ ok: false, mensaje: 'No se recibió ninguna imagen' });
        }

        const url = `/uploads/oportunidades/${req.file.filename}`;

        try {
            const resultado = await this.oportunidadService.subirImagen(id, req.jwt!.id, url);

            if (!resultado.ok) {
                // El archivo ya se guardó en disco por multer antes de llegar aquí;
                // si el negocio lo rechaza (no existe / no es dueño / estado inválido),
                // se borra para no dejar huérfanos.
                this.borrarArchivoSiExiste(req.file.filename);
                return res.status(400).json(resultado);
            }

            // Reemplazo exitoso: se borra la imagen anterior (si tenía una) para no
            // acumular archivos huérfanos en /uploads/oportunidades.
            if (resultado.imagenAnterior) {
                this.borrarArchivoSiExiste(path.basename(resultado.imagenAnterior));
            }

            return res.status(200).json({ ok: true, imagenUrl: url });
        } catch (error) {
            // Si algo falla después de que multer ya escribió el archivo, se limpia
            // para no dejarlo huérfano en disco.
            this.borrarArchivoSiExiste(req.file.filename);
            throw error; // lo atrapa errorHandler
        }
    };

    private borrarArchivoSiExiste(filename: string) {
        const ruta = path.join(process.cwd(), 'uploads', 'oportunidades', filename);
        fs.unlink(ruta, (err) => {
            if (err && err.code !== 'ENOENT') {
                console.error('[subirImagen] No se pudo borrar el archivo anterior:', err);
            }
        });
    }
}