'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import type { Qualification, QualificationPaymentMethod } from '@/lib/quotation.api';
import { useAppState } from '@/state/AppStateContext';
import { selectQualification } from '@/state/appState.selectors';

function coerceRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

function normalizePaymentMethod(raw: unknown, idx: number): QualificationPaymentMethod {
  const item = coerceRecord(raw);
  const subTexto = String(item.subTexto ?? item.sub_texto ?? '');
  const infoTexto = String(item.infoTexto ?? item.info_texto ?? '');
  const precioTexto = String(item.precioTexto ?? item.precio_texto ?? '');
  const texto = String(item.texto ?? '');

  return {
    _id: String(item._id ?? `pm_${idx}`),
    orden: Number(item.orden ?? idx),
    cuotas: Number(item.cuotas ?? 0),
    visible: item.visible !== false,
    destacado: Boolean(item.destacado),
    texto,
    subTexto: subTexto || undefined,
    precioTexto: precioTexto || undefined,
    infoTexto: infoTexto || undefined,
    importe: Number(item.importe ?? 0),
    importeTotal: item.importeTotal != null ? Number(item.importeTotal) : undefined,
    importeCuota: item.importeCuota != null ? Number(item.importeCuota) : undefined,
    importeAdelanto: item.importeAdelanto != null ? Number(item.importeAdelanto) : undefined,
  };
}

function paymentMethodsFromCotizacion(apiRes: Qualification['api_res_data']): QualificationPaymentMethod[] {
  const cot = apiRes?.cotizacion;
  if (!cot) return [];
  const raw = cot.facilidadesPago ?? cot.facilita_desPago ?? [];
  return raw.map((row, idx) => normalizePaymentMethod(row, idx));
}

function displayPlanAmount(method: QualificationPaymentMethod): number {
  if (method.cuotas <= 1) {
    return method.importeTotal ?? method.importe;
  }
  return method.importeCuota ?? method.importe;
}

interface ResultProps {
  qualification?: Qualification;
  isPartners?: boolean;
}

export function Result({ qualification: qualificationProp, isPartners = false }: ResultProps) {
  const state = useAppState();
  const [copied, setCopied] = useState(false);
  const qualification = qualificationProp ?? selectQualification(state);
  if (!qualification) return null;
  const statusId = qualification.status_id;

  const buildConstanciaAprobacionUrl = (bailNumber: string): string => {
    const normalized = bailNumber.trim();
    const fileName = `Constancia_${normalized}.pdf`;
    const encodedFileName = encodeURIComponent(fileName);

    return `https://hoggax500.s3.us-east-1.amazonaws.com/Constancias_Aprobacion/${encodedFileName}`;
  };

  const firstName = qualification?.api_res_data?.front?.nombre?.trim()?.split(/\s+/)[0] || '';
  const name = qualification?.api_res_data?.front?.nombre || '';
  const quoteValue = qualification?.api_res_data?.cotizacion?.costoServicio;
  const paymentMethods = paymentMethodsFromCotizacion(qualification.api_res_data).filter((p) => p.visible);
  const agent = qualification?.api_res_data?.front?.agente;

  const formatArs = (value: number | undefined | null): string => {
    if (value == null || isNaN(Number(value))) return '-';
    return `$${Number(value).toLocaleString('es-AR')}`;
  };

  const copyWhatsAppSummary = () => {
    const cot = qualification?.api_res_data?.cotizacion;
    const methods = paymentMethodsFromCotizacion(qualification.api_res_data).filter((m) => m.visible);

    const findByCuotas = (n: number) => methods.find((m) => m.cuotas === n);
    const transfer = findByCuotas(0) || methods.find((m) => /transfer/i.test(m.subTexto || ''));

    const plan3 = findByCuotas(3);
    const plan12 = findByCuotas(12);
    const plan24 = findByCuotas(24);

    const montoAlquiler = formatArs(cot?.alquiler ?? cot?.costoServicio);
    const expensas = cot?.expensas ?? 0;
    const expensasTexto =
      expensas > 0
        ? `y expensas iniciales de ${formatArs(expensas)}`
        : 'sin expensas iniciales';

    const plazoAnios = cot?.plazo ?? 0;
    const plazoContratoMeses = plazoAnios > 0 ? String(plazoAnios * 12) : '—';

    const precioTransferencia = formatArs(transfer?.importeTotal ?? transfer?.importe);
    const valorCuota3 = formatArs(plan3?.importeCuota ?? plan3?.importe);
    const total3Cuotas = formatArs(plan3?.importeTotal ?? plan3?.importe);
    const valorCuota12 = formatArs(plan12?.importeCuota ?? plan12?.importe);
    const total12Cuotas = formatArs(plan12?.importeTotal ?? plan12?.importe);
    const adelanto = formatArs(plan24?.importeAdelanto ?? 0);
    const valorCuotaPlan = formatArs(plan24?.importeCuota ?? plan24?.importe);
    const totalPlan = formatArs(plan24?.importeTotal ?? plan24?.importe);

    const lines = [
      `Hola ${firstName},`,
      '',
      'Te compartimos la cotización de tu garantía Hoggax:',
      '',
      `Corresponde a un alquiler mensual de ${montoAlquiler} ${expensasTexto}.`,
      `Valor final con IVA incluido por un contrato de ${plazoContratoMeses} meses.`,
      '',
      'Opciones de pago:',
      '',
      '• Transferencia:',
      `Precio final: ${precioTransferencia}`,
      '',
      '• 3 cuotas sin interés:',
      `${valorCuota3} por cuota`,
      `Total: ${total3Cuotas}`,
      '',
      '• 12 cuotas:',
      `${valorCuota12} por cuota`,
      `Total: ${total12Cuotas}`,
      '',
      '• 24 cuotas:',
      `Adelanto: ${adelanto}`,
      `${valorCuotaPlan} por cuota`,
      `Total: ${totalPlan}`,
      '',
      'Tu garantía incluye un seguro integral de hogar.',
      '',
      'El próximo paso consiste en completar la documentación para validar tu solicitud.',
      '',
      'Si necesitás más información, podés responder a este mensaje.',
      '',
      'Saludos,',
      'Equipo Hoggax',
    ];

    const text = lines.join('\n');
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      toast.success('Resumen copiado al portapapeles');
      setTimeout(() => setCopied(false), 3000);
    });
  };

  // Approved (status_id: 4)
  if (statusId === 4) {
    return (
      <section className="py-8 sm:py-12">
        <div className="max-w-6xl mx-auto px-4">

          {/* Fila 1: título + descripción (50% izq en lg) — igual que col-60 col-lg-30 */}
          <div className="lg:w-1/2 lg:pr-12 mb-6">
            {qualification.is_quotation_only ? (
              <>
                <h2 className="text-4xl sm:text-5xl font-bold text-[var(--app-green)] mb-4">
                  Tu cotización está lista
                </h2>
                <p className="text-4xl sm:text-5xl text-label">
                  Mirá el <strong className="font-extrabold">valor del servicio</strong>{' '}
                  y los planes de pago disponibles.
                </p>
              </>
            ) : (
              <>
                <h2 className="text-4xl sm:text-5xl font-bold text-[var(--app-green)] mb-4">
                  ¡Felicitaciones {name}!
                </h2>
                <p className="text-4xl sm:text-5xl text-label">
                  Tu garantía Hoggax de alquiler{' '}
                  <strong className="font-extrabold">está aprobada</strong>
                </p>
              </>
            )}
          </div>

          {/* Fila 2: valor + cards (ancho completo) — igual que col-60 container */}
          <div className="mt-4">
            <p className="text-2xl sm:text-3xl font-bold mb-3">
              El valor de tu garantía es de{' '}
              <span className="text-[var(--primary)]">{formatArs(quoteValue)}</span>
            </p>

            {isPartners && paymentMethods.length > 0 && (
              <div className="mt-4">
                <p className="text-lg sm:text-xl font-bold mb-3">Planes de pago</p>
                {/* Cards horizontales: título izq, precio der — igual que justify-content-between align-items-center */}
                <div className="flex flex-col sm:flex-row gap-2">
                  {paymentMethods.map((method) => (
                    <div
                      key={method._id}
                      className={`flex-1 flex justify-between items-center bg-[var(--app-lilac)] rounded-2xl p-4 ${
                        method.destacado ? 'ring-2 ring-[var(--primary)]' : ''
                      }`}
                    >
                      <div className="flex-1 min-w-0 pr-2">
                        <p className="font-bold text-lg leading-tight text-label mb-0">
                          {method.texto}
                        </p>
                        {method.subTexto && (
                          <p className="text-label/70 text-sm leading-tight mb-0">
                            {method.subTexto}
                          </p>
                        )}
                        {method.infoTexto && (
                          <p className="text-label/70 text-sm leading-tight mb-0">
                            {method.infoTexto}
                          </p>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-bold text-[var(--primary)] text-2xl leading-tight mb-0">
                          {formatArs(displayPlanAmount(method))}
                        </p>
                        {method.cuotas > 1 && (
                          <p className="text-label/70 text-sm mb-0">por cuota</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Botones de acción */}
              {isPartners && !qualification.is_quotation_only && (
                <div className="mt-5 flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={copyWhatsAppSummary}
                    className="px-5 py-3 border border-[var(--primary)] text-[var(--primary)] rounded-full font-bold hover:bg-red-50 transition-colors"
                  >
                    {copied ? 'Copiado al portapapeles' : 'Copiar resumen para WhatsApp'}
                  </button>
                  {qualification.bail_number?.trim() ? (
                    <a
                      href={buildConstanciaAprobacionUrl(qualification.bail_number)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-5 py-3 bg-[var(--primary)] text-white rounded-full font-bold hover:bg-[var(--primary-hover)] transition-colors text-center"
                    >
                      Descargar certificado
                    </a>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="px-5 py-3 bg-gray-300 text-label/75 rounded-full font-bold cursor-not-allowed text-center"
                      title="Todavía no hay constancia disponible (falta bail_number)"
                    >
                      Descargar certificado
                    </button>
                  )}
                </div>
              )}
          </div>

        </div>
      </section>
    );
  }

  // Casi aprobado (status_id: 6) — pasaporte o documentación a validar
  if (statusId === 6) {
    return (
      <>
        {/* Sección superior — blanco */}
        <section className="py-8 sm:py-12">
          <div className="max-w-6xl mx-auto px-4">
            <div className="lg:w-1/2 lg:pr-12">
              <h2 className="text-4xl sm:text-5xl font-bold text-[var(--app-green)] mb-4">
                {name ? `${name} ` : ''}¡Ya casi está!
              </h2>
              <p className="text-xl text-label">
                Para ofrecerte una garantía necesitaremos validar tu documentación e ingresos.
              </p>
            </div>
          </div>
        </section>

        {/* Sección inferior — lilac */}
        <section className="py-8 sm:py-10 bg-[var(--app-lilac)]">
          <div className="max-w-6xl mx-auto px-4">
            <p className="text-xl text-label">
              {agent ? (
                <strong className="font-bold">{agent.nombre}</strong>
              ) : (
                'Uno de nuestros agentes'
              )}{' '}
              te va a contactar para asesorarte con tu garantía.
            </p>
            <p className="text-lg text-label mt-3">
              <strong className="font-bold">
                Vas a recibir un email con las instrucciones para completar el proceso.
              </strong>
            </p>
            <p className="text-label/75 mt-2">
              Si no lo recibís en tu bandeja de entrada te sugerimos que revises
              la carpeta de correo no deseado.
            </p>
          </div>
        </section>
      </>
    );
  }

  // Co-solicitante (status_id: 9)
  if (statusId === 9) {
    return (
      <>
        {/* Sección superior — blanco */}
        <section className="py-8 sm:py-12">
          <div className="max-w-6xl mx-auto px-4">
            <div className="lg:w-1/2 lg:pr-12">
              <h2 className="text-4xl sm:text-5xl font-bold text-[var(--app-green)] mb-4">
                {name ? `${name} ` : ''}¡Ya casi está!
              </h2>
              <p className="text-xl text-label">
                Para que podamos emitir tu garantía, Hoggax solo{' '}
                <strong className="font-bold">
                  necesitamos sumar a otra persona a tu solicitud
                </strong>
                .
              </p>
            </div>
          </div>
        </section>

        {/* Sección inferior — lilac */}
        <section className="py-8 sm:py-10 bg-[var(--app-lilac)]">
          <div className="max-w-6xl mx-auto px-4">
            <p className="text-xl text-label">
              {agent ? (
                <strong className="font-bold">{agent.nombre}</strong>
              ) : (
                'Uno de nuestros agentes'
              )}{' '}
              te va a contactar para asesorarte con tu garantía.
            </p>
          </div>
        </section>
      </>
    );
  }

  // Identidad (status_id: 11)
  if (statusId === 11) {
    return (
      <section className="py-8 sm:py-12 bg-[var(--app-lilac)]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-2xl sm:text-3xl mb-4 text-label">
                {name ? `${name}, encontramos` : 'Encontramos'} información incorrecta.
              </h2>
              <p className="text-xl text-label">
                Por esta razón, no nos es posible continuar.
              </p>
            </div>
            <div>
              <p className="text-xl text-label">
                <strong className="font-bold">
                  Algunos de los datos que ingresaste no nos permite validar tu identidad.
                </strong>
              </p>
              <p className="text-lg text-label mt-2">
                Volvé a intentarlo revisando la información ingresada o comunícate
                con un asesor por WhatsApp.
              </p>
              <div className="mt-5">
                <a
                  href="https://hoggax.com/contacto/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-5 py-3 border border-gray-500 rounded-lg"
                >
                  Contactar a un asesor
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Error técnico (status_id: 13)
  if (statusId === 13) {
    return (
      <section className="py-8 sm:py-12 bg-[var(--app-lilac)]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-2xl sm:text-3xl mb-4 text-label">
                Oops!
              </h2>
              <p className="text-xl text-label">
                Ocurrió un error y no pudimos procesar tu solicitud.
              </p>
            </div>
            <div>
              <p className="text-xl text-label">
                <strong className="font-bold">Tuvimos un desperfecto técnico.</strong>
              </p>
              <p className="text-lg text-label mt-2">
                No te preocupes, procesaremos tu solicitud nuevamente en forma
                automática y nos pondremos en contacto con vos cuando tu solicitud sea
                aprobada.
              </p>
              <p className="text-lg text-label mt-2">
                Te pedimos disculpas por las demoras. Muchas gracias por confiar en
                Hoggax para obtener tu garantía.
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Rechazada (cualquier otro caso: 7, 8, y fallback)
  return (
    <>
      {/* Sección superior — blanco */}
      <section className="py-8 sm:py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="lg:w-1/2 lg:pr-12">
            <h2 className="text-4xl sm:text-5xl text-label leading-snug">
              {name ? `${name}, no` : 'No'} podemos ofrecerte una garantía.
            </h2>
          </div>
        </div>
      </section>

      {/* Sección inferior — lilac */}
      <section className="py-8 sm:py-10 bg-[var(--app-lilac)]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-8 items-start">
            <div>
              <p className="text-xl text-label font-bold">
                Desafortunadamente no contás con los requisitos mínimos para
                solicitar nuestra garantía.
              </p>
              <p className="text-lg text-label/85 mt-2">
                Si tenés más consultas, podés ver nuestra sección de Preguntas Frecuentes.
              </p>
            </div>
            <div>
              <a
                href="https://hoggax.com/preguntas/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-6 py-3 border border-gray-500 rounded-lg font-medium hover:bg-white transition-colors"
              >
                Ver preguntas frecuentes
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}