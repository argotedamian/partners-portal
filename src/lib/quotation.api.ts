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

/** Plan de pago en `api_res_data.cotizacion` (lambda / calificación). */
export type QualificationPaymentMethod = {
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
  importeCuota?: number;
  importeAdelanto?: number;
};

// Shape que consume Result
export type Qualification = {
  status_id: number;
  is_quotation_only?: boolean;
  id?: number | null;
  bail_number?: string | null;
  /** Deal de Pipedrive asociado (respuesta de creación de calificación). */
  pipedrive_id?: number | string | null;
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
      alquiler?: number;
      expensas?: number;
      /** Años de contrato en API Hoggax (p. ej. 2 → 24 meses). */
      plazo?: number;
      costoServicio?: number;
      costoServicioRaw?: number;
      legales?: string;
      /** Alias legacy / cotización v2 mapeada. */
      facilita_desPago?: QualificationPaymentMethod[];
      /** Shape principal devuelto por calificar (Hoggax). */
      facilidadesPago?: QualificationPaymentMethod[];
      discount?: number;
      discountRef?: number | null;
    };
  };
};

const DEFAULT_FIANZA_APROBACION_WEBHOOK_URL =
  'https://hoggax.app.n8n.cloud/webhook/fianza-aprobacion';

function getFianzaAprobacionWebhookUrl(): string {
  return process.env.NEXT_PUBLIC_N8N_FIANZA_APROBACION_WEBHOOK_URL || DEFAULT_FIANZA_APROBACION_WEBHOOK_URL;
}

/**
 * Notifica a n8n cuando la calificación queda aprobada (status 4 o 5).
 * POST JSON: `{ "deal_id": <qualification.pipedrive_id> }` (mismo id que Pipedrive).
 * Si no hay `pipedrive_id`, no se envía nada (best-effort).
 */
function toFiniteDealId(value: Qualification['pipedrive_id']): number | null {
  if (value == null) return null;
  const n = typeof value === 'number' ? value : Number(String(value).trim());
  return Number.isFinite(n) ? n : null;
}

export async function notifyFianzaAprobacionWebhook(qualification: Qualification): Promise<void> {
  const dealId = toFiniteDealId(qualification.pipedrive_id);
  if (dealId == null) {
    return;
  }

  const url = getFianzaAprobacionWebhookUrl();

  const controller = new AbortController();
  const timeoutMs = 10_000;
  const scheduleTimeout = typeof window !== 'undefined' ? window.setTimeout : setTimeout;
  const clearScheduledTimeout = typeof window !== 'undefined' ? window.clearTimeout : clearTimeout;
  const timeoutId = scheduleTimeout(() => controller.abort(), timeoutMs);

  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deal_id: dealId }),
      signal: controller.signal,
    });
  } catch {
    // intentionally swallow
  } finally {
    clearScheduledTimeout(timeoutId);
  }
}

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
    bail_number: null,
    pipedrive_id: null,
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
        alquiler: cotizacion.alquiler,
        expensas: cotizacion.expensas,
        plazo: cotizacion.plazo,
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

// Tipos del request de calificación
export type QualificationRequest = {
  user_personal_data: {
    document_type_id: number;
    document_value: string;
    gender_id: number | null;
    phone: string;
    email: string;
    first_name?: string;
    last_name?: string;
    employment_situation_id: number | null;
    antiquity_id: number | null;
    monthly_income: number | null;
  };
  quotation: {
    rent: number;
    expenses: number;
    term: number;
    discount_code?: string;
    ref?: string;
  };
  is_partner: true;
  agent_email: string;
  send_agent_email_to_tenant: boolean;
  is_real_estate: boolean;
  origin_id: 1;
};

type QualificationApiResponse = {
  qualification: {
    id: number;
    status_id: number;
    bail_number?: string | null;
    pipedrive_id?: number | string | null;
    api_res_data: Qualification['api_res_data'];
  };
};

type BackendEnvelope<TBody> = {
  status?: number;
  message?: string;
  body?: TBody | null;
  validation?: Record<string, string[]>;
};

export type DiscountValidateResponseBody = {
  discountPercent: { value: number } | null;
  discountMoney: unknown | null;
};

export type DiscountValidationResult =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'valid'; percent: number }
  | { status: 'invalid'; message: string };

export async function validateDiscountCode(code: string): Promise<DiscountValidationResult> {
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!baseUrl) throw new Error('Missing NEXT_PUBLIC_BACKEND_URL');

  const normalizedCode = code.trim().startsWith('#') ? code.trim() : `#${code.trim()}`;
  if (!normalizedCode || normalizedCode === '#') return { status: 'idle' };

  const url = `${baseUrl}/api/web/v2/discounts/validate`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code: normalizedCode }),
  });

  const raw: unknown = await res.json().catch(() => null);

  if (res.ok) {
    const envelope = raw as BackendEnvelope<DiscountValidateResponseBody>;
    const percent = envelope.body?.discountPercent?.value ?? null;
    if (typeof percent === 'number') return { status: 'valid', percent };
    return { status: 'invalid', message: 'El código ingresado no es válido' };
  }

  if (res.status === 404) {
    const envelope = raw as BackendEnvelope<null>;
    return { status: 'invalid', message: envelope.message ?? 'El código ingresado no es válido' };
  }

  const text = typeof raw === 'string' ? raw : raw ? JSON.stringify(raw) : '';
  throw new Error(`Error ${res.status}${text ? `: ${text}` : ''}`);
}

// Llama al endpoint de calificación y devuelve Qualification mapeada
export async function createQualification(body: QualificationRequest): Promise<Qualification> {
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!baseUrl) throw new Error('Missing NEXT_PUBLIC_BACKEND_URL');
  const url = `${baseUrl}/api/web/v1/qualifications`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Error ${res.status}${text ? `: ${text}` : ''}`);
  }

  const raw: unknown = await res.json();
  const data = raw as QualificationApiResponse | BackendEnvelope<QualificationApiResponse>;

  const qualification = ('qualification' in (data as QualificationApiResponse))
    ? (data as QualificationApiResponse).qualification
    : (data as BackendEnvelope<QualificationApiResponse>).body?.qualification;

  if (!qualification) {
    const envelope = data as BackendEnvelope<QualificationApiResponse>;
    const validation = envelope.validation
      ? ` Validation: ${JSON.stringify(envelope.validation)}`
      : '';
    throw new Error(`Unexpected qualification response.${validation}`);
  }

  return {
    status_id: qualification.status_id,
    is_quotation_only: false,
    id: qualification.id,
    bail_number: qualification.bail_number ?? null,
    pipedrive_id: toFiniteDealId(qualification.pipedrive_id),
    api_res_data: qualification.api_res_data,
  };
}

// Función principal: llama al endpoint y devuelve Qualification mapeada
export async function createQuotation(
  body: QuotationRequest,
  agentLabel?: string,
  agentPhone?: string,
): Promise<Qualification> {
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!baseUrl) throw new Error('Missing NEXT_PUBLIC_BACKEND_URL');
  const url = `${baseUrl}/api/web/v2/individual/quotations`;

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
