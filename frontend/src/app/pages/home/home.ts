import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
 
interface ContentCard {
  title:       string;
  description: string;
  icon:        string;
  path:        string;
}
 
interface FeaturedSlide {
  title:       string;
  subtitle:    string;
  image:       string;
  path:        string;
  badge:       string;
}
 
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, MatCardModule, MatIconModule, MatButtonModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  // Ajusta apiBaseUrl según donde sirvas /assets/uploads (ej. environment.apiUrl)
  private readonly apiBaseUrl = 'http://localhost:3000';
 
  slides = signal<FeaturedSlide[]>([
    {
      title:    'Cursos de fotografía digital',
      subtitle: 'Aprende técnicas profesionales desde cero',
      image:    `uploads/curso-fotografia-digital.jpg`,
      path:     '/servicios',
      badge:    'Formación',
    },
    {
      title:    'Fotografía documental',
      subtitle: 'Historias reales contadas a través del lente',
      image:    `uploads/fotografia-documental.jpg`,
      path:     '/profesionales',
      badge:    'Especialidad',
    },
    {
      title:    'Sesiones profesionales',
      subtitle: 'Producciones audiovisuales de alta calidad',
      image:    `uploads/4641-b10045c6-640w.webp`,
      path:     '/citas',
      badge:    'Destacado',
    },
  ]);
 
  activeIndex = signal(0);
 
  cards = signal<ContentCard[]>([
    {
      title:       'Fotógrafos',
      description: 'Explora perfiles de fotógrafos y productores audiovisuales.',
      icon:        'people',
      path:        '/profesionales',
    },
    {
      title:       'Servicios',
      description: 'Filtra servicios por categoría, modalidad y precio.',
      icon:        'camera_alt',
      path:        '/servicios',
    },
    {
      title:       'Reserva tu cita',
      description: 'Agenda una sesión con tu fotógrafo favorito fácilmente.',
      icon:        'calendar_month',
      path:        '/citas',
    },
  ]);
 
  next(): void {
    const total = this.slides().length;
    this.activeIndex.set((this.activeIndex() + 1) % total);
  }
 
  prev(): void {
    const total = this.slides().length;
    this.activeIndex.set((this.activeIndex() - 1 + total) % total);
  }
 
  goTo(index: number): void {
    this.activeIndex.set(index);
  }
}