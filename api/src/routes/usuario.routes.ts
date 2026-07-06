import { Router } from "express";
import { UsuarioController } from "../controllers/usuario.controller";
import { asyncHandler } from "../middlewares/async-handler.middleware";

export class UsuarioRoutes {
  static get routes(): Router {
    const router = Router();
    const controller = new UsuarioController();

    // localhost:3000/usuario
    router.get("/", controller.listar);

   
   

    // PATCH http://localhost:3000/usuario/1/estado
    router.patch("/:id/estado", asyncHandler(controller.cambiarEstado));

    // GET http://localhost:3000/usuario/7
    router.get("/:id", controller.usuarioById);


    return router;
  }
}