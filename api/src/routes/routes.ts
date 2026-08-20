import { Router } from 'express';
import { UsuarioRoutes } from './usuario.routes';
import { CategoriaRoutes } from './categoria.routes';
import { EspecialidadRoutes } from './especialidad.routes';
import { PerfilProfesionalRoutes } from './perfilProfesional.routes';
import { ServicioRoutes } from './servicio.routes';
import { CitaRoutes } from './cita.routes';
import { ImageRoutes } from './image.routes';
import { ReporteRoutes } from './reporte.routes';
import { AuthRoutes } from './auth.routes';

export class AppRoutes {
    static get routes(): Router {
        const router = Router();
        // ----Agregar las rutas----
        router.use('/usuario', UsuarioRoutes.routes)   
        router.use('/auth', AuthRoutes.routes);
        router.use("/categoria", CategoriaRoutes.routes);
        router.use("/especialidad", EspecialidadRoutes.routes);
        router.use("/profesional", PerfilProfesionalRoutes.routes);
        router.use("/servicio", ServicioRoutes.routes);
        router.use("/cita", CitaRoutes.routes);
        router.use('/images', ImageRoutes.routes);
        router.use('/reporte', ReporteRoutes.routes);


        return router;
    }
}
                    