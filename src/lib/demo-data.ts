export type RolUsuario = "inquilino" | "propietario";

export interface MovimientoDemo {
  id: string;
  tipo: "renta" | "luz" | "agua" | "gas" | "internet" | "compensacion";
  concepto: string;
  periodoMes: string;
  importeEur: number;
  estado: "pendiente" | "pagado_inquilino" | "verificado_propietario";
  fechaVencimiento: string;
  fechaPago?: string;
}

export type EstadoIncidencia =
  | "pendiente_aprobacion"
  | "aprobada_presupuesto"
  | "aprobada_tecnico"
  | "denegada"
  | "resuelta_conforme"
  | "descuento_aplicado";

export interface IncidenciaDemo {
  id: string;
  titulo: string;
  descripcion: string;
  urgencia: "baja" | "media" | "alta" | "urgente";
  responsableIa: "propietario" | "inquilino" | "revisar";
  articuloLau: string;
  dictamenIa: string;
  guiaEmergencia: string;
  busquedaBricolaje?: string;
  fotos: string[];
  presupuestoInquilinoEur?: number;
  notaPresupuestoInquilino?: string;
  diasRestantesPlazo15: number;
  estado: EstadoIncidencia;
  respuestaPropietario?: string;
  motivoDenegacion?: string;
  facturaDescuentoEur?: number;
  fechaReporte: string;
  conformidadInquilinoFecha?: string;
}

export interface FotoEstadoInicial {
  id: string;
  estancia: string;
  url: string;
  fecha: string;
  nota: string;
}

export interface CertificadoReputacionDemo {
  codigo: string;
  titular: string;
  rol: "Buen Inquilino" | "Buen Casero";
  puntuacion: number;
  pagosPuntualesPct: number;
  horasRespuestaMedia: number;
  mesesVerificados: number;
  enlaceInquicheck: string;
  selloVerificacion: string;
}

export interface ViviendaContratoDemo {
  id: string;
  codigoVinculacion: string;
  alias: string;
  direccion: string;
  municipio: string;
  codigoPostal: string;
  superficieM2: number;
  exterior: boolean;
  imagenUrl: string;
  esZonaTensionada: boolean;
  tipoContrato: "habitual" | "temporada" | "habitaciones";
  fechaInicio: string;
  fechaFin: string;
  mesActualContrato: number;
  mesesTotalesContrato: number;
  rentaBaseEur: number;
  fianzaEur: number;
  organismoFianza: string;
  numeroDepositoFianza: string;
  resguardoFianzaVerificado: boolean;
  propietarioNombre: string;
  propietarioEmail: string;
  propietarioTelefono?: string;
  autorizaCompartirTelefono?: boolean;
  estadoContrato?: "activo" | "finalizado";
  fechaFinalizacion?: string;
  fianzaDevueltaCompleta?: boolean;
  notaCierreFianza?: string;
  ultimaActualizacionRenta?: string;
  inquilinoNombre: string;
  inquilinoEmail: string;
  idPasaporteInquicheck: string;
  solvenciaInquicheckAdjunta: boolean;
  fotosEstadoInicial: FotoEstadoInicial[];
  movimientos: MovimientoDemo[];
  incidencias: IncidenciaDemo[];
  certificadoInquilino: CertificadoReputacionDemo;
  certificadoCasero: CertificadoReputacionDemo;
}

export const VIVIENDAS_DEMO: ViviendaContratoDemo[] = [
  {
    id: "viv-madrid-01",
    codigoVinculacion: "MAD-2026-B",
    alias: "C/ Fuencarral 42, 3ºB",
    direccion: "C/ Fuencarral 42, 3ºB · Malasaña",
    municipio: "Madrid",
    codigoPostal: "28004",
    superficieM2: 88,
    exterior: true,
    imagenUrl: "/images/vivienda-madrid.jpg",
    esZonaTensionada: false,
    tipoContrato: "habitual",
    fechaInicio: "2024-01-15",
    fechaFin: "2029-01-15",
    mesActualContrato: 35,
    mesesTotalesContrato: 60,
    rentaBaseEur: 1200,
    fianzaEur: 1200,
    organismoFianza: "IVIMA · Agencia de Vivienda Social de Madrid",
    numeroDepositoFianza: "DEP-28912-M",
    resguardoFianzaVerificado: true,
    propietarioNombre: "Javier Mendoza",
    propietarioEmail: "javier.mendoza@ejemplo.es",
    propietarioTelefono: "612 345 678",
    autorizaCompartirTelefono: true,
    estadoContrato: "activo",
    inquilinoNombre: "Elena Soler",
    inquilinoEmail: "elena.soler@ejemplo.es",
    idPasaporteInquicheck: "#IC-E42GC2",
    solvenciaInquicheckAdjunta: true,
    fotosEstadoInicial: [
      {
        id: "foto-ini-1",
        estancia: "Salón principal y suelos de roble",
        url: "/images/vivienda-madrid.jpg",
        fecha: "15 Ene 2024",
        nota: "Paredes recién pintadas, tarima sin arañazos y balcones sellados.",
      },
    ],
    movimientos: [
      {
        id: "mov-r1",
        tipo: "renta",
        concepto: "Mensualidad Noviembre 2026",
        periodoMes: "Noviembre 2026",
        importeEur: 1200,
        estado: "pendiente",
        fechaVencimiento: "05 Dic 2026",
      },
      {
        id: "mov-r2",
        tipo: "renta",
        concepto: "Mensualidad Octubre 2026",
        periodoMes: "Octubre 2026",
        importeEur: 1200,
        estado: "verificado_propietario",
        fechaVencimiento: "05 Oct 2026",
        fechaPago: "02 Oct 2026",
      },
      {
        id: "mov-r3",
        tipo: "renta",
        concepto: "Mensualidad Septiembre 2026",
        periodoMes: "Septiembre 2026",
        importeEur: 1200,
        estado: "verificado_propietario",
        fechaVencimiento: "05 Sep 2026",
        fechaPago: "03 Sep 2026",
      },
      {
        id: "mov-s1",
        tipo: "luz",
        concepto: "Iberdrola · Electricidad Noviembre",
        periodoMes: "Noviembre 2026",
        importeEur: 64.4,
        estado: "pagado_inquilino",
        fechaVencimiento: "28 Nov 2026",
        fechaPago: "22 Nov 2026",
      },
      {
        id: "mov-s2",
        tipo: "luz",
        concepto: "Iberdrola · Electricidad Octubre",
        periodoMes: "Octubre 2026",
        importeEur: 58.1,
        estado: "verificado_propietario",
        fechaVencimiento: "28 Oct 2026",
        fechaPago: "25 Oct 2026",
      },
      {
        id: "mov-s3",
        tipo: "agua",
        concepto: "Canal de Isabel II · Bimestre Sep-Oct",
        periodoMes: "Octubre 2026",
        importeEur: 31.8,
        estado: "verificado_propietario",
        fechaVencimiento: "15 Oct 2026",
        fechaPago: "12 Oct 2026",
      },
      {
        id: "mov-s4",
        tipo: "gas",
        concepto: "Naturgy · Calefacción y Agua Caliente",
        periodoMes: "Noviembre 2026",
        importeEur: 49.5,
        estado: "pendiente",
        fechaVencimiento: "02 Dic 2026",
      },
      {
        id: "mov-s5",
        tipo: "internet",
        concepto: "Fibra 600Mb · Mensualidad Noviembre",
        periodoMes: "Noviembre 2026",
        importeEur: 32.0,
        estado: "verificado_propietario",
        fechaVencimiento: "01 Nov 2026",
        fechaPago: "01 Nov 2026",
      },
    ],
    incidencias: [
      {
        id: "inc-1",
        titulo: "Pérdida de presión en caldera Junkers",
        descripcion:
          "La caldera pierde presión cada 24 horas y gotea agua caliente por la válvula al encender la calefacción.",
        urgencia: "alta",
        responsableIa: "propietario",
        articuloLau: "Art. 21.1 LAU (Habitabilidad)",
        dictamenIa:
          "La calefacción y agua caliente son esenciales. Al ser desgaste estructural, corresponde al propietario repararlo sin subir la renta.",
        guiaEmergencia:
          "Coloca un recipiente bajo la válvula y cierra la llave de llenado inferior hasta que llegue el técnico.",
        fotos: ["/images/vivienda-madrid.jpg"],
        presupuestoInquilinoEur: 145,
        notaPresupuestoInquilino: "Presupuesto de Servicio Técnico Junkers local (cambio válvula + purgado).",
        diasRestantesPlazo15: 10,
        estado: "pendiente_aprobacion",
        fechaReporte: "19 Nov 2026",
      },
      {
        id: "inc-2",
        titulo: "Cinta de persiana del dormitorio",
        descripcion:
          "La cinta textil se ha deshilachado por el uso diario tras casi tres años.",
        urgencia: "baja",
        responsableIa: "inquilino",
        articuloLau: "Art. 21.4 LAU (Uso ordinario)",
        dictamenIa:
          "Pequeña reparación por desgaste normal diario. Corresponde al inquilino.",
        guiaEmergencia: "No tirar con fuerza para evitar que se suelte el tambor.",
        busquedaBricolaje: "como cambiar cinta de persiana facil paso a paso",
        fotos: [],
        diasRestantesPlazo15: 14,
        estado: "resuelta_conforme",
        conformidadInquilinoFecha: "08 Oct 2026",
        fechaReporte: "03 Oct 2026",
      },
    ],
    certificadoInquilino: {
      codigo: "TYH-REP-INQ-942B",
      titular: "Elena Soler",
      rol: "Buen Inquilino",
      puntuacion: 98,
      pagosPuntualesPct: 100,
      horasRespuestaMedia: 6,
      mesesVerificados: 34,
      enlaceInquicheck: "https://inquicheck.vercel.app/",
      selloVerificacion: "34 de 34 mensualidades puntuales · Cero daños reportados",
    },
    certificadoCasero: {
      codigo: "TYH-REP-PRO-418M",
      titular: "Javier Mendoza",
      rol: "Buen Casero",
      puntuacion: 96,
      pagosPuntualesPct: 100,
      horasRespuestaMedia: 18,
      mesesVerificados: 34,
      enlaceInquicheck: "https://inquicheck.vercel.app/",
      selloVerificacion: "Fianza en IVIMA · Respuesta media a averías < 24 h",
    },
  },
  {
    id: "viv-valencia-02",
    codigoVinculacion: "VAL-2026-A",
    alias: "Av. del Puerto 18, 4ºA",
    direccion: "Av. del Puerto 18, 4ºA · Camins al Grau",
    municipio: "Valencia",
    codigoPostal: "46023",
    superficieM2: 74,
    exterior: true,
    imagenUrl: "/images/vivienda-valencia.jpg",
    esZonaTensionada: true,
    tipoContrato: "habitual",
    fechaInicio: "2025-02-01",
    fechaFin: "2030-02-01",
    mesActualContrato: 22,
    mesesTotalesContrato: 60,
    rentaBaseEur: 890,
    fianzaEur: 890,
    organismoFianza: "Generalitat Valenciana · Conselleria de Hacienda",
    numeroDepositoFianza: "GVA-46023-881",
    resguardoFianzaVerificado: true,
    propietarioNombre: "Javier Mendoza",
    propietarioEmail: "javier.mendoza@ejemplo.es",
    inquilinoNombre: "Marcos Domínguez",
    inquilinoEmail: "marcos.dominguez@ejemplo.es",
    idPasaporteInquicheck: "#IC-V91MK4",
    solvenciaInquicheckAdjunta: true,
    fotosEstadoInicial: [
      {
        id: "foto-val-1",
        estancia: "Salón-comedor y ventanales",
        url: "/images/vivienda-valencia.jpg",
        fecha: "01 Feb 2025",
        nota: "Suelo hidráulico íntegro y carpintería en perfecto estado.",
      },
    ],
    movimientos: [
      {
        id: "mov-v1",
        tipo: "renta",
        concepto: "Mensualidad Noviembre 2026",
        periodoMes: "Noviembre 2026",
        importeEur: 890,
        estado: "verificado_propietario",
        fechaVencimiento: "05 Nov 2026",
        fechaPago: "03 Nov 2026",
      },
      {
        id: "mov-v2",
        tipo: "gas",
        concepto: "Gas Natural · Bimestre Oct-Nov",
        periodoMes: "Noviembre 2026",
        importeEur: 42.15,
        estado: "pendiente",
        fechaVencimiento: "30 Nov 2026",
      },
      {
        id: "mov-v3",
        tipo: "luz",
        concepto: "Electricidad Noviembre",
        periodoMes: "Noviembre 2026",
        importeEur: 51.2,
        estado: "verificado_propietario",
        fechaVencimiento: "20 Nov 2026",
        fechaPago: "18 Nov 2026",
      },
    ],
    incidencias: [
      {
        id: "inc-v1",
        titulo: "Humedad en techo del baño (bajante)",
        descripcion:
          "Mancha de humedad en el techo junto al tubo general de desagüe comunitario.",
        urgencia: "alta",
        responsableIa: "propietario",
        articuloLau: "Art. 21.1 LAU + Propiedad Horizontal",
        dictamenIa:
          "Filtración de bajante comunitario ajena al inquilino. Debe atenderlo el propietario con el seguro.",
        guiaEmergencia: "Ventila el baño y evita encender el foco cercano.",
        fotos: ["/images/vivienda-valencia.jpg"],
        diasRestantesPlazo15: 12,
        estado: "aprobada_tecnico",
        respuestaPropietario: "Parte abierto con el seguro; el perito acude el jueves a las 10:30.",
        fechaReporte: "21 Nov 2026",
      },
    ],
    certificadoInquilino: {
      codigo: "TYH-REP-INQ-881V",
      titular: "Marcos Domínguez",
      rol: "Buen Inquilino",
      puntuacion: 97,
      pagosPuntualesPct: 100,
      horasRespuestaMedia: 8,
      mesesVerificados: 22,
      enlaceInquicheck: "https://inquicheck.vercel.app/",
      selloVerificacion: "22 de 22 mensualidades puntuales",
    },
    certificadoCasero: {
      codigo: "TYH-REP-PRO-418M",
      titular: "Javier Mendoza",
      rol: "Buen Casero",
      puntuacion: 96,
      pagosPuntualesPct: 100,
      horasRespuestaMedia: 18,
      mesesVerificados: 22,
      enlaceInquicheck: "https://inquicheck.vercel.app/",
      selloVerificacion: "Fianza en GVA · Respuesta media < 24 h",
    },
  },
];
