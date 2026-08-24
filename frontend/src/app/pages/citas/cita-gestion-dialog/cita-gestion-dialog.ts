import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { CitaService } from '../../../core/services/cita.service';
import { Cita, EstadoCita } from '../../../core/models/cita.model';

export interface CitaGestionDialogData {
  cita: Cita;
  profesionalUsuarioId: number;
}

export interface CitaGestionDialogResult {
  actualizado: boolean;
}

type Vista = 'detalle' | 'rechazar' | 'cancelar';

@Component({
  selector: 'app-cita-gestion-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
  ],
  providers: [DatePipe],
  templateUrl: './cita-gestion-dialog.html',
  styleUrl: './cita-gestion-dialog.css',
})
export class CitaGestionDialog {
  private readonly citaService = inject(CitaService);
  private readonly datePipe = inject(DatePipe);
  private readonly dialogRef = inject(MatDialogRef<CitaGestionDialog>);
  readonly data = inject<CitaGestionDialogData>(MAT_DIALOG_DATA);

  cita = signal<Cita>(this.data.cita);
  vista = signal<Vista>('detalle');
  guardando = signal(false);
  errorMsg = signal<string | null>(null);

  comentarioAceptar = signal('');
  motivoRechazo = signal('');
  motivoCancelacion = signal('');

  puedeAceptar = computed(() => this.cita().estado === 'PENDIENTE');
  puedeRechazar = computed(() => this.cita().estado === 'PENDIENTE');
  puedeCancelar = computed(() =>
    this.cita().estado === 'PENDIENTE' || this.cita().estado === 'ACEPTADA'
  );
  puedeCompletar = computed(() => {
    const cita = this.cita();
    if (cita.estado !== 'ACEPTADA') return false;
    return this.fechaHoraFin(cita) <= new Date();
  });

  // Combina fechaCita + horaFin en un Date real usando el mismo formato
  // que ya usas para mostrar horas en citas-list (date:'HH:mm'), así
  // evitamos problemas de timezone entre lo que muestra el pipe y lo que validamos.
  private fechaHoraFin(cita: Cita): Date {
    const fecha = this.datePipe.transform(cita.fechaCita, 'yyyy-MM-dd');
    const hora = this.datePipe.transform(cita.horaFin, 'HH:mm');
    return new Date(`${fecha}T${hora}:00`);
  }

  cerrar(actualizado = false): void {
    this.dialogRef.close({ actualizado } as CitaGestionDialogResult);
  }

  irADetalle(): void {
    this.vista.set('detalle');
    this.errorMsg.set(null);
  }

  irARechazar(): void {
    this.vista.set('rechazar');
    this.errorMsg.set(null);
  }

  irACancelar(): void {
    this.vista.set('cancelar');
    this.errorMsg.set(null);
  }

  aceptar(): void {
    this.guardando.set(true);
    this.errorMsg.set(null);

    this.citaService
      .aceptar(this.cita().id, {
        profesionalUsuarioId: this.data.profesionalUsuarioId,
        comentarioProfesional: this.comentarioAceptar().trim() || undefined,
      })
      .subscribe({
        next: () => this.cerrar(true),
        error: (err) => {
          this.errorMsg.set(err?.error?.message ?? 'No se pudo aceptar la cita.');
          this.guardando.set(false);
        },
      });
  }

  confirmarRechazo(): void {
    if (this.motivoRechazo().trim().length < 10) {
      this.errorMsg.set('El motivo debe tener al menos 10 caracteres.');
      return;
    }

    this.guardando.set(true);
    this.errorMsg.set(null);

    this.citaService
      .rechazar(this.cita().id, {
        profesionalUsuarioId: this.data.profesionalUsuarioId,
        motivo: this.motivoRechazo().trim(),
      })
      .subscribe({
        next: () => this.cerrar(true),
        error: (err) => {
          this.errorMsg.set(err?.error?.message ?? 'No se pudo rechazar la cita.');
          this.guardando.set(false);
        },
      });
  }

  confirmarCancelacion(): void {
    if (this.motivoCancelacion().trim().length < 10) {
      this.errorMsg.set('El motivo debe tener al menos 10 caracteres.');
      return;
    }

    this.guardando.set(true);
    this.errorMsg.set(null);

    this.citaService
      .cancelar(this.cita().id, {
        usuarioId: this.data.profesionalUsuarioId,
        motivo: this.motivoCancelacion().trim(),
      })
      .subscribe({
        next: () => this.cerrar(true),
        error: (err) => {
          this.errorMsg.set(err?.error?.message ?? 'No se pudo cancelar la cita.');
          this.guardando.set(false);
        },
      });
  }

  completar(): void {
    this.guardando.set(true);
    this.errorMsg.set(null);

    this.citaService
      .completar(this.cita().id, {
        profesionalUsuarioId: this.data.profesionalUsuarioId,
      })
      .subscribe({
        next: () => this.cerrar(true),
        error: (err) => {
          this.errorMsg.set(err?.error?.message ?? 'No se pudo completar la cita.');
          this.guardando.set(false);
        },
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
}