import { prisma } from "../config/prisma"; // ajusta al import real de tu cliente Prisma
import { AppError } from "../utils/app-error";
import { EstadoCita } from "../../generated/prisma";
import { number, string } from "zod";

interface ResumenMensualAcumulado {
  anio: number;
  mes: number;
  citasCompletadas: number;
  ingresos: number;
}

export class ReporteService {
  async financieroProfesional(perfilProfesionalId: number) {
    const perfil = await prisma.perfilProfesional.findUnique({
      where: { id: perfilProfesionalId },
      include: {
        usuario: { select: { nombre: true, apellidos: true } },
      },
    });

    if (!perfil) {
      throw AppError.notFound("El perfil profesional no existe");
    }

    // Conteo de citas por estado
    const conteoPorEstadoRaw = await prisma.cita.groupBy({
      by: ["estado"],
      where: { perfilProfesionalId },
      _count: { _all: true },
    });

    const conteoPorEstado = conteoPorEstadoRaw.map((item) => ({
      estado: item.estado,
      cantidad: item._count._all,
    }));

    // Calificación promedio
    const resenas = await prisma.resena.findMany({
      where: { perfilProfesionalId },
      select: { puntuacion: true },
    });

    const cantidadResenas = resenas.length;
    const promedioCalificacion =
      cantidadResenas > 0
        ? resenas.reduce((acc, r) => acc + r.puntuacion, 0) / cantidadResenas
        : 0;

    // Citas completadas (para el detalle y el resumen mensual) LO MAS IMPORTANTE
    const citasCompletadas = await prisma.cita.findMany({
      where: { perfilProfesionalId, estado: "COMPLETADA" },
      include: {
        cliente: { select: { nombre: true, apellidos: true } },
        servicio: {
          include: { categoria: { select: { nombre: true } } },
        },
      },
      orderBy: { fechaCita: "asc" },
    });

    // Agrupar por mes (año-mes) para el resumen
    const mapaMensual = new Map<string, ResumenMensualAcumulado>();

    for (const cita of citasCompletadas) {
      const fecha = new Date(cita.fechaCita);
      const anio = fecha.getFullYear();
      const mes = fecha.getMonth() + 1;
      const clave = `${anio}-${String(mes).padStart(2, "0")}`; //2026-01
      
      //Obtener el resumen de ese mes si ya existe
      const actual = mapaMensual.get(clave) ?? {
        anio,
        mes,
        citasCompletadas: 0,
        ingresos: 0,
      };

      actual.citasCompletadas += 1;
      actual.ingresos += Number(cita.montoEstimado);

      //guardar o actualizar resumen del periodo
      mapaMensual.set(clave, actual);
    }
    
    //Convierte el mapa en un array ordenado cronológicamente
    const resumenMensual = Array.from(mapaMensual.entries())
      .map(([periodo, valores]) => ({ periodo, ...valores })) // Cada Objeto es un mes 
      .sort((a, b) => a.periodo.localeCompare(b.periodo));// Se ordena cronologicamente

    const detalleCitas = citasCompletadas.map((cita) => ({
      id: cita.id,
      fecha: cita.fechaCita,
      cliente: `${cita.cliente.nombre} ${cita.cliente.apellidos}`,
      servicio: cita.servicio.nombre,
      categoria: cita.servicio.categoria.nombre,
      monto: Number(cita.montoEstimado),
      
    }));

    return {
      profesional: {
        id: perfil.id,
        nombre: perfil.usuario.nombre,
        apellidos: perfil.usuario.apellidos,
        tituloProfesional: perfil.tituloProfesional,
      },
      generadoEn: new Date().toISOString(),
      conteoPorEstado,
      calificacion: {
        promedio: Number(promedioCalificacion.toFixed(2)),
        cantidadResenas,
      },
      resumenMensual,
      detalleCitas,
    };
  }



// ... dentro de la clase ReporteService

  // =========================================================
  // REPORTE: CITAS POR ESTADO
  // =========================================================
  async citasPorEstado(filtros: {
    fechaInicio?: Date;
    fechaFin?: Date;
    perfilProfesionalId?: number;
    categoriaId?: number;
  }) {
    const { fechaInicio, fechaFin, perfilProfesionalId, categoriaId } = filtros;

    const where = {
      perfilProfesionalId: perfilProfesionalId ?? undefined,
      fechaCita:
        fechaInicio || fechaFin
          ? { gte: fechaInicio, lte: fechaFin }
          : undefined,
      servicio: categoriaId ? { categoriaId } : undefined,
    };

    const conteoRaw = await prisma.cita.groupBy({
      by: ["estado"],
      where,
      _count: { _all: true },
    });

    const totalGeneral = conteoRaw.reduce((acc, c) => acc + c._count._all, 0);

    // Se incluyen SIEMPRE los 5 estados, aunque tengan 0 citas
    const estados: EstadoCita[] = [
      "PENDIENTE",
      "ACEPTADA",
      "RECHAZADA",
      "CANCELADA",
      "COMPLETADA",
    ] as EstadoCita[];

    const conteoPorEstado = estados.map((estado) => {
      const encontrado = conteoRaw.find((c) => c.estado === estado);
      const cantidad = encontrado?._count._all ?? 0;
      return {
        estado,
        cantidad,
        porcentaje:
          totalGeneral > 0
            ? Number(((cantidad / totalGeneral) * 100).toFixed(2))
            : 0,
      };
    });

    return {
      filtrosAplicados: {
        fechaInicio: fechaInicio ?? null,
        fechaFin: fechaFin ?? null,
        perfilProfesionalId: perfilProfesionalId ?? null,
        categoriaId: categoriaId ?? null,
      },
      totalGeneral,
      conteoPorEstado,
      generadoEn: new Date().toISOString(),
    };
  }

  // =========================================================
  // REPORTE: CITAS POR PROFESIONAL
  // Si se envía perfilProfesionalId -> reporte de un solo profesional
  // Si no se envía -> reporte de todos (vista de administrador)
  // =========================================================
  async citasPorProfesional(filtros: {
    perfilProfesionalId?: number;
    fechaInicio?: Date;
    fechaFin?: Date;
  }) {
    const { perfilProfesionalId, fechaInicio, fechaFin } = filtros;

    const perfiles = await prisma.perfilProfesional.findMany({
      where: { id: perfilProfesionalId ?? undefined },
      select: {
        id: true,
        usuario: { select: { nombre: true, apellidos: true } },
      },
      orderBy: { id: "asc" },
    });

    if (perfilProfesionalId && perfiles.length === 0) {
      throw AppError.notFound("El perfil profesional no existe");
    }

    const profesionales = await Promise.all(
      perfiles.map(async (perfil) => {
        const whereBase = {
          perfilProfesionalId: perfil.id,
          fechaCita:
            fechaInicio || fechaFin
              ? { gte: fechaInicio, lte: fechaFin }
              : undefined,
        };

        const [totalCitas, citasCompletadas] = await Promise.all([
          prisma.cita.count({ where: whereBase }),
          prisma.cita.count({
            where: { ...whereBase, estado: "COMPLETADA" },
          }),
        ]);

        return {
          perfilProfesionalId: perfil.id,
          nombre: perfil.usuario.nombre,
          apellidos: perfil.usuario.apellidos,
          totalCitas,
          citasCompletadas,
          porcentajeFinalizacion:
            totalCitas > 0
              ? Number(((citasCompletadas / totalCitas) * 100).toFixed(2))
              : 0,
        };
      })
    );

    return {
      filtrosAplicados: {
        perfilProfesionalId: perfilProfesionalId ?? null,
        fechaInicio: fechaInicio ?? null,
        fechaFin: fechaFin ?? null,
      },
      generadoEn: new Date().toISOString(),
      profesionales,
    };
  }

  // =========================================================
  // REPORTE: CALIFICACIONES
  // =========================================================
  async calificaciones(filtros: {
    perfilProfesionalId?: number;
    umbral?: number;
  }) {
    const umbral = filtros.umbral ?? 3.0; // documentado en el DTO

    const perfiles = await prisma.perfilProfesional.findMany({
      where: { id: filtros.perfilProfesionalId ?? undefined },
      select: {
        id: true,
        usuario: { select: { nombre: true, apellidos: true } },
      },
      orderBy: { id: "asc" },
    });

    if (filtros.perfilProfesionalId && perfiles.length === 0) {
      throw AppError.notFound("El perfil profesional no existe");
    }

    const serviciosBajaCalificacion: Array<{
      perfilProfesionalId: number;
      profesional: string;
      servicioId: number;
      nombre: string;
      promedio: number;
      cantidadResenas: number;
    }> = [];

    const profesionales = await Promise.all(
      perfiles.map(async (perfil) => {
        const resenas = await prisma.resena.findMany({
          where: { perfilProfesionalId: perfil.id },
          select: {
            puntuacion: true,
            cita: {
              select: {
                servicioId: true,
                servicio: { select: { nombre: true } },
              },
            },
          },
        });

        const cantidadResenas = resenas.length;

        // null explícito (no 0) para distinguir "sin reseñas" de "calificación baja real"
        const promedioCalificacion =
          cantidadResenas > 0
            ? Number(
                (
                  resenas.reduce((acc, r) => acc + r.puntuacion, 0) /
                  cantidadResenas
                ).toFixed(2)
              )
            : null;

        // Agrupar reseñas por servicio
        const mapaServicios = new Map<
  number,
  { nombre: string; suma: number; cantidad: number }
>();

        for (const r of resenas) {
          const servicioId = r.cita.servicioId;
          const actual = mapaServicios.get(servicioId) ?? {
            nombre: r.cita.servicio.nombre,
            suma: 0,
            cantidad: 0,
          };
          actual.suma += r.puntuacion;
          actual.cantidad += 1;
          mapaServicios.set(servicioId, actual);
        }

        const promediosServicios = Array.from(mapaServicios.entries()).map(
          ([servicioId, v]) => ({
            servicioId,
            nombre: v.nombre,
            promedio: Number((v.suma / v.cantidad).toFixed(2)),
            cantidadResenas: v.cantidad,
          })
        );

        // Mejor servicio: mayor promedio.
        // Empate -> gana el de más reseñas (más confiable).
        // Empate total -> orden alfabético (regla documentada y determinista).
        let mejorServicio: (typeof promediosServicios)[number] | null = null;
        for (const s of promediosServicios) {
          if (!mejorServicio) {
            mejorServicio = s;
            continue;
          }
          if (s.promedio > mejorServicio.promedio) {
            mejorServicio = s;
          } else if (s.promedio === mejorServicio.promedio) {
            if (s.cantidadResenas > mejorServicio.cantidadResenas) {
              mejorServicio = s;
            } else if (
              s.cantidadResenas === mejorServicio.cantidadResenas &&
              s.nombre.localeCompare(mejorServicio.nombre) < 0
            ) {
              mejorServicio = s;
            }
          }
        }

        // Servicios de baja calificación (solo si tienen al menos 1 reseña)
        for (const s of promediosServicios) {
          if (s.promedio < umbral) {
            serviciosBajaCalificacion.push({
              perfilProfesionalId: perfil.id,
              profesional: `${perfil.usuario.nombre} ${perfil.usuario.apellidos}`,
              ...s,
            });
          }
        }

        return {
          perfilProfesionalId: perfil.id,
          nombre: perfil.usuario.nombre,
          apellidos: perfil.usuario.apellidos,
          promedioCalificacion,
          cantidadResenas,
          sinResenas: cantidadResenas === 0,
          mejorServicio,
        };
      })
    );

    return {
      umbralBajaCalificacion: umbral,
      generadoEn: new Date().toISOString(),
      profesionales,
      serviciosBajaCalificacion,
    };
  }
}