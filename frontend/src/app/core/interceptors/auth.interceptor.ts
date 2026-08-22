import { inject } from '@angular/core';

import {
    HttpInterceptorFn,
} from '@angular/common/http';

import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn =
    (request, next) => {
        const authService =
            inject(AuthService);

        const token =
            authService.getToken();

        console.log('Token en interceptor:', token);
    console.log('URL:', request.url);

        if (!token) {
            return next(request);
        }

        const requestAutenticado =
            request.clone({
                setHeaders: {
                    Authorization:
                        `Bearer ${token}`,
                },
            });

        return next(requestAutenticado);
    };