import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { ApiResponse } from '../models/api-response.model';
import { CreateResenaDto, Resena, ResenasProfesionalResponse } from '../models/resena.model';

@Injectable({ providedIn: 'root' })
export class ResenaService {
  private readonly http   = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/resena`;

  crear(data: CreateResenaDto) {
    return this.http.post<ApiResponse<Resena>>(this.apiUrl, data);
  }

  obtenerPorCita(citaId: number) {
    return this.http.get<ApiResponse<Resena | null>>(`${this.apiUrl}/cita/${citaId}`);
  }

  listarPorProfesional(perfilProfesionalId: number) {
    return this.http.get<ApiResponse<ResenasProfesionalResponse>>(
      `${this.apiUrl}/profesional/${perfilProfesionalId}`
    );
  }
}