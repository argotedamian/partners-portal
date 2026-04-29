'use client';

import { useEffect, useRef, useState } from 'react';
import { Controller } from 'react-hook-form';
import { IMaskInput } from 'react-imask';
import { useQuotationFlow } from '@/hooks/useQuotationFlow';

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
  const {
    register,
    control,
    setValue,
    constants,
    selectedDocType,
    setSelectedDocType,
    selectedGenderId,
    discountValidation,
    isLoading,
    onSubmit,
  } = useQuotationFlow({ onComplete });

  return (
    <div className="form-container">
      <form onSubmit={onSubmit}>
        <p className="tenant-caption">Datos del inquilino</p>

        <fieldset>
          <legend className="form-section-title">Datos del alquiler</legend>
          <div className="grid-fields-three">
            <div className="form-group">
              <label>Alquiler <span className="required-star">*</span></label>
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
              <label>Expensas <span className="required-star">*</span></label>
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
              <label>Duración <span className="required-star">*</span></label>
              <select {...register('quotation.term', { valueAsNumber: true })}>
                {constants.TERMS.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Cupón de descuento</label>
            <input
              type="text"
              {...register('quotation.discount_code')}
              placeholder="Descuento"
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

        <fieldset>
          <legend className="form-section-title">Datos labores</legend>
          <div className="grid-fields">
            <div className="form-group">
              <label>Situación laboral <span className="required-star">*</span></label>
              <select {...register('user_personal_data.employment_situation_id', { valueAsNumber: true })}>
                <option value="">Seleccioná la opción</option>
                {constants.EMPLOYMENT_SITUATIONS.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Antigüedad <span className="required-star">*</span></label>
              <select {...register('user_personal_data.antiquity_id', { valueAsNumber: true })}>
                <option value="">Seleccioná la opción</option>
                {constants.ANTIQUITIES.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Ingresos mensuales <span className="required-star">*</span></label>
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
        </fieldset>

        <fieldset>
          <legend className="form-section-title">Datos personales</legend>

          <div className="form-group">
            <label>Documento de identidad <span className="required-star">*</span></label>
            <div className="identity-grid">
              <DocTypeSelect
                value={selectedDocType}
                options={constants.DOCUMENT_TYPES}
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
                      placeholder="11.111.111"
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
              <div className="gender-segment">
                {constants.GENDERS.map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    className={`gender-segment-btn${selectedGenderId === g.id ? ' is-active' : ''}`}
                    onClick={() => setValue('user_personal_data.gender_id', g.id, { shouldDirty: true })}
                  >
                    {g.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid-fields">
            <div className="form-group">
              <label>Correo electrónico <span className="required-star">*</span></label>
              <input
                type="email"
                {...register('user_personal_data.email')}
                placeholder="tuemail@hoggax.com"
              />
            </div>
            <div className="form-group">
              <label>Celular <span className="required-star">*</span></label>
              <div className="phone-grid">
                <input type="text" value="+54" readOnly />
                <Controller
                  control={control}
                  name="user_personal_data.phone"
                  render={({ field }) => (
                    <IMaskInput
                      mask="0000-0000"
                      value={field.value ?? ''}
                      onAccept={(val: string) => field.onChange(val)}
                      inputRef={field.ref}
                      onBlur={field.onBlur}
                      name={field.name}
                      placeholder="1111-1111"
                    />
                  )}
                />
              </div>
            </div>
          </div>
        </fieldset>

        <div className="form-submit">
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Cargando...' : 'Cotizar'}
          </button>
        </div>
      </form>
    </div>
  );
}