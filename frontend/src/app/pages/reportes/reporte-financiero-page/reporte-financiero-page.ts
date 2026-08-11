import { Component, inject, signal } from '@angular/core';
import { DecimalPipe, DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { UsuarioService } from '../../../core/services/usuario.service';
import { PerfilProfesionalService } from '../../../core/services/perfil-profesional';
import { ReporteService } from '../../../core/services/reporte.service';
import { ExcelReporteService } from '../../../core/services/excel-reporte.service';
import { ReporteFinancieroProfesional } from '../../../core/models/reporte.model';



@Component({
  selector: 'app-reporte-financiero-page',
  standalone: true,
  imports: [
    DecimalPipe,
    DatePipe,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTableModule,
  ],
  templateUrl: './reporte-financiero-page.html',
  styleUrl: './reporte-financiero-page.css',
})
export class ReporteFinancieroPage {
  private readonly usuarioService = inject(UsuarioService);
  private readonly perfilService = inject(PerfilProfesionalService);
  private readonly reporteService = inject(ReporteService);
  private readonly excelService = inject(ExcelReporteService);

  reporte = signal<ReporteFinancieroProfesional | null>(null);
  loading = signal(true);
  exportando = signal(false);
  error = signal<string | null>(null);

  columnasDetalle = ['fecha', 'cliente', 'servicio', 'categoria', 'monto'];

  constructor() {
    this.cargarReporte();
  }

  cargarReporte(): void {
    this.loading.set(true);
    this.error.set(null);

    const idUsuario = this.usuarioService.idUsuario();

    this.perfilService.obtenerPorIdUsuario(idUsuario).subscribe({
      next: (perfilResponse) => {
        this.reporteService.obtenerFinancieroProfesional(perfilResponse.data.id).subscribe({
          next: (response) => {
            this.reporte.set(response.data);
          },
          error: () => {
            this.error.set('No se pudo generar el reporte');
          },
          complete: () => {
            this.loading.set(false);
          },
        });
      },
      error: () => {
        this.error.set('No se pudo obtener tu perfil profesional');
        this.loading.set(false);
      },
    });
  }

  async exportarExcel(): Promise<void> {
    const reporte = this.reporte();
    if (!reporte || this.exportando()) return;

    this.exportando.set(true);
    try {
      await this.excelService.generarReporteFinancieroProfesional(reporte);
    } catch {
      this.error.set('No se pudo generar el archivo Excel');
    } finally {
      this.exportando.set(false);
    }
  }
}