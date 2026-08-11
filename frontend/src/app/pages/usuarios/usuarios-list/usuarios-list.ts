import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { DatePipe } from '@angular/common';
import { UsuarioService } from '../../../core/services/usuario.service';
import { Usuario } from '../../../core/models/usuario.model';

@Component({
  selector: 'app-usuarios-list',
  standalone: true,
  imports: [
    FormsModule,
    DatePipe,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatChipsModule,
    MatCardModule,
  ],
  templateUrl: './usuarios-list.html',
  styleUrl: './usuarios-list.css',
})
export class UsuariosList implements OnInit {
  private readonly usuarioService = inject(UsuarioService);
actualizandoEstadoId = signal<number | null>(null);  // Columnas de la tabla
  columnas = [
    'nombre',
    'correo',
    'telefono',
    'rol',
    'estado',
    'fechaRegistro',
    'acciones',
  ];

  // Estado de la pantalla
  usuarios = signal<Usuario[]>([]);
  search   = signal('');
  rol      = signal<string | null>(null);
  estado   = signal<string | null>(null);
  loading  = signal(false);
  error    = signal<string | null>(null);

  
  // Filtrar localmente con computed
  usuariosFiltrados = computed(() => {
    const texto       = this.search().trim().toLowerCase();
    const rolFiltro   = this.rol();
    const estadoFiltro = this.estado();

    return this.usuarios().filter((u) => {
      const nombre   = `${u.nombre} ${u.apellidos}`.toLowerCase();
      const correo   = u.correo?.toLowerCase() ?? '';
      const telefono = u.telefono?.toLowerCase() ?? '';

      const coincideTexto =
        texto.length === 0      ||
        nombre.includes(texto)  ||
        correo.includes(texto)  ||
        telefono.includes(texto);

      const coincideRol =
        rolFiltro === null ||
        u.rol === rolFiltro;

      const coincideEstado =
        estadoFiltro === null ||
        u.estado === estadoFiltro;

      return coincideTexto && coincideRol && coincideEstado;
    });
  });

  totalUsuarios = computed(() => this.usuariosFiltrados().length);

  // Contadores por rol para el resumen
  totalAdmins       = computed(() => this.usuarios().filter(u => u.rol === 'ADMIN').length);
  totalProfesionales = computed(() => this.usuarios().filter(u => u.rol === 'PROFESIONAL').length);
  totalClientes     = computed(() => this.usuarios().filter(u => u.rol === 'CLIENTE').length);
  totalActivos      = computed(() => this.usuarios().filter(u => u.estado === 'ACTIVO').length);

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.loading.set(true);
    this.error.set(null);

    this.usuarioService.listar().subscribe({
      next: (response) => {
        this.usuarios.set(response.data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar los usuarios.');
        this.loading.set(false);
      },
    });
  }

  cambiarEstadoUsuario(usuario: Usuario): void {
  if (this.actualizandoEstadoId() !== null) return; // evita doble clic 
  this.actualizandoEstadoId.set(usuario.id);
  const nuevoEstado = usuario.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';

  this.usuarioService.cambiarEstado(usuario.id, nuevoEstado).subscribe({
    next: () => {
      // Actualiza solo el campo estado
      this.usuarios.update((lista) =>
        lista.map((u) => (u.id === usuario.id ? { ...u, estado: nuevoEstado } : u))
      );
    },
    error: () => {
      this.error.set('No se pudo cambiar el estado del usuario');
    },
    complete: () => {
      this.actualizandoEstadoId.set(null);
    },
  });
}

  limpiarFiltros(): void {
    this.search.set('');
    this.rol.set(null);
    this.estado.set(null);
  }

  getRolIcon(rol: string): string {
    const icons: Record<string, string> = {
      ADMIN:        'admin_panel_settings',
      PROFESIONAL:  'badge',
      CLIENTE:      'person',
    };
    return icons[rol] ?? 'person';
  }

  getRolLabel(rol: string): string {
    const labels: Record<string, string> = {
      ADMIN:       'Administrador',
      PROFESIONAL: 'Profesional',
      CLIENTE:     'Cliente',
    };
    return labels[rol] ?? rol;
  }
}