import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { CategoriaService } from '../../../core/services/categoria.service';
import { Categoria } from '../../../core/models/categoria.model';

@Component({
  selector: 'app-categorias-list',
  standalone: true,
  imports: [
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  templateUrl: './categorias-list.html',
  styleUrl: './categorias-list.css',
})
export class CategoriasList implements OnInit {
  private readonly categoriaService = inject(CategoriaService);

  // Estado de la pantalla
  categorias = signal<Categoria[]>([]);
  search     = signal('');
  estado     = signal<boolean | null>(null);
  loading    = signal(false);
  error      = signal<string | null>(null);
  actualizandoEstadoId = signal<number | null>(null);

  // Filtrar localmente con computed
  categoriasFiltradas = computed(() => {
    const texto        = this.search().trim().toLowerCase();
    const estadoFiltro = this.estado();

    return this.categorias().filter((c) => {
      const nombre      = c.nombre?.toLowerCase()      ?? '';
      const descripcion = c.descripcion?.toLowerCase() ?? '';

      const coincideTexto =
        texto.length === 0          ||
        nombre.includes(texto)      ||
        descripcion.includes(texto);

      const coincideEstado =
        estadoFiltro === null ||
        c.estado === estadoFiltro;

      return coincideTexto && coincideEstado;
    });
  });

  totalCategorias = computed(() => this.categoriasFiltradas().length);

  ngOnInit(): void {
    this.cargarCategorias();
  }

  cargarCategorias(): void {
    this.loading.set(true);
    this.error.set(null);

    this.categoriaService.listar().subscribe({
      next: (response) => {
        this.categorias.set(response.data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar las categorías.');
        this.loading.set(false);
      },
    });
  }

  cambiarEstadoCategoria(categoria: Categoria): void {
  if (this.actualizandoEstadoId() !== null) return;

  this.actualizandoEstadoId.set(categoria.id);
  const nuevoEstado = !categoria.estado;

  this.categoriaService.cambiarEstado(categoria.id, nuevoEstado).subscribe({
    next: () => {
      this.categorias.update((lista) =>
        lista.map((c) => (c.id === categoria.id ? { ...c, estado: nuevoEstado } : c))
      );
    },
    error: () => {
      this.error.set('No se pudo cambiar el estado de la categoría');
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