import { z } from 'zod';

export const updateUsuarioSchema = z.object({
  nombre:    z.string().trim().min(2).max(100).optional(),
  apellidos: z.string().trim().min(2).max(150).optional(),
  correo:    z.string().trim().email().max(254).optional(),
  telefono:  z.string().trim().min(8).max(20).optional(),
});

export type UpdateUsuarioDto = z.infer<typeof updateUsuarioSchema>;