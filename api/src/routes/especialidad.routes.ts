import { Router } from "express";
import { EspecialidadController } from "../controllers/especialidad.controller";
import { asyncHandler } from "../middlewares/async-handler.middleware";


export class EspecialidadRoutes {

    static get routes(): Router {

        const router = Router();
        const controller = new EspecialidadController();

        // GET http://localhost:3000/especialidad
        router.get("/", controller.listar);

        // PATCH http://localhost:3000/especialidad/1/estado
        router.patch("/:id/estado", asyncHandler(controller.cambiarEstado));

        return router;
    }

}