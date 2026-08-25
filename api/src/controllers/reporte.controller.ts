import { Request, Response } from "express";
import { ReporteService } from "../services/reporte.service";
import { calificacionesQuerySchema, citasPorEstadoQuerySchema, citasPorProfesionalQuerySchema } from "../dtos/reporte.dto";
import { AppError } from "../utils/app-error";

const service = new ReporteService();

export class ReporteController {
  financieroProfesional = async (req: Request, res: Response) => {
    const perfilProfesionalId = Number(req.params.id);
    const data = await service.financieroProfesional(perfilProfesionalId);
    res.json({ data });
  };


  citasPorEstado = async (req: Request, res: Response) => {
    const parsed = citasPorEstadoQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      throw AppError.badRequest(parsed.error.issues[0].message);
    }
    const data = await service.citasPorEstado(parsed.data);
    res.json({ data });
  };

  // GET /reporte/citas/profesional  (admin: todos, filtrable por ?perfilProfesionalId=)
  citasPorProfesionalTodos = async (req: Request, res: Response) => {
    const parsed = citasPorProfesionalQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      throw AppError.badRequest(parsed.error.issues[0].message);
    }
    const data = await service.citasPorProfesional(parsed.data);
    res.json({ data });
  };

  // GET /reporte/citas/profesional/:id  (vista propia del profesional)
  citasPorProfesionalUno = async (req: Request, res: Response) => {
    const perfilProfesionalId = Number(req.params.id);
    const parsed = citasPorProfesionalQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      throw AppError.badRequest(parsed.error.issues[0].message);
    }
    const data = await service.citasPorProfesional({
      ...parsed.data,
      perfilProfesionalId,
    });
    res.json({ data });
  };

  // GET /reporte/calificaciones  (todos, o uno vía ?perfilProfesionalId=)
  calificaciones = async (req: Request, res: Response) => {
    const parsed = calificacionesQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      throw AppError.badRequest(parsed.error.issues[0].message);
    }
    const data = await service.calificaciones(parsed.data);
    res.json({ data });
  };
}