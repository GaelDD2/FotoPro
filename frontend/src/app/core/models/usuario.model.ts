export interface Usuario {
  id:        number;
  nombre:    string;
  apellidos: string;
  correo:    string;
  telefono:  string;
  rol:       'ADMIN' | 'PROFESIONAL' | 'CLIENTE';
  estado:    'ACTIVO' | 'INACTIVO';
  createdAt: string;
}

export enum Rol {
    ADMIN = 'ADMIN',
    CLIENTE = 'CLIENTE',
    PROFESIONAL='PROFESIONAL'
}

export interface UsuarioSesion {
    id: number;
    nombre: string;
    apellidos: string;
    correo: string;
    rol: Rol;
    estado: string;
}

export interface AuthResponse {
    success: boolean;
    data: {
        token: string;
        usuario: UsuarioSesion;
    };
}

 export interface PerfilResponse {
    success: boolean;
    data: UsuarioSesion;
}


export interface LoginRequest {
    correo: string;
    contrasena: string;
}
export interface LoginResult {
    token: string;
}
export interface RegisterRequest {
    nombre: string;
    correo: string;
    contrasena: string;
    apellidos: string;
    telefono:  string;
}