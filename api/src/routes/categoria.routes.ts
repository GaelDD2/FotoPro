import { Router } from "express";
import { CategoriaController } from "../controllers/categoriaServicio.controller";
import { asyncHandler } from "../middlewares/async-handler.middleware";


export class CategoriaRoutes {

    static get routes(): Router {

        const router = Router();
        const controller = new CategoriaController();

        // GET http://localhost:3000/categoria
        router.get("/", controller.listar);

        // PATCH http://localhost:3000/categoria/1/estado
        router.patch("/:id/estado", asyncHandler(controller.cambiarEstado));

        return router;
    }

}