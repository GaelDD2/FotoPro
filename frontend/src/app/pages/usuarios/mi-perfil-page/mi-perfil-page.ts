import { Component, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { UsuarioService } from '../../../core/services/usuario.service';
import { PerfilProfesionalService } from '../../../core/services/perfil-profesional';
import { PerfilProfesional } from '../../../core/models/perfil-profesional.model';
import { Usuario } from '../../../core/models/usuario.model';
import { AuthService } from '../../../core/services/auth.service';
import { LowerCasePipe } from '@angular/common';

@Component({
  selector: 'app-mi-perfil-page',
  standalone: true,
  imports: [
    FormsModule,
    MatCardModule,
    MatSlideToggleModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDividerModule,
    MatChipsModule,
    LowerCasePipe
  ],
  templateUrl: './mi-perfil-page.html',
  styleUrl: './mi-perfil-page.css',
})
export class MiPerfilPage {
  private readonly usuarioService = inject(UsuarioService);
  private readonly perfilService  = inject(PerfilProfesionalService);
  private readonly authService    = inject(AuthService);

  usuarioActual = this.authService.usuario;
  isProfesional = this.authService.isProfesional;

  // Estado de datos
  usuario      = signal<Usuario | null>(null);
  perfil       = signal<PerfilProfesional | null>(null);
  loading      = signal(true);
  actualizando = signal(false);
  guardando    = signal(false);
  error        = signal<string | null>(null);
  exito        = signal<string | null>(null);

  // Modo edición
  editando = signal(false);

  // Formulario de edición — se inicializa cuando se carga el usuario
  form = signal({
    nombre:    '',
    apellidos: '',
    correo:    '',
    telefono:  '',
  });

  constructor() {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.loading.set(true);
    this.error.set(null);

    const id = this.usuarioService.idUsuario();

    this.usuarioService.obtenerPorId(id).subscribe({
      next: (resp) => {
        this.usuario.set(resp.data);
        this.inicializarForm(resp.data);

        if (this.isProfesional()) {
          this.cargarPerfilProfesional(id);
        } else {
          this.loading.set(false);
        }
      },
      error: () => {
        this.error.set('No se pudo cargar tu información.');
        this.loading.set(false);
      },
    });
  }

  private cargarPerfilProfesional(usuarioId: number): void {
    this.perfilService.obtenerPorIdUsuario(usuarioId).subscribe({
      next: (resp) => {
        this.perfil.set(resp.data);
      },
      error: () => {
        // No bloqueamos si falla el perfil profesional
      },
      complete: () => {
        this.loading.set(false);
      },
    });
  }

  private inicializarForm(u: Usuario): void {
    this.form.set({
      nombre:    u.nombre,
      apellidos: u.apellidos,
      correo:    u.correo,
      telefono:  u.telefono,
    });
  }

  activarEdicion(): void {
    const u = this.usuario();
    if (u) this.inicializarForm(u);
    this.editando.set(true);
    this.exito.set(null);
    this.error.set(null);
  }

  cancelarEdicion(): void {
    this.editando.set(false);
    this.error.set(null);
  }

  guardarCambios(): void {
    const id = this.usuarioService.idUsuario();
    const f  = this.form();

    if (!f.nombre.trim() || !f.apellidos.trim() ||
        !f.correo.trim() || !f.telefono.trim()) {
      this.error.set('Todos los campos son obligatorios.');
      return;
    }

    this.guardando.set(true);
    this.error.set(null);

    this.usuarioService.actualizar(id, {
      nombre:    f.nombre.trim(),
      apellidos: f.apellidos.trim(),
      correo:    f.correo.trim(),
      telefono:  f.telefono.trim(),
    }).subscribe({
      next: (resp) => {
        // Actualiza el signal sin recargar la página
        this.usuario.set(resp.data);
        this.editando.set(false);
        this.exito.set('Perfil actualizado correctamente.');
        setTimeout(() => this.exito.set(null), 3000);
      },
      error: (err) => {
        this.error.set(err.error?.message ?? 'No se pudo actualizar el perfil.');
      },
      complete: () => {
        this.guardando.set(false);
      },
    });
  }

  cambiarDisponibilidad(event: { checked: boolean }): void {
    const p = this.perfil();
    if (!p || this.actualizando()) return;

    this.actualizando.set(true);
    const nuevoValor = event.checked;

    this.perfilService.cambiarDisponibilidad(p.id, nuevoValor).subscribe({
      next: () => {
        // Actualiza el signal sin recargar
        this.perfil.update((prev) => prev ? { ...prev, disponible: nuevoValor } : prev);
        this.exito.set(`Ahora estás ${nuevoValor ? 'disponible' : 'no disponible'} para nuevas citas.`);
        setTimeout(() => this.exito.set(null), 3000);
      },
      error: () => {
        this.error.set('No se pudo actualizar tu disponibilidad.');
      },
      complete: () => {
        this.actualizando.set(false);
      },
    });
  }

  getRolLabel(rol: string): string {
    const labels: Record<string, string> = {
      ADMIN:       'Administrador',
      PROFESIONAL: 'Profesional',
      CLIENTE:     'Cliente',
    };
    return labels[rol] ?? rol;
  }

  getRolIcon(rol: string): string {
    const icons: Record<string, string> = {
      ADMIN:       'admin_panel_settings',
      PROFESIONAL: 'badge',
      CLIENTE:     'person',
    };
    return icons[rol] ?? 'person';
  }
}