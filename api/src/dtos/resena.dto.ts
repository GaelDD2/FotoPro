import { z } from "zod";

export const createResenaSchema = z.object({
  citaId: z
    .number({ message: "La cita es obligatoria" })
    .int()
    .positive("La cita es obligatoria"),
  clienteId: z
    .number({ message: "El cliente es obligatorio" })
    .int()
    .positive("El cliente es obligatorio"),
  puntuacion: z
    .number({ message: "La puntuación es obligatoria" })
    .int("La puntuación debe ser un número entero")
    .min(1, "La puntuación mínima es 1")
    .max(5, "La puntuación máxima es 5"),
  comentario: z
    .string()
    .trim()
    .max(500, "El comentario no puede superar 500 caracteres")
    .optional(),
});

export type CreateResenaDto = z.infer<typeof createResenaSchema>;