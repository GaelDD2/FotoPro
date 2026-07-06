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

export type CreateCitaDto = z.infer<typeof createCitaSchema>;
export type UpdateCitaDto = z.infer<typeof updateCitaSchema>;