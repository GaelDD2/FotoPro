import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { PerfilProfesionalService } from '../../../core/services/perfil-profesional';
import { EspecialidadService } from '../../../core/services/especialidad.service';
import { Especialidad } from '../../../core/models/especialidad.model';
import { PerfilProfesionalCreateDto, PerfilProfesionalUpdateDto } from '../../../core/models/perfil-profesional.model';
import { PerfilProfesionalForm } from '../perfil-profesional-form/perfil-profesional-form';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-perfil-profesional-create-page',
  standalone: true,
  imports: [PerfilProfesionalForm,MatIconModule,MatProgressSpinnerModule],
  templateUrl: './perfil-profesional-create-page.html',
})
export class PerfilProfesionalCreatePage {
  private readonly router = inject(Router);
  private readonly perfilService = inject(PerfilProfesionalService);
  private readonly especialidadService = inject(EspecialidadService);

  especialidades = signal<Especialidad[]>([]);
  loading = signal(true);
  saving = signal(false);
  error = signal<string | null>(null);

  constructor() {
    this.cargarDatosFormulario();
  }

  cargarDatosFormulario(): void {
    this.loading.set(true);
    this.error.set(null);

    this.especialidadService.listar().subscribe({
      next: (response) => {
        this.especialidades.set(response.data ?? []);
      },
      error: () => {
        this.error.set('No se pudieron cargar las especialidades');
      },
      complete: () => {
        this.loading.set(false);
      },
    });
  }

  guardar(data: PerfilProfesionalCreateDto | PerfilProfesionalUpdateDto): void {
    this.saving.set(true);
    this.error.set(null);

    this.perfilService.crear(data as PerfilProfesionalCreateDto).subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.error.set(
          err?.error?.message === 'CORREO_DUPLICADO'
            ? 'Ese correo ya está registrado'
            : 'No se pudo registrar el profesional'
        );
      },
      complete: () => {
        this.saving.set(false);
      },
    });
  }

  cancelar(): void {
    this.router.navigate(['/']);
  }
}