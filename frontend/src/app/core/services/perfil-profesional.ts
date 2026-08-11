import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { ApiResponse } from '../models/api-response.model';
import { PerfilProfesional, PerfilProfesionalCreateDto, PerfilProfesionalUpdateDto } from '../models/perfil-profesional.model';

@Injectable({
  providedIn: 'root',
})
export class PerfilProfesionalService {
  private readonly http   = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/profesional`;

  listar() {
    return this.http.get<ApiResponse<PerfilProfesional[]>>(this.apiUrl);
  }

  obtenerPorId(id: number) {
    return this.http.get<ApiResponse<PerfilProfesional>>(`${this.apiUrl}/${id}`);
  }

  obtenerPorIdUsuario(usuarioId: number) {
  return this.http.get<ApiResponse<PerfilProfesional>>(
    `${this.apiUrl}/usuario/${usuarioId}`
  );
}

crear(data: PerfilProfesionalCreateDto) {
  return this.http.post<ApiResponse<PerfilProfesional>>(this.apiUrl, data);
}

 getImageUrl(imageName: string): string {
    return `${environment.imageUrl}/${imageName}`;
  }

  actualizar(id: number, data: PerfilProfesionalUpdateDto) {
  return this.http.put<ApiResponse<PerfilProfesional>>(`${this.apiUrl}/${id}`, data);
}

cambiarDisponibilidad(id: number, disponible: boolean) {
  return this.http.patch<ApiResponse<PerfilProfesional>>(
    `${this.apiUrl}/${id}/disponibilidad`,
    { disponible }
  );
}

}