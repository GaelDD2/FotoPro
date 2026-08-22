import { inject } from '@angular/core';

import {
    ActivatedRouteSnapshot,
    CanActivateFn,
    Router,
} from '@angular/router';

import { map } from 'rxjs';

import { AuthService } from '../services/auth.service';
import { Rol } from '../models/role.model';

export const roleGuard: CanActivateFn =
    (route: ActivatedRouteSnapshot) => {
        const authService =
            inject(AuthService);

        const router =
            inject(Router);

        const rolesPermitidos =
            route.data['roles'] as
            Rol[] | undefined;

        if (!rolesPermitidos?.length) {
            return true;
        }

        const validarRol = () =>
            authService.tieneRol(
                rolesPermitidos
            )
                ? true
                : router.createUrlTree([
                    '/sin-autorizacion',
                ]);

        if (authService.autenticado()) {
            return validarRol();
        }

        return authService
            .inicializarSesion()
            .pipe(
                map((usuario) =>
                    usuario
                        ? validarRol()
                        : router.createUrlTree([
                            '/login',
                        ])
                )
            );
    };