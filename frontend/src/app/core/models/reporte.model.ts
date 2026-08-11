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