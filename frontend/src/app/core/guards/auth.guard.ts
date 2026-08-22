import { inject } from '@angular/core';

import {
    CanActivateFn,
    Router,
} from '@angular/router';

import {
    map,
    of,
    switchMap,
} from 'rxjs';

import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn =
    () => {
        const authService =
            inject(AuthService);

        const router =
            inject(Router);

        if (authService.autenticado()) {
            return true;
        }

        if (
            authService.sesionInicializada() &&
            !authService.getToken()
        ) {
            return router.createUrlTree([
                '/login',
            ]);
        }

        return authService
            .inicializarSesion()
            .pipe(
                map((usuario) =>
                    usuario
                        ? true
                        : router.createUrlTree([
                            '/login',
                        ])
                )
            );
    };