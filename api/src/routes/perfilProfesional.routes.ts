import { Router } from "express";
import { PerfilProfesionalController } from "../controllers/perfilProfesional.controller";
import { createPerfilProfesionalSchema, updatePerfilProfesionalSchema } from "../dtos/perfilProfesional.dto";
import { asyncHandler } from "../middlewares/async-handler.middleware";
import { validateRequest } from "../middlewares/validate-request.middleware";


export class PerfilProfesionalRoutes {

    static get routes(): Router {

        const router = Router();
        const controller = new PerfilProfesionalController();

        // GET http://localhost:3000/profesional
        router.get("/", controller.listar);

         // GET http://localhost:3000/profesional/1
        router.get("/:id", controller.details);
        
        //GET http://localhost:3000/profesional/usuario/7
        router.get("/usuario/:usuarioId", controller.obtenerPorUsuarioId);

        router.post(
      "/",
      validateRequest(createPerfilProfesionalSchema),
      asyncHandler(controller.crear)
    );

    // PATCH http://localhost:3000/profesional/1/disponibilidad
    router.patch("/:id/disponibilidad", asyncHandler(controller.cambiarDisponibilidad));

    // PUT http://localhost:3000/profesional/1
    router.put(
      "/:id",
      validateRequest(updatePerfilProfesionalSchema),
      asyncHandler(controller.actualizar)
    );


        return router;
    }

}