import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { EspecialidadService } from "../services/especialidad.service";
import { parseId } from "../utils/parse-id";
import { sendSuccess } from "../utils/http-response";

export class EspecialidadController {

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

            const especialidades=
                await EspecialidadService.listar(nombre, activo);

            return response.status(StatusCodes.OK).json({
                success: true,
                data: especialidades
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

  const especialidad = await EspecialidadService.cambiarEstado(id, activo);
  return sendSuccess(response, especialidad, `Especialidad ${activo ? "activada" : "desactivada"} correctamente`);
};

}