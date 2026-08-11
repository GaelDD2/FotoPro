import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';
import { ApiResponse } from '../models/api-response.model';
import { ReporteFinancieroProfesional } from '../models/reporte.model';

@Injectable({ providedIn: 'root' })
export class ReporteService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/reporte`;

  obtenerFinancieroProfesional(perfilProfesionalId: number) {
    return this.http.get<ApiResponse<ReporteFinancieroProfesional>>(
      `${this.apiUrl}/profesional/${perfilProfesionalId}/financiero`
    );
  }
}