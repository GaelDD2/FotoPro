import { Especialidad } from './especialidad.model';

export interface Servicio {
  id:          number;
  nombre:      string;
  descripcion: string;
  precio:      number;
  duracionMin: number;
  modalidad:   'VIRTUAL' | 'PRESENCIAL' | 'MIXTA';
  activo:      boolean;
  createdAt:   string;
  categoria: {
    id:          number;
    nombre:      string;
    descripcion: string | null;
  };
  especialidades: {
    especialidad: Especialidad;
  }[];
  perfilProfesional: {
    id:                number;
    tituloProfesional: string;
    provincia:         string;
    canton:            string;
    disponible:        boolean;
    imagenPerfilUrl:   string | null;
    usuario: {
      nombre:    string;
      apellidos: string;
      correo:    string;
      telefono:  string;
    };
  };


  
}

export interface ServicioFormModel {
  nombre: string;
  descripcion: string;
  precio: number;
  duracionMin: number;
  modalidad: 'VIRTUAL' | 'PRESENCIAL' | 'MIXTA';
  categoriaId: number | null;
  activo: boolean;
  especialidadIds: number[];
}

export interface ServicioCreateDto {
  perfilProfesionalId: number;
  categoriaId: number;
  nombre: string;
  descripcion: string;
  precio: number;
  duracionMin: number;
  modalidad: 'VIRTUAL' | 'PRESENCIAL' | 'MIXTA';
  activo: boolean;
  especialidadIds: number[];
}

export interface ServicioUpdateDto extends Partial<ServicioCreateDto> {}