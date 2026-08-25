import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { DecimalPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CitaService } from '../../../core/services/cita.service';
import { SesionService } from '../../../core/services/sesion.service';
import { Cita, EstadoCita } from '../../../core/models/cita.model';
import { NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import { UsuarioService } from '../../../core/services/usuario.service';
import { Usuario } from '../../../core/models/usuario.model';
import { PerfilProfesionalService } from '../../../core/services/perfil-profesional';
import { PerfilProfesional } from '../../../core/models/perfil-profesional.model';
import { MatDialog } from '@angular/material/dialog';
import { CancelarCitaDialog, CancelarCitaDialogData, CancelarCitaDialogResult } from '../cancelar-cita-dialog/cancelar-cita-dialog';

@Component({
  selector: 'app-citas-list',
  standalone: true,
  imports: [
    NgClass,
    RouterLink,
    FormsModule,
    DecimalPipe,
    DatePipe,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatTooltipModule,
    
  ],
  providers: [DatePipe],
  templateUrl: './citas-list.html',
  styleUrl: './citas-list.css',
})
export class CitasList implements OnInit {
  private readonly citaService = inject(CitaService);
  private readonly usuarioService = inject(UsuarioService);
  private readonly profesionalService = inject(PerfilProfesionalService);
  private readonly dialog = inject(MatDialog);
  private readonly datePipe = inject(DatePipe);



  // Estado de la pantalla
  citas = signal<Cita[]>([]);
  usuarioSimulado = signal<Usuario | null>(null);
  profesional = signal<PerfilProfesional | null>(null);
  estado = signal<string | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);

   // Clave ordenable 'YYYY-MM-DDTHH:mm' combinando fechaCita + horaInicio
  private claveOrden(cita: Cita): string {
    const fecha = this.datePipe.transform(cita.fechaCita, 'yyyy-MM-dd');
    const hora  = this.datePipe.transform(cita.horaInicio, 'HH:mm');
    return `${fecha}T${hora}`;
  }

  // Filtrar localmente por estado
  citasFiltradas = computed(() => {
    const estadoFiltro = this.estado();
    const filtradas = this.citas().filter((c) =>
      estadoFiltro === null || c.estado === estadoFiltro
    );
    // Historial cronológico: más reciente primero
    return [...filtradas].sort((a, b) =>
      this.claveOrden(b).localeCompare(this.claveOrden(a))
    );
  });

  totalCitas = computed(() => this.citasFiltradas().length);

  // Contadores por estado
  totalPendientes = computed(() => this.citas().filter(c => c.estado === 'PENDIENTE').length);
  totalAceptadas = computed(() => this.citas().filter(c => c.estado === 'ACEPTADA').length);
  totalCompletadas = computed(() => this.citas().filter(c => c.estado === 'COMPLETADA').length);
  totalCanceladas = computed(() => this.citas().filter(c => c.estado === 'CANCELADA' || c.estado === 'RECHAZADA').length);

  ngOnInit(): void {
    this.cargarCitas();
  }

  cargarCitas(): void {

    this.loading.set(true);

    const idUsuario = this.usuarioService.idUsuario();;

    this.usuarioService.obtenerPorId(idUsuario).subscribe({

      next: (response) => {

        const usuario = response.data;

        this.usuarioSimulado.set(usuario);

        switch (usuario.rol) {

          case 'ADMIN':



            this.citaService.listarAdmin().subscribe({
              next: (response) => {
                this.citas.set(response.data);
                this.loading.set(false);
              },
              error: () => {
                this.error.set('No se pudieron cargar las citas.');
                this.loading.set(false);
              }
            });

            break;

          case 'CLIENTE':

            this.citaService.listarByUsuario(usuario.id).subscribe({
              next: (response) => {
                this.citas.set(response.data);
                this.loading.set(false);
              },
              error: () => {
                this.error.set('No se pudieron cargar las citas.');
                this.loading.set(false);
              }
            });

            break;

          case 'PROFESIONAL':
            this.profesionalService.obtenerPorIdUsuario(idUsuario).subscribe({

              next: (response) => {

                const profesionalData = response.data;

                this.profesional.set(profesionalData);

                this.citaService.listarByProfesional(profesionalData.id).subscribe({
                  next: (response) => {
                    this.citas.set(response.data);
                    this.loading.set(false);
                  },
                  error: () => {
                    this.error.set('No se pudieron cargar las citas.');
                    this.loading.set(false);
                  }
                });
              },
              error: () => {
                this.error.set('No se pudieron cargar las citas.');
                this.loading.set(false);
              }
            });
            break;

        }

      },

      error: () => {

        this.error.set('No se pudo obtener el usuario.');
        this.loading.set(false);

      }

    });

  }

  limpiarFiltro(): void {
    this.estado.set(null);
  }

    puedeCancelar(cita: Cita): boolean {
    return (
      this.usuarioSimulado()?.rol === 'CLIENTE' &&
      (cita.estado === 'PENDIENTE' || cita.estado === 'ACEPTADA')
    );
  }

  abrirCancelar(cita: Cita): void {
    const usuario = this.usuarioSimulado();
    if (!usuario) return;

    const ref = this.dialog.open(CancelarCitaDialog, {
      width: '420px',
      data: { cita, usuarioId: usuario.id } as CancelarCitaDialogData,
    });

    ref.afterClosed().subscribe((resultado?: CancelarCitaDialogResult) => {
      if (resultado?.actualizado) {
        this.cargarCitas();
      }
    });
  }

  getEstadoClass(estado: EstadoCita): string {
    const clases: Record<EstadoCita, string> = {
      PENDIENTE: 'estado-pendiente',
      ACEPTADA: 'estado-aceptada',
      RECHAZADA: 'estado-rechazada',
      CANCELADA: 'estado-cancelada',
      COMPLETADA: 'estado-completada',
    };
    return clases[estado] ?? '';
  }

  getEstadoIcon(estado: EstadoCita): string {
    const icons: Record<EstadoCita, string> = {
      PENDIENTE: 'schedule',
      ACEPTADA: 'check_circle',
      RECHAZADA: 'cancel',
      CANCELADA: 'do_not_disturb',
      COMPLETADA: 'task_alt',
    };
    return icons[estado] ?? 'help';
  }
}