import { Component, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { ResenaService } from '../../../core/services/resena.service';
import { Cita } from '../../../core/models/cita.model';
import { Resena } from '../../../core/models/resena.model';

export interface ResenaFormDialogData {
  cita: Cita;
  clienteId: number;
  resenaExistente: Resena | null;
}

export interface ResenaFormDialogResult {
  actualizado: boolean;
}

@Component({
  selector: 'app-resena-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DatePipe,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './resena-form-dialog.html',
  styleUrl: './resena-form-dialog.css',
})
export class ResenaFormDialog {
  private readonly resenaService = inject(ResenaService);
  private readonly dialogRef = inject(MatDialogRef<ResenaFormDialog>);
  readonly data = inject<ResenaFormDialogData>(MAT_DIALOG_DATA);

  modoLectura = !!this.data.resenaExistente;

  puntuacion = signal(this.data.resenaExistente?.puntuacion ?? 0);
  comentario = signal(this.data.resenaExistente?.comentario ?? '');
  guardando  = signal(false);
  errorMsg   = signal<string | null>(null);

  estrellas = [1, 2, 3, 4, 5];

  cerrar(actualizado = false): void {
    this.dialogRef.close({ actualizado } as ResenaFormDialogResult);
  }

  seleccionarPuntuacion(valor: number): void {
    if (this.modoLectura) return;
    this.puntuacion.set(valor);
  }

  enviar(): void {
    if (this.puntuacion() < 1) {
      this.errorMsg.set('Selecciona una puntuación entre 1 y 5.');
      return;
    }

    this.guardando.set(true);
    this.errorMsg.set(null);

    this.resenaService
      .crear({
        citaId: this.data.cita.id,
        clienteId: this.data.clienteId,
        puntuacion: this.puntuacion(),
        comentario: this.comentario().trim() || undefined,
      })
      .subscribe({
        next: () => this.cerrar(true),
        error: (err) => {
          this.errorMsg.set(err?.error?.message ?? 'No se pudo registrar la reseña.');
          this.guardando.set(false);
        },
      });
  }
}