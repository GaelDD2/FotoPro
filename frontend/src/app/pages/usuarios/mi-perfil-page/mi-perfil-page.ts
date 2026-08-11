import { Component, inject, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UsuarioService } from '../../../core/services/usuario.service';
import { PerfilProfesionalService } from '../../../core/services/perfil-profesional';
import { PerfilProfesional } from '../../../core/models/perfil-profesional.model';


@Component({
  selector: 'app-mi-perfil-page',
  standalone: true,
  imports: [MatCardModule, MatSlideToggleModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './mi-perfil-page.html',
  styleUrl: './mi-perfil-page.css',
})
export class MiPerfilPage {
  private readonly usuarioService = inject(UsuarioService);
  private readonly perfilService = inject(PerfilProfesionalService);

  perfil = signal<PerfilProfesional | null>(null);
  loading = signal(true);
  actualizando = signal(false);
  error = signal<string | null>(null);

  constructor() {
    this.cargarPerfil();
  }

  cargarPerfil(): void {
    this.loading.set(true);
    this.error.set(null);

    const idUsuario = this.usuarioService.idUsuario();

    this.perfilService.obtenerPorIdUsuario(idUsuario).subscribe({
      next: (response) => {
        this.perfil.set(response.data);
      },
      error: () => {
        this.error.set('No se pudo cargar tu perfil profesional');
      },
      complete: () => {
        this.loading.set(false);
      },
    });
  }

  cambiarDisponibilidad(event: { checked: boolean }): void {
    const perfil = this.perfil();
    if (!perfil || this.actualizando()) return;

    this.actualizando.set(true);
    const nuevoValor = event.checked;

    this.perfilService.cambiarDisponibilidad(perfil.id, nuevoValor).subscribe({
      next: () => {
        this.perfil.update((p) => (p ? { ...p, disponible: nuevoValor } : p));
      },
      error: () => {
        this.error.set('No se pudo actualizar tu disponibilidad');
      },
      complete: () => {
        this.actualizando.set(false);
      },
    });
  }
}