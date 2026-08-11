import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { DecimalPipe } from '@angular/common';
import { PerfilProfesional } from '../../../core/models/perfil-profesional.model';
import { PerfilProfesionalService } from '../../../core/services/perfil-profesional';
import { Usuario } from '../../../core/models/usuario.model';
import { UsuarioService } from '../../../core/services/usuario.service';

@Component({
  selector: 'app-profesional-detail',
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
  templateUrl: './profesional-detail.html',
  styleUrl: './profesional-detail.css',
})
export class ProfesionalDetail implements OnInit {
  private readonly route         = inject(ActivatedRoute);
  private readonly perfilService = inject(PerfilProfesionalService);
  private readonly usuarioService = inject(UsuarioService);
usuarioSimulado = signal<Usuario | null>(null);
  profesional = signal<PerfilProfesional | null>(null);
  loading     = signal(false);
  error       = signal<string | null>(null);

  ngOnInit(): void {

    const idUsuario = this.usuarioService.idUsuario();

  this.usuarioService.obtenerPorId(idUsuario).subscribe({
    next: (response) => {
      this.usuarioSimulado.set(response.data);
    }
  });

    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.error.set('El identificador del profesional no es válido.');
      return;
    }
    this.cargarProfesional(id);
  }

  get isAdmin(): boolean {

  return this.usuarioSimulado()?.rol === 'ADMIN';

}

  cargarProfesional(id: number): void {
    this.loading.set(true);
    this.error.set(null);

    this.perfilService.obtenerPorId(id).subscribe({
      next: (response) => {
        this.profesional.set(response.data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar el perfil del profesional.');
        this.loading.set(false);
      },
    });
  }

  getImageUrl(imageName: string): string {
    return this.perfilService.getImageUrl(imageName);
  }
}