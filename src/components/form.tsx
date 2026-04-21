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

// Tipo para la qualification
type Qualification = {
  status_id: number;
  is_quotation_only?: boolean;
  id?: number | null;
  bail_number?: string | null;
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
      }>;
      discount?: number;
      discountRef?: number | null;
    };
  };
};

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

  const onSubmit = async (data: FormValues) => {
    console.log('[Form] submit:', data);
    setIsLoading(true);

    if (!data.agent_email) {
      toast.error('Seleccionar un agente');
      setIsLoading(false);
      return;
    }

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const mockQualification: Qualification = {
        status_id: 4,
        is_quotation_only: true,
        api_res_data: {
          idHoggax: null,
          front: {
            nombre: 'Juan',
            agente: (() => {
              const found = PARTNERS_AGENTS.find((a) => a.email === data.agent_email);
              return found ? { nombre: found.label, email: found.email, telefono: found.phone, foto: null } : undefined;
            })(),
          },
          cotizacion: {
            costoServicio: 350000,
            costoServicioRaw: 350000,
            legales: 'Legales del servicio...',
            facilita_desPago: [
              {
                _id: 'po_0',
                orden: 1,
                cuotas: 0,
                visible: true,
                texto: 'Transferencia',
                subTexto: 'Precio final',
                importe: 350000,
              },
              {
                _id: 'po_1',
                orden: 2,
                cuotas: 3,
                visible: true,
                destacado: true,
                texto: '3 cuotas sin interés',
                subTexto: '$116.666 por cuota',
                importe: 350000,
              },
              {
                _id: 'po_2',
                orden: 3,
                cuotas: 6,
                visible: true,
                texto: '6 cuotas',
                subTexto: '$58.333 por cuota',
                infoTexto: 'Total: $350.000',
                importe: 350000,
              },
              {
                _id: 'po_3',
                orden: 4,
                cuotas: 12,
                visible: true,
                texto: '12 cuotas',
                subTexto: '$29.166 por cuota',
                infoTexto: 'Total: $350.000',
                importe: 350000,
              },
            ],
            discount: 0,
            discountRef: null,
          },
        },
      };

      onComplete(mockQualification);
      toast.success('Cotización creada');
    } catch (error) {
      toast.error('Error al crear cotización');
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