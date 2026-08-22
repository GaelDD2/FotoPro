import { Component, computed, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from '../header/header';
import { Footer } from '../footer/footer';
import { AuthService } from '../../core/services/auth.service';

type Rol = 'CLIENTE' | 'ADMIN' | 'PROFESIONAL';

interface MenuItem {
  label: string;
  path:  string;
  icon:  string;
  roles?: Rol[];
}

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, Header, Footer],
  templateUrl: './main-layout.html',
  styleUrl:    './main-layout.css',
})
export class MainLayout {
  private readonly authService = inject(AuthService);

  currentUser = this.authService.usuario;
  isAdmin     = this.authService.isAdmin;

  publicMenu: MenuItem[] = [
    { label: 'Inicio',     path: '/',              icon: 'home'           },
    { label: 'Fotógrafos', path: '/profesionales', icon: 'people'         },
    { label: 'Servicios',  path: '/servicios',     icon: 'camera_alt'     },
    { label: 'Mis citas',  path: '/citas',         icon: 'calendar_month',
      roles: ['CLIENTE', 'PROFESIONAL', 'ADMIN']                          },
  ];

  adminMantenimientoMenu: MenuItem[] = [
    { label: 'Categorías',     path: '/admin/categorias',     icon: 'folder' },
    { label: 'Especialidades', path: '/admin/especialidades', icon: 'star'   },
    { label: 'Profesionales',  path: '/admin/profesionales',  icon: 'badge'  },
  ];

  adminGestionMenu: MenuItem[] = [
    { label: 'Citas',    path: '/admin/citas',    icon: 'calendar_month' },
    { label: 'Usuarios', path: '/admin/usuarios', icon: 'group'          },
    { label: 'Reportes', path: '/admin/reportes', icon: 'bar_chart'      },
  ];

  canShowItem(item: MenuItem): boolean {
    if (!item.roles) return true;
    const user = this.currentUser();
    return !!user && item.roles.includes(user.rol as Rol);
  }

  logout(): void {
    this.authService.logout();
  }
}