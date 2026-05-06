'use client';

import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import {
  PARTNERS_AGENTS,
  DOCUMENT_TYPES,
  GENDERS,
  EMPLOYMENT_SITUATIONS,
  ANTIQUITIES,
  TERMS,
} from '@/lib/constants';
import {
  createQualification,
  notifyFianzaAprobacionWebhook,
  validateDiscountCode,
} from '@/lib/quotation.api';
import type { Qualification } from '@/lib/quotation.api';
import { useAppDispatch } from '@/state/AppStateContext';

/** Fijo en mock para URL de constancia / QR predecible (mismo criterio que `bail_number` real). */
const MOCK_BAIL_NUMBER = 'MOCK-BAIL-PRUEBA';

function buildMockQualification(params: {
  rent: number;
  expenses: number;
  term: number;
  discountCode?: string;
  tenantEmail: string;
  agentEmail: string;
}): Qualification {
  const { rent, expenses, term, discountCode, tenantEmail, agentEmail } = params;
  const contractMonths = term * 12;

  const base = Math.max(0, rent + expenses);
  const hasDiscount = Boolean(discountCode);
  const costoServicioRaw = Math.round(base * 0.65);

  const now = Date.now();
  const transferPrecioOriginal = Math.round(costoServicioRaw * 1.176); // usado como "precio tachado" en el diseño
  const transferPrecioFinal = hasDiscount ? Math.round(transferPrecioOriginal * 0.85) : transferPrecioOriginal; // 15% off
  const cft0 = 'CFT: 0%';
  const cft12 = 'CFT: 14.41%';
  const cftAdelanto = 'CFT: 16.93%';

  const plan3Total = transferPrecioOriginal;
  const plan3Cuota = Math.round(plan3Total / 3);

  const plan12Total = Math.round(transferPrecioOriginal * 1.2325);
  const plan12Cuota = Math.round(plan12Total / 12);

  const adelantoTotalCuotas = term === 2 ? 24 : 36;
  const cuotasDespuesAdelanto = adelantoTotalCuotas - 1;
  const adelantoPct = 0.075;
  const planAdelanto = Math.round(transferPrecioOriginal * adelantoPct);
  const planAdelantoTotal = Math.round(transferPrecioOriginal * 1.308); // total con financiación (aprox)
  const planAdelantoCuota = Math.round((planAdelantoTotal - planAdelanto) / cuotasDespuesAdelanto);

  function moneyLine(label: string, value: number) {
    return `${label}: ${formatCurrencyArs(value)}`;
  }

  function formatCurrencyArs(value: number) {
    return `$${Number(value).toLocaleString('es-AR')}`;
  }

  const mockPaymentMethods = [
    {
      _id: 'pm_transfer',
      orden: 1,
      cuotas: 0,
      visible: true,
      destacado: true,
      texto: 'Transferencia',
      subTexto: 'Transferencia',
      precioTexto: 'total',
      infoTexto: hasDiscount
        ? `15% off · ${moneyLine('Precio final', transferPrecioFinal)} · ${cft0}`
        : `${moneyLine('Precio final', transferPrecioFinal)} · ${cft0}`,
      importe: transferPrecioOriginal,
      importeTotal: transferPrecioOriginal,
    },
    {
      _id: 'pm_3',
      orden: 2,
      cuotas: 3,
      visible: true,
      texto: '3 cuotas sin interés',
      subTexto: 'Crédito o Débito',
      precioTexto: 'cuotas',
      infoTexto: `${moneyLine('Precio final', plan3Total)} · ${cft0}`,
      importe: plan3Cuota,
      importeCuota: plan3Cuota,
      importeTotal: plan3Total,
    },
    {
      _id: 'pm_12',
      orden: 3,
      cuotas: 12,
      visible: true,
      texto: '12 cuotas',
      subTexto: 'Crédito o Débito',
      precioTexto: 'cuotas',
      infoTexto: `${moneyLine('Precio final', plan12Total)} · ${cft12}`,
      importe: plan12Cuota,
      importeCuota: plan12Cuota,
      importeTotal: plan12Total,
    },
    {
      _id: 'pm_24',
      orden: 4,
      cuotas: term === 2 ? 24 : 36,
      visible: true,
      texto: term === 2 ? `7,5% adel. + ${cuotasDespuesAdelanto} cuotas` : `7,5% adel. + ${cuotasDespuesAdelanto} cuotas`,
      subTexto: 'Crédito o Débito',
      precioTexto: 'cuotas',
      infoTexto: `${moneyLine('Precio adel.', planAdelanto)} · ${moneyLine('Precio final', planAdelantoTotal)} · ${cftAdelanto}`,
      importeAdelanto: planAdelanto,
      importe: planAdelantoCuota,
      importeCuota: planAdelantoCuota,
      importeTotal: planAdelantoTotal,
    },
  ];

  return {
    status_id: 4,
    is_quotation_only: true,
    id: now,
    bail_number: MOCK_BAIL_NUMBER,
    pipedrive_id: now,
    quotation_id: now,
    api_res_data: {
      idHoggax: now,
      front: {
        nombre: tenantEmail.split('@')[0] ?? 'Mock',
        agente: {
          nombre: agentEmail,
          email: agentEmail,
          telefono: '',
          foto: null,
        },
      },
      cotizacion: {
        alquiler: rent,
        expensas: expenses,
        plazo: term,
        costoServicio: transferPrecioOriginal,
        costoServicioRaw: transferPrecioOriginal,
        legales: `Mock — contrato ${contractMonths} meses`,
        facilidadesPago: mockPaymentMethods,
        discount: hasDiscount ? 15 : 0,
        discountRef: discountCode ? 1 : null,
      },
    },
  };
}

export type PersonalData = {
  document_type_id: number;
  document_value: string;
  gender_id: number | null;
  phone: string;
  email: string;
  first_name: string;
  last_name: string;
  employment_situation_id: number | null;
  antiquity_id: number | null;
  monthly_income: number | null;
};

export type Quotation = {
  rent: number | null;
  expenses: number | null;
  term: number;
  discount_code: string;
};

export type FormValues = {
  user_personal_data: PersonalData;
  quotation: Quotation;
  agent_email: string;
  send_agent_email_to_tenant: boolean;
};

type UseQuotationFlowParams = {
  onComplete: (qualification: Qualification) => void;
};

function sanitizeNumericInput(value: string): string {
  return value.replace(/\D/g, '');
}

function normalizeNullableNumber(value: number | null): number | null {
  if (value === null) return null;
  return Number.isFinite(value) ? value : null;
}

export function useQuotationFlow({ onComplete }: UseQuotationFlowParams) {
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState(1);
  const [discountValidation, setDiscountValidation] = useState<Awaited<ReturnType<typeof validateDiscountCode>>>({
    status: 'idle',
  });
  const discountTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const form = useForm<FormValues>({
    defaultValues: {
      user_personal_data: {
        document_type_id: 1,
        document_value: '',
        gender_id: null,
        phone: '',
        email: '',
        first_name: '',
        last_name: '',
        employment_situation_id: null,
        antiquity_id: null,
        monthly_income: null,
      },
      quotation: {
        rent: null,
        expenses: null,
        term: 2,
        discount_code: '',
      },
      agent_email: PARTNERS_AGENTS[0]?.email ?? '',
      send_agent_email_to_tenant: false
    },
  });

  const { watch, setValue, handleSubmit } = form;
  const discountCode = watch('quotation.discount_code');
  const selectedGenderId = watch('user_personal_data.gender_id');

  useEffect(() => {
    if (discountTimer.current) clearTimeout(discountTimer.current);

    const code = (discountCode ?? '').trim();
    if (!code) {
      setDiscountValidation({ status: 'idle' });
      return;
    }

    setDiscountValidation({ status: 'loading' });
    discountTimer.current = setTimeout(() => {
      validateDiscountCode(code)
        .then(setDiscountValidation)
        .catch(() => setDiscountValidation({ status: 'invalid', message: 'No pudimos validar el cupón' }));
    }, 350);

    return () => {
      if (discountTimer.current) clearTimeout(discountTimer.current);
    };
  }, [discountCode]);

  const onSubmit = handleSubmit(async (data) => {
    setIsLoading(true);

    if (!data.quotation.rent || !data.quotation.expenses) {
      toast.error('Ingresá el alquiler y las expensas');
      setIsLoading(false);
      return;
    }

    try {
      const { document_value, document_type_id, first_name, last_name } = data.user_personal_data;
      const agent = PARTNERS_AGENTS.find((a) => a.email === data.agent_email);

      let qualification: Qualification;

      if (!document_value?.trim()) {
        toast.error('Ingresá el documento de identidad');
        return;
      }

      if (document_type_id === 2 && (!first_name?.trim() || !last_name?.trim())) {
        toast.error('Ingresá nombre y apellido');
        return;
      }

      const normalizedGenderId = normalizeNullableNumber(data.user_personal_data.gender_id);
      const normalizedEmploymentSituationId = normalizeNullableNumber(data.user_personal_data.employment_situation_id);
      const normalizedAntiquityId = normalizeNullableNumber(data.user_personal_data.antiquity_id);
      const normalizedMonthlyIncome = normalizeNullableNumber(data.user_personal_data.monthly_income);

      if (!normalizedGenderId) {
        toast.error('Seleccioná el género');
        return;
      }

      if (!normalizedEmploymentSituationId) {
        toast.error('Seleccioná la situación laboral');
        return;
      }

      if (normalizedEmploymentSituationId !== 1) {
        if (!normalizedAntiquityId) {
          toast.error('Seleccioná la antigüedad');
          return;
        }
        if (!normalizedMonthlyIncome) {
          toast.error('Ingresá los ingresos mensuales');
          return;
        }
      }

      const normalizedDocumentValue = document_type_id === 1 ? sanitizeNumericInput(document_value) : document_value.trim();

      const personalData = {
        document_type_id,
        document_value: normalizedDocumentValue,
        gender_id: normalizedGenderId,
        phone: sanitizeNumericInput(data.user_personal_data.phone),
        email: data.user_personal_data.email,
        employment_situation_id: normalizedEmploymentSituationId,
        antiquity_id: normalizedEmploymentSituationId === 1 ? null : normalizedAntiquityId,
        monthly_income: normalizedEmploymentSituationId === 1 ? null : normalizedMonthlyIncome,
        ...(document_type_id === 2 ? { first_name, last_name } : {}),
      };

      const qualificationRequest = {
        user_personal_data: personalData,
        quotation: {
          rent: data.quotation.rent,
          expenses: data.quotation.expenses,
          term: data.quotation.term,
          discount_code: data.quotation.discount_code || undefined,
          ref: 'Hoggax',
        },
        origin_id: 1,
        is_partner: true,
        origin_channel_id: 431,
        agent_email: data.agent_email,
        send_agent_email_to_tenant: data.send_agent_email_to_tenant,
      } as const;

      dispatch({ type: 'quotation/setDraft', payload: { qualificationRequest } });

      const shouldUseMock = process.env.NEXT_PUBLIC_USE_MOCK_RESULT === '1';
      qualification = shouldUseMock
        ? buildMockQualification({
            rent: data.quotation.rent,
            expenses: data.quotation.expenses,
            term: data.quotation.term,
            discountCode: data.quotation.discount_code || undefined,
            tenantEmail: data.user_personal_data.email,
            agentEmail: agent?.email ?? data.agent_email,
          })
        : await createQualification(qualificationRequest);
      toast.success('Calificación procesada');

      if ([4, 5].includes(qualification.status_id)) {
        void notifyFianzaAprobacionWebhook(qualification);
      }

      onComplete(qualification);
    } catch (error) {
      console.error('[Form] error:', error);
      toast.error('Error al procesar la solicitud. Intentá de nuevo.');
    } finally {
      setIsLoading(false);
    }
  });

  return {
    ...form,
    constants: {
      DOCUMENT_TYPES,
      GENDERS,
      EMPLOYMENT_SITUATIONS,
      ANTIQUITIES,
      TERMS,
    },
    selectedDocType,
    setSelectedDocType,
    selectedGenderId,
    discountValidation,
    isLoading,
    onSubmit,
    setValue,
    watch,
  };
}

