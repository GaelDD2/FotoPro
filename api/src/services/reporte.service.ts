import { number, string } from "zod";
import { prisma } from "../config/prisma"; // ajusta al import real de tu cliente Prisma
import { AppError } from "../utils/app-error";

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
}