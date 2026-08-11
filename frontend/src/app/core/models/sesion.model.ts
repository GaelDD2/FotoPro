export type Rol = 'ADMIN' | 'PROFESIONAL' | 'CLIENTE';

export interface SesionUsuario {
  id:       7;
  nombre:   string;
  apellidos: string;
  correo:   string;
  rol:      Rol;
}