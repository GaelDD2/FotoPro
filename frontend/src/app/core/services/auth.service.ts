import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable, signal, computed, effect } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment.development';
import { catchError, finalize, map, Observable, of, shareReplay, switchMap, tap, throwError } from 'rxjs';
import { LoginRequest, LoginResult, RegisterRequest, UsuarioSesion } from '../models/usuario.model';
import { AuthResponse } from '../models/usuario.model';
import { ApiResponse } from '../models/api-response.model';
import { UsuariosList } from '../../pages/usuarios/usuarios-list/usuarios-list';
import { Rol } from '../models/role.model';



@Injectable({ providedIn: 'root' })
export class AuthService {
    private readonly http = inject(HttpClient);
    private readonly router = inject(Router);
    private readonly apiUrl = `${environment.apiUrl}/auth`;
    private readonly tokenKey = 'access_token'
    private readonly _token = signal<string | null>(
        this.leerTokenAlmacenado()
    )

    // Signal central — toda la app lee de aquí
    private readonly _usuario = signal<UsuarioSesion | null>(
        this.cargarUsuarioLocal()
    );

    readonly usuario = this._usuario.asReadonly();

    private readonly _cargandoSesion =
        signal(false)

    private readonly _sesionInicializada =
        signal(false)

    private solicitudPerfilActual:
        Observable<UsuarioSesion | null> | null = null

    readonly token = this._token.asReadonly()

    readonly cargandoSesion =
        this._cargandoSesion.asReadonly()
    readonly sesionInicializada =
        this._sesionInicializada.asReadonly()
    
    readonly autenticado = computed(
        () =>
            this._token() !== null &&
            this._usuario() !== null
    )

    readonly rol = computed(
        () => this._usuario()?.rol ?? null
    )

    
    readonly isLoggedIn = computed(() => this._usuario() !== null);
    readonly isAdmin = computed(() => this._usuario()?.rol === 'ADMIN');
    readonly isProfesional = computed(() => this._usuario()?.rol === 'PROFESIONAL');
    readonly isCliente = computed(() => this._usuario()?.rol === 'CLIENTE');

    // para enviar a usuarioService y mantenerlo 
    readonly idUsuario = computed(() => this._usuario()?.id ?? 0);

    login(
        credenciales: LoginRequest
    ): Observable<UsuarioSesion> {
        this._cargandoSesion.set(true)
        return this.http
            .post<ApiResponse<LoginResult>>(
                `${this.apiUrl}/login`,
                credenciales
            )
            .pipe(
                map((response) => {
                    const resultado = response.data
                    if (!resultado?.token) {
                        throw new Error(
                            'El API no devolvió el token de autenticación'
                        )
                    }
                    return resultado
                }),
                tap(({ token }) => {
                    this.guardarToken(token)
                }),
                switchMap(() => this.obtenerPerfil()),
                tap((usuario) => {
                    this._usuario.set(usuario)
                    this._sesionInicializada.set(true)
                }),
                catchError((error: unknown) => {
                    this.limpiarSesion()
                    return throwError(
                        () =>
                            this.obtenerErrorAutenticacion(
                                error
                            )
                    )
                }),
                finalize(() => {
                    this._cargandoSesion.set(false)
                })
            )
    }

    obtenerPerfil(): Observable<UsuarioSesion> {
        return this.http
            .get<ApiResponse<UsuarioSesion>>(
                `${this.apiUrl}/perfil`
            )
            .pipe(
                map((response) => {
                    const usuario = response.data
                    if (!usuario) {
                        throw new Error(
                            'El API no devolvió la información del perfil'
                        )
                    }
                    return usuario
                })
            )
    }

    inicializarSesion(): Observable<UsuarioSesion | null> {
        if (this._sesionInicializada()) {
            return of(this._usuario())
        }
        const token = this._token()
        if (!token) {
            this._usuario.set(null)
            this._sesionInicializada.set(true)

            return of(null)
        }
        return this.cargarPerfil()
    }


    cargarPerfil(): Observable<UsuarioSesion | null> {
        if (this.solicitudPerfilActual) {
            return this.solicitudPerfilActual
        }
        const token = this._token()
        if (!token) {
            this._usuario.set(null)
            this._sesionInicializada.set(true)

            return of(null)
        }
        this._cargandoSesion.set(true)
        this.solicitudPerfilActual =
            this.obtenerPerfil().pipe(
                tap((usuario) => {
                    this._usuario.set(usuario)
                }),
                map(
                    (usuario): UsuarioSesion | null =>
                        usuario
                ),
                catchError(() => {
                    this.limpiarSesion()
                    return of(null)
                }),
                finalize(() => {
                    this._cargandoSesion.set(false)
                    this._sesionInicializada.set(true)
                    this.solicitudPerfilActual = null
                }),
                shareReplay({
                    bufferSize: 1,
                    refCount: false,
                })
            )
        return this.solicitudPerfilActual
    }   

    register(
        datos: RegisterRequest
    ): Observable<UsuarioSesion> {
        return this.http
            .post<ApiResponse<UsuarioSesion>>(
                `${this.apiUrl}/register`,
                datos
            )
            .pipe(
                map((response) => {
                    const usuario = response.data
                    if (!usuario) {
                        throw new Error(
                            'El API no devolvió el usuario registrado'
                        )
                    }
                    return usuario
                })
            )
    }

    logout(redirigir = true): void {
        this.limpiarSesion()
        if (redirigir) {
            void this.router.navigate(['/login'])
        }
    }

    tieneRol(rolesPermitidos: Rol[]): boolean {
        const rolActual = this.rol()
        return (
            rolActual !== null &&
            rolesPermitidos.includes(rolActual)
        )
    }

    getToken(): string | null {
        return this._token()
    }

    private guardarToken(token: string): void {
        const tokenLimpio = token.trim()
        if (!tokenLimpio) {
            throw new Error(
                'El token recibido no es válido'
            )
        }
        localStorage.setItem(
            this.tokenKey,
            tokenLimpio
        )
        this._token.set(tokenLimpio)
    }

    private cargarUsuarioLocal(): UsuarioSesion | null {
    return null;
}


    private leerTokenAlmacenado(): string | null {
        const token =
            localStorage.getItem(this.tokenKey)
        if (!token) {
            return null
        }
        const tokenLimpio = token.trim()
        return tokenLimpio.length > 0
            ? tokenLimpio
            : null
    }

    private limpiarSesion(): void {
        localStorage.removeItem(this.tokenKey)
        this._token.set(null)
        this._usuario.set(null)
        this._cargandoSesion.set(false)
        this._sesionInicializada.set(true)
        this.solicitudPerfilActual = null
    }

    private obtenerErrorAutenticacion(
        error: unknown
    ): Error {
        if (!(error instanceof HttpErrorResponse)) {
            return error instanceof Error
                ? error
                : new Error(
                    'No fue posible iniciar sesión'
                )
        }
        if (error.status === 0) {
            return new Error(
                'No fue posible conectarse con el servidor'
            )
        }
        if (error.status === 400) {
            return new Error(
                error.error?.message ??
                'Los datos enviados no son válidos'
            )
        }
        if (error.status === 401) {
            return new Error(
                error.error?.message ??
                'Correo o contraseña incorrectos'
            )
        }
        if (error.status === 403) {
            return new Error(
                error.error?.message ??
                'No tiene permisos para realizar esta acción'
            )
        }
        if (error.status === 404) {
            return new Error(
                error.error?.message ??
                'No fue posible obtener el perfil del usuario'
            )
        }
        return new Error(
            error.error?.message ??
            'Ocurrió un error durante la autenticación'
        )
    }

}