import { Especialidad } from './especialidad.model';
import { Servicio } from './servicio.model';


export interface PerfilProfesional {
  id:                number;
  tituloProfesional: string;
  descripcion:       string | null;
  aniosExperiencia:  number | null;
  modalidad:         'VIRTUAL' | 'PRESENCIAL' | 'MIXTA';
  provincia:         string;
  canton:            string;
  distrito:          string;
  tarifaBase:        number | null;
  disponible:        boolean;
  imagenPerfilUrl:   string | null;
  createdAt:         string;
  usuario: {
    nombre:    string;
    apellidos: string;
    correo:    string;
    telefono:  string;
  };
  especialidades: {
    especialidad: Especialidad;
  }[];
  servicios?: Servicio[];
}

export interface PerfilProfesionalFormModel {
  // Usuario
  nombre: string;
  apellidos: string;
  correo: string;
  telefono: string;
  contrasenaHash: string;
  confirmarContrasena: string; // solo validación en frontend, no se envía
  imagenPerfilUrl: string;
  // Perfil profesional
  tituloProfesional: string;
  descripcion: string;
  aniosExperiencia: number | null;
  modalidad: 'VIRTUAL' | 'PRESENCIAL' | 'MIXTA';
  provincia: string;
  canton: string;
  distrito: string;
  tarifaBase: number | null;
  disponible: boolean;
  especialidadIds: number[];
}

export interface PerfilProfesionalCreateDto {
  nombre: string;
  apellidos: string;
  correo: string;
  telefono: string;
  contrasenaHash: string;
  tituloProfesional: string;
  descripcion: string;
  aniosExperiencia: number | null;
  modalidad: 'VIRTUAL' | 'PRESENCIAL' | 'MIXTA';
  provincia: string;
  canton: string;
  distrito: string;
  tarifaBase: number | null;
  disponible: boolean;
  especialidadIds: number[];
  imagenPerfilUrl?: string;
}

export interface PerfilProfesionalUpdateDto
  extends Partial<Omit<PerfilProfesionalCreateDto, 'contrasenaHash'>> {}