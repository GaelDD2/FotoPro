import { Router } from "express";
import { ReporteController } from "../controllers/reporte.controller";
import { asyncHandler } from "../middlewares/async-handler.middleware";

export class ReporteRoutes {
  static get routes(): Router {
    const router = Router();
    const controller = new ReporteController();

    // GET http://localhost:3000/reporte/profesional/1/financiero
    router.get(
      "/profesional/:id/financiero",
      asyncHandler(controller.financieroProfesional)
    );

    return router;
  }
}