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