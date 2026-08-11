import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ServicioService } from '../../../core/services/servicio.service';
import { EspecialidadService } from '../../../core/services/especialidad.service';
import { CategoriaServicio } from '../../../core/models/categoria-servicio.model';
import { Especialidad } from '../../../core/models/especialidad.model';
import { Servicio, ServicioCreateDto, ServicioUpdateDto } from '../../../core/models/servicio.model';
import { ServicioForm } from '../servicio-form/servicio-form';
import { CategoriaService } from '../../../core/services/categoria.service';
import { Categoria } from '../../../core/models/categoria.model';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';


@Component({
  selector: 'app-servicio-edit-page',
  standalone: true,
  imports: [ServicioForm,MatIconModule,MatProgressSpinnerModule],
  templateUrl: './servicio-edit-page.html',
})
export class ServicioEditPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly servicioService = inject(ServicioService);
  private readonly categoriaService = inject(CategoriaService);
  private readonly especialidadService = inject(EspecialidadService);

  servicio = signal<Servicio | null>(null);
  categorias = signal<Categoria[]>([]);
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
      this.error.set('El identificador del servicio no es válido');
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    forkJoin({
      servicio: this.servicioService.obtenerPorId(this.id),
      categorias: this.categoriaService.listar(),
      especialidades: this.especialidadService.listar(),
    }).subscribe({
      next: ({ servicio, categorias, especialidades }) => {
        this.servicio.set(servicio.data);
        this.categorias.set(categorias.data ?? []);
        this.especialidades.set(especialidades.data ?? []);
      },
      error: () => {
        this.error.set('No se pudo cargar la información del servicio');
      },
      complete: () => {
        this.loading.set(false);
      },
    });
  }

  guardar(data: ServicioCreateDto | ServicioUpdateDto): void {
    if (!this.id) return;

    this.saving.set(true);
    this.error.set(null);

    this.servicioService.actualizar(this.id, data as ServicioUpdateDto).subscribe({
      next: () => {
        this.router.navigate(['/servicios', this.id]);
      },
      error: () => {
        this.error.set('No se pudo actualizar el servicio');
      },
      complete: () => {
        this.saving.set(false);
      },
    });
  }

  cancelar(): void {
    this.router.navigate(['/servicios', this.id]);
  }
}