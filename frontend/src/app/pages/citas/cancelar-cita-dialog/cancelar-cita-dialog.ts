import { Component, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Cita } from '../../../core/models/cita.model';
import { CitaService } from '../../../core/services/cita.service';


export interface CancelarCitaDialogData {
  cita: Cita;
  usuarioId: number;
}

export interface CancelarCitaDialogResult {
  actualizado: boolean;
}

@Component({
  selector: 'app-cancelar-cita-dialog',
  standalone: true,
  imports: [
    DatePipe,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './cancelar-cita-dialog.html',
  styleUrl: './cancelar-cita-dialog.css',
})
export class CancelarCitaDialog {
  private readonly citaService = inject(CitaService);
  private readonly dialogRef = inject(MatDialogRef<CancelarCitaDialog>);
  readonly data = inject<CancelarCitaDialogData>(MAT_DIALOG_DATA);

  motivo = signal('');
  guardando = signal(false);
  errorMsg = signal<string | null>(null);

  cerrar(actualizado = false): void {
    this.dialogRef.close({ actualizado } as CancelarCitaDialogResult);
  }

  confirmar(): void {
    if (this.motivo().trim().length < 10) {
      this.errorMsg.set('El motivo debe tener al menos 10 caracteres.');
      return;
    }

    this.guardando.set(true);
    this.errorMsg.set(null);

    this.citaService
      .cancelar(this.data.cita.id, {
        usuarioId: this.data.usuarioId,
        motivo: this.motivo().trim(),
      })
      .subscribe({
        next: () => this.cerrar(true),
        error: (err) => {
          this.errorMsg.set(err?.error?.message ?? 'No se pudo cancelar la cita.');
          this.guardando.set(false);
        },
      });
  }
}