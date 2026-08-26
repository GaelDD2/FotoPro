import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgxSonnerToaster } from 'ngx-sonner';
import { AuthService } from './core/services/auth.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NgxSonnerToaster,MatProgressSpinnerModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  private readonly authService = inject(AuthService);

  sesionLista = signal(false);

  ngOnInit(): void {
    this.authService.inicializarSesion().subscribe({
      complete: () => this.sesionLista.set(true),
      error:    () => this.sesionLista.set(true),
    });
  }
}