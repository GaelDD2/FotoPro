import { Router } from "express";
import { ServicioController } from "../controllers/servicio.controller";
import { validateRequest } from "../middlewares/validate-request.middleware";
import { createServicioSchema, updateServicioSchema } from "../dtos/servicio.dto";
import { asyncHandler } from "../middlewares/async-handler.middleware";


export class ServicioRoutes {

    static get routes(): Router {

        const router = Router();
        const controller = new ServicioController();

        // GET http://localhost:3000/servicio
        router.get("/", controller.listar);

        // GET http://localhost:3000/servicio/1
        router.get("/:id", controller.details);
        
        // POST http://localhost:3000/servicio
    router.post(
      "/",
      validateRequest(createServicioSchema),
      asyncHandler(controller.crear)
    );

    // PUT http://localhost:3000/servicio/1
    router.put(
      "/:id",
      validateRequest(updateServicioSchema),
      asyncHandler(controller.actualizar)
    );

    // PATCH http://localhost:3000/servicio/1/estado
    router.patch("/:id/estado", asyncHandler(controller.cambiarEstado));


        return router;
    }

}   