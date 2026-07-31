import { Request, Response } from 'express';
import { MetricasService } from '../../application/services/metricas.service';

export class MetricasController {
    private service = new MetricasService();

    obtenerGlobales = async (req: Request, res: Response) => {
        const metricas = await this.service.obtenerMetricasGlobales();
        return res.status(200).json({ ok: true, ...metricas });
    };
}