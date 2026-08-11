import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CitaService } from '../../../core/services/cita.service';
import { ServicioService } from '../../../core/services/servicio.service';
import { UsuarioService } from '../../../core/services/usuario.service';
import { Servicio } from '../../../core/models/servicio.model';
import { Usuario } from '../../../core/models/usuario.model';
import { CitaCreateDto } from '../../../core/models/cita.model';
import { CitaForm } from '../cita-form/cita-form';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';


@Component({
  selector: 'app-cita-create-page',
  standalone: true,
  imports: [CitaForm,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './cita-create-page.html',
  
})
export class CitaCreatePage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly citaService = inject(CitaService);
  private readonly servicioService = inject(ServicioService);
  private readonly usuarioService = inject(UsuarioService);

  servicio = signal<Servicio | null>(null);
  cliente = signal<Usuario | null>(null);

  loading = signal(true);
  saving = signal(false);
  error = signal<string | null>(null);

  private readonly servicioId = Number(this.route.snapshot.queryParamMap.get('servicioId'));

  constructor() {
    this.cargarDatosFormulario();
  }

  cargarDatosFormulario(): void {
    if (!this.servicioId) {
      this.error.set('Debe seleccionar un servicio desde su detalle para reservar una cita.');
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const idUsuario = this.usuarioService.idUsuario();

    this.usuarioService.obtenerPorId(idUsuario).subscribe({
      next: (usuarioResponse) => {
        this.cliente.set(usuarioResponse.data);

        this.servicioService.obtenerPorId(this.servicioId).subscribe({
          next: (servicioResponse) => {
            this.servicio.set(servicioResponse.data);
          },
          error: () => {
            this.error.set('No se pudo cargar la información del servicio');
          },
          complete: () => {
            this.loading.set(false);
          },
        });
      },
      error: () => {
        this.error.set('No se pudo obtener la información del cliente');
        this.loading.set(false);
      },
    });
  }

  guardar(data: Omit<CitaCreateDto, 'clienteId'>): void {
    const cliente = this.cliente();
    if (!cliente) return;

    this.saving.set(true);
    this.error.set(null);

    const dto: CitaCreateDto = {
      ...data,
      clienteId: cliente.id,
    };

    this.citaService.crear(dto).subscribe({
      next: () => {
        this.router.navigate(['/citas']);
      },
      error: () => {
        this.error.set('No se pudo registrar la cita');
      },
      complete: () => {
        this.saving.set(false);
      },
    });
  }

  cancelar(): void {
    this.router.navigate(['/servicios', this.servicioId]);
  }
}