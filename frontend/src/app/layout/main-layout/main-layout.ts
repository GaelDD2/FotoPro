import { Component, computed, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from '../header/header';
import { Footer } from '../footer/footer';
import { SesionService } from '../../core/services/sesion.service';
import { SesionUsuario } from '../../core/models/sesion.model';

type Rol = 'CLIENTE' | 'ADMIN' | 'PROFESIONAL';

interface MenuItem {
  label: string;
  path:  string;
  icon:  string;
  roles?: Rol[];
}

// Usuarios de prueba disponibles en el seed


@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, Header, Footer],
  templateUrl: './main-layout.html',
  styleUrl:    './main-layout.css',
})
export class MainLayout {
  private readonly sesionService = inject(SesionService);

  // Exponer el usuario actual del servicio
  currentUser = this.sesionService.usuario;
  isAdmin     = this.sesionService.isAdmin;

 

  publicMenu: MenuItem[] = [
    { label: 'Inicio',     path: '/',              icon: 'home'           },
    { label: 'Fotógrafos', path: '/profesionales', icon: 'people'         },
    { label: 'Servicios',  path: '/servicios',     icon: 'camera_alt'     },
    { label: 'Mis citas',  path: '/citas',         icon: 'calendar_month',
      roles: ['CLIENTE', 'PROFESIONAL', 'ADMIN']                          },
  ];

  adminMantenimientoMenu: MenuItem[] = [
    { label: 'Categorías',     path: '/admin/categorias',     icon: 'folder'  },
    { label: 'Especialidades', path: '/admin/especialidades', icon: 'star'    },
    { label: 'Profesionales',  path: '/admin/profesionales',  icon: 'badge'   },
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

  simularUsuario(usuario: SesionUsuario): void {
    this.sesionService.simularUsuario(usuario);
  }

  cerrarSesion(): void {
    this.sesionService.cerrarSesion();
  }
}