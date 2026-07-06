import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { Modalidad } from "../../generated/prisma";
import { servicioService } from "../services/servicio.service";
import { parseId } from "../utils/parse-id";
import { sendSuccess } from "../utils/http-response";

export class ServicioController {

    listar = async (
        request: Request,
        response: Response,
        next: NextFunction
    ) => {

        try {

            const nombre =
                request.query.nombre as string | undefined;

            const categoriaId =
                request.query.categoriaId
                    ? Number(request.query.categoriaId)
                    : undefined;

            const modalidad =
                request.query.modalidad
                    ? request.query.modalidad.toString().toUpperCase() as Modalidad
                    : undefined;

            const precioMin =
                request.query.precioMin
                    ? Number(request.query.precioMin)
                    : undefined;

            const precioMax =
                request.query.precioMax
                    ? Number(request.query.precioMax)
                    : undefined;

            const servicios = await servicioService.listar(
                nombre,
                categoriaId,
                modalidad,
                precioMin,
                precioMax
            );

            return response.status(StatusCodes.OK).json({
                success: true,
                data: servicios
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

        const servicio = await servicioService.details(id);

        if (!servicio) {

            return response.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: "Servicio no encontrado"
            });

        }

        return response.status(StatusCodes.OK).json({
            success: true,
            data: servicio
        });

    } catch (error) {

        console.error(error);
        next(error);

    }

    };

    obtenerPorId = async (request: Request, response: Response, next: NextFunction) => {
    const id = parseId(request.params.id);
    const servicio = await servicioService.obtenerPorId(id);
    return sendSuccess(response, servicio, "Servicio obtenido correctamente");
  };

  crear = async (request: Request, response: Response, next: NextFunction) => {
    const servicio = await servicioService.crear(request.body);
    return sendSuccess(response, servicio, "Servicio creado correctamente", StatusCodes.CREATED);
  };

  actualizar = async (request: Request, response: Response, next: NextFunction) => {
    const id = parseId(request.params.id);
    const servicio = await servicioService.actualizar(id, request.body);
    return sendSuccess(response, servicio, "Servicio actualizado correctamente");
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

    const servicio = await servicioService.cambiarEstado(id, activo);
    return sendSuccess(response, servicio, `Servicio ${activo ? "activado" : "desactivado"} correctamente`);
  };

}