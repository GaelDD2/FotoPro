import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { toast, NgxSonnerToaster } from 'ngx-sonner';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NgxSonnerToaster],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('app');
  private readonly authService = inject(AuthService);

  ngOnInit(): void {
    this.authService.inicializarSesion().subscribe();
  }
}

