import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { EstadoCita } from "../../generated/prisma";
import { citaService } from "../services/cita.service";
import { parseId } from "../utils/parse-id";
import { sendSuccess } from "../utils/http-response";

export class CitaController {

     listarAdmin = async (
        request: Request,
        response: Response,
        next: NextFunction
    ) => {

        try {

            const estado =
                request.query.estado
                    ? request.query.estado.toString().toUpperCase() as EstadoCita
                    : undefined;

            const profesionalId =
                request.query.profesionalId
                    ? Number(request.query.profesionalId)
                    : undefined;

            const fechaInicio =
                request.query.fechaInicio
                    ? new Date(request.query.fechaInicio.toString())
                    : undefined;

            const fechaFin =
                request.query.fechaFin
                    ? new Date(request.query.fechaFin.toString())
                    : undefined;

            const citas = await citaService.listarAdmin(
                estado,
                profesionalId,
                fechaInicio,
                fechaFin
            );

            return response.status(StatusCodes.OK).json({
                success: true,
                data: citas
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

        const cita = await citaService.details(id);

        if (!cita) {

            return response.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: "Cita no encontrada"
            });

        }

        return response.status(StatusCodes.OK).json({
            success: true,
            data: cita
        });

    } catch (error) {

        console.error(error);
        next(error);

    }

};

obtenerPorId = async (request: Request, response: Response, next: NextFunction) => {
    const id = parseId(request.params.id);
    const cita = await citaService.obtenerPorId(id);
    return sendSuccess(response, cita, "Cita obtenida correctamente");
  };

  crear = async (request: Request, response: Response, next: NextFunction) => {
    const cita = await citaService.crear(request.body);
    return sendSuccess(response, cita, "Cita registrada correctamente", StatusCodes.CREATED);
  };

  actualizar = async (request: Request, response: Response, next: NextFunction) => {
    const id   = parseId(request.params.id);
    const cita = await citaService.actualizar(id, request.body);
    return sendSuccess(response, cita, "Cita actualizada correctamente");
  };


  listarByUsuario = async (
    request: Request,
    response: Response,
    next: NextFunction
) => {

    try {

        const usuarioId = Number(request.params.usuarioId);

        const estado =
            request.query.estado
                ? request.query.estado.toString().toUpperCase() as EstadoCita
                : undefined;

        const profesionalId =
            request.query.profesionalId
                ? Number(request.query.profesionalId)
                : undefined;

        const fechaInicio =
            request.query.fechaInicio
                ? new Date(request.query.fechaInicio.toString())
                : undefined;

        const fechaFin =
            request.query.fechaFin
                ? new Date(request.query.fechaFin.toString())
                : undefined;

        const citas = await citaService.listarByUsuario(
            usuarioId,
            estado,
            profesionalId,
            fechaInicio,
            fechaFin
        );

        return response.status(StatusCodes.OK).json({
            success: true,
            data: citas
        });

    } catch (error) {

        console.error(error);
        next(error);

    }

};

listarByProfesional = async (
    request: Request,
    response: Response,
    next: NextFunction
) => {

    try {

        const profesionalId = Number(request.params.profesionalId);

const usuarioId =
    request.query.usuarioId
        ? Number(request.query.usuarioId)
        : undefined;

const estado =
    request.query.estado
        ? request.query.estado.toString().toUpperCase() as EstadoCita
        : undefined;

const fechaInicio =
    request.query.fechaInicio
        ? new Date(request.query.fechaInicio.toString())
        : undefined;

const fechaFin =
    request.query.fechaFin
        ? new Date(request.query.fechaFin.toString())
        : undefined;

const citas = await citaService.listarByProfesional(
    profesionalId,
    usuarioId,
    estado,
    fechaInicio,
    fechaFin
);

        return response.status(StatusCodes.OK).json({
            success: true,
            data: citas
        });

    } catch (error) {

        console.error(error);
        next(error);

    }

};

}