import { Injectable, signal, computed } from '@angular/core';
import { SesionUsuario, Rol } from '../models/sesion.model';

// ================================================
// USUARIO SIMULADO — cambiar estos valores para
// probar distintos roles sin necesidad de login
// ================================================
const USUARIO_SIMULADO: SesionUsuario = {
  id:        7,
  nombre:    'María',
  apellidos: 'Fernández López',
  correo:    'maria@cliente.com',
  rol:       'CLIENTE',
};
// Opciones disponibles en el seed:
// id: 1,  rol: 'ADMIN'       → admin@fotopro.com
// id: 2,  rol: 'PROFESIONAL' → carlos@fotopro.com
// id: 3,  rol: 'PROFESIONAL' → laura@fotopro.com
// id: 7,  rol: 'CLIENTE'     → maria@cliente.com
// id: 8,  rol: 'CLIENTE'     → jose@cliente.com
// id: 9,  rol: 'CLIENTE'     → ana@cliente.com
// ================================================

@Injectable({
  providedIn: 'root',
})
export class SesionService {

  // Signal privado con el usuario actual
  private readonly _usuario = signal<SesionUsuario | null>(USUARIO_SIMULADO);

  // Señales públicas de solo lectura
  readonly usuario  = this._usuario.asReadonly();
  readonly isLoggedIn = computed(() => this._usuario() !== null);
  readonly isAdmin    = computed(() => this._usuario()?.rol === 'ADMIN');
  readonly isProfesional = computed(() => this._usuario()?.rol === 'PROFESIONAL');
  readonly isCliente  = computed(() => this._usuario()?.rol === 'CLIENTE');

  // ID del usuario actual — útil para filtrar datos
  readonly usuarioId = computed(() => this._usuario()?.id ?? null);

  // Simular login (cambiar usuario en tiempo de ejecución)
  simularUsuario(usuario: SesionUsuario): void {
    this._usuario.set(usuario);
  }

  // Simular logout
  cerrarSesion(): void {
    this._usuario.set(null);
  }
}