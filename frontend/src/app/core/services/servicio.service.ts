import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { ApiResponse } from '../models/api-response.model';
import { Servicio, ServicioCreateDto, ServicioUpdateDto } from '../models/servicio.model';

@Injectable({
  providedIn: 'root',
})
export class ServicioService {
  private readonly http   = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/servicio`;

  listar() {
    return this.http.get<ApiResponse<Servicio[]>>(this.apiUrl);
  }

  obtenerPorId(id: number) {
    return this.http.get<ApiResponse<Servicio>>(`${this.apiUrl}/${id}`);
  }

  listarByProfesional(perfilProfesionalId: number) {

  return this.http.get<ApiResponse<Servicio[]>>(
    `${this.apiUrl}/profesional/${perfilProfesionalId}`
  );

  

}

crear(data: ServicioCreateDto) {
  return this.http.post<ApiResponse<Servicio>>(this.apiUrl, data);
}

actualizar(id: number, data: ServicioUpdateDto) {
  return this.http.put<ApiResponse<Servicio>>(`${this.apiUrl}/${id}`, data);
}

cambiarEstado(id: number, activo: boolean) {
  return this.http.patch<ApiResponse<Servicio>>(`${this.apiUrl}/${id}/estado`, { activo });
}

}