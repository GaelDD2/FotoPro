import { prisma } from "../config/prisma";
import { Modalidad } from "../../generated/prisma";
import { AppError } from "../utils/app-error";
import { CreateServicioDto, UpdateServicioDto } from "../dtos/servicio.dto";

export const servicioService = {

    async listar(
        nombre?: string,
        categoriaId?: number,
        modalidad?: Modalidad,
        precioMin?: number,
        precioMax?: number
    ) {

        return await prisma.servicio.findMany({

            where: {

                nombre: nombre
                    ? {
                        contains: nombre
                    }
                    : undefined,

                categoriaId: categoriaId ?? undefined,

                modalidad: modalidad ?? undefined,

                precio: {
                    gte: precioMin,
                    lte: precioMax
                },

                activo: true

            },

            select: {

                id: true,

                nombre: true,

                precio: true,

                modalidad: true,

                activo: true,

                duracionMin: true, 

                categoria: {
                    select: {
                        nombre: true
                    }
                },

                perfilProfesional: {

                    select: {

                        usuario: {

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
    async listarByProfesional(perfilProfesionalId: number) {

    return await prisma.servicio.findMany({

        where: {
            perfilProfesionalId
        },

        select: {

            id: true,

            nombre: true,

            descripcion: true,

            precio: true,

            duracionMin: true,

            modalidad: true,

            activo: true,

            categoria: {

                select: {
                    nombre: true
                }

            }

        }

    });

},

    async details(id: number) {

        return await prisma.servicio.findUnique({

            where: {
                id
            },

            include: {

                categoria: true,

                perfilProfesional: {

                    include: {

                        usuario: true

                    }

                },

                especialidades: {

                    include: {

                        especialidad: true

                    }

                }

            }

        });

    },

    async validarPerfil(perfilProfesionalId: number) {
    const perfil = await prisma.perfilProfesional.findUnique({
      where: { id: perfilProfesionalId },
    });
    if (!perfil) {
      throw AppError.badRequest("El perfil profesional indicado no existe");
    }
  },


  async validarCategoria(categoriaId: number) {
    const categoria = await prisma.categoriaServicio.findUnique({
      where: { id: categoriaId },
    });
    if (!categoria) {
      throw AppError.badRequest("La categoría indicada no existe");
    }
    if (!categoria.activo) {
      throw AppError.badRequest("La categoría indicada no está activa");
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
    const servicio = await prisma.servicio.findUnique({ where: { id } });
    if (!servicio) {
      throw AppError.notFound("El servicio no existe");
    }
    return servicio;
  },

  async obtenerPorId(id: number) {
    const servicio = await prisma.servicio.findUnique({
      where: { id },
      include: {
        categoria: true,
        especialidades: {
          include: { especialidad: true },
        },
        perfilProfesional: {
          include: {
            usuario: {
              select: {
                nombre:    true,
                apellidos: true,
                correo:    true,
                telefono:  true,
              },
            },
          },
        },
      },
    });

    if (!servicio) {
      throw AppError.notFound("El servicio no existe");
    }

    return servicio;
  },

  async crear(data: CreateServicioDto) {
    await this.validarPerfil(data.perfilProfesionalId);
    await this.validarCategoria(data.categoriaId);

    if (data.especialidadIds?.length) {
      await this.validarEspecialidades(data.especialidadIds);
    }

    return await prisma.servicio.create({
      data: {
        perfilProfesionalId: data.perfilProfesionalId,
        categoriaId:         data.categoriaId,
        nombre:              data.nombre,
        descripcion:         data.descripcion,
        precio:              data.precio,
        duracionMin:         data.duracionMin,
        modalidad:           data.modalidad,
        activo:              data.activo ?? true,
        especialidades: data.especialidadIds?.length
          ? {
              create: data.especialidadIds.map((id) => ({
                especialidadId: id,
              })),
            }
          : undefined,
      },
      include: {
        categoria: true,
        especialidades: {
          include: { especialidad: true },
        },
        perfilProfesional: {
          select: {
            id:                true,
            tituloProfesional: true,
            usuario: {
              select: {
                nombre:    true,
                apellidos: true,
              },
            },
          },
        },
      },
    });
  },

  async actualizar(id: number, data: UpdateServicioDto) {
    await this.validarExistencia(id);

    if (data.categoriaId) {
      await this.validarCategoria(data.categoriaId);
    }

    if (data.especialidadIds?.length) {
      await this.validarEspecialidades(data.especialidadIds);
    }

    return await prisma.servicio.update({
      where: { id },
      data: {
        categoriaId:  data.categoriaId,
        nombre:       data.nombre,
        descripcion:  data.descripcion,
        precio:       data.precio,
        duracionMin:  data.duracionMin,
        modalidad:    data.modalidad,
        activo:       data.activo,
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
        categoria: true,
        especialidades: {
          include: { especialidad: true },
        },
        perfilProfesional: {
          select: {
            id:                true,
            tituloProfesional: true,
            usuario: {
              select: {
                nombre:    true,
                apellidos: true,
              },
            },
          },
        },
      },
    });
  },

  // ---- Cambiar estado activo/inactivo ----

  async cambiarEstado(id: number, activo: boolean) {
    await this.validarExistencia(id);

    return await prisma.servicio.update({
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

