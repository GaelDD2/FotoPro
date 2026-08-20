import { Request, Response } from "express";
import { ReporteService } from "../services/reporte.service";

const service = new ReporteService();

export class ReporteController {
  financieroProfesional = async (req: Request, res: Response) => {
    const perfilProfesionalId = Number(req.params.id);
    const data = await service.financieroProfesional(perfilProfesionalId);
    res.json({ data });
  };
}