import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { ApiResponse } from '../models/api-response.model';
import { Categoria } from '../models/categoria.model';

@Injectable({
  providedIn: 'root',
})
export class CategoriaService {
  private readonly http   = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/categoria`;

  listar() {
    return this.http.get<ApiResponse<Categoria[]>>(this.apiUrl);
  }

  cambiarEstado(id: number, activo: boolean) {
  return this.http.patch<ApiResponse<Categoria>>(`${this.apiUrl}/${id}/estado`, { activo });
}

  
}