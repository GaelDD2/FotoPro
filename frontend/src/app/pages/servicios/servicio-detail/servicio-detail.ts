import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { ServicioService } from '../../../core/services/servicio.service';
import { Servicio } from '../../../core/models/servicio.model';
import { Usuario } from '../../../core/models/usuario.model';
import { UsuarioService } from '../../../core/services/usuario.service';
import { PerfilProfesionalService } from '../../../core/services/perfil-profesional';

@Component({
  selector: 'app-servicio-detail',
  standalone: true,
  imports: [
    RouterLink,
    DecimalPipe,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDividerModule,
  ],
  templateUrl: './servicio-detail.html',
  styleUrl: './servicio-detail.css',
})
export class ServicioDetail implements OnInit {
  private readonly route          = inject(ActivatedRoute);
  private readonly servicioService = inject(ServicioService);
  private readonly usuarioService = inject(UsuarioService);
  private readonly perfilService = inject(PerfilProfesionalService);
private readonly perfilProfesionalService = inject(PerfilProfesionalService);

miPerfilProfesionalId = signal<number | null>(null);
actualizandoEstado = signal(false);

esDuenio = computed(() => {
  const servicio = this.servicio();
  const miId = this.miPerfilProfesionalId();
  return servicio !== null && miId !== null && servicio.perfilProfesional.id === miId;
});



  servicio = signal<Servicio | null>(null);
  usuarioSimulado = signal<Usuario | null>(null);
  
  loading  = signal(false);
  error    = signal<string | null>(null);

  ngOnInit(): void {

  const idUsuario = this.usuarioService.idUsuario();

  this.usuarioService.obtenerPorId(idUsuario).subscribe({
    next: (response) => {
      this.usuarioSimulado.set(response.data);
    }
  });

  const id = Number(this.route.snapshot.paramMap.get('id'));

  if (!id) {
    this.error.set('El identificador del servicio no es válido.');
    return;
  }

  this.cargarServicio(id);
}

  get isCliente(): boolean {

  return this.usuarioSimulado()?.rol === 'CLIENTE';

}

  cargarServicio(id: number): void {
    this.loading.set(true);
    this.error.set(null);

    this.servicioService.obtenerPorId(id).subscribe({
      next: (response) => {
        this.servicio.set(response.data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar el detalle del servicio.');
        this.loading.set(false);
      },
    });
  }

  private cargarMiPerfilSiAplica(): void {
  const idUsuario = this.usuarioService.idUsuario();
  if (!idUsuario) return;

  this.perfilProfesionalService.obtenerPorIdUsuario(idUsuario).subscribe({
    next: (response) => {
      this.miPerfilProfesionalId.set(response.data.id);
    },
    error: () => {
      
    },
  });
}

cambiarEstadoServicio(): void {
  const servicio = this.servicio();
  if (!servicio || this.actualizandoEstado()) return;

  this.actualizandoEstado.set(true);
  const nuevoEstado = !servicio.activo;

  this.servicioService.cambiarEstado(servicio.id, nuevoEstado).subscribe({
    next: () => {
      this.servicio.update((s) => (s ? { ...s, activo: nuevoEstado } : s));
    },
    error: () => {
      this.error.set('No se pudo cambiar el estado del servicio');
    },
    complete: () => {
      this.actualizandoEstado.set(false);
    },
  });
}

  formatDuracion(minutos: number): string {
    if (minutos < 60) return `${minutos} min`;
    const horas = Math.floor(minutos / 60);
    const mins  = minutos % 60;
    return mins > 0 ? `${horas}h ${mins}min` : `${horas}h`;
  }

  getImageUrl(imageName: string | null): string {
  if (!imageName) {
    return 'assets/images/default-avatar.png';
  }

  return this.perfilService.getImageUrl(imageName);
}
}