import { Router } from "express";
import { CitaController } from "../controllers/cita.controller";
import { validateRequest } from "../middlewares/validate-request.middleware";
import { createCitaSchema, updateCitaSchema } from "../dtos/cita.dto";
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

        return router;
    }

}   