import { Router } from "express";
import { UsuarioController } from "../controllers/usuario.controller";
import { asyncHandler } from "../middlewares/async-handler.middleware";
import { validateRequest } from "../middlewares/validate-request.middleware";
import { updateUsuarioSchema } from "../dtos/usuario.dto";

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

    // PUT http://localhost:3000/usuario/:id
    router.put(
      '/:id',
      validateRequest(updateUsuarioSchema),
      asyncHandler(controller.actualizar)
    );


    return router;
  }
}