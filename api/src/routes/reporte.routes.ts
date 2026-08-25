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

    // GET http://localhost:3000/reporte/citas/estado
    router.get("/citas/estado", asyncHandler(controller.citasPorEstado));

    // GET http://localhost:3000/reporte/citas/profesional
    router.get(
      "/citas/profesional",
      asyncHandler(controller.citasPorProfesionalTodos)
    );

    // GET http://localhost:3000/reporte/citas/profesional/1
    router.get(
      "/citas/profesional/:id",
      asyncHandler(controller.citasPorProfesionalUno)
    );

    // GET http://localhost:3000/reporte/calificaciones
    router.get("/calificaciones", asyncHandler(controller.calificaciones));

    return router;
  }
}