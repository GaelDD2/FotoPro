import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DecimalPipe, DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CitaService } from '../../../core/services/cita.service';
import { SesionService } from '../../../core/services/sesion.service';
import { Cita, EstadoCita, HistorialCita } from '../../../core/models/cita.model';
import { forkJoin } from 'rxjs';
import { ResenaService } from '../../../core/services/resena.service';
import { MatDialog } from '@angular/material/dialog';
import { Resena } from '../../../core/models/resena.model';
import { ResenaFormDialog, ResenaFormDialogData, ResenaFormDialogResult } from '../../resenas/resena-form-dialog/resena-form-dialog';

@Component({
  selector: 'app-cita-detail',
  standalone: true,
  imports: [
    RouterLink,
    DecimalPipe,
    DatePipe,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatChipsModule,
    MatTooltipModule,
  ],
  templateUrl: './cita-detail.html',
  styleUrl: './cita-detail.css',
})
export class CitaDetail implements OnInit {
  private readonly route        = inject(ActivatedRoute);
  private readonly citaService  = inject(CitaService);
  private readonly sesionService = inject(SesionService);
    private readonly resenaService = inject(ResenaService);
  private readonly dialog        = inject(MatDialog);

  cita      = signal<Cita | null>(null);
  historial = signal<HistorialCita[]>([]);
  loading   = signal(false);
  error     = signal<string | null>(null);
    resena = signal<Resena | null>(null);

  usuarioActual = this.sesionService.usuario;
  isCliente     = this.sesionService.isCliente;
  isProfesional = this.sesionService.isProfesional;
  isAdmin       = this.sesionService.isAdmin;

  // Calcular duración de la cita en horas y minutos
  duracion = computed(() => {
    const c = this.cita();
    if (!c) return '';
    const inicio = new Date(c.horaInicio);
    const fin    = new Date(c.horaFin);
    const mins   = (fin.getTime() - inicio.getTime()) / 60000;
    if (mins < 60) return `${mins} min`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? `${h}h ${m}min` : `${h}h`;
  });

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.error.set('El identificador de la cita no es válido.');
      return;
    }
    this.cargarCita(id);
  }

     cargarCita(id: number): void {
    this.loading.set(true);
    this.error.set(null);

    forkJoin({
      cita:     this.citaService.obtenerPorId(id),
      historial: this.citaService.obtenerHistorial(id),
      resena:   this.resenaService.obtenerPorCita(id),
    }).subscribe({
      next: ({ cita, historial, resena }) => {
        this.cita.set(cita.data);
        this.historial.set(historial.data);
        this.resena.set(resena.data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar el detalle de la cita.');
        this.loading.set(false);
      },
    });
  }

    abrirResena(): void {
    const cita = this.cita();
    const usuario = this.usuarioActual();
    if (!cita || !usuario) return;

    const ref = this.dialog.open(ResenaFormDialog, {
      width: '420px',
      data: {
        cita,
        clienteId: usuario.id,
        resenaExistente: this.resena(),
      } as ResenaFormDialogData,
    });

    ref.afterClosed().subscribe((resultado?: ResenaFormDialogResult) => {
      if (resultado?.actualizado) {
        this.cargarCita(cita.id);
      }
    });
  }

  getEstadoClass(estado: EstadoCita): string {
    const clases: Record<EstadoCita, string> = {
      PENDIENTE:  'estado-pendiente',
      ACEPTADA:   'estado-aceptada',
      RECHAZADA:  'estado-rechazada',
      CANCELADA:  'estado-cancelada',
      COMPLETADA: 'estado-completada',
    };
    return clases[estado] ?? '';
  }

  getEstadoIcon(estado: EstadoCita): string {
    const icons: Record<EstadoCita, string> = {
      PENDIENTE:  'schedule',
      ACEPTADA:   'check_circle',
      RECHAZADA:  'cancel',
      CANCELADA:  'do_not_disturb',
      COMPLETADA: 'task_alt',
    };
    return icons[estado] ?? 'help';
  }

  // Verificar qué acciones puede realizar el usuario actual
  puedeAceptar = computed(() => {
    const c = this.cita();
    return this.isProfesional() && c?.estado === 'PENDIENTE';
  });

  puedeRechazar = computed(() => {
    const c = this.cita();
    return this.isProfesional() && c?.estado === 'PENDIENTE';
  });

  puedeCancelar = computed(() => {
    const c = this.cita();
    return (this.isCliente() || this.isProfesional()) &&
           (c?.estado === 'PENDIENTE' || c?.estado === 'ACEPTADA');
  });

  puedeCompletar = computed(() => {
    const c = this.cita();
    return this.isProfesional() && c?.estado === 'ACEPTADA';
  });
}