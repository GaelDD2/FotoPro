import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { PerfilProfesionalService } from '../../../core/services/perfil-profesional';
import { EspecialidadService } from '../../../core/services/especialidad.service';
import { Especialidad } from '../../../core/models/especialidad.model';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';


import {
  PerfilProfesional,
  PerfilProfesionalCreateDto,
  PerfilProfesionalUpdateDto,
} from '../../../core/models/perfil-profesional.model';
import { PerfilProfesionalForm } from '../perfil-profesional-form/perfil-profesional-form';

@Component({
  selector: 'app-perfil-profesional-edit-page',
  standalone: true,
  imports: [PerfilProfesionalForm,MatIconModule,MatProgressSpinnerModule],
  templateUrl: './perfil-profesional-edit-page.html',
})
export class PerfilProfesionalEditPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly perfilService = inject(PerfilProfesionalService);
  private readonly especialidadService = inject(EspecialidadService);

  perfil = signal<PerfilProfesional | null>(null);
  especialidades = signal<Especialidad[]>([]);

  loading = signal(true);
  saving = signal(false);
  error = signal<string | null>(null);

  private readonly id = Number(this.route.snapshot.paramMap.get('id'));

  constructor() {
    this.cargarDatosFormulario();
  }

  cargarDatosFormulario(): void {
    if (!this.id) {
      this.error.set('El identificador del profesional no es válido');
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    forkJoin({
      perfil: this.perfilService.obtenerPorId(this.id),
      especialidades: this.especialidadService.listar(),
    }).subscribe({
      next: ({ perfil, especialidades }) => {
        this.perfil.set(perfil.data);
        this.especialidades.set(especialidades.data ?? []);
      },
      error: () => {
        this.error.set('No se pudo cargar la información del profesional');
      },
      complete: () => {
        this.loading.set(false);
      },
    });
  }

  guardar(data: PerfilProfesionalCreateDto | PerfilProfesionalUpdateDto): void {
    if (!this.id) return;

    this.saving.set(true);
    this.error.set(null);

    this.perfilService.actualizar(this.id, data as PerfilProfesionalUpdateDto).subscribe({
      next: () => {
        this.router.navigate(['/profesionales', this.id]);
      },
      error: () => {
        this.error.set('No se pudo actualizar el perfil');
      },
      complete: () => {
        this.saving.set(false);
      },
    });
  }

  cancelar(): void {
    this.router.navigate(['/profesionales', this.id]);
  }
}