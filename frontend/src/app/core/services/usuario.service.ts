import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { ApiResponse } from '../models/api-response.model';
import { Usuario } from '../models/usuario.model';
import { AuthService } from './auth.service';


@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/usuario`;
  private readonly authService = inject(AuthService);

  idUsuario = computed(() => this.authService.idUsuario() ?? 0);

  listar() {
    return this.http.get<ApiResponse<Usuario[]>>(this.apiUrl);
  }

  obtenerPorId(id: number) {
    return this.http.get<ApiResponse<Usuario>>(`${this.apiUrl}/${id}`);
  }

  cambiarEstado(id: number, estado: 'ACTIVO' | 'INACTIVO') {
    return this.http.patch<ApiResponse<Usuario>>(`${this.apiUrl}/${id}/estado`, { estado });
  }
}