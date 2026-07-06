import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { categoriaService } from "../services/categoriaServicio.service";
import { parseId } from "../utils/parse-id";
import { sendSuccess } from "../utils/http-response";

export class CategoriaController {

    listar = async (
        request: Request,
        response: Response,
        next: NextFunction
    ) => {

        try {

            const nombre = request.query.nombre as string | undefined;

            const activo =
                request.query.activo !== undefined
                    ? request.query.activo === "true"
                    : undefined;

            const categorias =
                await categoriaService.listar(nombre, activo);

            return response.status(StatusCodes.OK).json({
                success: true,
                data: categorias
            });

        } catch (error) {
            console.error(error);
            next(error);
        }

    };

    cambiarEstado = async (request: Request, response: Response, next: NextFunction) => {
  const id = parseId(request.params.id);
  const { activo } = request.body;

  if (typeof activo !== "boolean") {
    return response.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: "El campo activo debe ser true o false",
    });
  }

  const categoria = await categoriaService.cambiarEstado(id, activo);
  return sendSuccess(response, categoria, `Categoría ${activo ? "activada" : "desactivada"} correctamente`);
};

}