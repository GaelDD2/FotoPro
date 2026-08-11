import { Component, computed, effect, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormField, form, required, minLength, validate } from '@angular/forms/signals';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';

import { Servicio } from '../../../core/models/servicio.model';
import { Usuario } from '../../../core/models/usuario.model';
import { CitaFormModel, CitaCreateDto, CitaUpdateDto } from '../../../core/models/cita.model';

@Component({
  selector: 'app-cita-form',
  standalone: true,
  imports: [
    CommonModule,
    FormField,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
  ],
  templateUrl: './cita-form.html',
  styleUrl: './cita-form.css',
})
export class CitaForm {
  saving = input<boolean>(false);
  cliente = input<Usuario | null>(null); // solo informativo
  servicio = input<Servicio | null>(null); // fijo, viene de la ruta

  guardar = output<Omit<CitaCreateDto, 'clienteId'>>();
  cancelar = output<void>();

  citaModel = signal<CitaFormModel>({
    servicioId: null,
    fecha: '',
    horaInicio: '',
    modalidad: 'PRESENCIAL',
    comentarioCliente: '',
  });

  modalidadesDisponibles = computed<('VIRTUAL' | 'PRESENCIAL' | 'MIXTA')[]>(() => {
    const servicio = this.servicio();
    if (!servicio) return ['VIRTUAL', 'PRESENCIAL', 'MIXTA'];
    return servicio.modalidad === 'MIXTA' ? ['VIRTUAL', 'PRESENCIAL'] : [servicio.modalidad];
  });

  citaForm = form(this.citaModel, (path) => {
    required(path.fecha, { message: 'La fecha es obligatoria' });
    required(path.horaInicio, { message: 'La hora es obligatoria' });
    validate(path.horaInicio, (ctx) => {
  const horaInicio = ctx.value();
  const servicio = this.servicio();
  if (!horaInicio || !servicio) return undefined;

  const [h, m] = horaInicio.split(':').map(Number);
  const totalMin = h * 60 + m + servicio.duracionMin;

  if (totalMin >= 24 * 60) {
    return {
      kind: 'horaFinFueraDeRango',
      message: `Con esta hora de inicio la cita terminaría después de medianoche (dura ${this.formatDuracion(servicio.duracionMin)}). Elija una hora más temprana.`,
    };
  }
  return undefined;
});

    required(path.horaInicio, { message: 'La hora es obligatoria' });

    required(path.modalidad, { message: 'Seleccione una modalidad' });

    required(path.comentarioCliente, { message: 'La descripción es obligatoria' });
    minLength(path.comentarioCliente, 10, { message: 'Mínimo 10 caracteres' });
  });

  isSubmitting = computed(() => this.saving());

  constructor() {
    // Ajusta el servicioId interno y corrige la modalidad cuando llega el servicio
    effect(() => {
      const servicio = this.servicio();
      const opciones = this.modalidadesDisponibles();
      this.citaModel.update((v) => ({
        ...v,
        servicioId: servicio?.id ?? null,
        modalidad: opciones.includes(v.modalidad) ? v.modalidad : opciones[0],
      }));
    });
  }

  private marcarCamposComoTocados(): void {
    this.citaForm.fecha().markAsTouched();
    this.citaForm.horaInicio().markAsTouched();
    this.citaForm.modalidad().markAsTouched();
    this.citaForm.comentarioCliente().markAsTouched();
  }

  private formularioInvalido(): boolean {
    return (
      this.citaForm.fecha().invalid() ||
      this.citaForm.horaInicio().invalid() ||
      this.citaForm.modalidad().invalid() ||
      this.citaForm.comentarioCliente().invalid()
    );
  }

  private calcularHoraFin(horaInicio: string, duracionMin: number): string | null {
  const [h, m] = horaInicio.split(':').map(Number);
  const totalMin = h * 60 + m + duracionMin;

  if (totalMin >= 24 * 60) {
    return null; // se pasaría de medianoche, no es válido
  }

  const horaF = Math.floor(totalMin / 60);
  const minF = totalMin % 60;
  return `${horaF.toString().padStart(2, '0')}:${minF.toString().padStart(2, '0')}`;
}

  formatDuracion(minutos: number): string {
    if (minutos < 60) return `${minutos} min`;
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    return mins > 0 ? `${horas}h ${mins}min` : `${horas}h`;
  }

  submit(): void {
  const servicio = this.servicio();
  if (!servicio) return;
  if (this.isSubmitting()) return;

  this.marcarCamposComoTocados();
  if (this.formularioInvalido()) return;

  const value = this.citaModel();
  const horaFin = this.calcularHoraFin(value.horaInicio, servicio.duracionMin);
  if (!horaFin) return; // ya cubierto por la validación, pero por seguridad

  this.guardar.emit({
    perfilProfesionalId: servicio.perfilProfesional.id,
    servicioId: servicio.id,
    modalidad: value.modalidad,
    fechaCita: value.fecha,
    horaInicio: value.horaInicio,
    horaFin,
    comentarioCliente: value.comentarioCliente.trim(),
  });
}
}