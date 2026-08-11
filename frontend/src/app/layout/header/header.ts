import { Component, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgClass } from '@angular/common';
import { MatDividerModule } from '@angular/material/divider';
import { inject, OnInit, signal } from '@angular/core';
import { UsuarioService } from '../../core/services/usuario.service';
import { Usuario } from '../../core/models/usuario.model';

type Rol = 'CLIENTE' | 'ADMIN' | 'PROFESIONAL';

interface MenuItem {
  label:  string;
  path:   string;
  icon:   string;
  roles?: Rol[];
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    NgClass,
  RouterLink,
  RouterLinkActive,
  MatToolbarModule,
  MatButtonModule,
  MatIconModule,
  MatMenuModule,
  MatTooltipModule,
  MatDividerModule,
  ],
  templateUrl: './header.html',
  styleUrl:    './header.css',
})
export class Header {
  publicMenu             = input.required<MenuItem[]>();
  adminMantenimientoMenu = input.required<MenuItem[]>();
  adminGestionMenu       = input.required<MenuItem[]>();

 
  canShowItem            = input.required<(item: MenuItem) => boolean>();

  private readonly usuarioService = inject(UsuarioService);

usuario = signal<Usuario | null>(null);

  cerrarSesion   = output<void>();

  ngOnInit(): void {

  const idUsuario = this.usuarioService.idUsuario();

  this.usuarioService.obtenerPorId(idUsuario).subscribe({

    next: (response) => {

      this.usuario.set(response.data);

    },

    error: (error) => {

      console.error(error);

    }

  });

}

get isAdmin(): boolean {

  return this.usuario()?.rol === 'ADMIN';

}

  getRolIcon(rol: string): string {
    const icons: Record<string, string> = {
      ADMIN:       'admin_panel_settings',
      PROFESIONAL: 'badge',
      CLIENTE:     'person',
    };
    return icons[rol] ?? 'person';
  }

  getRolColor(rol: string): string {
    const colors: Record<string, string> = {
      ADMIN:       'rol-admin',
      PROFESIONAL: 'rol-profesional',
      CLIENTE:     'rol-cliente',
    };
    return colors[rol] ?? '';
  }
}