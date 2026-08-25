import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { ReporteService } from '../../../core/services/reporte.service';
import { ReporteCitasPorProfesional } from '../../../core/models/reporte.model';
import { UsuarioService } from '../../../core/services/usuario.service';
import { PerfilProfesionalService } from '../../../core/services/perfil-profesional';

@Component({
  selector: 'app-citas-por-profesional-page',
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
    MatTableModule,
  ],
  templateUrl: './citas-por-profesional-page.html',
  styleUrl: './citas-por-profesional-page.css',
})
export class CitasPorProfesionalPage {
  private readonly reporteService = inject(ReporteService);
  private readonly usuarioService = inject(UsuarioService);
  private readonly perfilService = inject(PerfilProfesionalService);

  reporte = signal<ReporteCitasPorProfesional | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  esAdmin = signal(false);
  columnas = ['nombre', 'totalCitas', 'citasCompletadas', 'porcentajeFinalizacion'];

  fechaInicio = signal<string | null>(null);
  fechaFin = signal<string | null>(null);

  private miPerfilProfesionalId: number | null = null;

  constructor() {
    this.inicializar();
  }

  private inicializar(): void {
    this.loading.set(true);
    const idUsuario = this.usuarioService.idUsuario();

    this.usuarioService.obtenerPorId(idUsuario).subscribe({
      next: (res) => {
        const usuario = res.data;

        if (usuario.rol === 'ADMIN') {
          this.esAdmin.set(true);
          this.cargarReporte();
          return;
        }

        if (usuario.rol === 'PROFESIONAL') {
          this.esAdmin.set(false);
          this.perfilService.obtenerPorIdUsuario(idUsuario).subscribe({
            next: (perfilRes) => {
              this.miPerfilProfesionalId = perfilRes.data.id;
              this.cargarReporte();
            },
            error: () => {
              this.error.set('No se pudo obtener tu perfil profesional');
              this.loading.set(false);
            },
          });
          return;
        }

        // Otro rol sin acceso a este reporte
        this.error.set('No tienes acceso a este reporte');
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudo obtener el usuario');
        this.loading.set(false);
      },
    });
  }

  cargarReporte(): void {
    this.loading.set(true);
    this.error.set(null);

    const filtros = {
      fechaInicio: this.fechaInicio() ?? undefined,
      fechaFin: this.fechaFin() ?? undefined,
    };

    const peticion = this.esAdmin()
      ? this.reporteService.obtenerCitasPorProfesionalTodos(filtros)
      : this.reporteService.obtenerCitasPorProfesionalUno(this.miPerfilProfesionalId!, filtros);

    peticion.subscribe({
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

  aplicarFiltros(): void {
    this.cargarReporte();
  }
}