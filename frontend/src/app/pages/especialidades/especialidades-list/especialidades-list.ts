import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { EspecialidadService } from '../../../core/services/especialidad.service';
import { Especialidad } from '../../../core/models/especialidad.model';

@Component({
  selector: 'app-especialidades-list',
  standalone: true,
  imports: [
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  templateUrl: './especialidades-list.html',
  styleUrl: './especialidades-list.css',
})
export class EspecialidadesList implements OnInit {
  private readonly especialidadService = inject(EspecialidadService);

  // Estado de la pantalla
  especialidades = signal<Especialidad[]>([]);
  search         = signal('');
  estado         = signal<boolean | null>(null);
  loading        = signal(false);
  error          = signal<string | null>(null);
  actualizandoEstadoId = signal<number | null>(null);



  // Filtrar localmente con computed
  especialidadesFiltradas = computed(() => {
    const texto        = this.search().trim().toLowerCase();
    const estadoFiltro = this.estado();

    return this.especialidades().filter((e) => {
      const nombre      = e.nombre?.toLowerCase()      ?? '';
      const descripcion = e.descripcion?.toLowerCase() ?? '';

      const coincideTexto =
        texto.length === 0          ||
        nombre.includes(texto)      ||
        descripcion.includes(texto);

      const coincideEstado =
        estadoFiltro === null ||
        e.activo === estadoFiltro;

      return coincideTexto && coincideEstado;
    });
  });

  totalEspecialidades = computed(() => this.especialidadesFiltradas().length);

  ngOnInit(): void {
    this.cargarEspecialidades();
  }

  cargarEspecialidades(): void {
    this.loading.set(true);
    this.error.set(null);

    this.especialidadService.listar().subscribe({
      next: (response) => {
        this.especialidades.set(response.data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar las especialidades.');
        this.loading.set(false);
      },
    });
  }

  cambiarEstadoEspecialidad(especialidad: Especialidad): void {
  if (this.actualizandoEstadoId() !== null) return;

  this.actualizandoEstadoId.set(especialidad.id);
  const nuevoEstado = !especialidad.activo;

  this.especialidadService.cambiarEstado(especialidad.id, nuevoEstado).subscribe({
    next: () => {
      this.especialidades.update((lista) =>
        lista.map((e) => (e.id === especialidad.id ? { ...e, activo: nuevoEstado } : e))
      );
    },
    error: () => {
      this.error.set('No se pudo cambiar el estado de la especialidad');
    },
    complete: () => {
      this.actualizandoEstadoId.set(null);
    },
  });
}

  limpiarFiltros(): void {
    this.search.set('');
    this.estado.set(null);
  }
}