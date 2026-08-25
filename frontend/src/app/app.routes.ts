import { Routes } from '@angular/router';
import { MainLayout } from './layout/main-layout/main-layout';
import { Home } from './pages/home/home';
import { ProfesionalesList } from './pages/profesionales/profesionales-list/profesionales-list';
import { ProfesionalDetail } from './pages/profesionales/profesional-detail/profesional-detail';
import { ServiciosList } from './pages/servicios/servicios-list/servicios-list';
import { ServicioDetail } from './pages/servicios/servicio-detail/servicio-detail';
import { CitasList } from './pages/citas/citas-list/citas-list';
import { UsuariosList } from './pages/usuarios/usuarios-list/usuarios-list';
import { CategoriasList } from './pages/categorias/categorias-list/categorias-list';
import { EspecialidadesList } from './pages/especialidades/especialidades-list/especialidades-list';
import { CitaDetail } from './pages/citas/cita-detail/cita-detail';
import { ServicioCreatePage } from './pages/servicios/servicio-create-page/servicio-create-page';
import { CitaCreatePage } from './pages/citas/cita-create-page/cita-create-page';
import { ServicioEditPage } from './pages/servicios/servicio-edit-page/servicio-edit-page';
import { PerfilProfesionalCreatePage } from './pages/profesionales/perfil-profesional-create-page/perfil-profesional-create-page';
import { PerfilProfesionalEditPage } from './pages/profesionales/perfil-profesional-edit-page/perfil-profesional-edit-page';
import { MiPerfilPage } from './pages/usuarios/mi-perfil-page/mi-perfil-page';
import { ReporteFinancieroPage } from './pages/reportes/reporte-financiero-page/reporte-financiero-page';
import { LoginPage } from './pages/auth/login-page/login-page';
import { RegisterPage } from './pages/auth/register-page/register-page';
import { authGuard } from './core/guards/auth.guard';
import { CitasAgendaProfesionalPage } from './pages/citas/cita-agenda-profesional-page/cita-agenda-profesional-page';
import { CitaAgendaAdminPage } from './pages/citas/cita-agenda-admin-page/cita-agenda-admin-page';

export const routes: Routes = [

  { path: 'login', component: LoginPage, title: 'Iniciar sesión' },
  { path: 'register', component: RegisterPage, title: 'Registro' },

  {
    path: '',
    component: MainLayout,
    children: [
      { path: '', component: Home, title: 'FotoPro - Inicio' },
      { path: 'mi-perfil', component: MiPerfilPage, title: 'Mi perfil' },
      { path: 'profesionales', component: ProfesionalesList, title: 'Fotógrafos' },
      { path: 'profesionales/registro', component: PerfilProfesionalCreatePage, title: 'Registrarse como profesional' },
      { path: 'profesionales/:id/editar', component: PerfilProfesionalEditPage, title: 'Editar perfil profesional' },
      { path: 'profesionales/:id', component: ProfesionalDetail, title: 'Perfil del profesional' },
      { path: 'servicios', component: ServiciosList, title: 'Servicios' },
      { path: 'servicios/crear', component: ServicioCreatePage, title: 'Crear servicio' },
      { path: 'servicios/:id/editar', component: ServicioEditPage, title: 'Editar servicio' },
      { path: 'servicios/:id', component: ServicioDetail, title: 'Detalle del servicio' },

      { path: 'mi-reporte', component: ReporteFinancieroPage, title: 'Mi reporte financiero' },

      { path: 'citas', component: CitasList, canActivate: [authGuard], title: 'Mis Citas' },
      { path: 'admin/citas', component: CitasList, title: 'Gestión de Citas' },
      { path: 'admin/citas/agenda', component: CitaAgendaAdminPage, canActivate: [authGuard], title: 'Agenda general' },



      { path: 'citas', component: CitasList, canActivate: [authGuard], title: 'Mis Citas' },
      { path: 'citas/agenda', component: CitasAgendaProfesionalPage, canActivate: [authGuard], title: 'Agenda de citas' },
      { path: 'citas/crear', component: CitaCreatePage, title: 'Reservar cita' },
      { path: 'citas/:id', component: CitaDetail, canActivate: [authGuard], title: 'Cita' },
      { path: 'admin/usuarios', component: UsuariosList, title: 'Gestión de Usuarios' },
      { path: 'admin/citas', component: CitasList, title: 'Gestión de Citas' },
      { path: 'admin/categorias', component: CategoriasList, title: 'Categorías' },
      { path: 'admin/especialidades', component: EspecialidadesList, title: 'Especialidades' },

    ],
  },
  { path: '**', redirectTo: '' },
];