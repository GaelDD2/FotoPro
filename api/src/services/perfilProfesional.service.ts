import { prisma } from "../config/prisma";
import { Modalidad, Rol } from "../../generated/prisma";
import { AppError } from "../utils/app-error";
import { CreatePerfilProfesionalDto, UpdatePerfilProfesionalDto } from "../dtos/perfilProfesional.dto";

export const perfilProfesionalService = {

    async listar(
        nombre?: string,
        modalidad?: Modalidad,
        disponible?: boolean
    ) {

        return await prisma.perfilProfesional.findMany({

            where: {

                modalidad: modalidad ?? undefined,

                disponible: disponible ?? undefined,

                usuario: nombre
                    ? {
                        nombre: {
                            contains: nombre
                        }
                    }
                    : undefined

            },

            select: {

                id: true,

                tituloProfesional: true,

                modalidad: true,

                tarifaBase: true,

                disponible: true,
                provincia: true,
                canton:   true ,
                distrito:true,


                usuario: {

                    select: {
                        nombre: true,
                        apellidos: true
                    }

                }

            }

        });

    },
    async details(id: number) {

    return await prisma.perfilProfesional.findUnique({

        where: {
            id
        },

        select: {

            id: true,

            tituloProfesional: true,

            descripcion: true,

            aniosExperiencia: true,

            modalidad: true,

            provincia: true,

            canton: true,

            distrito: true,

            tarifaBase: true,

            disponible: true,

            imagenPerfilUrl: true,

            createdAt: true,

            usuario: {

                select: {

                    id: true,

                    nombre: true,

                    apellidos: true,

                    correo: true,

                    telefono: true,

                    estado: true

                }

            },

            servicios: {

                select: {

                    id: true,

                    nombre: true,

                    precio: true,

                    modalidad: true,

                    activo: true,

                    categoria: {

                        select: {

                            nombre: true

                        }

                    }

                }

            },

            resenas: {

                select: {

                    puntuacion: true,

                    comentario: true,

                    createdAt: true,

                    cliente: {

                        select: {

                            nombre: true,

                            apellidos: true

                        }

                    }

                }

            }

        }

    });

},

async obtenerPorUsuarioId(usuarioId: number) {

    return await prisma.perfilProfesional.findUnique({

        where: {
            usuarioId
        },

        select: {

            id: true,

            usuarioId: true,

            tituloProfesional: true,

            modalidad: true,

            tarifaBase: true,

            disponible: true,

            usuario: {

                select: {
                    nombre: true,
                    apellidos: true,
                    correo: true
                }

            }

        }

    });

},
async validarCorreoUnico(correo: string) {
    const existe = await prisma.usuario.findUnique({ where: { correo } });
    if (existe) {
      throw AppError.conflict("El correo ya está registrado");
    }
  },

  async validarEspecialidades(especialidadIds: number[]) {
    const count = await prisma.especialidad.count({
      where: { id: { in: especialidadIds } },
    });
    if (count !== especialidadIds.length) {
      throw AppError.badRequest("Una o más especialidades no existen");
    }
  },

  async validarExistencia(id: number) {
    const perfil = await prisma.perfilProfesional.findUnique({ where: { id } });
    if (!perfil) {
      throw AppError.notFound("El perfil profesional no existe");
    }
    return perfil;
  },

  async obtenerPorId(id: number) {
    const perfil = await prisma.perfilProfesional.findUnique({
      where: { id },
      include: {
        usuario: {
          select: {
            nombre:    true,
            apellidos: true,
            correo:    true,
            telefono:  true,
            estado:    true,
          },
        },
        especialidades: {
          include: {
            especialidad: true,
          },
        },
        servicios: {
          where: { activo: true },
          select: {
            id:          true,
            nombre:      true,
            precio:      true,
            duracionMin: true,
            modalidad:   true,
          },
        },
      },
    });

    if (!perfil) {
      throw AppError.notFound("El perfil profesional no existe");
    }

    return perfil;
  },

  async crear(data: CreatePerfilProfesionalDto) {
    await this.validarCorreoUnico(data.correo);

    if (data.especialidadIds?.length) {
      await this.validarEspecialidades(data.especialidadIds);
    }

    return await prisma.$transaction(async (tx) => {
      const usuario = await tx.usuario.create({
        data: {
          nombre:        data.nombre,
          apellidos:     data.apellidos,
          correo:        data.correo,
          contrasenaHash: data.contrasenaHash,
          telefono:      data.telefono,
          rol:           Rol.PROFESIONAL,
        },
      });

      const perfil = await tx.perfilProfesional.create({
        data: {
          usuarioId:         usuario.id,
          tituloProfesional: data.tituloProfesional,
          descripcion:       data.descripcion,
          aniosExperiencia:  data.aniosExperiencia,
          modalidad:         data.modalidad,
          provincia:         data.provincia,
          canton:            data.canton,
          distrito:          data.distrito,
          tarifaBase:        data.tarifaBase,
          disponible:        data.disponible ?? true,
          imagenPerfilUrl:   data.imagenPerfilUrl,
          especialidades: data.especialidadIds?.length
            ? {
                create: data.especialidadIds.map((id) => ({
                  especialidadId: id,
                })),
              }
            : undefined,
        },
        include: {
          usuario: {
            select: {
              nombre:    true,
              apellidos: true,
              correo:    true,
              telefono:  true,
            },
          },
          especialidades: {
            include: { especialidad: true },
          },
        },
      });

      return perfil;
    });
  },

  async actualizar(id: number, data: UpdatePerfilProfesionalDto) {
    await this.validarExistencia(id);

    if (data.especialidadIds?.length) {
      await this.validarEspecialidades(data.especialidadIds);
    }

    return await prisma.perfilProfesional.update({
      where: { id },
      data: {
        tituloProfesional: data.tituloProfesional,
        descripcion:       data.descripcion,
        aniosExperiencia:  data.aniosExperiencia,
        modalidad:         data.modalidad,
        provincia:         data.provincia,
        canton:            data.canton,
        distrito:          data.distrito,
        tarifaBase:        data.tarifaBase,
        disponible:        data.disponible,
        imagenPerfilUrl:   data.imagenPerfilUrl,
        usuario: {
          update: {
            nombre:    data.nombre,
            apellidos: data.apellidos,
            telefono:  data.telefono,
          },
        },
        especialidades: data.especialidadIds
          ? {
              deleteMany: {},
              create: data.especialidadIds.map((id) => ({
                especialidadId: id,
              })),
            }
          : undefined,
      },
      include: {
        usuario: {
          select: {
            nombre:    true,
            apellidos: true,
            correo:    true,
            telefono:  true,
          },
        },
        especialidades: {
          include: { especialidad: true },
        },
      },
    });
  },
  
  
  async cambiarDisponibilidad(id: number, disponible: boolean) {
    await this.validarExistencia(id);

    return await prisma.perfilProfesional.update({
      where: { id },
      data:  { disponible },
      select: {
        id:        true,
        disponible: true,
      },
    });
  },

};