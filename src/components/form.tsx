'use client';

import { useState, useRef, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { IMaskInput } from 'react-imask';
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
  createQuotation,
  createQualification,
  notifyFianzaAprobacionWebhook,
  validateDiscountCode,
} from '@/lib/quotation.api';

// Tipos del formulario
type PersonalData = {
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

type Quotation = {
  rent: number | null;
  expenses: number | null;
  term: number;
  discount_code: string;
};

type FormValues = {
  user_personal_data: PersonalData;
  quotation: Quotation;
  agent_email: string;
  send_agent_email_to_tenant: boolean;
  is_real_estate: boolean;
};

import type { Qualification } from '@/lib/quotation.api';

interface FormProps {
  onComplete: (qualification: Qualification) => void;
}

function DocTypeSelect({
  value,
  options,
  onChange,
}: {
  value: number;
  options: { id: number; name: string }[];
  onChange: (id: number) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.id === value);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="doc-type-dropdown" ref={ref}>
      <button type="button" className="doc-type-trigger" onClick={() => setIsOpen((o) => !o)}>
        {selected?.name}
        <svg width="10" height="10" viewBox="0 0 12 12" aria-hidden="true">
          <path fill="#0F0054" d="M6 8L1 3h10z" />
        </svg>
      </button>
      {isOpen && (
        <div className="doc-type-options">
          {options.map((option) => (
            <div
              key={option.id}
              className={`doc-type-option${value === option.id ? ' selected' : ''}`}
              onClick={() => {
                onChange(option.id);
                setIsOpen(false);
              }}
            >
              {option.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function Form({ onComplete }: FormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState(1);
  const [discountValidation, setDiscountValidation] = useState<Awaited<ReturnType<typeof validateDiscountCode>>>({ status: 'idle' });
  const discountTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function sanitizeNumericInput(value: string): string {
    return value.replace(/\D/g, '');
  }

  function normalizeNullableNumber(value: number | null): number | null {
    if (value === null) return null;
    return Number.isFinite(value) ? value : null;
  }

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<FormValues>({
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
      agent_email: '',
      send_agent_email_to_tenant: false,
      is_real_estate: false,
    },
  });

  const employmentSituationId = watch('user_personal_data.employment_situation_id');
  const discountCode = watch('quotation.discount_code');

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

  const onSubmit = async (data: FormValues) => {
    console.log('[Form] submit:', data);
    setIsLoading(true);

    if (!data.agent_email) {
      toast.error('Seleccionar un agente');
      setIsLoading(false);
      return;
    }

    if (!data.quotation.rent || !data.quotation.expenses) {
      toast.error('Ingresá el alquiler y las expensas');
      setIsLoading(false);
      return;
    }

    try {
      const { document_value, document_type_id, first_name, last_name } = data.user_personal_data;
      const agent = PARTNERS_AGENTS.find((a) => a.email === data.agent_email);

      // Routing: calificación completa si hay documento válido, cotización pura si no
      const shouldQualify =
        !!document_value &&
        (document_type_id === 1 ||
          (document_type_id === 2 && !!first_name && !!last_name));

      let qualification;

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

        const normalizedDocumentValue = document_type_id === 1
          ? sanitizeNumericInput(document_value)
          : document_value.trim();

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
            rent: data.quotation.rent!,
            expenses: data.quotation.expenses!,
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

        // n8n: solo cuando la calificación queda aprobada
        if ([4, 5].includes(qualification.status_id)) {
          void notifyFianzaAprobacionWebhook(qualification);
        }
      } else {
        qualification = await createQuotation(
          {
            rent: data.quotation.rent!,
            expenses: data.quotation.expenses!,
            term: data.quotation.term,
            discount_code: data.quotation.discount_code || undefined,
            is_partner: true,
            agent_email: data.agent_email,
            contact_email: data.send_agent_email_to_tenant
              ? data.user_personal_data.email || undefined
              : undefined,
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
  };

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Partner */}
        <div className="form-group">
          <label>Usuario</label>
          <select {...register('agent_email')}>
            <option value="">Seleccionar usuario</option>
            {PARTNERS_AGENTS.map((agent) => (
              <option key={agent.email} value={agent.email}>
                {agent.label}
              </option>
            ))}
          </select>
        </div>

        {/* Switches */}
        <div className="form-switches">
          <div className="switch-row">
            <label className="toggle-switch">
              <input type="checkbox" {...register('send_agent_email_to_tenant')} />
              <span className="toggle-slider" />
            </label>
            <span>Enviar cotización al inquilino</span>
          </div>
        </div>

        <hr className="form-divider" />

        {/* Datos personales */}
        <fieldset>
          <legend>Datos personales</legend>

          {/* Tipo de documento */}
          <div className="grid-fields">
            <div className="form-group">
              <DocTypeSelect
                value={selectedDocType}
                options={DOCUMENT_TYPES}
                onChange={(id) => {
                  setSelectedDocType(id);
                  setValue('user_personal_data.document_type_id', id);
                }}
              />
              {selectedDocType === 1 ? (
                <Controller
                  control={control}
                  name="user_personal_data.document_value"
                  render={({ field }) => (
                    <IMaskInput
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      mask={[{ mask: '0.000.000' }, { mask: '00.000.000' }] as any}
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      dispatch={(appended: string, dyn: any) => {
                        const digits = (dyn.value + appended).replace(/\D/g, '');
                        return dyn.compiledMasks[digits.length > 7 ? 1 : 0];
                      }}
                      value={field.value ?? ''}
                      onAccept={(val: string) => field.onChange(val)}
                      inputRef={field.ref}
                      onBlur={field.onBlur}
                      name={field.name}
                      placeholder="XX.XXX.XXX"
                    />
                  )}
                />
              ) : (
                <input
                  type="text"
                  {...register('user_personal_data.document_value')}
                  placeholder="Pasaporte"
                />
              )}
            </div>

            <div className="form-group">
              <label>Género</label>
              <select {...register('user_personal_data.gender_id', { valueAsNumber: true })}>
                <option value="">Seleccionar</option>
                {GENDERS.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Nombre y Apellido (cuando no es DNI) */}
          {selectedDocType !== 1 && (
            <div className="grid-fields">
              <div className="form-group">
                <label>Nombre</label>
                <input type="text" {...register('user_personal_data.first_name')} />
              </div>
              <div className="form-group">
                <label>Apellido</label>
                <input type="text" {...register('user_personal_data.last_name')} />
              </div>
            </div>
          )}

          {/* Contacto */}
          <div className="grid-fields">
            <div className="form-group">
              <label>Celular</label>
              <Controller
                control={control}
                name="user_personal_data.phone"
                render={({ field }) => (
                  <IMaskInput
                    mask="+{54} 00 0000-0000"
                    value={field.value ?? ''}
                    onAccept={(val: string) => field.onChange(val)}
                    inputRef={field.ref}
                    onBlur={field.onBlur}
                    name={field.name}
                    placeholder="+54 11 1234-5678"
                  />
                )}
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                {...register('user_personal_data.email')}
                placeholder="email@ejemplo.com"
              />
            </div>
          </div>

          {/* Situación laboral */}
          <div className="form-group">
            <label>Situación laboral</label>
            <select {...register('user_personal_data.employment_situation_id', { valueAsNumber: true })}>
              <option value="">Seleccionar</option>
              {EMPLOYMENT_SITUATIONS.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
                </option>
              ))}
            </select>
          </div>

          {/* Antigüedad e ingresos (excepto estudiante) */}
          {employmentSituationId !== 1 && (
            <div className="grid-fields">
              <div className="form-group">
                <label>Antigüedad</label>
                <select {...register('user_personal_data.antiquity_id', { valueAsNumber: true })}>
                  <option value="">Seleccionar</option>
                  {ANTIQUITIES.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Ingresos mensuales</label>
                <Controller
                  control={control}
                  name="user_personal_data.monthly_income"
                  render={({ field }) => (
                    <div className="price-field">
                      <span className="price-prefix">$</span>
                      <IMaskInput
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        mask={Number as any}
                        scale={0}
                        thousandsSeparator="."
                        radix=","
                        normalizeZeros={false}
                        value={field.value !== null && field.value !== undefined ? String(field.value) : ''}
                        onAccept={(_val: unknown, maskRef: { unmaskedValue: string }) => {
                          const raw = maskRef.unmaskedValue;
                          field.onChange(raw ? parseInt(raw, 10) : null);
                        }}
                        inputRef={field.ref}
                        onBlur={field.onBlur}
                        name={field.name}
                        placeholder="0"
                      />
                    </div>
                  )}
                />
              </div>
            </div>
          )}
        </fieldset>

        {/* Cotización */}
        <fieldset>
          <legend>Cotización</legend>

          <div className="grid-fields-three">
            <div className="form-group">
              <label>Alquiler</label>
              <Controller
                control={control}
                name="quotation.rent"
                render={({ field }) => (
                  <div className="price-field">
                    <span className="price-prefix">$</span>
                    <IMaskInput
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      mask={Number as any}
                      scale={0}
                      thousandsSeparator="."
                      radix=","
                      normalizeZeros={false}
                      value={field.value !== null && field.value !== undefined ? String(field.value) : ''}
                      onAccept={(_val: unknown, maskRef: { unmaskedValue: string }) => {
                        const raw = maskRef.unmaskedValue;
                        field.onChange(raw ? parseInt(raw, 10) : null);
                      }}
                      inputRef={field.ref}
                      onBlur={field.onBlur}
                      name={field.name}
                      placeholder="0"
                    />
                  </div>
                )}
              />
            </div>
            <div className="form-group">
              <label>Expensas</label>
              <Controller
                control={control}
                name="quotation.expenses"
                render={({ field }) => (
                  <div className="price-field">
                    <span className="price-prefix">$</span>
                    <IMaskInput
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      mask={Number as any}
                      scale={0}
                      thousandsSeparator="."
                      radix=","
                      normalizeZeros={false}
                      value={field.value !== null && field.value !== undefined ? String(field.value) : ''}
                      onAccept={(_val: unknown, maskRef: { unmaskedValue: string }) => {
                        const raw = maskRef.unmaskedValue;
                        field.onChange(raw ? parseInt(raw, 10) : null);
                      }}
                      inputRef={field.ref}
                      onBlur={field.onBlur}
                      name={field.name}
                      placeholder="0"
                    />
                  </div>
                )}
              />
            </div>
            <div className="form-group">
              <label>Plazo</label>
              <select {...register('quotation.term', { valueAsNumber: true })}>
                {TERMS.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Cupón de descuento */}
          <div className="form-group">
            <label>Cupón de descuento</label>
            <input
              type="text"
              {...register('quotation.discount_code')}
              placeholder="Código"
            />
            {discountValidation.status === 'invalid' && (
              <span className="mt-2 flex items-center gap-2 text-sm font-bold text-[var(--primary)]">
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full border border-[var(--primary)]">
                  ×
                </span>
                {discountValidation.message === 'El código ingresado no es válido'
                  ? 'El código ingresado no es válido'
                  : discountValidation.message}
              </span>
            )}
            {discountValidation.status === 'valid' && (
              <span className="mt-2 flex items-center gap-2 text-sm font-bold text-[var(--app-green)]">
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full border border-[var(--app-green)]">
                  ✓
                </span>
                {discountValidation.percent}% de descuento
              </span>
            )}
          </div>
        </fieldset>

        {/* Submit */}
        <div className="form-submit">
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Cargando...' : 'Cotizar ahora'}
          </button>
        </div>
      </form>
    </div>
  );
}