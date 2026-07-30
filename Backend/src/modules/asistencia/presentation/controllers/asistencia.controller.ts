import { Request, Response } from 'express';

import { RegistrarAsistenciaDTO } from '../../application/dtos/registrar-asistencia.dto';
import { SubirEvidenciaDTO } from '../../application/dtos/subir-evidencia.dto';
import { ReportarIncidenciaDTO } from '../../application/dtos/reportar-incidencia.dto';
import { ActualizarEstadoIncidenciaDTO } from '../../application/dtos/actualizar-estado-incidencia.dto';

import { AsistenciaService } from '../../application/services/asistencia.service';
import { EvidenciaService } from '../../application/services/evidencia.service';
import { IncidenciaService } from '../../application/services/incidencia.service';

import { AsistenciaRepository } from '../../infrastructure/repositories/asistencia.repository';
import { EvidenciaRepository } from '../../infrastructure/repositories/evidencia.repository';
import { IncidenciaRepository } from '../../infrastructure/repositories/incidencia.repository';
import { InscripcionConsultaRepository } from '../../infrastructure/repositories/inscripcion-consulta.repository';

export class AsistenciaController {
    private asistenciaService: AsistenciaService;
    private evidenciaService: EvidenciaService;
    private incidenciaService: IncidenciaService;

    constructor() {
        const inscripcionRepository = new InscripcionConsultaRepository();
        this.asistenciaService = new AsistenciaService(new AsistenciaRepository(), inscripcionRepository);
        this.evidenciaService = new EvidenciaService(new EvidenciaRepository(), inscripcionRepository);
        this.incidenciaService = new IncidenciaService(new IncidenciaRepository(), inscripcionRepository);
    }

    // ---- Asistencia ----
    registrarAsistencia = async (req: Request, res: Response) => {
        const dto = req.dto as RegistrarAsistenciaDTO;
        const resultado = await this.asistenciaService.registrarManual(dto, req.jwt!.id);
        return res.status(resultado.ok ? 201 : 400).json(resultado);
    };

    listarAsistenciaPorOportunidad = async (req: Request, res: Response) => {
        const oportunidadId = Number(req.params.oportunidadId);
        const resultado = await this.asistenciaService.listarPorOportunidad(oportunidadId, req.jwt!.id);
        return res.status(resultado.ok ? 200 : 403).json(resultado);
    };

    misHorasAcumuladas = async (req: Request, res: Response) => {
        const horas = await this.asistenciaService.horasAcumuladas(req.jwt!.id);
        return res.status(200).json({ ok: true, horasAcumuladas: horas });
    };

    // ---- Evidencias ----
    subirEvidencia = async (req: Request, res: Response) => {
        const dto = req.dto as SubirEvidenciaDTO;
        if (!req.file) return res.status(400).json({ ok: false, mensaje: 'No se recibió ningún archivo' });

        const url = `/uploads/evidencias/${req.file.filename}`;
        const resultado = await this.evidenciaService.subir(
            dto.inscripcionId, dto.tipo, url, req.jwt!.id, dto.contenidoSensible, dto.descripcion,
        );
        return res.status(resultado.ok ? 201 : 400).json(resultado);
    };

    galeriaPublica = async (req: Request, res: Response) => {
        const datos = await this.evidenciaService.listarPublicas(Number(req.params.oportunidadId));
        return res.status(200).json({ ok: true, datos });
    };

    galeriaCompleta = async (req: Request, res: Response) => {
        const resultado = await this.evidenciaService.listarCompleta(Number(req.params.oportunidadId), req.jwt!.id);
        return res.status(resultado.ok ? 200 : 403).json(resultado);
    };

    // ---- Incidencias ----
    reportarIncidencia = async (req: Request, res: Response) => {
        const dto = req.dto as ReportarIncidenciaDTO;
        const esOrganizacion = req.jwt!.rol === 'ORGANIZACION';
        const resultado = await this.incidenciaService.reportar(
            dto.oportunidadId, dto.categoria, dto.descripcion, req.jwt!.id, esOrganizacion, dto.severidad, dto.inscripcionId,
        );
        return res.status(resultado.ok ? 201 : 400).json(resultado);
    };

    listarIncidencias = async (req: Request, res: Response) => {
        const datos = await this.incidenciaService.listarPorOportunidad(Number(req.params.oportunidadId));
        return res.status(200).json({ ok: true, datos });
    };

    actualizarEstadoIncidencia = async (req: Request, res: Response) => {
        const dto = req.dto as ActualizarEstadoIncidenciaDTO;
        const resultado = await this.incidenciaService.actualizarEstado(Number(req.params.id), dto.estado, req.jwt!.id);
        return res.status(resultado.ok ? 200 : 400).json(resultado);
    };
}