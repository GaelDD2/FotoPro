import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';

import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventClickArg, EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import esLocale from '@fullcalendar/core/locales/es';

import { CitaService } from '../../../core/services/cita.service';
import { UsuarioService } from '../../../core/services/usuario.service';
import { PerfilProfesionalService } from '../../../core/services/perfil-profesional';
import { Cita, EstadoCita } from '../../../core/models/cita.model';
import { CitaGestionDialog, CitaGestionDialogData, CitaGestionDialogResult } from '../cita-gestion-dialog/cita-gestion-dialog';


@Component({
  selector: 'app-cita-agenda-profesional-page',
  standalone: true,
  imports: [FullCalendarModule, MatIconModule, MatButtonModule, MatProgressSpinnerModule],
  providers: [DatePipe],
  templateUrl: './cita-agenda-profesional-page.html',
  styleUrl: './cita-agenda-profesional-page.css',
})
export class CitasAgendaProfesionalPage {
  private readonly citaService = inject(CitaService);
  private readonly usuarioService = inject(UsuarioService);
  private readonly profesionalService = inject(PerfilProfesionalService);
  private readonly dialog = inject(MatDialog);
  private readonly datePipe = inject(DatePipe);
  private readonly router = inject(Router);

  loading = signal(true);
  error = signal<string | null>(null);
  profesionalUsuarioId = signal<number | null>(null);
  citas = signal<Cita[]>([]);

  calendarOptions = signal<CalendarOptions>({
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin],
    initialView: 'timeGridWeek',
    locale: esLocale,
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
    },
    allDaySlot: false,
    slotMinTime: '06:00:00',
    slotMaxTime: '21:00:00',
    height: 'auto',
    nowIndicator: true,
    events: [],
    eventClick: (arg) => this.abrirGestion(arg),
    eventContent: (arg) => this.renderEvento(arg),
  });

  constructor() {
    this.cargarAgenda();
  }

  cargarAgenda(): void {
    this.loading.set(true);
    this.error.set(null);

    const idUsuario = this.usuarioService.idUsuario();
    this.profesionalUsuarioId.set(idUsuario);

    this.profesionalService.obtenerPorIdUsuario(idUsuario).subscribe({
      next: (perfilResponse) => {
        const perfil = perfilResponse.data;

        this.citaService.listarByProfesional(perfil.id).subscribe({
          next: (citasResponse) => {
            this.citas.set(citasResponse.data);
            this.actualizarEventos();
            this.loading.set(false);
          },
          error: () => {
            this.error.set('No se pudieron cargar las citas de la agenda.');
            this.loading.set(false);
          },
        });
      },
      error: () => {
        this.error.set('No se pudo obtener el perfil profesional.');
        this.loading.set(false);
      },
    });
  }

  private actualizarEventos(): void {
    const eventos = this.citas().map((cita) => this.citaToEvento(cita));
    this.calendarOptions.update((opts) => ({ ...opts, events: eventos }));
  }

  private citaToEvento(cita: Cita): EventInput {
    const fecha = this.datePipe.transform(cita.fechaCita, 'yyyy-MM-dd');
    const horaInicio = this.datePipe.transform(cita.horaInicio, 'HH:mm');
    const horaFin = this.datePipe.transform(cita.horaFin, 'HH:mm');
    const color = this.colorPorEstado(cita.estado);

    return {
      id: String(cita.id),
      title: `${cita.servicio.nombre} · ${cita.cliente.nombre} ${cita.cliente.apellidos}`,
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

  private renderEvento(arg: any) {
    const cita: Cita = arg.event.extendedProps['cita'];
    return {
      html: `
        <div class="fc-evento-custom">
          <span class="fc-evento-hora">${arg.timeText}</span>
          <span class="fc-evento-servicio">${cita.servicio.nombre}</span>
          <span class="fc-evento-cliente">${cita.cliente.nombre} ${cita.cliente.apellidos}</span>
        </div>
      `,
    };
  }

  abrirGestion(arg: EventClickArg): void {
    const cita: Cita = arg.event.extendedProps['cita'];
    const profesionalUsuarioId = this.profesionalUsuarioId();
    if (!profesionalUsuarioId) return;

    const data: CitaGestionDialogData = { cita, profesionalUsuarioId };

    const ref = this.dialog.open(CitaGestionDialog, { width: '480px', data });

    ref.afterClosed().subscribe((resultado: CitaGestionDialogResult | undefined) => {
      if (resultado?.actualizado) {
        this.cargarAgenda();
      }
    });
  }

  volver(): void {
    this.router.navigate(['/citas']);
  }
}