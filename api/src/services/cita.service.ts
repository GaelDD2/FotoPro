import { prisma } from "../config/prisma";
import { EstadoCita } from "../../generated/prisma";
import { AppError } from "../utils/app-error";
import { AceptarCitaDto, CancelarCitaDto, CompletarCitaDto, CreateCitaDto, RechazarCitaDto, UpdateCitaDto } from "../dtos/cita.dto";

export const citaService = {

    async listarAdmin(
        estado?: EstadoCita,
        profesionalId?: number,
        fechaInicio?: Date,
        fechaFin?: Date
    ) {

        return await prisma.cita.findMany({

            where: {

                estado: estado ?? undefined,

                perfilProfesionalId: profesionalId ?? undefined,

                fechaCita:
                    fechaInicio || fechaFin
                        ? {
                            gte: fechaInicio,
                            lte: fechaFin
                        }
                        : undefined

            },

            select: {

                id: true,

                fechaCita: true,

                horaInicio: true,

                horaFin: true,

                

                estado: true,


                cliente: {

                    select: {

                        nombre: true,
                        apellidos: true

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

                },

                servicio: {

                    select: {

                        nombre: true

                    }

                }

            }

        });

    },

    async listarByUsuario(
    usuarioId: number,
    estado?: EstadoCita,
    profesionalId?: number,
    fechaInicio?: Date,
    fechaFin?: Date
) {

    return await prisma.cita.findMany({

        where: {

            clienteId: usuarioId,

            estado: estado ?? undefined,

            perfilProfesionalId: profesionalId ?? undefined,

            fechaCita:
                fechaInicio || fechaFin
                    ? {
                        gte: fechaInicio,
                        lte: fechaFin
                    }
                    : undefined

        },

        select: {

            id: true,

            fechaCita: true,

            horaInicio: true,

            horaFin: true,

            estado: true,

            modalidad:true,

            montoEstimado: true,

            cliente: {

                select: {

                    nombre: true,
                    apellidos: true

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

            },

            servicio: {

                select: {

                    nombre: true

                }

            }

        }

    });

    },


    async listarByProfesional(
    profesionalId: number,
    usuarioId?: number,
    estado?: EstadoCita,
    
    fechaInicio?: Date,
    fechaFin?: Date
) {

    return await prisma.cita.findMany({

        where: {

            clienteId: usuarioId ?? undefined,

            estado: estado ?? undefined,

            perfilProfesionalId: profesionalId ,

            fechaCita:
                fechaInicio || fechaFin
                    ? {
                        gte: fechaInicio,
                        lte: fechaFin
                    }
                    : undefined

        },

        select: {

            id: true,

            fechaCita: true,

            horaInicio: true,

            horaFin: true,

            estado: true,

            modalidad:true,

            montoEstimado: true,

            cliente: {

                select: {

                    nombre: true,
                    apellidos: true

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

            },

            servicio: {

                select: {

                    nombre: true

                }

            }

        }

    });

    },
    async details(id: number) {

    return await prisma.cita.findUnique({

        where: {
            id
        },

        select: {

            id: true,

            fechaCita: true,

            horaInicio: true,

            horaFin: true,

            modalidad: true,

            estado: true,

            comentarioCliente: true,

            comentarioProfesional: true,

            montoEstimado: true,

            cliente: {

                select: {

                    id: true,

                    nombre: true,

                    apellidos: true,

                    correo: true,

                    telefono: true

                }

            },

            perfilProfesional: {

                select: {

                    id: true,

                    tituloProfesional: true,

                    usuario: {

                        select: {

                            nombre: true,

                            apellidos: true,

                            correo: true,

                            telefono: true

                        }

                    }

                }

            },

            servicio: {

                select: {

                    id: true,

                    nombre: true,

                    descripcion: true,

                    precio: true,

                    duracionMin: true

                }

            }

        }

    });

},

async validarCliente(clienteId: number) {
    const cliente = await prisma.usuario.findUnique({
      where: { id: clienteId },
    });
    if (!cliente) {
      throw AppError.badRequest("El cliente indicado no existe");
    }
    if (cliente.rol !== "CLIENTE") {
      throw AppError.badRequest("El usuario indicado no tiene rol de cliente");
    }
    if (cliente.estado !== "ACTIVO") {
      throw AppError.badRequest("El cliente indicado no está activo");
    }
  },

  async validarProfesional(perfilProfesionalId: number) {
    const perfil = await prisma.perfilProfesional.findUnique({
      where: { id: perfilProfesionalId },
    });
    if (!perfil) {
      throw AppError.badRequest("El profesional indicado no existe");
    }
    if (!perfil.disponible) {
      throw AppError.badRequest("El profesional no está disponible para citas");
    }
  },

  async validarServicio(servicioId: number, perfilProfesionalId: number) {
    const servicio = await prisma.servicio.findUnique({
      where: { id: servicioId },
    });
    if (!servicio) {
      throw AppError.badRequest("El servicio indicado no existe");
    }
    if (!servicio.activo) {
      throw AppError.badRequest("El servicio indicado no está activo");
    }
    if (servicio.perfilProfesionalId !== perfilProfesionalId) {
      throw AppError.badRequest("El servicio no pertenece al profesional indicado");
    }
    return servicio;
  },

  async validarDisponibilidadHorario(
    perfilProfesionalId: number,
    fechaCita: Date,
    horaInicio: Date,
    horaFin: Date,
    excludeId?: number
  ) {
    const conflicto = await prisma.cita.findFirst({
      where: {
        perfilProfesionalId,
        fechaCita,
        estado: { notIn: ["CANCELADA", "RECHAZADA"] },
        id:     excludeId ? { not: excludeId } : undefined,
        AND: [
          { horaInicio: { lt: horaFin   } },
          { horaFin:    { gt: horaInicio } },
        ],
      },
    });

    if (conflicto) {
      throw AppError.conflict(
        "El profesional ya tiene una cita en ese horario"
      );
    }
  },

  async validarExistencia(id: number) {
    const cita = await prisma.cita.findUnique({ where: { id } });
    if (!cita) {
      throw AppError.notFound("La cita no existe");
    }
    return cita;
  },

  async obtenerPorId(id: number) {
    const cita = await prisma.cita.findUnique({
      where: { id },
      include: {
        cliente: {
          select: {
            nombre:    true,
            apellidos: true,
            correo:    true,
            telefono:  true,
          },
        },
        perfilProfesional: {
          include: {
            usuario: {
              select: {
                nombre:    true,
                apellidos: true,
                telefono:  true,
              },
            },
          },
        },
        servicio: true,
        historial: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!cita) {
      throw AppError.notFound("La cita no existe");
    }

    return cita;
  },

  async crear(data: CreateCitaDto) {
    await this.validarCliente(data.clienteId);
    await this.validarProfesional(data.profesionalUsuarioId);
    const servicio = await this.validarServicio(
      data.servicioId,
      data.profesionalUsuarioId
    );

    const fechaCita  = new Date(data.fechaCita);
    const horaInicio = new Date(`1970-01-01T${data.horaInicio}:00`);
    const horaFin    = new Date(`1970-01-01T${data.horaFin}:00`);

    if (horaFin <= horaInicio) {
      throw AppError.badRequest("La hora de fin debe ser mayor a la hora de inicio");
    }

    await this.validarDisponibilidadHorario(
      data.profesionalUsuarioId,
      fechaCita,
      horaInicio,
      horaFin
    );

   
    const montoEstimado = Number(servicio.precio);

    return await prisma.$transaction(async (tx) => {
      const cita = await tx.cita.create({
        data: {
          clienteId:           data.clienteId,
          perfilProfesionalId: data.profesionalUsuarioId,
          servicioId:          data.servicioId,
          modalidad:           data.modalidad,
          estado:              EstadoCita.PENDIENTE,
          fechaCita,
          horaInicio,
          horaFin,
          comentarioCliente:   data.comentarioCliente,
          montoEstimado,
        },
        include: {
          cliente: {
            select: {
              nombre:    true,
              apellidos: true,
              correo:    true,
            },
          },
          perfilProfesional: {
            select: {
              tituloProfesional: true,
              usuario: {
                select: {
                  nombre:    true,
                  apellidos: true,
                },
              },
            },
          },
          servicio: {
            select: {
              nombre: true,
              precio: true,
            },
          },
        },
      });

      // Registrar en historial el estado inicial
      await tx.historialEstadoCita.create({
        data: {
          citaId:        cita.id,
          usuarioId:     data.clienteId,
          estadoAnterior: null,
          estadoNuevo:   EstadoCita.PENDIENTE,
          motivo:        "Cita registrada por el cliente",
        },
      });

      return cita;
    });
  },

  // ---- Actualizar (solo datos, no estado) ----

  async actualizar(id: number, data: UpdateCitaDto) {
    const citaActual = await this.validarExistencia(id);

    if (citaActual.estado !== EstadoCita.PENDIENTE) {
      throw AppError.badRequest(
        "Solo se pueden editar citas en estado Pendiente"
      );
    }

    const fechaCita  = data.fechaCita
      ? new Date(data.fechaCita)
      : citaActual.fechaCita;
    const horaInicio = data.horaInicio
      ? new Date(`1970-01-01T${data.horaInicio}:00`)
      : citaActual.horaInicio;
    const horaFin    = data.horaFin
      ? new Date(`1970-01-01T${data.horaFin}:00`)
      : citaActual.horaFin;

    if (horaFin <= horaInicio) {
      throw AppError.badRequest("La hora de fin debe ser mayor a la hora de inicio");
    }

    await this.validarDisponibilidadHorario(
      citaActual.perfilProfesionalId,
      fechaCita,
      horaInicio,
      horaFin,
      id
    );

    return await prisma.cita.update({
      where: { id },
      data: {
        modalidad:         data.modalidad,
        fechaCita,
        horaInicio,
        horaFin,
        comentarioCliente: data.comentarioCliente,
      },
      include: {
        cliente: {
          select: { nombre: true, apellidos: true },
        },
        perfilProfesional: {
          select: {
            tituloProfesional: true,
            usuario: { select: { nombre: true, apellidos: true } },
          },
        },
        servicio: {
          select: { nombre: true, precio: true },
        },
      },
    });
  },


  // Valida que el usuario sea el profesional dueño de la cita 

  async validarActorProfesional(usuarioId: number, perfilProfesionalId: number) {
    const perfil = await prisma.perfilProfesional.findUnique({
      where: { usuarioId },
    });
    if (!perfil) {
      throw AppError.badRequest("El usuario indicado no tiene un perfil profesional");
    }
    if (perfil.id !== perfilProfesionalId) {
      throw AppError.badRequest("El profesional indicado no gestiona esta cita");
    }
    return perfil;
  },

  // Auxiliar: combina la fecha de la cita con una hora (ambas guardadas por separado) 
  combinarFechaHora(fecha: Date, hora: Date): Date {
    const resultado = new Date(fecha);
    resultado.setHours(hora.getHours(), hora.getMinutes(), hora.getSeconds(), 0);
    return resultado;
  },


  // ---- Aceptar ----

  async aceptar(id: number, data: AceptarCitaDto) {
    const cita = await this.validarExistencia(id);

    if (cita.estado !== EstadoCita.PENDIENTE) {
      throw AppError.badRequest("Solo se pueden aceptar citas en estado Pendiente");
    }

    await this.validarActorProfesional(data.profesionalUsuarioId, cita.perfilProfesionalId);

    return await prisma.$transaction(async (tx) => {
      const citaActualizada = await tx.cita.update({
        where: { id },
        data: {
          estado: EstadoCita.ACEPTADA,
          comentarioProfesional: data.comentarioProfesional ?? null,
        },
        include: {
          cliente: { select: { nombre: true, apellidos: true } },
          perfilProfesional: {
            select: {
              tituloProfesional: true,
              usuario: { select: { nombre: true, apellidos: true } },
            },
          },
          servicio: { select: { nombre: true, precio: true } },
        },
      });

      await tx.historialEstadoCita.create({
        data: {
          citaId: id,
          usuarioId: data.profesionalUsuarioId,
          estadoAnterior: EstadoCita.PENDIENTE,
          estadoNuevo: EstadoCita.ACEPTADA,
          motivo: data.comentarioProfesional ?? "Cita aceptada por el profesional",
        },
      });

      return citaActualizada;
    });
  },


  // ---- Rechazar ----

  async rechazar(id: number, data: RechazarCitaDto) {
    const cita = await this.validarExistencia(id);

    if (cita.estado !== EstadoCita.PENDIENTE) {
      throw AppError.badRequest("Solo se pueden rechazar citas en estado Pendiente");
    }

    await this.validarActorProfesional(data.profesionalUsuarioId, cita.perfilProfesionalId);

    return await prisma.$transaction(async (tx) => {
      const citaActualizada = await tx.cita.update({
        where: { id },
        data: {
          estado: EstadoCita.RECHAZADA,
          comentarioProfesional: data.motivo,
        },
        include: {
          cliente: { select: { nombre: true, apellidos: true } },
          perfilProfesional: {
            select: {
              tituloProfesional: true,
              usuario: { select: { nombre: true, apellidos: true } },
            },
          },
          servicio: { select: { nombre: true, precio: true } },
        },
      });

      await tx.historialEstadoCita.create({
        data: {
          citaId: id,
          usuarioId: data.profesionalUsuarioId,
          estadoAnterior: EstadoCita.PENDIENTE,
          estadoNuevo: EstadoCita.RECHAZADA,
          motivo: data.motivo,
        },
      });

      return citaActualizada;
    });
  },

  // ---- Cancelar ----

  async cancelar(id: number, data: CancelarCitaDto) {
    const cita = await this.validarExistencia(id);

    if (cita.estado !== EstadoCita.PENDIENTE && cita.estado !== EstadoCita.ACEPTADA) {
      throw AppError.badRequest(
        "Solo se pueden cancelar citas en estado Pendiente o Aceptada"
      );
    }

    const esCliente = cita.clienteId === data.usuarioId;
    let esProfesional = false;

    if (!esCliente) {
      const perfil = await prisma.perfilProfesional.findUnique({
        where: { usuarioId: data.usuarioId },
      });
      esProfesional = !!perfil && perfil.id === cita.perfilProfesionalId;
    }

    if (cita.estado === EstadoCita.PENDIENTE && !esCliente) {
      throw AppError.badRequest("Solo el cliente puede cancelar una cita pendiente");
    }

    if (cita.estado === EstadoCita.ACEPTADA && !esCliente && !esProfesional) {
      throw AppError.badRequest(
        "Solo el cliente o el profesional pueden cancelar una cita aceptada"
      );
    }

    const estadoAnterior = cita.estado;

    return await prisma.$transaction(async (tx) => {
      const citaActualizada = await tx.cita.update({
        where: { id },
        data: { estado: EstadoCita.CANCELADA },
        include: {
          cliente: { select: { nombre: true, apellidos: true } },
          perfilProfesional: {
            select: {
              tituloProfesional: true,
              usuario: { select: { nombre: true, apellidos: true } },
            },
          },
          servicio: { select: { nombre: true, precio: true } },
        },
      });

      await tx.historialEstadoCita.create({
        data: {
          citaId: id,
          usuarioId: data.usuarioId,
          estadoAnterior,
          estadoNuevo: EstadoCita.CANCELADA,
          motivo: data.motivo,
        },
      });

      return citaActualizada;
    });
  },

  // ---- Completar ----

  async completar(id: number, data: CompletarCitaDto) {
    const cita = await this.validarExistencia(id);

    if (cita.estado !== EstadoCita.ACEPTADA) {
      throw AppError.badRequest("Solo se pueden completar citas en estado Aceptada");
    }

    await this.validarActorProfesional(data.profesionalUsuarioId, cita.perfilProfesionalId);

    const fechaHoraFin = this.combinarFechaHora(cita.fechaCita, cita.horaFin);
    if (fechaHoraFin > new Date()) {
      throw AppError.badRequest(
        "No se puede completar la cita antes de su fecha y hora programadas"
      );
    }

    return await prisma.$transaction(async (tx) => {
      const citaActualizada = await tx.cita.update({
        where: { id },
        data: { estado: EstadoCita.COMPLETADA },
        include: {
          cliente: { select: { nombre: true, apellidos: true } },
          perfilProfesional: {
            select: {
              tituloProfesional: true,
              usuario: { select: { nombre: true, apellidos: true } },
            },
          },
          servicio: { select: { nombre: true, precio: true } },
        },
      });

      await tx.historialEstadoCita.create({
        data: {
          citaId: id,
          usuarioId: data.profesionalUsuarioId,
          estadoAnterior: EstadoCita.ACEPTADA,
          estadoNuevo: EstadoCita.COMPLETADA,
          motivo: "Cita marcada como completada por el profesional",
        },
      });

      return citaActualizada;
    });
  },

  // ---- Historial ----

  async historial(id: number) {
    await this.validarExistencia(id);
    return await prisma.historialEstadoCita.findMany({
      where: { citaId: id },
      orderBy: { createdAt: "asc" },
    });
  },

};
