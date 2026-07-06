import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { usuarioService } from "../services/usuario.service";
import { parseId } from "../utils/parse-id";
import { sendSuccess } from "../utils/http-response";
import { Rol } from "../../generated/prisma";

export class UsuarioController {

   listar = async (
        request: Request,
        response: Response,
        next: NextFunction
    ) => {

        try {

            const nombre =
                request.query.nombre as string | undefined;

            const rol =
                request.query.rol
                    ? request.query.rol.toString().toUpperCase() as Rol
                    : undefined;

            const usuarios = await usuarioService.listar(
                nombre,
                rol
            );

            return response.status(StatusCodes.OK).json({
                success: true,
                data: usuarios
            });

        } catch (error) {

            console.error(error);
            next(error);

        }

    };

  

cambiarEstado = async (request: Request, response: Response, next: NextFunction) => {
  const id = parseId(request.params.id);
  const { estado } = request.body;

  if (estado !== "ACTIVO" && estado !== "INACTIVO") {
    return response.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: "El estado debe ser ACTIVO o INACTIVO",
    });
  }

  const usuario = await usuarioService.cambiarEstado(id, estado);
  return sendSuccess(response, usuario, `Usuario ${estado === "ACTIVO" ? "activado" : "desactivado"} correctamente`);
};
  

usuarioById = async (
    request: Request,
    response: Response,
    next: NextFunction
) => {

    try {

        const id = Number(request.params.id);

        const usuario = await usuarioService.usuarioById(id);

        if (!usuario) {

            return response.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: "Usuario no encontrado"
            });

        }

        return response.status(StatusCodes.OK).json({
            success: true,
            data: usuario
        });

    } catch (error) {

        console.error(error);
        next(error);

    }

};

}