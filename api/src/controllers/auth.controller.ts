import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { authService } from '../services/auth.service';
import { sendSuccess } from '../utils/http-response';
import { parseId } from '../utils/parse-id';
import { AuthRequest } from '../middlewares/auth.middleware';

export class AuthController {

  login = async (request: Request, response: Response, next: NextFunction) => {
    try {
        const result = await authService.login(request.body);

        return sendSuccess(
            response,
            result,
            "Inicio de sesión correcto"
        );
    } catch (error) {
        const message = error instanceof Error
            ? error.message
            : "Credenciales incorrectas";

        if (
            message === "Correo o contraseña incorrectos" ||
            message === "El usuario se encuentra inactivo"
        ) {
            return response.status(StatusCodes.UNAUTHORIZED).json({
                success: false,
                message: "Credenciales incorrectas",
            });
        }

        next(error);
    }
};

  register = async (req: Request, res: Response, next: NextFunction) => {
    const resultado = await authService.register(req.body);
    return sendSuccess(res, resultado, 'Registro exitoso', StatusCodes.CREATED);
  };

  perfil = async (request: AuthRequest, response: Response, next: NextFunction) => {
        const usuarioId = request.user?.id;

        if (!usuarioId) {
            return response.status(StatusCodes.UNAUTHORIZED).json({
                success: false,
                message: "Usuario no autenticado: " + usuarioId,
            });
        }
        
        const usuario = await authService.perfil(usuarioId);
        if (!usuario) { 
            return response 
            .status(StatusCodes.NOT_FOUND) 
            .json({ success: false, message: "El usuario autenticado no existe: " + usuarioId }) 
        }
        return sendSuccess(
            response,
            usuario,
            "Perfil obtenido correctamente"
        );
    };
}