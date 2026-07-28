import { Request, Response } from 'express';

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
}