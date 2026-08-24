import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { ApiResponse } from '../models/api-response.model';
import { AceptarCitaDto, CancelarCitaDto, Cita, CitaCreateDto, CompletarCitaDto, HistorialCita, RechazarCitaDto } from '../models/cita.model';

@Injectable({
  providedIn: 'root',
})
export class CitaService {
  private readonly http   = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/cita`;

  listarAdmin(clienteId?: number, perfilProfesionalId?: number, estado?: string) {
    let params = new HttpParams();

    if (clienteId)           params = params.set('clienteId',           clienteId);
    if (perfilProfesionalId) params = params.set('perfilProfesionalId', perfilProfesionalId);
    if (estado)              params = params.set('estado',              estado);

    return this.http.get<ApiResponse<Cita[]>>(this.apiUrl, { params });
  }

  obtenerPorId(id: number) {
    return this.http.get<ApiResponse<Cita>>(`${this.apiUrl}/${id}`);
  }

listarByUsuario(
  usuarioId: number,
  profesionalId?: number,
  estado?: string,
  fechaInicio?: string,
  fechaFin?: string
) {

  let params = new HttpParams();

  if (profesionalId)
    params = params.set('profesionalId', profesionalId);

  if (estado)
    params = params.set('estado', estado);

  if (fechaInicio)
    params = params.set('fechaInicio', fechaInicio);

  if (fechaFin)
    params = params.set('fechaFin', fechaFin);

  return this.http.get<ApiResponse<Cita[]>>(
    `${this.apiUrl}/usuario/${usuarioId}`,
    { params }
  );

}

listarByProfesional(
  profesionalId: number,
  usuarioId?: number,
  estado?: string,
  fechaInicio?: string,
  fechaFin?: string
) {

  let params = new HttpParams();

  if (usuarioId)
    params = params.set('usuarioId', usuarioId);

  if (estado)
    params = params.set('estado', estado);

  if (fechaInicio)
    params = params.set('fechaInicio', fechaInicio);

  if (fechaFin)
    params = params.set('fechaFin', fechaFin);

  return this.http.get<ApiResponse<Cita[]>>(
    `${this.apiUrl}/profesional/${profesionalId}`,
    { params }
  );

}

crear(data: CitaCreateDto) {
  return this.http.post<ApiResponse<Cita>>(this.apiUrl, data);
}

  aceptar(id: number, data: AceptarCitaDto) {
    return this.http.patch<ApiResponse<Cita>>(`${this.apiUrl}/${id}/aceptar`, data);
  }

  rechazar(id: number, data: RechazarCitaDto) {
    return this.http.patch<ApiResponse<Cita>>(`${this.apiUrl}/${id}/rechazar`, data);
  }

  cancelar(id: number, data: CancelarCitaDto) {
    return this.http.patch<ApiResponse<Cita>>(`${this.apiUrl}/${id}/cancelar`, data);
  }

  completar(id: number, data: CompletarCitaDto) {
    return this.http.patch<ApiResponse<Cita>>(`${this.apiUrl}/${id}/completar`, data);
  }

  obtenerHistorial(id: number) {
    return this.http.get<ApiResponse<HistorialCita[]>>(`${this.apiUrl}/${id}/historial`);
  }

}