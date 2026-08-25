export interface Resena {
  id:                  number;
  citaId:              number;
  clienteId:           number;
  perfilProfesionalId: number;
  puntuacion:          number;
  comentario:          string | null;
  createdAt:           string;
  cliente: {
    nombre:    string;
    apellidos: string;
  };
}

export interface CreateResenaDto {
  citaId:     number;
  clienteId:  number;
  puntuacion: number;
  comentario?: string;
}

export interface ResenasProfesionalResponse {
  resenas:       Resena[];
  promedio:      number | null;
  totalResenas:  number;
}