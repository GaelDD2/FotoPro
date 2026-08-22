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
  selector: 'app-login-page',
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
  templateUrl: './login-page.html',
  styleUrl: './login-page.css',
})
export class LoginPage {
  private readonly authService = inject(AuthService);
  private readonly router      = inject(Router);

  correo     = signal('');
  contrasena = signal('');
  error      = signal<string | null>(null);
  mostrarContrasena = signal(false);

  // Usa el signal del servicio directamente en vez de uno local
  readonly cargando = this.authService.cargandoSesion;

  login() {
    if (!this.correo().trim() || !this.contrasena().trim()) {
      this.error.set('Completa todos los campos');
      return;
    }

    // Evita doble envío mientras está cargando
    if (this.cargando()) return;

    this.error.set(null);

    this.authService.login({
      correo:     this.correo().trim(),
      contrasena: this.contrasena(),
    }).subscribe({
      next: () => {
        // El usuario ya está seteado en el servicio
        // Redirige según el rol
        const rol = this.authService.rol();
        if (rol === 'ADMIN')            this.router.navigate(['/admin/usuarios']);
        else if (rol === 'PROFESIONAL') this.router.navigate(['/citas']);
        else                            this.router.navigate(['/']);
      },
      error: (err: Error) => {
        // El servicio ya transforma el error en un Error legible
        this.error.set(err.message);
      },
    });
  }
}