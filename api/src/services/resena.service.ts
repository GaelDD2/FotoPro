import { prisma } from "../config/prisma";
import { EstadoCita } from "../../generated/prisma";
import { AppError } from "../utils/app-error";
import { CreateResenaDto } from "../dtos/resena.dto";

export const resenaService = {

  async crear(data: CreateResenaDto) {
    const cita = await prisma.cita.findUnique({
      where: { id: data.citaId },
    });

    if (!cita) {
      throw AppError.notFound("La cita no existe");
    }

    if (cita.estado !== EstadoCita.COMPLETADA) {
      throw AppError.badRequest(
        "Solo se pueden calificar citas en estado Completada"
      );
    }

    if (cita.clienteId !== data.clienteId) {
      throw AppError.badRequest(
        "El cliente indicado no corresponde a esta cita"
      );
    }

    const resenaExistente = await prisma.resena.findUnique({
      where: { citaId: data.citaId },
    });

    if (resenaExistente) {
      throw AppError.conflict("Esta cita ya cuenta con una reseña");
    }

    return await prisma.resena.create({
      data: {
        citaId:              data.citaId,
        clienteId:           data.clienteId,
        perfilProfesionalId: cita.perfilProfesionalId,
        puntuacion:          data.puntuacion,
        comentario:          data.comentario ?? null,
      },
      include: {
        cliente: {
          select: { nombre: true, apellidos: true },
        },
      },
    });
  },

  // Devuelve null si la cita aún no tiene reseña 
  async obtenerPorCita(citaId: number) {
    return await prisma.resena.findUnique({
      where: { citaId },
      include: {
        cliente: {
          select: { nombre: true, apellidos: true },
        },
      },
    });
  },

  async listarPorProfesional(perfilProfesionalId: number) {
    const [resenas, agregado] = await Promise.all([
      prisma.resena.findMany({
        where: { perfilProfesionalId },
        orderBy: { createdAt: "desc" },
        include: {
          cliente: {
            select: { nombre: true, apellidos: true },
          },
        },
      }),
      prisma.resena.aggregate({
        where: { perfilProfesionalId },
        _avg:   { puntuacion: true },
        _count: { _all: true },
      }),
    ]);

    return {
      resenas,
      promedio: agregado._avg.puntuacion
        ? Number(agregado._avg.puntuacion.toFixed(1))
        : null,
      totalResenas: agregado._count._all,
    };
  },

};