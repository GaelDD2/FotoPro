import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { PerfilProfesional } from '../../../core/models/perfil-profesional.model';
import { PerfilProfesionalService } from '../../../core/services/perfil-profesional';
import { DecimalPipe } from '@angular/common';
import { Usuario } from '../../../core/models/usuario.model';
import { UsuarioService } from '../../../core/services/usuario.service';

@Component({
  selector: 'app-profesionales-list',
  standalone: true,
  imports: [
    DecimalPipe,
    RouterLink,
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
  templateUrl: './profesionales-list.html',
  styleUrl: './profesionales-list.css',
})
export class ProfesionalesList implements OnInit {
  private readonly perfilService = inject(PerfilProfesionalService);
  private readonly usuarioService = inject(UsuarioService);
  // Estado de la pantalla
  profesionales = signal<PerfilProfesional[]>([]);
  search        = signal('');
  modalidad     = signal<string | null>(null);
  loading       = signal(false);
  error         = signal<string | null>(null);
  usuarioSimulado = signal<Usuario | null>(null);

  // Filtros con computed (sin llamar al API de nuevo)
  profesionalesFiltrados = computed(() => {
    const texto           = this.search().trim().toLowerCase();
    const modalidadFiltro = this.modalidad();

    return this.profesionales().filter((p) => {
      const nombre    = `${p.usuario.nombre} ${p.usuario.apellidos}`.toLowerCase();
      const titulo    = p.tituloProfesional?.toLowerCase() ?? '';
      const provincia = p.provincia?.toLowerCase() ?? '';

      const coincideTexto =
        texto.length === 0 ||
        nombre.includes(texto)    ||
        titulo.includes(texto)    ||
        provincia.includes(texto);

      const coincideModalidad =
        modalidadFiltro === null ||
        p.modalidad === modalidadFiltro;

      return coincideTexto && coincideModalidad;
    });
  });

  totalProfesionales = computed(() => this.profesionalesFiltrados().length);

  ngOnInit(): void {
    const idUsuario = this.usuarioService.idUsuario();

  this.usuarioService.obtenerPorId(idUsuario).subscribe({
    next: (response) => {
      this.usuarioSimulado.set(response.data);
    }
  });
    this.cargarProfesionales();
  }

  get isAdmin(): boolean {

  return this.usuarioSimulado()?.rol === 'ADMIN';

}

  cargarProfesionales(): void {
    this.loading.set(true);
    this.error.set(null);

    this.perfilService.listar().subscribe({
      next: (response) => {
        this.profesionales.set(response.data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar los profesionales.');
        this.loading.set(false);
      },
    });
  }

  limpiarFiltros(): void {
    this.search.set('');
    this.modalidad.set(null);
  }

  getImageUrl(imageName: string): string {
    return this.perfilService.getImageUrl(imageName);
  }
}