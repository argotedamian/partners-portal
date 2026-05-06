'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { IMaskInput } from 'react-imask';
import { toast } from 'sonner';
import { TERMS } from '@/lib/constants';
import { createQualification } from '@/lib/quotation.api';
import { useAppDispatch, useAppState } from '@/state/AppStateContext';
import { selectQuotationDraft, selectQualification } from '@/state/appState.selectors';

type EditValues = {
  rent: number | null;
  expenses: number | null;
  term: number;
  discountCode: string;
  phoneCountryCode: string;
  phone: string;
  email: string;
};

function formatArs(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return '-';
  return `$${Number(value).toLocaleString('es-AR')}`;
}

function sanitizeNumericInput(value: string): string {
  return value.replace(/\D/g, '');
}

function splitPhoneDigits(value: string): { phoneCountryCode: string; phoneLocal: string } {
  const digits = sanitizeNumericInput(value ?? '');
  if (!digits) return { phoneCountryCode: '+54', phoneLocal: '' };
  if (digits.length <= 10) return { phoneCountryCode: '+54', phoneLocal: digits };
  const local = digits.slice(-10);
  const cc = digits.slice(0, -10);
  return { phoneCountryCode: `+${cc}`, phoneLocal: local };
}

function normalizeDiscountCode(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return trimmed.startsWith('#') ? trimmed : `#${trimmed}`;
}

function coerceNumber(value: unknown): number | null {
  const n = typeof value === 'number' ? value : Number(String(value ?? '').trim());
  return Number.isFinite(n) ? n : null;
}

function PencilIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3 17.25V21h3.75L19.81 7.94l-3.75-3.75L3 17.25z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M14.06 4.19l3.75 3.75"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function runQuotationEditTransition(updateDom: () => void) {
  if (typeof document === 'undefined') {
    updateDom();
    return;
  }
  const doc = document as Document & {
    startViewTransition?: (callback: () => void) => { finished: Promise<void> };
  };
  if (typeof doc.startViewTransition === 'function') {
    doc.startViewTransition(() => {
      flushSync(updateDom);
    });
  } else {
    updateDom();
  }
}

function ArrowRightIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 12h14M13 5l7 7-7 7"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function QuotationEditPanel() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const draft = selectQuotationDraft(state);
  const qualification = selectQualification(state);

  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const firstInputRef = useRef<HTMLInputElement | null>(null);

  const initialValues = useMemo<EditValues>(() => {
    const req = draft?.qualificationRequest ?? null;
    const cot = qualification?.api_res_data?.cotizacion;

    const rent = coerceNumber(req?.quotation?.rent ?? cot?.alquiler ?? null);
    const expenses = coerceNumber(req?.quotation?.expenses ?? cot?.expensas ?? null);
    const term = coerceNumber(req?.quotation?.term ?? cot?.plazo ?? 2) ?? 2;
    const discountCode = String(req?.quotation?.discount_code ?? '');
    const phoneRaw = String(req?.user_personal_data?.phone ?? '');
    const email = String(req?.user_personal_data?.email ?? '');

    const { phoneCountryCode, phoneLocal } = splitPhoneDigits(phoneRaw);

    return {
      rent,
      expenses,
      term,
      discountCode,
      phoneCountryCode,
      phone: phoneLocal,
      email,
    };
  }, [draft?.qualificationRequest, qualification?.api_res_data?.cotizacion]);

  const [values, setValues] = useState<EditValues>(initialValues);

  useEffect(() => {
    setValues(initialValues);
  }, [initialValues]);

  useEffect(() => {
    if (!isExpanded) return;
    firstInputRef.current?.focus();
  }, [isExpanded]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== 'Escape') return;
      runQuotationEditTransition(() => {
        setIsExpanded(false);
        setValues(initialValues);
      });
    }
    if (isExpanded) document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [initialValues, isExpanded]);

  function closeExpanded() {
    runQuotationEditTransition(() => {
      setIsExpanded(false);
      setValues(initialValues);
    });
  }

  const termLabel = TERMS.find((t) => t.value === values.term)?.name ?? `${values.term} años`;

  async function onRecalculate() {
    const baseRequest = draft?.qualificationRequest ?? null;
    if (!baseRequest) {
      toast.error('No pudimos recuperar los datos de la solicitud para recalcular.');
      return;
    }

    if (!values.rent || !values.expenses) {
      toast.error('Ingresá el alquiler y las expensas');
      return;
    }

    const normalizedEmail = values.email.trim();
    if (!normalizedEmail) {
      toast.error('Ingresá el email');
      return;
    }

    const normalizedCountryCode = sanitizeNumericInput(values.phoneCountryCode || '+54');
    if (!normalizedCountryCode) {
      toast.error('Ingresá el código de país');
      return;
    }

    const normalizedPhoneLocal = sanitizeNumericInput(values.phone);
    if (normalizedPhoneLocal.length !== 10) {
      toast.error('Ingresá 10 dígitos (cód. de área + número)');
      return;
    }

    const patchedRequest = {
      ...baseRequest,
      user_personal_data: {
        ...baseRequest.user_personal_data,
        email: normalizedEmail,
        phone: `${normalizedCountryCode}${normalizedPhoneLocal}`,
      },
      quotation: {
        ...baseRequest.quotation,
        rent: values.rent,
        expenses: values.expenses,
        term: values.term,
        discount_code: normalizeDiscountCode(values.discountCode),
      },
    } as const;

    setIsLoading(true);
    try {
      dispatch({ type: 'quotation/setDraft', payload: { qualificationRequest: patchedRequest } });
      const nextQualification = await createQualification(patchedRequest);
      dispatch({ type: 'quotation/setQualification', payload: nextQualification });
      toast.success('Cotización actualizada');
      runQuotationEditTransition(() => {
        setIsExpanded(false);
      });
    } catch (error) {
      console.error('[QuotationEditPanel] error:', error);
      toast.error('Error al recalcular. Intentá de nuevo.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section
      className={`quotation-edit-host${isExpanded ? ' quotation-edit-host--expanded' : ''}`}
      aria-label="Editar cotización"
    >
      {!isExpanded ? (
        <div className="quotation-edit-summary">
          <div className="quotation-edit-items" aria-label="Resumen de cotización">
            <div className="quotation-edit-item">
              <span className="quotation-edit-label">Alquiler inicial</span>
              <span className="quotation-edit-value">{formatArs(values.rent)}</span>
            </div>
            <span className="quotation-edit-sep" aria-hidden="true" />
            <div className="quotation-edit-item">
              <span className="quotation-edit-label">Expensas</span>
              <span className="quotation-edit-value">{formatArs(values.expenses)}</span>
            </div>
            <span className="quotation-edit-sep" aria-hidden="true" />
            <div className="quotation-edit-item">
              <span className="quotation-edit-label">Duración</span>
              <span className="quotation-edit-value">{termLabel}</span>
            </div>
          </div>

          <button
            type="button"
            className="quotation-edit-button"
            onClick={() =>
              runQuotationEditTransition(() => {
                setIsExpanded(true);
              })
            }
            aria-expanded={false}
            aria-controls="quotation-edit-expanded-panel"
            id="quotation-edit-open-button"
          >
            <PencilIcon />
          </button>
        </div>
      ) : (
        <div
          className="quotation-edit-expanded-shell"
          id="quotation-edit-expanded-panel"
          role="region"
          aria-label="Formulario de edición de cotización"
        >
          <div className="quotation-edit-expanded-head">
            <button
              type="button"
              className="quotation-edit-close"
              onClick={closeExpanded}
              aria-label="Cerrar edición"
              disabled={isLoading}
            >
              ×
            </button>
          </div>

          <div className="form-container quotation-edit-expanded-form">
            <fieldset>
              <legend className="form-section-title">Datos del alquiler</legend>
              <div className="grid-fields-three">
                <div className="form-group">
                  <label htmlFor="qe-rent">
                    Alquiler inicial <span className="required-star">*</span>
                  </label>
                  <div className="price-field">
                    <span className="price-prefix">$</span>
                    <IMaskInput
                      id="qe-rent"
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      mask={Number as any}
                      scale={0}
                      thousandsSeparator="."
                      radix=","
                      normalizeZeros={false}
                      value={values.rent != null ? String(values.rent) : ''}
                      inputRef={(node) => {
                        firstInputRef.current = node;
                      }}
                      onAccept={(_val: unknown, maskRef: { unmaskedValue: string }) => {
                        const raw = maskRef.unmaskedValue;
                        setValues((prev) => ({ ...prev, rent: raw ? parseInt(raw, 10) : null }));
                      }}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="qe-expenses">
                    Expensas <span className="required-star">*</span>
                  </label>
                  <div className="price-field">
                    <span className="price-prefix">$</span>
                    <IMaskInput
                      id="qe-expenses"
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      mask={Number as any}
                      scale={0}
                      thousandsSeparator="."
                      radix=","
                      normalizeZeros={false}
                      value={values.expenses != null ? String(values.expenses) : ''}
                      onAccept={(_val: unknown, maskRef: { unmaskedValue: string }) => {
                        const raw = maskRef.unmaskedValue;
                        setValues((prev) => ({ ...prev, expenses: raw ? parseInt(raw, 10) : null }));
                      }}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="qe-term">
                    Duración <span className="required-star">*</span>
                  </label>
                  <select
                    id="qe-term"
                    value={values.term}
                    onChange={(e) => setValues((prev) => ({ ...prev, term: Number(e.target.value) }))}
                  >
                    {TERMS.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </fieldset>

            <fieldset>
              <legend className="form-section-title">Datos personales</legend>
              <div className="grid-fields">
                <div className="form-group">
                  <label htmlFor="qe-email">
                    Correo electrónico <span className="required-star">*</span>
                  </label>
                  <input
                    id="qe-email"
                    type="email"
                    value={values.email}
                    onChange={(e) => setValues((prev) => ({ ...prev, email: e.target.value }))}
                    placeholder="tuemail@hoggax.com"
                    autoComplete="email"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="qe-phone">
                    Celular <span className="required-star">*</span>
                  </label>
                  <div className="phone-grid">
                    <input
                      type="tel"
                      value={values.phoneCountryCode}
                      onChange={(e) => setValues((prev) => ({ ...prev, phoneCountryCode: e.target.value }))}
                      aria-label="Código de país"
                      placeholder="+54"
                      autoComplete="tel-country-code"
                      inputMode="tel"
                    />
                    <IMaskInput
                      id="qe-phone"
                      mask="00-0000-0000"
                      value={values.phone ?? ''}
                      onAccept={(val: string) => setValues((prev) => ({ ...prev, phone: val }))}
                      placeholder="11-1111-1111"
                    />
                  </div>
                </div>
              </div>
            </fieldset>

            <div className="quotation-edit-edit-actions">
              <div className="form-group quotation-edit-coupon-field mb-0">
                <label htmlFor="qe-coupon">Cupón de descuento</label>
                <input
                  id="qe-coupon"
                  type="text"
                  value={values.discountCode}
                  onChange={(e) => setValues((prev) => ({ ...prev, discountCode: e.target.value }))}
                  placeholder="Descuento"
                  autoComplete="off"
                />
              </div>
              <button
                type="button"
                className="quotation-edit-submit quotation-edit-submit--primary"
                onClick={onRecalculate}
                disabled={isLoading}
              >
                <span>{isLoading ? 'Recalculando…' : 'Cotizar mi garantía'}</span>
                {!isLoading ? <ArrowRightIcon /> : null}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
