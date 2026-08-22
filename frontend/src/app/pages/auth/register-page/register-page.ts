import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [
    RouterLink,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './register-page.html',
  styleUrl: './register-page.css',
})
export class RegisterPage {
  private readonly authService = inject(AuthService);
  private readonly router      = inject(Router);

  nombre     = signal('');
  apellidos  = signal('');
  correo     = signal('');
  contrasena = signal('');
  telefono   = signal('');
  loading    = signal(false);
  error      = signal<string | null>(null);
  mostrarContrasena = signal(false);

  register() {
    if (
      !this.nombre().trim()     ||
      !this.apellidos().trim()  ||
      !this.correo().trim()     ||
      !this.contrasena().trim() ||
      !this.telefono().trim()
    ) {
      this.error.set('Completa todos los campos');
      return;
    }

    if (this.loading()) return;

    this.loading.set(true);
    this.error.set(null);

    this.authService.register({
      nombre:     this.nombre().trim(),
      apellidos:  this.apellidos().trim(),
      correo:     this.correo().trim(),
      contrasena: this.contrasena(),
      telefono:   this.telefono().trim(),
    }).subscribe({
      next: () => {
        // Solo registra, no loguea — redirige al login
        this.router.navigate(['/login']);
      },
      error: (err: Error) => {
        this.error.set(err.message ?? 'No se pudo completar el registro');
        this.loading.set(false);
      },
      complete: () => this.loading.set(false),
    });
  }
}