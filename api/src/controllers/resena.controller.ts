import { Request, Response, NextFunction } from "express";
import { resenaService } from "../services/resena.service";
import { parseId } from "../utils/parse-id";
import { sendSuccess } from "../utils/http-response";
import { CreateResenaDto } from "../dtos/resena.dto";

export class ResenaController {

  crear = async (request: Request, response: Response, next: NextFunction) => {
    const dto: CreateResenaDto = request.body;
    const resena = await resenaService.crear(dto);
    return sendSuccess(response, resena, "Reseña registrada correctamente", 201);
  };

  obtenerPorCita = async (request: Request, response: Response, next: NextFunction) => {
    const citaId = parseId(request.params.citaId);
    const resena = await resenaService.obtenerPorCita(citaId);
    return sendSuccess(response, resena, "Consulta realizada correctamente");
  };

  listarPorProfesional = async (request: Request, response: Response, next: NextFunction) => {
    const perfilProfesionalId = parseId(request.params.perfilProfesionalId);
    const data = await resenaService.listarPorProfesional(perfilProfesionalId);
    return sendSuccess(response, data, "Reseñas obtenidas correctamente");
  };

}