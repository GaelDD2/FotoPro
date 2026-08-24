import { Router } from "express";
import { CitaController } from "../controllers/cita.controller";
import { validateRequest } from "../middlewares/validate-request.middleware";
import { aceptarCitaSchema, cancelarCitaSchema, completarCitaSchema, createCitaSchema, rechazarCitaSchema, updateCitaSchema } from "../dtos/cita.dto";
import { asyncHandler } from "../middlewares/async-handler.middleware";


export class CitaRoutes {

    static get routes(): Router {

        const router = Router();
        const controller = new CitaController();

        // GET http://localhost:3000/cita
        router.get("/", controller.listarAdmin);

         // GET http://localhost:3000/cita/1
        router.get("/:id", controller.details);

        //GET http://localhost:3000/cita/usuario/5
        router.get("/usuario/:usuarioId", controller.listarByUsuario);

        //GET http://localhost:3000/cita/profesional/5 PROFESIONAL
        router.get("/profesional/:profesionalId", controller.listarByProfesional);

        // POST http://localhost:3000/cita
    router.post(
      "/",
      validateRequest(createCitaSchema),
      asyncHandler(controller.crear)
    );

    // PUT http://localhost:3000/cita/1
    router.put(
      "/:id",
      validateRequest(updateCitaSchema),
      asyncHandler(controller.actualizar)
    );

    // PATCH http://localhost:3000/cita/1/aceptar  (PROFESIONAL)
        router.patch(
          "/:id/aceptar",
          validateRequest(aceptarCitaSchema),
          asyncHandler(controller.aceptar)
        );

        // PATCH http://localhost:3000/cita/1/rechazar  (PROFESIONAL)
        router.patch(
          "/:id/rechazar",
          validateRequest(rechazarCitaSchema),
          asyncHandler(controller.rechazar)
        );

        // PATCH http://localhost:3000/cita/1/cancelar  (CLIENTE o PROFESIONAL)
        router.patch(
          "/:id/cancelar",
          validateRequest(cancelarCitaSchema),
          asyncHandler(controller.cancelar)
        );

        // PATCH http://localhost:3000/cita/1/completar  (PROFESIONAL)
        router.patch(
          "/:id/completar",
          validateRequest(completarCitaSchema),
          asyncHandler(controller.completar)
        );

        // GET
        router.get("/:id/historial", asyncHandler(controller.historial));

        return router;
    }

}   