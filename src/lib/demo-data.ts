export type RolUsuario = "inquilino" | "propietario";

export interface MovimientoDemo {
  id: string;
  tipo: "renta" | "luz" | "agua" | "gas" | "internet" | "comunidad" | "compensacion";
  concepto: string;
  periodoMes: string;
  importeEur: number;
  descuentoLegalEur?: number;
  estado: "pendiente" | "pagado_inquilino" | "verificado_propietario";
  fechaVencimiento: string;
  fechaPago?: string;
}

export interface IncidenciaDemo {
  id: string;
  titulo: string;
  descripcion: string;
  categoria: string;
  urgencia: "baja" | "media" | "alta" | "urgente";
  responsableIa: "propietario" | "inquilino" | "revisar";
  articuloLau: string;
  dictamenIa: string;
  guiaEmergencia: string;
  busquedaBricolaje?: string;
  diasRestantesPlazo15: number;
  estado: "abierta" | "en_proceso" | "resuelta" | "descuento_aplicado";
  propuestaPropietario?: string;
  facturaDescuentoEur?: number;
  fechaReporte: string;
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
  gastosComunidadEur: number;
  tasaResiduosEur: number;
  fianzaEur: number;
  organismoFianza: string;
  numeroDepositoFianza: string;
  resguardoFianzaVerificado: boolean;
  propietarioNombre: string;
  propietarioEmail: string;
  inquilinoNombre: string;
  inquilinoEmail: string;
  idPasaporteInquicheck: string;
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
    gastosComunidadEur: 55,
    tasaResiduosEur: 25,
    fianzaEur: 1200,
    organismoFianza: "IVIMA · Agencia de Vivienda Social de Madrid",
    numeroDepositoFianza: "DEP-28912-M",
    resguardoFianzaVerificado: true,
    propietarioNombre: "Javier Mendoza",
    propietarioEmail: "javier.mendoza@ejemplo.es",
    inquilinoNombre: "Elena Soler",
    inquilinoEmail: "elena.soler@ejemplo.es",
    idPasaporteInquicheck: "#IC-E42GC2",
    movimientos: [
      {
        id: "mov-1",
        tipo: "renta",
        concepto: "Mensualidad Noviembre 2026 (Renta + Comunidad + Tasa)",
        periodoMes: "Noviembre 2026",
        importeEur: 1280,
        estado: "pendiente",
        fechaVencimiento: "05 Dic 2026",
      },
      {
        id: "mov-2",
        tipo: "luz",
        concepto: "Suministro Eléctrico · Factura Oct–Nov (OCR IA)",
        periodoMes: "Noviembre 2026",
        importeEur: 64.4,
        estado: "pagado_inquilino",
        fechaVencimiento: "28 Nov 2026",
        fechaPago: "22 Nov 2026",
      },
      {
        id: "mov-3",
        tipo: "agua",
        concepto: "Canal de Isabel II · Consumo Bimestral",
        periodoMes: "Octubre 2026",
        importeEur: 31.8,
        estado: "verificado_propietario",
        fechaVencimiento: "15 Oct 2026",
        fechaPago: "12 Oct 2026",
      },
      {
        id: "mov-4",
        tipo: "renta",
        concepto: "Mensualidad Octubre 2026 (Renta Oficial)",
        periodoMes: "Octubre 2026",
        importeEur: 1280,
        estado: "verificado_propietario",
        fechaVencimiento: "05 Oct 2026",
        fechaPago: "02 Oct 2026",
      },
    ],
    incidencias: [
      {
        id: "inc-1",
        titulo: "Filtración y pérdida de presión en caldera Junkers Cerapur",
        descripcion:
          "La caldera pierde presión cada 24 horas y gotea agua caliente por la válvula de seguridad al encender la calefacción.",
        categoria: "Climatización y agua caliente",
        urgencia: "alta",
        responsableIa: "propietario",
        articuloLau: "Art. 21.1 LAU (Conservación y habitabilidad)",
        dictamenIa:
          "La calefacción y el agua caliente son elementos esenciales de habitabilidad. Al tratarse de un fallo interno por desgaste estructural y no por mal uso, corresponde al propietario asumir la reparación sin derecho a subir la renta.",
        guiaEmergencia:
          "Coloca un recipiente bajo la válvula de seguridad y cierra la llave de llenado inferior para evitar sobrepresión hasta la visita del técnico.",
        diasRestantesPlazo15: 10,
        estado: "abierta",
        fechaReporte: "19 Nov 2026",
      },
      {
        id: "inc-2",
        titulo: "Cinta de persiana del dormitorio principal deshilachada",
        descripcion:
          "La cinta textil de la persiana se ha desgastado por el uso diario y cuesta subirla del todo.",
        categoria: "Carpintería / Uso ordinario",
        urgencia: "baja",
        responsableIa: "inquilino",
        articuloLau: "Art. 21.4 LAU (Pequeña reparación por desgaste ordinario)",
        dictamenIa:
          "La sustitución de una cinta de persiana por uso cotidiano entra dentro de las pequeñas reparaciones derivadas del desgaste ordinario, por lo que corresponde asumirla al inquilino.",
        guiaEmergencia:
          "Evita tirar con fuerza de la cinta deshilachada para que no se rompa dentro del tambor superior.",
        busquedaBricolaje: "como cambiar cinta de persiana facil paso a paso",
        diasRestantesPlazo15: 14,
        estado: "resuelta",
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
      selloVerificacion: "Historial verificado · 34 de 34 rentas puntuales",
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
      selloVerificacion: "Fianza depositada en IVIMA · Respuesta media < 24 h",
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
    gastosComunidadEur: 0,
    tasaResiduosEur: 0,
    fianzaEur: 890,
    organismoFianza: "Generalitat Valenciana · Conselleria de Hacienda",
    numeroDepositoFianza: "GVA-46023-881",
    resguardoFianzaVerificado: true,
    propietarioNombre: "Javier Mendoza",
    propietarioEmail: "javier.mendoza@ejemplo.es",
    inquilinoNombre: "Marcos Domínguez",
    inquilinoEmail: "marcos.dominguez@ejemplo.es",
    idPasaporteInquicheck: "#IC-V91MK4",
    movimientos: [
      {
        id: "mov-v1",
        tipo: "renta",
        concepto: "Mensualidad Noviembre 2026 (Renta Oficial)",
        periodoMes: "Noviembre 2026",
        importeEur: 890,
        estado: "verificado_propietario",
        fechaVencimiento: "05 Nov 2026",
        fechaPago: "03 Nov 2026",
      },
      {
        id: "mov-v2",
        tipo: "gas",
        concepto: "Gas Natural · Factura Bimestral",
        periodoMes: "Noviembre 2026",
        importeEur: 42.15,
        estado: "pendiente",
        fechaVencimiento: "30 Nov 2026",
      },
    ],
    incidencias: [
      {
        id: "inc-v1",
        titulo: "Humedad en techo del baño procedente del bajante",
        descripcion:
          "Ha aparecido una mancha de humedad en el techo junto al tubo general de desagüe comunitario.",
        categoria: "Fontanería / Comunidad",
        urgencia: "alta",
        responsableIa: "propietario",
        articuloLau: "Art. 21.1 LAU + Ley de Propiedad Horizontal",
        dictamenIa:
          "Las filtraciones de bajantes comunitarios son ajenas al inquilino. El propietario debe dar parte inmediato al seguro de hogar y a la comunidad de propietarios.",
        guiaEmergencia:
          "Ventila el baño, haz fotos con fecha visible y evita encender el foco eléctrico cercano a la humedad.",
        diasRestantesPlazo15: 12,
        estado: "en_proceso",
        propuestaPropietario: "Parte abierto con el seguro; el perito acude el jueves a las 10:30.",
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
      selloVerificacion: "Historial verificado · 22 de 22 rentas puntuales",
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
      selloVerificacion: "Fianza depositada en GVA · Respuesta media < 24 h",
    },
  },
];
