import { Rol, EstadoUsuario, Modalidad, EstadoCita } from "../generated/prisma";
import { prisma } from "../src/config/prisma";


async function main() {
  console.log("Iniciando seed...");

  // ================================
  // 1. LIMPIEZA EN ORDEN JERÁRQUICO
  // ================================
  const models = [
    prisma.resena,
    prisma.historialEstadoCita,
    prisma.cita,
    prisma.servicioEspecialidad,
    prisma.servicio,
    prisma.perfilProfesionalEspecialidad,
    prisma.perfilProfesional,
    prisma.especialidad,
    prisma.categoriaServicio,
    prisma.usuario,
  ];

  for (const model of models) {
    await (model as any).deleteMany();
  }

  // ================================
  // 2. DATOS MAESTROS INDEPENDIENTES
  // ================================

  await prisma.categoriaServicio.createMany({
    data: [
      { nombre: "Fotografía de bodas",      descripcion: "Cobertura fotográfica de eventos nupciales.",     activo: true  },
      { nombre: "Fotografía corporativa",   descripcion: "Retratos y eventos para empresas.",               activo: true  },
      { nombre: "Fotografía de productos",  descripcion: "Imágenes para catálogos y comercio electrónico.", activo: true  },
      { nombre: "Video y producción",       descripcion: "Producción audiovisual y edición de video.",      activo: true  },
      { nombre: "Fotografía de naturaleza", descripcion: "Paisajes, fauna y flora.",                        activo: false },
    ],
  });

  await prisma.especialidad.createMany({
    data: [
      { nombre: "Edición Lightroom",     descripcion: "Retoque y edición profesional en Lightroom.", activo: true  },
      { nombre: "Fotografía nocturna",   descripcion: "Técnicas de larga exposición y astrofotografía.", activo: true  },
      { nombre: "Drone y aéreo",         descripcion: "Fotografía y video con drones certificados.", activo: true  },
      { nombre: "Retrato de estudio",    descripcion: "Fotografía en estudio con iluminación controlada.", activo: true  },
      { nombre: "Video 4K",              descripcion: "Producción de video en resolución 4K.", activo: true  },
      { nombre: "Fotografía submarina",  descripcion: "Fotografía bajo el agua con equipo especializado.", activo: false },
      { nombre: "Color grading",         descripcion: "Corrección y gradación de color en postproducción.", activo: true  },
      { nombre: "Fotografía de eventos", descripcion: "Cobertura de eventos sociales y corporativos.", activo: false },
    ],
  });

  await prisma.usuario.createMany({
    data: [
      {
        nombre: "Admin", apellidos: "Sistema",
        correo: "admin@fotopro.com", contrasenaHash: "hash_admin",
        telefono: "88880000", rol: Rol.ADMIN, estado: EstadoUsuario.ACTIVO,
      },
      {
        nombre: "Carlos", apellidos: "Mora Rodríguez",
        correo: "carlos@fotopro.com", contrasenaHash: "hash_carlos",
        telefono: "88881111", rol: Rol.PROFESIONAL, estado: EstadoUsuario.ACTIVO,
      },
      {
        nombre: "Laura", apellidos: "Jiménez Solís",
        correo: "laura@fotopro.com", contrasenaHash: "hash_laura",
        telefono: "88882222", rol: Rol.PROFESIONAL, estado: EstadoUsuario.ACTIVO,
      },
      {
        nombre: "Andrés", apellidos: "Vargas Castro",
        correo: "andres@fotopro.com", contrasenaHash: "hash_andres",
        telefono: "88883333", rol: Rol.PROFESIONAL, estado: EstadoUsuario.ACTIVO,
      },
      {
        nombre: "Sofía", apellidos: "Méndez Ulate",
        correo: "sofia@fotopro.com", contrasenaHash: "hash_sofia",
        telefono: "88884444", rol: Rol.PROFESIONAL, estado: EstadoUsuario.ACTIVO,
      },
      {
        nombre: "Diego", apellidos: "Rojas Fallas",
        correo: "diego@fotopro.com", contrasenaHash: "hash_diego",
        telefono: "88885555", rol: Rol.PROFESIONAL, estado: EstadoUsuario.INACTIVO,
      },
      {
        nombre: "María", apellidos: "Fernández López",
        correo: "maria@cliente.com", contrasenaHash: "hash_maria",
        telefono: "88886666", rol: Rol.CLIENTE, estado: EstadoUsuario.ACTIVO,
      },
      {
        nombre: "José", apellidos: "Gutiérrez Pérez",
        correo: "jose@cliente.com", contrasenaHash: "hash_jose",
        telefono: "88887777", rol: Rol.CLIENTE, estado: EstadoUsuario.ACTIVO,
      },
      {
        nombre: "Ana", apellidos: "Castro Herrera",
        correo: "ana@cliente.com", contrasenaHash: "hash_ana",
        telefono: "88888888", rol: Rol.CLIENTE, estado: EstadoUsuario.ACTIVO,
      },
    ],
  });

  // ================================
  // 3. RECUPERAR IDs PARA MAPEO
  // ================================
  const [cats, specs, users] = await Promise.all([
    prisma.categoriaServicio.findMany(),
    prisma.especialidad.findMany(),
    prisma.usuario.findMany(),
  ]);

  const catMap  = Object.fromEntries(cats.map((c) => [c.nombre, c.id]));
  const specMap = Object.fromEntries(specs.map((s) => [s.nombre, s.id]));
  const userMap = Object.fromEntries(users.map((u) => [u.correo, u.id]));

  // ================================
  // 4. PERFILES PROFESIONALES (con especialidades asociadas)
  // ================================
  const perfilCarlos = await prisma.perfilProfesional.create({
    data: {
      usuarioId:         userMap["carlos@fotopro.com"],
      tituloProfesional: "Fotógrafo de bodas certificado",
      descripcion:       "Especialista en bodas y eventos con más de 8 años de experiencia.",
      aniosExperiencia:  8,
      modalidad:         Modalidad.PRESENCIAL,
      provincia:         "San José",
      canton:            "San José",
      distrito:          "Catedral",
      tarifaBase:        150000,
      disponible:        true,
      especialidades: { create: [
        { especialidadId: specMap["Edición Lightroom"] },
        { especialidadId: specMap["Fotografía de eventos"] },
      ]},
    },
  });

  const perfilLaura = await prisma.perfilProfesional.create({
    data: {
      usuarioId:         userMap["laura@fotopro.com"],
      tituloProfesional: "Productora audiovisual",
      descripcion:       "Producción de video corporativo y publicitario en 4K.",
      aniosExperiencia:  5,
      modalidad:         Modalidad.MIXTA,
      provincia:         "Heredia",
      canton:            "Heredia",
      distrito:          "Mercedes",
      tarifaBase:        200000,
      disponible:        true,
      especialidades: { create: [
        { especialidadId: specMap["Video 4K"] },
        { especialidadId: specMap["Color grading"] },
      ]},
    },
  });

  const perfilAndres = await prisma.perfilProfesional.create({
    data: {
      usuarioId:         userMap["andres@fotopro.com"],
      tituloProfesional: "Fotógrafo corporativo y de productos",
      descripcion:       "Fotografía para empresas, catálogos y redes sociales.",
      aniosExperiencia:  6,
      modalidad:         Modalidad.VIRTUAL,
      provincia:         "Alajuela",
      canton:            "Alajuela",
      distrito:          "Central",
      tarifaBase:        120000,
      disponible:        true,
      especialidades: { create: [
        { especialidadId: specMap["Edición Lightroom"] },
        { especialidadId: specMap["Retrato de estudio"] },
      ]},
    },
  });

  const perfilSofia = await prisma.perfilProfesional.create({
    data: {
      usuarioId:         userMap["sofia@fotopro.com"],
      tituloProfesional: "Fotógrafa de estudio y retrato",
      descripcion:       "Especialista en retratos, books y fotografía de estudio.",
      aniosExperiencia:  4,
      modalidad:         Modalidad.PRESENCIAL,
      provincia:         "Cartago",
      canton:            "Cartago",
      distrito:          "Oriental",
      tarifaBase:        90000,
      disponible:        false,
      especialidades: { create: [
        { especialidadId: specMap["Retrato de estudio"] },
        { especialidadId: specMap["Fotografía nocturna"] },
      ]},
    },
  });

  const perfilDiego = await prisma.perfilProfesional.create({
    data: {
      usuarioId:         userMap["diego@fotopro.com"],
      tituloProfesional: "Fotógrafo con drone",
      descripcion:       "Fotografía aérea y drone para bienes raíces y eventos.",
      aniosExperiencia:  3,
      modalidad:         Modalidad.PRESENCIAL,
      provincia:         "Limón",
      canton:            "Limón",
      distrito:          "Limón",
      tarifaBase:        180000,
      disponible:        false,
      especialidades: { create: [
        { especialidadId: specMap["Drone y aéreo"] },
      ]},
    },
  });

  // ================================
  // 5. SERVICIOS
  // ================================
  const s1 = await prisma.servicio.create({
    data: {
      perfilProfesionalId: perfilCarlos.id,
      categoriaId:         catMap["Fotografía de bodas"],
      nombre:              "Cobertura completa de boda",
      descripcion:         "8 horas de cobertura fotográfica, 300 fotos editadas y álbum digital.",
      precio:              350000,
      duracionMin:         480,
      modalidad:           Modalidad.PRESENCIAL,
      activo:              true,
      especialidades: { create: [
        { especialidadId: specMap["Edición Lightroom"] },
        { especialidadId: specMap["Fotografía de eventos"] },
      ]},
    },
  });

  const s2 = await prisma.servicio.create({
    data: {
      perfilProfesionalId: perfilCarlos.id,
      categoriaId:         catMap["Fotografía de bodas"],
      nombre:              "Sesión de pre-boda",
      descripcion:         "2 horas de sesión exterior, 80 fotos editadas.",
      precio:              120000,
      duracionMin:         120,
      modalidad:           Modalidad.PRESENCIAL,
      activo:              true,
      especialidades: { create: [
        { especialidadId: specMap["Edición Lightroom"] },
      ]},
    },
  });

  const s3 = await prisma.servicio.create({
    data: {
      perfilProfesionalId: perfilLaura.id,
      categoriaId:         catMap["Video y producción"],
      nombre:              "Video corporativo 4K",
      descripcion:         "Producción de video institucional de 3 minutos en 4K con edición profesional.",
      precio:              450000,
      duracionMin:         240,
      modalidad:           Modalidad.MIXTA,
      activo:              true,
      especialidades: { create: [
        { especialidadId: specMap["Video 4K"] },
        { especialidadId: specMap["Color grading"] },
      ]},
    },
  });

  const s4 = await prisma.servicio.create({
    data: {
      perfilProfesionalId: perfilLaura.id,
      categoriaId:         catMap["Video y producción"],
      nombre:              "Reel para redes sociales",
      descripcion:         "Video corto de 60 segundos optimizado para Instagram y TikTok.",
      precio:              150000,
      duracionMin:         90,
      modalidad:           Modalidad.VIRTUAL,
      activo:              false,
      especialidades: { create: [
        { especialidadId: specMap["Color grading"] },
      ]},
    },
  });

  const s5 = await prisma.servicio.create({
    data: {
      perfilProfesionalId: perfilAndres.id,
      categoriaId:         catMap["Fotografía corporativa"],
      nombre:              "Sesión de headshots corporativos",
      descripcion:         "Retratos profesionales para LinkedIn y perfiles empresariales.",
      precio:              80000,
      duracionMin:         60,
      modalidad:           Modalidad.PRESENCIAL,
      activo:              true,
      especialidades: { create: [
        { especialidadId: specMap["Retrato de estudio"] },
      ]},
    },
  });

  const s6 = await prisma.servicio.create({
    data: {
      perfilProfesionalId: perfilAndres.id,
      categoriaId:         catMap["Fotografía de productos"],
      nombre:              "Fotografía de productos para ecommerce",
      descripcion:         "30 fotos de producto con fondo blanco y edición incluida.",
      precio:              95000,
      duracionMin:         120,
      modalidad:           Modalidad.PRESENCIAL,
      activo:              true,
      especialidades: { create: [
        { especialidadId: specMap["Edición Lightroom"] },
      ]},
    },
  });

  const s7 = await prisma.servicio.create({
    data: {
      perfilProfesionalId: perfilSofia.id,
      categoriaId:         catMap["Fotografía corporativa"],
      nombre:              "Book fotográfico personal",
      descripcion:         "Sesión de estudio de 2 horas, 50 fotos editadas para portafolio.",
      precio:              110000,
      duracionMin:         120,
      modalidad:           Modalidad.PRESENCIAL,
      activo:              true,
      especialidades: { create: [
        { especialidadId: specMap["Retrato de estudio"] },
        { especialidadId: specMap["Edición Lightroom"] },
      ]},
    },
  });

  const s8 = await prisma.servicio.create({
    data: {
      perfilProfesionalId: perfilSofia.id,
      categoriaId:         catMap["Fotografía corporativa"],
      nombre:              "Fotografía nocturna urbana",
      descripcion:         "Sesión nocturna en exteriores, 40 fotos editadas.",
      precio:              130000,
      duracionMin:         180,
      modalidad:           Modalidad.PRESENCIAL,
      activo:              false,
      especialidades: { create: [
        { especialidadId: specMap["Fotografía nocturna"] },
      ]},
    },
  });

  const s9 = await prisma.servicio.create({
    data: {
      perfilProfesionalId: perfilDiego.id,
      categoriaId:         catMap["Fotografía de productos"],
      nombre:              "Fotografía aérea con drone",
      descripcion:         "Toma aérea de propiedades o eventos con drone certificado.",
      precio:              200000,
      duracionMin:         90,
      modalidad:           Modalidad.PRESENCIAL,
      activo:              true,
      especialidades: { create: [
        { especialidadId: specMap["Drone y aéreo"] },
      ]},
    },
  });

  const s10 = await prisma.servicio.create({
    data: {
      perfilProfesionalId: perfilDiego.id,
      categoriaId:         catMap["Video y producción"],
      nombre:              "Video aéreo para bienes raíces",
      descripcion:         "Video de propiedad con drone, edición y música incluida.",
      precio:              250000,
      duracionMin:         120,
      modalidad:           Modalidad.PRESENCIAL,
      activo:              true,
      especialidades: { create: [
        { especialidadId: specMap["Drone y aéreo"] },
        { especialidadId: specMap["Video 4K"] },
      ]},
    },
  });

  // ================================
  // 6. CITAS (12 citas variadas)
  // ================================
  const citasData = [
    { clienteId: userMap["maria@cliente.com"], perfilProfesionalId: perfilCarlos.id, servicioId: s1.id, modalidad: Modalidad.PRESENCIAL, estado: EstadoCita.PENDIENTE, fechaCita: new Date("2026-07-10"), horaInicio: new Date("1970-01-01T09:00:00"), horaFin: new Date("1970-01-01T17:00:00"), comentarioCliente: "Boda en jardín al aire libre.", montoEstimado: 350000 },
    { clienteId: userMap["maria@cliente.com"], perfilProfesionalId: perfilCarlos.id, servicioId: s2.id, modalidad: Modalidad.PRESENCIAL, estado: EstadoCita.PENDIENTE, fechaCita: new Date("2026-07-05"), horaInicio: new Date("1970-01-01T15:00:00"), horaFin: new Date("1970-01-01T17:00:00"), comentarioCliente: "Sesión en parque La Sabana.", montoEstimado: 120000 },
    { clienteId: userMap["jose@cliente.com"], perfilProfesionalId: perfilLaura.id, servicioId: s3.id, modalidad: Modalidad.MIXTA, estado: EstadoCita.PENDIENTE, fechaCita: new Date("2026-07-15"), horaInicio: new Date("1970-01-01T08:00:00"), horaFin: new Date("1970-01-01T12:00:00"), comentarioCliente: "Video para lanzamiento de empresa.", montoEstimado: 450000 },
    { clienteId: userMap["jose@cliente.com"], perfilProfesionalId: perfilAndres.id, servicioId: s5.id, modalidad: Modalidad.PRESENCIAL, estado: EstadoCita.PENDIENTE, fechaCita: new Date("2026-07-20"), horaInicio: new Date("1970-01-01T10:00:00"), horaFin: new Date("1970-01-01T11:00:00"), comentarioCliente: "Necesito fotos para LinkedIn.", montoEstimado: 80000 },
    { clienteId: userMap["ana@cliente.com"], perfilProfesionalId: perfilAndres.id, servicioId: s6.id, modalidad: Modalidad.PRESENCIAL, estado: EstadoCita.PENDIENTE, fechaCita: new Date("2026-07-22"), horaInicio: new Date("1970-01-01T09:00:00"), horaFin: new Date("1970-01-01T11:00:00"), comentarioCliente: "Productos de joyería artesanal.", montoEstimado: 95000 },
    { clienteId: userMap["ana@cliente.com"], perfilProfesionalId: perfilSofia.id, servicioId: s7.id, modalidad: Modalidad.PRESENCIAL, estado: EstadoCita.PENDIENTE, fechaCita: new Date("2026-07-25"), horaInicio: new Date("1970-01-01T14:00:00"), horaFin: new Date("1970-01-01T16:00:00"), comentarioCliente: "Book para portafolio de modelaje.", montoEstimado: 110000 },
    { clienteId: userMap["maria@cliente.com"], perfilProfesionalId: perfilDiego.id, servicioId: s9.id, modalidad: Modalidad.PRESENCIAL, estado: EstadoCita.PENDIENTE, fechaCita: new Date("2026-08-01"), horaInicio: new Date("1970-01-01T07:00:00"), horaFin: new Date("1970-01-01T08:30:00"), comentarioCliente: "Toma aérea de finca cafetalera.", montoEstimado: 200000 },
    { clienteId: userMap["jose@cliente.com"], perfilProfesionalId: perfilDiego.id, servicioId: s10.id, modalidad: Modalidad.PRESENCIAL, estado: EstadoCita.PENDIENTE, fechaCita: new Date("2026-08-05"), horaInicio: new Date("1970-01-01T08:00:00"), horaFin: new Date("1970-01-01T10:00:00"), comentarioCliente: "Video de casa en venta en Escazú.", montoEstimado: 250000 },
    { clienteId: userMap["ana@cliente.com"], perfilProfesionalId: perfilLaura.id, servicioId: s3.id, modalidad: Modalidad.VIRTUAL, estado: EstadoCita.PENDIENTE, fechaCita: new Date("2026-08-10"), horaInicio: new Date("1970-01-01T13:00:00"), horaFin: new Date("1970-01-01T17:00:00"), comentarioCliente: "Video para campaña en redes.", montoEstimado: 450000 },
    { clienteId: userMap["maria@cliente.com"], perfilProfesionalId: perfilAndres.id, servicioId: s5.id, modalidad: Modalidad.PRESENCIAL, estado: EstadoCita.PENDIENTE, fechaCita: new Date("2026-08-12"), horaInicio: new Date("1970-01-01T11:00:00"), horaFin: new Date("1970-01-01T12:00:00"), comentarioCliente: "Fotos corporativas para equipo de 3 personas.", montoEstimado: 80000 },
    { clienteId: userMap["jose@cliente.com"], perfilProfesionalId: perfilCarlos.id, servicioId: s1.id, modalidad: Modalidad.PRESENCIAL, estado: EstadoCita.PENDIENTE, fechaCita: new Date("2026-09-01"), horaInicio: new Date("1970-01-01T09:00:00"), horaFin: new Date("1970-01-01T17:00:00"), comentarioCliente: "Boda civil en salón.", montoEstimado: 350000 },
    { clienteId: userMap["ana@cliente.com"], perfilProfesionalId: perfilSofia.id, servicioId: s7.id, modalidad: Modalidad.PRESENCIAL, estado: EstadoCita.PENDIENTE, fechaCita: new Date("2026-09-05"), horaInicio: new Date("1970-01-01T10:00:00"), horaFin: new Date("1970-01-01T12:00:00"), comentarioCliente: "Sesión para perfil profesional.", montoEstimado: 110000 },
  ];

  for (const cita of citasData) {
    await prisma.cita.create({ data: cita });
  }

  console.log("Seed completado con éxito.");
}

main()
  .catch((e) => {
    console.error("Error en seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });