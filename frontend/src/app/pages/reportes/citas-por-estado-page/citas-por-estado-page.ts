import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ReporteService, FiltrosCitasPorEstado } from '../../../core/services/reporte.service';
import { ReporteCitasPorEstado } from '../../../core/models/reporte.model';
import { PerfilProfesionalService } from '../../../core/services/perfil-profesional';
import { PerfilProfesional } from '../../../core/models/perfil-profesional.model';
import { Categoria } from '../../../core/models/categoria.model';
import { CategoriaService } from '../../../core/services/categoria.service';


@Component({
  selector: 'app-citas-por-estado-page',
  standalone: true,
  imports: [
    FormsModule,
    DecimalPipe,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './citas-por-estado-page.html',
  styleUrl: './citas-por-estado-page.css',
})
export class CitasPorEstadoPage {
  private readonly reporteService = inject(ReporteService);
  private readonly perfilService = inject(PerfilProfesionalService);
  private readonly categoriaService = inject(CategoriaService);

  reporte = signal<ReporteCitasPorEstado | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  profesionales = signal<PerfilProfesional[]>([]);
  categorias = signal<Categoria[]>([]);

  // Filtros
  fechaInicio = signal<string | null>(null);
  fechaFin = signal<string | null>(null);
  perfilProfesionalId = signal<number | null>(null);
  categoriaId = signal<number | null>(null);

  constructor() {
    this.cargarCombos();
    this.cargarReporte();
  }

  private cargarCombos(): void {
    this.perfilService.listar().subscribe({
      next: (res) => this.profesionales.set(res.data),
      error: () => {}, // los combos son un "nice to have", no bloquean el reporte
    });
    this.categoriaService.listar().subscribe({
      next: (res) => this.categorias.set(res.data),
      error: () => {},
    });
  }

  cargarReporte(): void {
    this.loading.set(true);
    this.error.set(null);

    const filtros: FiltrosCitasPorEstado = {
      fechaInicio: this.fechaInicio() ?? undefined,
      fechaFin: this.fechaFin() ?? undefined,
      perfilProfesionalId: this.perfilProfesionalId() ?? undefined,
      categoriaId: this.categoriaId() ?? undefined,
    };

    this.reporteService.obtenerCitasPorEstado(filtros).subscribe({
      next: (res) => {
        this.reporte.set(res.data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(
          err?.error?.message ?? 'No se pudo generar el reporte. Revisa el rango de fechas.'
        );
        this.loading.set(false);
      },
    });
  }

  aplicarFiltros(): void {
    this.cargarReporte();
  }

  limpiarFiltros(): void {
    this.fechaInicio.set(null);
    this.fechaFin.set(null);
    this.perfilProfesionalId.set(null);
    this.categoriaId.set(null);
    this.cargarReporte();
  }

  colorEstado(estado: string): string {
    const colores: Record<string, string> = {
      PENDIENTE: '#f5a623',
      ACEPTADA: '#4a90d9',
      RECHAZADA: '#d0021b',
      CANCELADA: '#9b9b9b',
      COMPLETADA: '#2e9e5b',
    };
    return colores[estado] ?? '#9b9b9b';
  }
}