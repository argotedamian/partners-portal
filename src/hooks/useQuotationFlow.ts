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
  createQuotation,
  notifyFianzaAprobacionWebhook,
  validateDiscountCode,
} from '@/lib/quotation.api';
import type { Qualification } from '@/lib/quotation.api';

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
  is_real_estate: boolean;
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
      send_agent_email_to_tenant: false,
      is_real_estate: false,
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

      const shouldQualify = !!document_value && (document_type_id === 1 || (document_type_id === 2 && !!first_name && !!last_name));

      let qualification: Qualification;

      if (shouldQualify) {
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

        qualification = await createQualification({
          user_personal_data: personalData,
          quotation: {
            rent: data.quotation.rent,
            expenses: data.quotation.expenses,
            term: data.quotation.term,
            discount_code: data.quotation.discount_code || undefined,
            ref: 'partners-portal',
          },
          origin_id: 1,
          is_partner: true,
          agent_email: data.agent_email,
          send_agent_email_to_tenant: data.send_agent_email_to_tenant,
          is_real_estate: false,
        });
        toast.success('Calificación procesada');

        if ([4, 5].includes(qualification.status_id)) {
          void notifyFianzaAprobacionWebhook(qualification);
        }
      } else {
        qualification = await createQuotation(
          {
            rent: data.quotation.rent,
            expenses: data.quotation.expenses,
            term: data.quotation.term,
            discount_code: data.quotation.discount_code || undefined,
            is_partner: true,
            agent_email: data.agent_email,
            contact_email: data.send_agent_email_to_tenant ? data.user_personal_data.email || undefined : undefined,
          },
          agent?.label,
          agent?.phone,
        );
        toast.success('Cotización creada');
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

