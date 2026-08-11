import { Component, computed, effect, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormField, form, required, min } from '@angular/forms/signals';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';

import {
  Servicio,
  ServicioCreateDto,
  ServicioFormModel,
  ServicioUpdateDto,
} from '../../../core/models/servicio.model';
import { CategoriaServicio } from '../../../core/models/categoria-servicio.model';
import { Especialidad } from '../../../core/models/especialidad.model';
import { PerfilProfesional } from '../../../core/models/perfil-profesional.model';
import { Categoria } from '../../../core/models/categoria.model';

@Component({
  selector: 'app-servicio-form',
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
    MatCheckboxModule,
  ],
  templateUrl: './servicio-form.html',
  styleUrl: './servicio-form.css',
})
export class ServicioForm {
  servicio = input<Servicio | null>(null);
  saving = input<boolean>(false);
  categorias = input<Categoria[]>([]);
  especialidades = input<Especialidad[]>([]);
  profesional = input<PerfilProfesional | null>(null); // solo informativo

  guardar = output<ServicioCreateDto | ServicioUpdateDto>();
  cancelar = output<void>();

  servicioModel = signal<ServicioFormModel>({
    nombre: '',
    descripcion: '',
    precio: 0,
    duracionMin: 30,
    modalidad: 'PRESENCIAL',
    categoriaId: null,
    activo: true,
    especialidadIds: [],
  });

  servicioForm = form(this.servicioModel, (path) => {
    required(path.nombre, { message: 'El nombre es obligatorio' });

    required(path.descripcion, { message: 'La descripción es obligatoria' });

    required(path.precio, { message: 'El precio es obligatorio' });
    min(path.precio, 1, { message: 'El precio debe ser mayor a cero' });

    required(path.duracionMin, { message: 'La duración es obligatoria' });
    min(path.duracionMin, 1, { message: 'La duración debe ser mayor a cero' });

    required(path.categoriaId, { message: 'Seleccione una categoría' });
  });
constructor() {
  effect(() => {
    const servicio = this.servicio();
    if (!servicio) {
      this.resetForm();
      return;
    }
    this.servicioModel.set({
      nombre: servicio.nombre,
      descripcion: servicio.descripcion,
      precio: Number(servicio.precio),
      duracionMin: servicio.duracionMin,
      modalidad: servicio.modalidad,
      categoriaId: servicio.categoria?.id ?? null,
      activo: servicio.activo,
      especialidadIds: servicio.especialidades?.map((e) => e.especialidad.id) ?? [],
    });
  });
}

private resetForm(): void {
  this.servicioModel.set({
    nombre: '',
    descripcion: '',
    precio: 0,
    duracionMin: 30,
    modalidad: 'PRESENCIAL',
    categoriaId: null,
    activo: true,
    especialidadIds: [],
  });
}
  isEdit = computed(() => this.servicio() !== null);
  isSubmitting = computed(() => this.saving());

  toggleEspecialidad(id: number, checked: boolean): void {
    this.servicioModel.update((value) => ({
      ...value,
      especialidadIds: checked
        ? Array.from(new Set([...value.especialidadIds, id]))
        : value.especialidadIds.filter((item) => item !== id),
    }));
  }

  isEspecialidadSelected(id: number): boolean {
    return this.servicioModel().especialidadIds.includes(id);
  }

  private marcarCamposComoTocados(): void {
    this.servicioForm.nombre().markAsTouched();
    this.servicioForm.descripcion().markAsTouched();
    this.servicioForm.precio().markAsTouched();
    this.servicioForm.duracionMin().markAsTouched();
    this.servicioForm.categoriaId().markAsTouched();
  }

  private formularioInvalido(): boolean {
    return (
      this.servicioForm.nombre().invalid() ||
      this.servicioForm.descripcion().invalid() ||
      this.servicioForm.precio().invalid() ||
      this.servicioForm.duracionMin().invalid() ||
      this.servicioForm.categoriaId().invalid()
    );
  }

  private buildDto(): ServicioCreateDto | ServicioUpdateDto {
    const value = this.servicioModel();
    return {
      nombre: value.nombre.trim(),
      descripcion: value.descripcion.trim(),
      precio: Number(value.precio),
      duracionMin: Number(value.duracionMin),
      modalidad: value.modalidad,
      categoriaId: Number(value.categoriaId),
      activo: value.activo,
      especialidadIds: value.especialidadIds,
    } as ServicioCreateDto;
  }

  submit(): void {
    if (this.isSubmitting()) return;
    this.marcarCamposComoTocados();
    if (this.formularioInvalido()) return;
    const dto = this.buildDto();
    this.guardar.emit(dto);
  }
}