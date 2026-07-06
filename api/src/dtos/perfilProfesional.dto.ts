import { z } from "zod";

export const createPerfilProfesionalSchema = z.object({
  // Datos del usuario
  nombre: z
    .string()
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre no puede superar 100 caracteres"),
  apellidos: z
    .string()
    .trim()
    .min(2, "Los apellidos deben tener al menos 2 caracteres")
    .max(150, "Los apellidos no pueden superar 150 caracteres"),
  correo: z
    .string()
    .trim()
    .email("El correo no tiene un formato válido")
    .max(254),
  telefono: z
    .string()
    .trim()
    .min(8, "El teléfono debe tener al menos 8 caracteres")
    .max(20),
  contrasenaHash: z
    .string()
    .min(6, "La contraseña debe tener al menos 6 caracteres"),

  // Datos del perfil profesional
  tituloProfesional: z
    .string()
    .trim()
    .min(3, "El título profesional es obligatorio")
    .max(150),
  descripcion: z.string().trim().max(1000).optional(),
  aniosExperiencia: z
    .number({ message: "Los años de experiencia deben ser numéricos" })
    .int()
    .min(0, "Los años de experiencia no pueden ser negativos")
    .max(70, "Los años de experiencia no son válidos"),
  modalidad: z.enum(["VIRTUAL", "PRESENCIAL", "MIXTA"], {
    message: "La modalidad debe ser VIRTUAL, PRESENCIAL o MIXTA",
  }),
  provincia: z.string().trim().min(2).max(100),
  canton:    z.string().trim().min(2).max(100),
  distrito:  z.string().trim().min(2).max(100),
  tarifaBase: z
    .number({ message: "La tarifa base debe ser numérica" })
    .positive("La tarifa base debe ser mayor a 0")
    .optional(),
  disponible:     z.boolean().optional(),
  imagenPerfilUrl: z.string().trim().max(500).optional(),
  especialidadIds: z.array(z.number().int().positive()).optional(),
});

export const updatePerfilProfesionalSchema = createPerfilProfesionalSchema
  .omit({ correo: true, contrasenaHash: true })
  .partial();

export type CreatePerfilProfesionalDto = z.infer<typeof createPerfilProfesionalSchema>;
export type UpdatePerfilProfesionalDto  = z.infer<typeof updatePerfilProfesionalSchema>;