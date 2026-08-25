import { Rol } from "../../generated/prisma";
import { prisma } from "../config/prisma";
import { UpdateUsuarioDto } from "../dtos/usuario.dto";
import { AppError } from "../utils/app-error";

export const usuarioService = {

  async listar(
        nombre?: string,
        rol?: Rol
    ) {

        return await prisma.usuario.findMany({

            where: {

                rol: rol ?? undefined,

                OR: nombre
                    ? [
                        {
                            nombre: {
                                contains: nombre
                            }
                        },
                        {
                            apellidos: {
                                contains: nombre
                            }
                        }
                    ]
                    : undefined

            },

            select: {

                id: true,

                nombre: true,

                apellidos: true,

                correo: true,

                rol: true,
                

                estado: true,

                telefono:true,

                createdAt: true

            }

        });

    },

  async usuarioById(id: number) {

    return await prisma.usuario.findUnique({

        where: {
            id
        },

        select: {

            id: true,

            nombre: true,

            apellidos: true,

            correo: true,

            rol: true,

            telefono: true,

        }

    });

},

  
async cambiarEstado(id: number, estado: "ACTIVO" | "INACTIVO") {
  const usuario = await prisma.usuario.findUnique({ where: { id } });
  if (!usuario) {
    throw AppError.notFound("El usuario no existe");
  }

  return await prisma.usuario.update({
    where: { id },
    data:  { estado },
    select: {
      id:     true,
      nombre: true,
      correo: true,
      rol:    true,
      estado: true,
    },
  });
},


async actualizar(id: number, data: UpdateUsuarioDto) {
  const usuario = await prisma.usuario.findUnique({ where: { id } });
  if (!usuario) {
    throw AppError.notFound('Usuario no encontrado');
  }

  if (data.correo && data.correo !== usuario.correo) {
    const existe = await prisma.usuario.findUnique({
      where: { correo: data.correo },
    });
    if (existe) {
      throw AppError.conflict('El correo ya está registrado');
    }
  }

  return await prisma.usuario.update({
    where: { id },
    data: {
      nombre:    data.nombre,
      apellidos: data.apellidos,
      correo:    data.correo,
      telefono:  data.telefono,
    },
    select: {
      id:        true,
      nombre:    true,
      apellidos: true,
      correo:    true,
      telefono:  true,
      rol:       true,
      estado:    true,
    },
  });
},

};

