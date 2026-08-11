import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ServicioService } from '../../../core/services/servicio.service';
import { EspecialidadService } from '../../../core/services/especialidad.service';
import { UsuarioService } from '../../../core/services/usuario.service';
import { PerfilProfesionalService } from '../../../core/services/perfil-profesional';
import { Especialidad } from '../../../core/models/especialidad.model';
import { PerfilProfesional } from '../../../core/models/perfil-profesional.model';
import { ServicioCreateDto, ServicioUpdateDto } from '../../../core/models/servicio.model';
import { CategoriaService } from '../../../core/services/categoria.service';
import { ServicioForm } from '../servicio-form/servicio-form';
import { Categoria } from '../../../core/models/categoria.model';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-servicio-create-page',
  standalone: true,
  imports: [ServicioForm,
     MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './servicio-create-page.html',
})
export class ServicioCreatePage {
  private readonly router = inject(Router);
  private readonly servicioService = inject(ServicioService);
  private readonly categoriaService = inject(CategoriaService);
  private readonly especialidadService = inject(EspecialidadService);
  private readonly usuarioService = inject(UsuarioService);
  private readonly profesionalService = inject(PerfilProfesionalService);

  categorias = signal<Categoria[]>([]);
  especialidades = signal<Especialidad[]>([]);
  perfilProfesional = signal<PerfilProfesional | null>(null);

  loading = signal(true);
  saving = signal(false);
  error = signal<string | null>(null);

  constructor() {
    this.cargarDatosFormulario();
  }

  cargarDatosFormulario(): void {
    this.loading.set(true);
    this.error.set(null);

    const idUsuario = this.usuarioService.idUsuario();

    this.profesionalService.obtenerPorIdUsuario(idUsuario).subscribe({
      next: (perfilResponse) => {
        this.perfilProfesional.set(perfilResponse.data);

        forkJoin({
          categorias: this.categoriaService.listar(),
          especialidades: this.especialidadService.listar(),
        }).subscribe({
          next: ({ categorias, especialidades }) => {
            this.categorias.set(categorias.data ?? []);
            this.especialidades.set(especialidades.data ?? []);
          },
          error: () => {
            this.error.set('No se pudieron cargar los datos del formulario');
          },
          complete: () => {
            this.loading.set(false);
          },
        });
      },
      error: () => {
        this.error.set('No se pudo obtener el perfil profesional');
        this.loading.set(false);
      },
    });
  }

  

  guardar(data: ServicioCreateDto | ServicioUpdateDto): void {
    const perfil = this.perfilProfesional();
    if (!perfil) return;

    this.saving.set(true);
    this.error.set(null);

    const dto: ServicioCreateDto = {
      ...(data as ServicioCreateDto),
      perfilProfesionalId: perfil.id,
    };

    this.servicioService.crear(dto).subscribe({
      next: () => {
        this.router.navigate(['/servicios']);
      },
      error: () => {
        this.error.set('No se pudo registrar el servicio');
      },
      complete: () => {
        this.saving.set(false);
      },
    });
  }

  cancelar(): void {
    this.router.navigate(['/servicios']);
  }
}