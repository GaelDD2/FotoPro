import { z } from 'zod';

const fechaOpcional = z.coerce.date().optional();

// ---------- Reporte: Citas por Estado ----------
export const citasPorEstadoQuerySchema = z
  .object({
    fechaInicio: fechaOpcional,
    fechaFin: fechaOpcional,
    perfilProfesionalId: z.coerce.number().int().positive().optional(),
    categoriaId: z.coerce.number().int().positive().optional(),
  })
  .refine(
    (data) => !data.fechaInicio || !data.fechaFin || data.fechaInicio <= data.fechaFin,
    {
      message: 'fechaInicio no puede ser posterior a fechaFin',
      path: ['fechaInicio'],
    }
  );

export type CitasPorEstadoQueryDto = z.infer<typeof citasPorEstadoQuerySchema>;

// ---------- Reporte: Citas por Profesional ----------
export const citasPorProfesionalQuerySchema = z
  .object({
    fechaInicio: fechaOpcional,
    fechaFin: fechaOpcional,
    perfilProfesionalId: z.coerce.number().int().positive().optional(),
  })
  .refine(
    (data) => !data.fechaInicio || !data.fechaFin || data.fechaInicio <= data.fechaFin,
    {
      message: 'fechaInicio no puede ser posterior a fechaFin',
      path: ['fechaInicio'],
    }
  );

export type CitasPorProfesionalQueryDto = z.infer<typeof citasPorProfesionalQuerySchema>;

// ---------- Reporte: Calificaciones ----------
export const calificacionesQuerySchema = z.object({
  perfilProfesionalId: z.coerce.number().int().positive().optional(),
  // Umbral documentado: por defecto 3.0 (sobre 5). Un servicio con promedio
  // estrictamente menor a este valor se considera de "baja calificación".
  // Solo se evalúan servicios con al menos 1 reseña.
  umbral: z.coerce.number().min(1).max(5).optional(),
});

export type CalificacionesQueryDto = z.infer<typeof calificacionesQuerySchema>;