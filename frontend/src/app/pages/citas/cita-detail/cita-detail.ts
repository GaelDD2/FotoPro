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
import { Cita, EstadoCita } from '../../../core/models/cita.model';

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

  cita    = signal<Cita | null>(null);
  loading = signal(false);
  error   = signal<string | null>(null);

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

    this.citaService.obtenerPorId(id).subscribe({
      next: (response) => {
        this.cita.set(response.data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar el detalle de la cita.');
        this.loading.set(false);
      },
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