import { prisma } from "../config/prisma";
import { AppError } from "../utils/app-error";

export const categoriaService = {

    async listar(nombre?: string, activo?: boolean) {

        return await prisma.categoriaServicio.findMany({

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
  const categoria = await prisma.categoriaServicio.findUnique({ where: { id } });
  if (!categoria) {
    throw AppError.notFound("La categoría no existe");
  }

  return await prisma.categoriaServicio.update({
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