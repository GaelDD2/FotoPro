import { z } from 'zod';

export const loginSchema = z.object({
  correo: z.string().trim().email('Correo inválido'),
  contrasena: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export const registerSchema = z.object({
  nombre: z.string().trim().min(2).max(100),
  apellidos: z.string().trim().min(2).max(150),
  correo: z.string().trim().email().max(254),
  contrasena: z.string().min(6),
  telefono: z.string().trim().min(8).max(20),
});

export type LoginDto    = z.infer<typeof loginSchema>;
export type RegisterDto = z.infer<typeof registerSchema>;