import { z } from "zod";

export const createCitaSchema = z.object({
  clienteId: z
    .number({ message: "El cliente es obligatorio" })
    .int()
    .positive("El cliente es obligatorio"),
  perfilProfesionalId: z
    .number({ message: "El profesional es obligatorio" })
    .int()
    .positive("El profesional es obligatorio"),
  servicioId: z
    .number({ message: "El servicio es obligatorio" })
    .int()
    .positive("El servicio es obligatorio"),
  modalidad: z.enum(["VIRTUAL", "PRESENCIAL", "MIXTA"], {
    message: "La modalidad debe ser VIRTUAL, PRESENCIAL o MIXTA",
  }),
  fechaCita: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "La fecha debe tener formato YYYY-MM-DD"),
  horaInicio: z
    .string()
    .trim()
    .regex(/^\d{2}:\d{2}$/, "La hora de inicio debe tener formato HH:MM"),
  horaFin: z
    .string()
    .trim()
    .regex(/^\d{2}:\d{2}$/, "La hora de fin debe tener formato HH:MM"),
  comentarioCliente: z
    .string()
    .trim()
    .min(10, "La descripción debe tener al menos 10 caracteres")
    .max(500, "La descripción no puede superar 500 caracteres"),
});

// El estado no se incluye en el DTO porque siempre
// se asigna automáticamente como PENDIENTE en el service

export const updateCitaSchema = createCitaSchema
  .omit({
    clienteId:           true,
    perfilProfesionalId: true,
    servicioId:          true,
  })
  .partial();

export const aceptarCitaSchema = z.object({
  profesionalUsuarioId: z
    .number({ message: "El usuario profesional es obligatorio" })
    .int()
    .positive("El usuario profesional es obligatorio"),
  comentarioProfesional: z
    .string()
    .trim()
    .max(500, "El comentario no puede superar 500 caracteres")
    .optional(),
});

export const rechazarCitaSchema = z.object({
  profesionalUsuarioId: z
    .number({ message: "El usuario profesional es obligatorio" })
    .int()
    .positive("El usuario profesional es obligatorio"),
  motivo: z
    .string({ message: "El motivo de rechazo es obligatorio" })
    .trim()
    .min(10, "El motivo debe tener al menos 10 caracteres")
    .max(500, "El motivo no puede superar 500 caracteres"),
});

export const cancelarCitaSchema = z.object({
  usuarioId: z
    .number({ message: "El usuario que cancela es obligatorio" })
    .int()
    .positive("El usuario que cancela es obligatorio"),
  motivo: z
    .string({ message: "El motivo de cancelación es obligatorio" })
    .trim()
    .min(10, "El motivo debe tener al menos 10 caracteres")
    .max(500, "El motivo no puede superar 500 caracteres"),
});

export const completarCitaSchema = z.object({
  profesionalUsuarioId: z
    .number({ message: "El usuario profesional es obligatorio" })
    .int()
    .positive("El usuario profesional es obligatorio"),
});

export type AceptarCitaDto = z.infer<typeof aceptarCitaSchema>;
export type RechazarCitaDto = z.infer<typeof rechazarCitaSchema>;
export type CancelarCitaDto = z.infer<typeof cancelarCitaSchema>;
export type CompletarCitaDto = z.infer<typeof completarCitaSchema>;

export type CreateCitaDto = z.infer<typeof createCitaSchema>;
export type UpdateCitaDto = z.infer<typeof updateCitaSchema>;