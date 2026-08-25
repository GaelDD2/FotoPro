import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { ReporteService } from '../../../core/services/reporte.service';
import { ReporteCalificaciones } from '../../../core/models/reporte.model';

@Component({
  selector: 'app-calificaciones-page',
  standalone: true,
  imports: [
    FormsModule,
    DecimalPipe,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatChipsModule,
  ],
  templateUrl: './calificaciones-page.html',
  styleUrl: './calificaciones-page.css',
})
export class CalificacionesPage {
  private readonly reporteService = inject(ReporteService);

  reporte = signal<ReporteCalificaciones | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  umbral = signal<number>(3);

  constructor() {
    this.cargarReporte();
  }

  cargarReporte(): void {
    this.loading.set(true);
    this.error.set(null);

    this.reporteService.obtenerCalificaciones({ umbral: this.umbral() }).subscribe({
      next: (res) => {
        this.reporte.set(res.data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.message ?? 'No se pudo generar el reporte');
        this.loading.set(false);
      },
    });
  }

  aplicarUmbral(): void {
    this.cargarReporte();
  }
}