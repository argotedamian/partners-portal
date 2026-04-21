// Tipos del request
export type QuotationRequest = {
  rent: number;
  expenses: number;
  term: number;
  discount_code?: string;
  is_partner: true;
  agent_email: string;
  contact_email?: string;
};

// Shape de la respuesta cruda del backend
type ApiPaymentMethod = {
  orden: number;
  destacado?: boolean;
  texto: string;
  sub_texto?: string;
  precio_texto?: string;
  info_texto?: string;
  importe: number;
  visible?: boolean;
};

type ApiCotizacion = {
  alquiler?: number;
  expensas?: number;
  plazo?: number;
  importe?: number;
  importeRaw?: number;
  legales?: string;
  discount?: number;
  discountRef?: string | null;
  facilidades_pago?: ApiPaymentMethod[];
};

type ApiResponse = {
  payload?: {
    cotizacion?: ApiCotizacion;
  };
  quotation_id?: number | null;
  quotation_user_id?: number | null;
};

// Shape que consume Result
export type Qualification = {
  status_id: number;
  is_quotation_only?: boolean;
  id?: number | null;
  quotation_id?: number | null;
  api_res_data?: {
    idHoggax?: number | null;
    front?: {
      nombre?: string;
      agente?: {
        nombre?: string;
        email?: string;
        telefono?: string;
        foto?: string | null;
      };
    };
    cotizacion?: {
      costoServicio?: number;
      costoServicioRaw?: number;
      legales?: string;
      facilita_desPago?: Array<{
        _id: string;
        orden: number;
        cuotas: number;
        visible: boolean;
        destacado?: boolean;
        texto: string;
        subTexto?: string;
        precioTexto?: string;
        infoTexto?: string;
        importe: number;
        importeTotal?: number;
      }>;
      discount?: number;
      discountRef?: number | null;
    };
  };
};

// Infiere la cantidad de cuotas por orden (misma lógica que _inferirCuotas en Laravel)
function inferCuotas(orden: number, plazo: number): number {
  const cuotasMaximas = plazo === 2 ? 24 : 36;
  switch (orden) {
    case 1: return 0;
    case 2: return 3;
    case 3: return 12;
    case 4: return cuotasMaximas;
    default: return 0;
  }
}

// Mapea la respuesta de la API al shape que usa Result
function mapResponseToQualification(
  data: ApiResponse,
  agentEmail: string,
  agentLabel?: string,
  agentPhone?: string,
): Qualification {
  const cotizacion = data?.payload?.cotizacion ?? {};
  const plazo = cotizacion.plazo ?? 2;

  const facilita_desPago = (cotizacion.facilidades_pago ?? []).map((f, idx) => ({
    _id: `po_${idx}`,
    orden: f.orden,
    cuotas: inferCuotas(f.orden, plazo),
    visible: f.visible !== false,
    destacado: f.destacado ?? false,
    texto: f.texto,
    subTexto: f.sub_texto,
    precioTexto: f.precio_texto,
    infoTexto: f.info_texto,
    importe: f.importe,
  }));

  return {
    status_id: 4,
    is_quotation_only: true,
    id: data.quotation_id ?? null,
    quotation_id: data.quotation_id ?? null,
    api_res_data: {
      idHoggax: null,
      front: {
        nombre: '',
        agente: {
          nombre: agentLabel ?? agentEmail,
          email: agentEmail,
          telefono: agentPhone ?? '',
          foto: null,
        },
      },
      cotizacion: {
        costoServicio: cotizacion.importe,
        costoServicioRaw: cotizacion.importeRaw,
        legales: cotizacion.legales,
        discount: cotizacion.discount,
        discountRef: cotizacion.discountRef !== undefined
          ? (cotizacion.discountRef as number | null)
          : null,
        facilita_desPago,
      },
    },
  };
}

// Función principal: llama al endpoint y devuelve Qualification mapeada
export async function createQuotation(
  body: QuotationRequest,
  agentLabel?: string,
  agentPhone?: string,
): Promise<Qualification> {
  const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/web/v2/individual/quotations`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Error ${res.status}${text ? `: ${text}` : ''}`);
  }

  const data: ApiResponse = await res.json();
  return mapResponseToQualification(data, body.agent_email, agentLabel, agentPhone);
}
