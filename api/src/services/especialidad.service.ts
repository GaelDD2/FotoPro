import { prisma } from "../config/prisma";
import { AppError } from "../utils/app-error";

export const EspecialidadService = {

    async listar(nombre?: string, activo?: boolean) {

        return await prisma.especialidad.findMany({

            where: {

                nombre: nombre
                    ? {
                        contains: nombre
                    }
                    : undefined,

                activo: activo ?? undefined

            },

            select: {
                id: true,
                nombre: true,
                descripcion:true,
                activo: true
            }

        });

    },

    async cambiarEstado(id: number, activo: boolean) {
  const especialidad = await prisma.especialidad.findUnique({ where: { id } });
  if (!especialidad) {
    throw AppError.notFound("La especialidad no existe");
  }

  return await prisma.especialidad.update({
    where: { id },
    data:  { activo },
    select: {
      id:     true,
      nombre: true,
      activo: true,
    },
  });
},

};