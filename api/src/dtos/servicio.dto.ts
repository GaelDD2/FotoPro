import { z } from "zod";

export const createServicioSchema = z.object({
  perfilProfesionalId: z
    .number({ message: "El profesional es obligatorio" })
    .int()
    .positive("El profesional es obligatorio"),
  categoriaId: z
    .number({ message: "La categoría es obligatoria" })
    .int()
    .positive("La categoría es obligatoria"),
  nombre: z
    .string()
    .trim()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(200, "El nombre no puede superar 200 caracteres"),
  descripcion: z
    .string()
    .trim()
    .min(10, "La descripción debe tener al menos 10 caracteres")
    .max(1000, "La descripción no puede superar 1000 caracteres"),
  precio: z
    .number({ message: "El precio debe ser numérico" })
    .positive("El precio debe ser mayor a cero"),
  duracionMin: z
    .number({ message: "La duración debe ser numérica" })
    .int()
    .positive("La duración debe ser mayor a cero"),
  modalidad: z.enum(["VIRTUAL", "PRESENCIAL", "MIXTA"], {
    message: "La modalidad debe ser VIRTUAL, PRESENCIAL o MIXTA",
  }),
  activo: z.boolean().optional(),
  especialidadIds: z
    .array(z.number().int().positive())
    .optional(),
});

export const updateServicioSchema = createServicioSchema
  .omit({ perfilProfesionalId: true })
  .partial();

export type CreateServicioDto = z.infer<typeof createServicioSchema>;
export type UpdateServicioDto  = z.infer<typeof updateServicioSchema>;