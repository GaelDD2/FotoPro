export type EstadoCita = 'PENDIENTE' | 'ACEPTADA' | 'RECHAZADA' | 'CANCELADA' | 'COMPLETADA';

export interface HistorialCita {
  id:             number;
  estadoAnterior: EstadoCita | null;
  estadoNuevo:    EstadoCita;
  motivo:         string | null;
  fechaCambio:    string;
}

export interface Cita {
  id:                    number;
  fechaCita:             string;
  horaInicio:            string;
  horaFin:               string;
  modalidad:             'VIRTUAL' | 'PRESENCIAL' | 'MIXTA';
  estado:                EstadoCita;
  montoEstimado:         number;
  comentarioCliente:     string | null;
  comentarioProfesional: string | null;
  createdAt:             string;
  cliente: {
    nombre:    string;
    apellidos: string;
    correo:    string;
  };
  perfilProfesional: {
    tituloProfesional: string;
    usuario: {
      nombre:    string;
      apellidos: string;
    };
  };
  servicio: {
    nombre: string;
    precio: number;
  };
  historial?: HistorialCita[];
}

export interface CitaFormModel {
  servicioId: number | null;
  fecha: string;        // 'YYYY-MM-DD'
  horaInicio: string;   // 'HH:mm'
  modalidad: 'VIRTUAL' | 'PRESENCIAL' | 'MIXTA';
  comentarioCliente: string;
}

export interface CitaCreateDto {
  clienteId: number;
  perfilProfesionalId: number;
  servicioId: number;
  modalidad: 'VIRTUAL' | 'PRESENCIAL' | 'MIXTA';
  fechaCita: string;
  horaInicio: string;
  horaFin: string;
  comentarioCliente: string;
}

export interface AceptarCitaDto {
  profesionalUsuarioId: number;
  comentarioProfesional?: string;
}

export interface RechazarCitaDto {
  profesionalUsuarioId: number;
  motivo: string;
}

export interface CancelarCitaDto {
  usuarioId: number;
  motivo: string;
}

export interface CompletarCitaDto {
  profesionalUsuarioId: number;
}

export interface HistorialCita {
  id:             number;
  citaId:         number;
  usuarioId:      number;
  estadoAnterior: EstadoCita | null;
  estadoNuevo:    EstadoCita;
  motivo:         string | null;
  createdAt:      string;
}

export interface CitaUpdateDto extends Partial<CitaCreateDto> {}