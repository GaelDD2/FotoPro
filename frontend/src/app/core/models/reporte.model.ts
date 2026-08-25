export interface ConteoPorEstado {
  estado: 'PENDIENTE' | 'ACEPTADA' | 'RECHAZADA' | 'CANCELADA' | 'COMPLETADA';
  cantidad: number;
}

export interface ResumenMensual {
  periodo: string; // '2026-08'
  anio: number;
  mes: number;
  citasCompletadas: number;
  ingresos: number;
}

export interface DetalleCitaReporte {
  id: number;
  fecha: string;
  cliente: string;
  servicio: string;
  categoria: string;
  monto: number;
}

export interface ReporteFinancieroProfesional {
  profesional: {
    id: number;
    nombre: string;
    apellidos: string;
    tituloProfesional: string;
  };
  generadoEn: string;
  conteoPorEstado: ConteoPorEstado[];
  calificacion: {
    promedio: number;
    cantidadResenas: number;
  };
  resumenMensual: ResumenMensual[];
  detalleCitas: DetalleCitaReporte[];
}

// ---------- Citas por Estado ----------
export interface ConteoPorEstadoDetallado {
  estado: 'PENDIENTE' | 'ACEPTADA' | 'RECHAZADA' | 'CANCELADA' | 'COMPLETADA';
  cantidad: number;
  porcentaje: number;
}

export interface ReporteCitasPorEstado {
  filtrosAplicados: {
    fechaInicio: string | null;
    fechaFin: string | null;
    perfilProfesionalId: number | null;
    categoriaId: number | null;
  };
  totalGeneral: number;
  conteoPorEstado: ConteoPorEstadoDetallado[];
  generadoEn: string;
}

// ---------- Citas por Profesional ----------
export interface CitasPorProfesionalItem {
  perfilProfesionalId: number;
  nombre: string;
  apellidos: string;
  totalCitas: number;
  citasCompletadas: number;
  porcentajeFinalizacion: number;
}

export interface ReporteCitasPorProfesional {
  filtrosAplicados: {
    perfilProfesionalId: number | null;
    fechaInicio: string | null;
    fechaFin: string | null;
  };
  generadoEn: string;
  profesionales: CitasPorProfesionalItem[];
}

// ---------- Calificaciones ----------
export interface MejorServicioCalificado {
  servicioId: number;
  nombre: string;
  promedio: number;
  cantidadResenas: number;
}

export interface CalificacionProfesionalItem {
  perfilProfesionalId: number;
  nombre: string;
  apellidos: string;
  promedioCalificacion: number | null;
  cantidadResenas: number;
  sinResenas: boolean;
  mejorServicio: MejorServicioCalificado | null;
}

export interface ServicioBajaCalificacion {
  perfilProfesionalId: number;
  profesional: string;
  servicioId: number;
  nombre: string;
  promedio: number;
  cantidadResenas: number;
}

export interface ReporteCalificaciones {
  umbralBajaCalificacion: number;
  generadoEn: string;
  profesionales: CalificacionProfesionalItem[];
  serviciosBajaCalificacion: ServicioBajaCalificacion[];
}

