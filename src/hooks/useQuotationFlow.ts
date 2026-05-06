'use client';

import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import {
  DOCUMENT_TYPES,
  EMPLOYMENT_STUDENT_ID,
  GENDERS,
  EMPLOYMENT_SITUATIONS,
  ANTIQUITIES,
  TERMS,
} from '@/lib/constants';
import { isAllowedAdvisorEmailFromMock, resolvePartnerAgent } from '@/lib/partners-mock';
import {
  alignQualificationStatusForPassport,
  getPassportAlignedStatusId,
} from '@/lib/passport-qualification-alignment';
import {
  createQualification,
  notifyFianzaAprobacionWebhook,
  validateDiscountCode,
} from '@/lib/quotation.api';
import type { Qualification } from '@/lib/quotation.api';
import {
  intermediateStatusIdFromMockMode,
  parseQualificationMockMode,
  QualificationMockMode,
  rejectedVariantFromMockMode,
} from '@/mocks/qualification-mock-mode.enum';
import { QualificationStatusId } from '@/mocks/qualification-status-id.enum';
import { buildMockQualificationIntermediate } from '@/mocks/qualification-intermediate-states';
import { buildMockQualificationRejected } from '@/mocks/qualification-rejected';
import { useAppDispatch, useAppState } from '@/state/AppStateContext';
import { selectAdvisorEmail } from '@/state/appState.selectors';

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
  const advisor = resolvePartnerAgent(agentEmail);
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
    status_id: QualificationStatusId.ApprovedQuotation,
    is_quotation_only: true,
    id: now,
    bail_number: MOCK_BAIL_NUMBER,
    pipedrive_id: now,
    quotation_id: now,
    api_res_data: {
      idHoggax: now,
      front: {
        nombre: ((tenantEmail ?? '').trim().split('@')[0] ?? '').trim() || 'Mock',
        agente: {
          nombre: advisor.displayName || advisor.email || '',
          email: advisor.email || '',
          telefono: advisor.phone || '',
          foto: null,
        },
      },
      cotizacion: {
        alquiler: rent,
        expensas: expenses,
        plazo: term,
        costoServicio: hasDiscount ? transferPrecioFinal : transferPrecioOriginal,
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
  phone_country_code: string;
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
  const advisorEmailFromStore = selectAdvisorEmail(useAppState());
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState(1);
  const [discountValidation, setDiscountValidation] = useState<Awaited<ReturnType<typeof validateDiscountCode>>>({
    status: 'idle',
  });
  const discountTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const form = useForm<FormValues>({
    mode: 'onChange',
    shouldUnregister: true,
    defaultValues: {
      user_personal_data: {
        document_type_id: 1,
        document_value: '',
        gender_id: null,
        phone_country_code: '+54',
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
      agent_email: '',
      send_agent_email_to_tenant: false,
    },
  });

  const { watch, setValue, handleSubmit } = form;

  useEffect(() => {
    setValue('agent_email', advisorEmailFromStore ?? '', {
      shouldValidate: true,
      shouldDirty: true,
    });
  }, [advisorEmailFromStore, setValue]);

  /** Mantiene `document_type_id` en el estado de RHF (requerido por el backend); el selector no usa `register`. */
  useEffect(() => {
    setValue('user_personal_data.document_type_id', selectedDocType);
  }, [selectedDocType, setValue]);
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
      const partnerAgent = resolvePartnerAgent(data.agent_email);
      if (!partnerAgent.email.trim() || !isAllowedAdvisorEmailFromMock(partnerAgent.email)) {
        toast.error('Seleccioná un asesor habilitado');
        setIsLoading(false);
        return;
      }

      const { document_value, first_name, last_name } = data.user_personal_data;
      const document_type_id = data.user_personal_data.document_type_id ?? selectedDocType;

      let qualification: Qualification;

      if (!document_value?.trim()) {
        toast.error('Ingresá el documento de identidad');
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

      if (normalizedEmploymentSituationId !== EMPLOYMENT_STUDENT_ID) {
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

      const normalizedCountryCode = sanitizeNumericInput(data.user_personal_data.phone_country_code || '+54');
      const normalizedPhoneLocal = sanitizeNumericInput(data.user_personal_data.phone);

      const personalData = {
        document_type_id,
        document_value: normalizedDocumentValue,
        gender_id: normalizedGenderId,
        phone_country_code: data.user_personal_data.phone_country_code,
        phone: `${normalizedCountryCode}${normalizedPhoneLocal}`,
        email: data.user_personal_data.email,
        employment_situation_id: normalizedEmploymentSituationId,
        antiquity_id:
          normalizedEmploymentSituationId === EMPLOYMENT_STUDENT_ID ? null : normalizedAntiquityId,
        monthly_income:
          normalizedEmploymentSituationId === EMPLOYMENT_STUDENT_ID ? null : normalizedMonthlyIncome,
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
        agent_email: partnerAgent.email,
        send_agent_email_to_tenant: data.send_agent_email_to_tenant,
      } as const;

      dispatch({ type: 'quotation/setDraft', payload: { qualificationRequest } });

      const mockMode = parseQualificationMockMode(process.env.NEXT_PUBLIC_USE_MOCK_RESULT);

      const passportAlignmentInput = {
        document_type_id,
        employment_situation_id: normalizedEmploymentSituationId,
        rent: data.quotation.rent,
        expenses: data.quotation.expenses,
      };

      if (mockMode === null) {
        qualification = await createQualification(qualificationRequest);
        qualification = alignQualificationStatusForPassport(qualification, passportAlignmentInput);
        toast.success('Calificación procesada');
      } else if (mockMode === QualificationMockMode.ApprovedQuotation) {
        const passportOutcome = getPassportAlignedStatusId(passportAlignmentInput);
        if (passportOutcome === QualificationStatusId.AlmostApproved) {
          qualification = buildMockQualificationIntermediate(QualificationStatusId.AlmostApproved, {
            tenantEmail: data.user_personal_data.email,
            agentEmail: partnerAgent.email,
          });
        } else {
          qualification = buildMockQualification({
            rent: data.quotation.rent,
            expenses: data.quotation.expenses,
            term: data.quotation.term,
            discountCode: data.quotation.discount_code || undefined,
            tenantEmail: data.user_personal_data.email,
            agentEmail: partnerAgent.email,
          });
        }
        toast.success('Calificación procesada');
      } else if (
        mockMode === QualificationMockMode.Rejected ||
        mockMode === QualificationMockMode.RejectedStatus7 ||
        mockMode === QualificationMockMode.RejectedStatus8
      ) {
        qualification = buildMockQualificationRejected({
          tenantEmail: data.user_personal_data.email,
          agentEmail: partnerAgent.email,
          variant: rejectedVariantFromMockMode(mockMode),
        });
        toast.info('Mock: solicitud no aprobada');
      } else {
        const intermediateId = intermediateStatusIdFromMockMode(mockMode);
        if (intermediateId === null) {
          qualification = await createQualification(qualificationRequest);
          toast.success('Calificación procesada');
        } else {
          qualification = buildMockQualificationIntermediate(intermediateId, {
            tenantEmail: data.user_personal_data.email,
            agentEmail: partnerAgent.email,
          });
          toast.info(`Mock: calificación estado ${intermediateId}`);
        }
      }

      if ([QualificationStatusId.ApprovedQuotation, 5].includes(qualification.status_id)) {
        void notifyFianzaAprobacionWebhook(qualification, partnerAgent.email);
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

