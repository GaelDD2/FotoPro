import { Component, ViewChild, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { FullCalendarComponent, FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, DatesSetArg, EventClickArg, EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import esLocale from '@fullcalendar/core/locales/es';

import { CitaService } from '../../../core/services/cita.service';
import { PerfilProfesionalService } from '../../../core/services/perfil-profesional';
import { Cita, EstadoCita } from '../../../core/models/cita.model';
import { PerfilProfesional } from '../../../core/models/perfil-profesional.model';

@Component({
  selector: 'app-cita-agenda-admin-page',
  standalone: true,
  imports: [
    FormsModule,
    FullCalendarModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatProgressSpinnerModule,
  ],
  providers: [DatePipe],
  templateUrl: './cita-agenda-admin-page.html',
  styleUrl: './cita-agenda-admin-page.css',
})
export class CitaAgendaAdminPage {
  @ViewChild('calendar') calendarComponent!: FullCalendarComponent;

  private readonly citaService = inject(CitaService);
  private readonly profesionalService = inject(PerfilProfesionalService);
  private readonly datePipe = inject(DatePipe);
  private readonly router = inject(Router);

  loading = signal(true);
  error = signal<string | null>(null);
  citas = signal<Cita[]>([]);
  profesionales = signal<PerfilProfesional[]>([]);

  estadoFiltro = signal<EstadoCita | null>(null);
  profesionalFiltro = signal<number | null>(null);

  private rangoVisible: { fechaInicio: string; fechaFin: string } | null = null;

  // OJO: ya NO es un signal, y ya NO incluye 'events' aquí.
  // Se crea UNA sola vez y no se vuelve a reasignar -> evita el re-init del calendario.
  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin],
    initialView: 'dayGridMonth',
    locale: esLocale,
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,listMonth',
    },
    height: 'auto',
    nowIndicator: true,
    datesSet: (arg) => this.onDatesSet(arg),
    eventClick: (arg) => this.abrirDetalle(arg),
  };

  constructor() {
    this.cargarProfesionales();
  }

  private cargarProfesionales(): void {
    this.profesionalService.listar().subscribe({
      next: (response) => this.profesionales.set(response.data),
      error: () => {},
    });
  }

  private onDatesSet(arg: DatesSetArg): void {
    const fechaInicio = this.datePipe.transform(arg.start, 'yyyy-MM-dd')!;
    const fechaFin     = this.datePipe.transform(arg.end, 'yyyy-MM-dd')!;
    this.rangoVisible = { fechaInicio, fechaFin };
    this.cargarAgenda();
  }

  cargarAgenda(): void {
    if (!this.rangoVisible) return;

    this.loading.set(true);
    this.error.set(null);

    this.citaService
      .listarAdmin(
        this.estadoFiltro() ?? undefined,
        this.profesionalFiltro() ?? undefined,
        this.rangoVisible.fechaInicio,
        this.rangoVisible.fechaFin
      )
      .subscribe({
        next: (response) => {
          this.citas.set(response.data);
          this.actualizarEventos();
          this.loading.set(false);
        },
        error: () => {
          this.error.set('No se pudo cargar la agenda general.');
          this.loading.set(false);
        },
      });
  }

  aplicarFiltros(): void {
    this.cargarAgenda();
  }

  limpiarFiltros(): void {
    this.estadoFiltro.set(null);
    this.profesionalFiltro.set(null);
    this.cargarAgenda();
  }

  // Actualiza los eventos vía la API interna del calendario,
  // en vez de reemplazar todo el objeto de opciones.
  private actualizarEventos(): void {
    const eventos = this.citas().map((cita) => this.citaToEvento(cita));
    const api = this.calendarComponent?.getApi();
    if (!api) return;

    api.removeAllEvents();
    api.addEventSource(eventos);
  }

  private citaToEvento(cita: Cita): EventInput {
    const fecha      = this.datePipe.transform(cita.fechaCita, 'yyyy-MM-dd');
    const horaInicio  = this.datePipe.transform(cita.horaInicio, 'HH:mm');
    const horaFin     = this.datePipe.transform(cita.horaFin, 'HH:mm');
    const color       = this.colorPorEstado(cita.estado);

    return {
      id: String(cita.id),
      title: `${cita.perfilProfesional.usuario.nombre} · ${cita.servicio.nombre}`,
      start: `${fecha}T${horaInicio}:00`,
      end: `${fecha}T${horaFin}:00`,
      backgroundColor: color,
      borderColor: color,
      extendedProps: { cita },
    };
  }

  private colorPorEstado(estado: EstadoCita): string {
    const colores: Record<EstadoCita, string> = {
      PENDIENTE: '#f59e0b',
      ACEPTADA: '#2563eb',
      COMPLETADA: '#16a34a',
      CANCELADA: '#6b7280',
      RECHAZADA: '#dc2626',
    };
    return colores[estado];
  }

  abrirDetalle(arg: EventClickArg): void {
    const cita: Cita = arg.event.extendedProps['cita'];
    this.router.navigate(['/citas', cita.id]);
  }
}