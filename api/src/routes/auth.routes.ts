import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { asyncHandler } from '../middlewares/async-handler.middleware';
import { validateRequest } from '../middlewares/validate-request.middleware';
import { authenticateToken } from '../middlewares/auth.middleware';
import { loginSchema, registerSchema } from '../dtos/auth.dto';

export class AuthRoutes {
  static get routes(): Router {
    const router     = Router();
    const controller = new AuthController();

    // POST http://localhost:3000/auth/login
    router.post(
      '/login',
      validateRequest(loginSchema),
      asyncHandler(controller.login)
    );

    // POST http://localhost:3000/auth/register
    router.post(
      '/register',
      validateRequest(registerSchema),
      asyncHandler(controller.register)
    );

    // GET http://localhost:3000/auth/perfil  (requiere token)
    router.get(
      '/perfil',
      authenticateToken,
      asyncHandler(controller.perfil)
    );

    return router;
  }
}