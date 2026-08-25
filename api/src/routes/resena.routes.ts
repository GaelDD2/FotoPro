import { Router } from "express";
import { ResenaController } from "../controllers/resena.controller";
import { validateRequest } from "../middlewares/validate-request.middleware";
import { createResenaSchema } from "../dtos/resena.dto";
import { asyncHandler } from "../middlewares/async-handler.middleware";

export class ResenaRoutes {

  static get routes(): Router {
    const router = Router();
    const controller = new ResenaController();

    // POST http://localhost:3000/resena
    router.post(
      "/",
      validateRequest(createResenaSchema),
      asyncHandler(controller.crear)
    );

    // GET http://localhost:3000/resena/cita/5
    router.get("/cita/:citaId", asyncHandler(controller.obtenerPorCita));

    // GET http://localhost:3000/resena/profesional/2
    router.get(
      "/profesional/:perfilProfesionalId",
      asyncHandler(controller.listarPorProfesional)
    );

    return router;
  }

}