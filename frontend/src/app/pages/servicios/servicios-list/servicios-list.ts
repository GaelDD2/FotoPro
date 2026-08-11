import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { ServicioService } from '../../../core/services/servicio.service';
import { Servicio } from '../../../core/models/servicio.model';
import { UsuarioService } from '../../../core/services/usuario.service';
import { PerfilProfesionalService } from '../../../core/services/perfil-profesional';
import { PerfilProfesional } from '../../../core/models/perfil-profesional.model';
import { Usuario } from '../../../core/models/usuario.model';


@Component({
  selector: 'app-servicios-list',
  standalone: true,
  imports: [
    RouterLink,
    DecimalPipe,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatChipsModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './servicios-list.html',
  styleUrl: './servicios-list.css',
})
export class ServiciosList implements OnInit {
  private readonly servicioService = inject(ServicioService);
private readonly usuarioService = inject(UsuarioService);
private readonly profesionalService = inject(PerfilProfesionalService);
  // Estado de la pantalla
  servicios  = signal<Servicio[]>([]);
  profesional = signal<PerfilProfesional | null>(null);
  usuarioSimulado = signal<Usuario | null>(null);
  
  search     = signal('');
  categoriaId = signal<number | null>(null);
  modalidad  = signal<string | null>(null);
  loading    = signal(false);
  error      = signal<string | null>(null);
  

  // Extraer categorías únicas de los servicios cargados
  categorias = computed(() => {
    const map = new Map<number, { id: number; nombre: string }>();
    this.servicios().forEach((s) => {
      if (s.categoria) {
        map.set(s.categoria.id, s.categoria);
      }
    });
    return Array.from(map.values());
  });

  // Filtrar localmente sin llamar al API de nuevo
  serviciosFiltrados = computed(() => {
    const texto             = this.search().trim().toLowerCase();
    const categoriaFiltro   = this.categoriaId();
    const modalidadFiltro   = this.modalidad();

    return this.servicios().filter((s) => {
      const nombre      = s.nombre?.toLowerCase()           ?? '';
      const descripcion = s.descripcion?.toLowerCase()      ?? '';
      const categoria   = s.categoria?.nombre?.toLowerCase() ?? '';
      const profesional = `${s.perfilProfesional?.usuario?.nombre} ${s.perfilProfesional?.usuario?.apellidos}`.toLowerCase();

      const coincideTexto =
        texto.length === 0        ||
        nombre.includes(texto)    ||
        descripcion.includes(texto) ||
        categoria.includes(texto) ||
        profesional.includes(texto);

      const coincideCategoria =
        categoriaFiltro === null ||
        s.categoria?.id === categoriaFiltro;

      const coincideModalidad =
        modalidadFiltro === null ||
        s.modalidad === modalidadFiltro;

      return coincideTexto && coincideCategoria && coincideModalidad;
    });
  });

  totalServicios = computed(() => this.serviciosFiltrados().length);

  ngOnInit(): void {
    this.cargarServicios();
  }

  

get isProfesional(): boolean {

  return this.usuarioSimulado()?.rol === 'PROFESIONAL';

}

  cargarServicios(): void {

  this.loading.set(true);
  this.error.set(null);

  const idUsuario = this.usuarioService.idUsuario();

  this.usuarioService.obtenerPorId(idUsuario).subscribe({

    next: (response) => {

      const usuario = response.data;

      this.usuarioSimulado.set(usuario);

      if (usuario.rol === 'PROFESIONAL') {

        this.profesionalService.obtenerPorIdUsuario(idUsuario).subscribe({

          next: (response) => {

            const profesional = response.data;

            this.profesional.set(profesional);

            this.servicioService.listarByProfesional(profesional.id).subscribe({

              next: (response) => {

                this.servicios.set(response.data);
                this.loading.set(false);

              },

              error: () => {

                this.error.set('No se pudieron cargar los servicios.');
                this.loading.set(false);

              }

            });

          },

          error: () => {

            this.error.set('No se pudo obtener el perfil profesional.');
            this.loading.set(false);

          }

        });

      } else {

        this.servicioService.listar().subscribe({

          next: (response) => {

            this.servicios.set(response.data);
            this.loading.set(false);

          },

          error: () => {

            this.error.set('No se pudieron cargar los servicios.');
            this.loading.set(false);

          }

        });

      }

    },

    error: () => {

      this.error.set('No se pudo obtener el usuario.');
      this.loading.set(false);

    }

  });

}

  limpiarFiltros(): void {
    this.search.set('');
    this.categoriaId.set(null);
    this.modalidad.set(null);
  }

  formatDuracion(minutos: number): string {
    if (minutos < 60) return `${minutos} min`;
    const horas = Math.floor(minutos / 60);
    const mins  = minutos % 60;
    return mins > 0 ? `${horas}h ${mins}min` : `${horas}h`;
  }
}