import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { DatePipe, DecimalPipe } from '@angular/common';
import { PerfilProfesional } from '../../../core/models/perfil-profesional.model';
import { PerfilProfesionalService } from '../../../core/services/perfil-profesional';
import { Usuario } from '../../../core/models/usuario.model';
import { UsuarioService } from '../../../core/services/usuario.service';
import { ResenaService } from '../../../core/services/resena.service';
import { ResenasProfesionalResponse } from '../../../core/models/resena.model';

@Component({
  selector: 'app-profesional-detail',
  standalone: true,
  imports: [
    RouterLink,
    DecimalPipe,
    DatePipe,
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
  private readonly resenaService = inject(ResenaService);

usuarioSimulado = signal<Usuario | null>(null);
  profesional = signal<PerfilProfesional | null>(null);
  loading     = signal(false);
  error       = signal<string | null>(null);
    resenasData = signal<ResenasProfesionalResponse | null>(null);

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
        this.cargarResenas(id);  
      },
      error: () => {
        this.error.set('No se pudo cargar el perfil del profesional.');
        this.loading.set(false);
      },
    });
  }

    cargarResenas(perfilProfesionalId: number): void {
    this.resenaService.listarPorProfesional(perfilProfesionalId).subscribe({
      next: (response) => this.resenasData.set(response.data),
      error: () => {
        // silencioso: si falla, la tarjeta de reseñas simplemente no se llena
      },
    });
  }

  getImageUrl(imageName: string): string {
    return this.perfilService.getImageUrl(imageName);
  }
}