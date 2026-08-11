import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormField,
  form,
  required,
  min,
  minLength,
  maxLength,
  pattern,
  validate,
} from '@angular/forms/signals';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { ImageService } from '../../../core/services/image.service';
import { Especialidad } from '../../../core/models/especialidad.model';
import {
  PerfilProfesional,
  PerfilProfesionalFormModel,
  PerfilProfesionalCreateDto,
  PerfilProfesionalUpdateDto,
} from '../../../core/models/perfil-profesional.model';

@Component({
  selector: 'app-perfil-profesional-form',
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
    MatProgressSpinnerModule,
  ],
  templateUrl: './perfil-profesional-form.html',
  styleUrl: './perfil-profesional-form.css',
})
export class PerfilProfesionalForm {
  private readonly imageService = inject(ImageService);

  perfil = input<PerfilProfesional | null>(null);
  saving = input<boolean>(false);
  especialidades = input<Especialidad[]>([]);

  guardar = output<PerfilProfesionalCreateDto | PerfilProfesionalUpdateDto>();
  cancelar = output<void>();

  uploadingImage = signal(false);
  imagePreview = signal<string | null>(null);
  selectedImageFile = signal<File | null>(null);
  private previousFileName: string | null = null;

  isEdit = computed(() => this.perfil() !== null);
  isSubmitting = computed(() => this.saving() || this.uploadingImage());

  perfilModel = signal<PerfilProfesionalFormModel>({
    nombre: '',
    apellidos: '',
    correo: '',
    telefono: '',
    contrasenaHash: '',
    confirmarContrasena: '',
    tituloProfesional: '',
    descripcion: '',
    aniosExperiencia: null,
    modalidad: 'PRESENCIAL',
    provincia: '',
    canton: '',
    distrito: '',
    tarifaBase: null,
    disponible: true,
    imagenPerfilUrl: '',
    especialidadIds: [],
  });

  perfilForm = form(this.perfilModel, (path) => {
    // --- Usuario ---
    required(path.nombre, { message: 'El nombre es obligatorio' });
    maxLength(path.nombre, 100, { message: 'Máximo 100 caracteres' });

    required(path.apellidos, { message: 'Los apellidos son obligatorios' });
    maxLength(path.apellidos, 150, { message: 'Máximo 150 caracteres' });

    required(path.correo, { message: 'El correo es obligatorio' });
    pattern(path.correo, /^[^\s@]+@[^\s@]+\.[^\s@]+$/, {
      message: 'Ingrese un correo válido',
    });

    required(path.telefono, { message: 'El teléfono es obligatorio' });
    pattern(path.telefono, /^\d{8}$/, {
      message: 'El teléfono debe tener 8 dígitos',
    });

    // La contraseña solo se valida al crear
    validate(path.contrasenaHash, (ctx) => {
      if (this.isEdit()) return undefined;
      const valor = ctx.value();
      if (!valor) {
        return { kind: 'required', message: 'La contraseña es obligatoria' };
      }
      if (valor.length < 6) {
        return { kind: 'minLength', message: 'Mínimo 6 caracteres' };
      }
      return undefined;
    });

    validate(path.confirmarContrasena, (ctx) => {
      if (this.isEdit()) return undefined;
      const confirmacion = ctx.value();
      const original = this.perfilModel().contrasenaHash;
      if (!confirmacion) {
        return { kind: 'required', message: 'Confirme la contraseña' };
      }
      if (confirmacion !== original) {
        return { kind: 'noCoincide', message: 'Las contraseñas no coinciden' };
      }
      return undefined;
    });

    // --- Perfil profesional ---
    required(path.tituloProfesional, { message: 'El título profesional es obligatorio' });
    maxLength(path.tituloProfesional, 150, { message: 'Máximo 150 caracteres' });

    required(path.descripcion, { message: 'La descripción es obligatoria' });
    minLength(path.descripcion, 20, { message: 'Mínimo 20 caracteres' });

    min(path.aniosExperiencia, 0, { message: 'No puede ser negativo' });

    required(path.modalidad, { message: 'Seleccione una modalidad' });

    required(path.provincia, { message: 'La provincia es obligatoria' });
    required(path.canton, { message: 'El cantón es obligatorio' });
    required(path.distrito, { message: 'El distrito es obligatorio' });

    min(path.tarifaBase, 0, { message: 'La tarifa no puede ser negativa' });
  });

  constructor() {
    effect(() => {
      const perfil = this.perfil();
      if (!perfil) {
        this.resetForm();
        return;
      }
      this.perfilModel.set({
        nombre: perfil.usuario?.nombre ?? '',
        apellidos: perfil.usuario?.apellidos ?? '',
        correo: perfil.usuario?.correo ?? '',
        telefono: perfil.usuario?.telefono ?? '',
        contrasenaHash: '',
        confirmarContrasena: '',
        tituloProfesional: perfil.tituloProfesional ?? '',
        descripcion: perfil.descripcion ?? '',
        aniosExperiencia: perfil.aniosExperiencia ?? null,
        modalidad: perfil.modalidad,
        provincia: perfil.provincia ?? '',
        canton: perfil.canton ?? '',
        distrito: perfil.distrito ?? '',
        tarifaBase: perfil.tarifaBase !== null ? Number(perfil.tarifaBase) : null,
        disponible: perfil.disponible ?? true,
        imagenPerfilUrl: perfil.imagenPerfilUrl ?? '',
        especialidadIds: perfil.especialidades?.map((e) => e.especialidad.id) ?? [],
      });
      this.previousFileName = perfil.imagenPerfilUrl ?? null;
      this.selectedImageFile.set(null);
      this.imagePreview.set(
        perfil.imagenPerfilUrl ? this.imageService.getImageUrl(perfil.imagenPerfilUrl) : null
      );
    });
  }

  private resetForm(): void {
    this.perfilModel.set({
      nombre: '',
      apellidos: '',
      correo: '',
      telefono: '',
      contrasenaHash: '',
      confirmarContrasena: '',
      tituloProfesional: '',
      descripcion: '',
      aniosExperiencia: null,
      modalidad: 'PRESENCIAL',
      provincia: '',
      canton: '',
      distrito: '',
      tarifaBase: null,
      disponible: true,
      imagenPerfilUrl: '',
      especialidadIds: [],
    });
    this.previousFileName = null;
    this.selectedImageFile.set(null);
    this.imagePreview.set(null);
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.selectedImageFile.set(file);
    this.imagePreview.set(URL.createObjectURL(file));
  }

  toggleEspecialidad(id: number, checked: boolean): void {
    this.perfilModel.update((value) => ({
      ...value,
      especialidadIds: checked
        ? Array.from(new Set([...value.especialidadIds, id]))
        : value.especialidadIds.filter((item) => item !== id),
    }));
  }

  isEspecialidadSelected(id: number): boolean {
    return this.perfilModel().especialidadIds.includes(id);
  }

  private readonly camposUsuario = ['nombre', 'apellidos', 'correo', 'telefono'] as const;
  private readonly camposPerfil = [
    'tituloProfesional', 'descripcion', 'aniosExperiencia', 'modalidad',
    'provincia', 'canton', 'distrito', 'tarifaBase',
  ] as const;

  private marcarCamposComoTocados(): void {
    [...this.camposUsuario, ...this.camposPerfil].forEach((campo) => {
      (this.perfilForm[campo]() as any).markAsTouched();
    });
    if (!this.isEdit()) {
      this.perfilForm.contrasenaHash().markAsTouched();
      this.perfilForm.confirmarContrasena().markAsTouched();
    }
  }

  private formularioInvalido(): boolean {
    const camposBase = [...this.camposUsuario, ...this.camposPerfil].some(
      (campo) => (this.perfilForm[campo]() as any).invalid()
    );
    if (this.isEdit()) return camposBase;
    return (
      camposBase ||
      this.perfilForm.contrasenaHash().invalid() ||
      this.perfilForm.confirmarContrasena().invalid()
    );
  }

  submit(): void {
    if (this.isSubmitting()) return;
    this.marcarCamposComoTocados();
    if (this.formularioInvalido()) return;

    const file = this.selectedImageFile();
    if (file) {
      this.subirImagenYGuardar(file);
      return;
    }
    this.emitirGuardar();
  }

  private subirImagenYGuardar(file: File): void {
    this.uploadingImage.set(true);
    this.imageService.upload(file, this.previousFileName).subscribe({
      next: (response) => {
        this.perfilModel.update((value) => ({
          ...value,
          imagenPerfilUrl: response.fileName,
        }));
        this.selectedImageFile.set(null);
        this.emitirGuardar();
      },
      error: () => {
        alert('No se pudo subir la imagen');
      },
      complete: () => {
        this.uploadingImage.set(false);
      },
    });
  }

  private emitirGuardar(): void {
    const value = this.perfilModel();

    if (this.isEdit()) {
      const dto: PerfilProfesionalUpdateDto = {
        nombre: value.nombre.trim(),
        apellidos: value.apellidos.trim(),
        telefono: value.telefono.trim(),
        tituloProfesional: value.tituloProfesional.trim(),
        descripcion: value.descripcion.trim(),
        aniosExperiencia: value.aniosExperiencia !== null ? Number(value.aniosExperiencia) : null,
        modalidad: value.modalidad,
        provincia: value.provincia.trim(),
        canton: value.canton.trim(),
        distrito: value.distrito.trim(),
        tarifaBase: value.tarifaBase !== null ? Number(value.tarifaBase) : null,
        disponible: value.disponible,
        imagenPerfilUrl: value.imagenPerfilUrl,
        especialidadIds: value.especialidadIds,
      };
      this.guardar.emit(dto);
      return;
    }

    const dto: PerfilProfesionalCreateDto = {
      nombre: value.nombre.trim(),
      apellidos: value.apellidos.trim(),
      correo: value.correo.trim().toLowerCase(),
      telefono: value.telefono.trim(),
      contrasenaHash: value.contrasenaHash,
      tituloProfesional: value.tituloProfesional.trim(),
      descripcion: value.descripcion.trim(),
      aniosExperiencia: value.aniosExperiencia !== null ? Number(value.aniosExperiencia) : null,
      modalidad: value.modalidad,
      provincia: value.provincia.trim(),
      canton: value.canton.trim(),
      distrito: value.distrito.trim(),
      tarifaBase: value.tarifaBase !== null ? Number(value.tarifaBase) : null,
      disponible: value.disponible,
      imagenPerfilUrl: value.imagenPerfilUrl,
      especialidadIds: value.especialidadIds,
    };
    this.guardar.emit(dto);
  }
}