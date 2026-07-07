import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { Modalidad } from "../../generated/prisma";
import { perfilProfesionalService } from "../services/perfilProfesional.service";
import { sendSuccess } from "../utils/http-response";
import { parseId } from "../utils/parse-id";

export class PerfilProfesionalController {

    listar = async (
        request: Request,
        response: Response,
        next: NextFunction
    ) => {

        try {

            const nombre =
                request.query.nombre as string | undefined;

            const modalidad =
                request.query.modalidad
                    ? request.query.modalidad.toString().toUpperCase() as Modalidad
                    : undefined;

            const disponible =
                request.query.disponible !== undefined
                    ? request.query.disponible === "true"
                    : undefined;

            const profesionales =
                await perfilProfesionalService.listar(
                    nombre,
                    modalidad,
                    disponible
                );

            return response.status(StatusCodes.OK).json({
                success: true,
                data: profesionales
            });

        } catch (error) {
            console.error(error);
            next(error);
        }

    };

    details = async (
    request: Request,
    response: Response,
    next: NextFunction
) => {

    try {

        const id = Number(request.params.id);

        const profesional = await perfilProfesionalService.details(id);

        if (!profesional) {

            return response.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: "Profesional no encontrado"
            });

        }

        return response.status(StatusCodes.OK).json({
            success: true,
            data: profesional
        });

    } catch (error) {

        console.error(error);
        next(error);

    }

};

obtenerPorUsuarioId = async (
    request: Request,
    response: Response,
    next: NextFunction
) => {

    try {

        const usuarioId = Number(request.params.usuarioId);

        const profesional =
            await perfilProfesionalService.obtenerPorUsuarioId(usuarioId);

        if (!profesional) {

            return response.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: "Profesional no encontrado"
            });

        }

        return response.status(StatusCodes.OK).json({
            success: true,
            data: profesional
        });

    } catch (error) {

        console.error(error);
        next(error);

    }

};

crear = async (request: Request, response: Response, next: NextFunction) => {
    const perfil = await perfilProfesionalService.crear(request.body);
    return sendSuccess(response, perfil, "Perfil profesional creado correctamente", StatusCodes.CREATED);
  };

  actualizar = async (request: Request, response: Response, next: NextFunction) => {
    const id = parseId(request.params.id);
    const perfil = await perfilProfesionalService.actualizar(id, request.body);
    return sendSuccess(response, perfil, "Perfil profesional actualizado correctamente");
  };

  cambiarDisponibilidad = async (request: Request, response: Response, next: NextFunction) => {
    const id = parseId(request.params.id);
    const { disponible } = request.body;

    if (typeof disponible !== "boolean") {
      return response.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "El campo disponible debe ser true o false",
      });
    }

    const perfil = await perfilProfesionalService.cambiarDisponibilidad(id, disponible);
    return sendSuccess(response, perfil, `Disponibilidad actualizada correctamente`);
  };

}