import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';
import { ApiResponse } from '../models/api-response.model';
import { ReporteCalificaciones, ReporteCitasPorEstado, ReporteCitasPorProfesional, ReporteFinancieroProfesional } from '../models/reporte.model';

export interface FiltrosCitasPorEstado {
  fechaInicio?: string; // 'YYYY-MM-DD'
  fechaFin?: string;
  perfilProfesionalId?: number;
  categoriaId?: number;
}

export interface FiltrosCitasPorProfesional {
  fechaInicio?: string;
  fechaFin?: string;
  perfilProfesionalId?: number;
}

export interface FiltrosCalificaciones {
  perfilProfesionalId?: number;
  umbral?: number;
}

@Injectable({ providedIn: 'root' })
export class ReporteService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/reporte`;
  

  obtenerFinancieroProfesional(perfilProfesionalId: number) {
    return this.http.get<ApiResponse<ReporteFinancieroProfesional>>(
      `${this.apiUrl}/profesional/${perfilProfesionalId}/financiero`
    );
  }

  private toHttpParams<T extends object>(filtros: T): HttpParams {
  let params = new HttpParams();
  for (const [clave, valor] of Object.entries(filtros) as [string, unknown][]) {
    if (valor !== undefined && valor !== null && valor !== '') {
      params = params.set(clave, String(valor));
    }
  }
  return params;
}

  obtenerCitasPorEstado(filtros: FiltrosCitasPorEstado = {}) {
    return this.http.get<ApiResponse<ReporteCitasPorEstado>>(
      `${this.apiUrl}/citas/estado`,
      { params: this.toHttpParams(filtros) }
    );
  }

  // Sin perfilProfesionalId -> todos (vista admin)
  obtenerCitasPorProfesionalTodos(filtros: FiltrosCitasPorProfesional = {}) {
    return this.http.get<ApiResponse<ReporteCitasPorProfesional>>(
      `${this.apiUrl}/citas/profesional`,
      { params: this.toHttpParams(filtros) }
    );
  }

  // Vista propia del profesional
  obtenerCitasPorProfesionalUno(
    perfilProfesionalId: number,
    filtros: Omit<FiltrosCitasPorProfesional, 'perfilProfesionalId'> = {}
  ) {
    return this.http.get<ApiResponse<ReporteCitasPorProfesional>>(
      `${this.apiUrl}/citas/profesional/${perfilProfesionalId}`,
      { params: this.toHttpParams(filtros) }
    );
  }

  obtenerCalificaciones(filtros: FiltrosCalificaciones = {}) {
    return this.http.get<ApiResponse<ReporteCalificaciones>>(
      `${this.apiUrl}/calificaciones`,
      { params: this.toHttpParams(filtros) }
    );
  }


}