'use client';

import { useState } from 'react';
import { toast } from 'sonner';

type PaymentMethod = {
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
};

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
      facilita_desPago?: PaymentMethod[];
      discount?: number;
      discountRef?: number | null;
    };
  };
};

interface ResultProps {
  qualification: Qualification;
  isPartners?: boolean;
}

export function Result({ qualification, isPartners = false }: ResultProps) {
  const statusId = qualification.status_id;
  const [copied, setCopied] = useState(false);

  const firstName = qualification?.api_res_data?.front?.nombre?.trim()?.split(/\s+/)[0] || '';
  const name = qualification?.api_res_data?.front?.nombre || '';
  const quoteValue = qualification?.api_res_data?.cotizacion?.costoServicio;
  const description = qualification?.api_res_data?.cotizacion?.legales;
  const paymentMethods = (qualification?.api_res_data?.cotizacion?.facilita_desPago || []).filter(
    (p: PaymentMethod) => p.visible
  );
  const agent = qualification?.api_res_data?.front?.agente;

  const formatArs = (value: number | undefined | null): string => {
    if (value == null || isNaN(Number(value))) return '-';
    return `$${Number(value).toLocaleString('es-AR')}`;
  };

  const copyWhatsAppSummary = () => {
    const cot = qualification?.api_res_data?.cotizacion;
    const methods: PaymentMethod[] = cot?.facilita_desPago || [];

    const findByCuotas = (n: number) => methods.find((m) => m.cuotas === n);
    const transfer = findByCuotas(0) || methods.find((m) => /transfer/i.test(m.subTexto || ''));

    const plan3 = findByCuotas(3);
    const plan12 = findByCuotas(12);
    const plan24 = findByCuotas(24);

    const montoAlquiler = formatArs(cot?.costoServicio);
    const precioTransferencia = formatArs(transfer?.importeTotal || transfer?.importe);
    const valorCuota3 = formatArs(plan3?.importe);
    const total3Cuotas = formatArs(plan3?.importe);
    const valorCuota12 = formatArs(plan12?.importe);
    const total12Cuotas = formatArs(plan12?.importe);
    const valorCuotaPlan = formatArs(plan24?.importe);
    const totalPlan = formatArs(plan24?.importe);

    const lines = [
      `Hola ${firstName},`,
      '',
      'Te compartimos la cotización de tu garantía Hoggax:',
      '',
      `Corresponde a un alquiler mensual de ${montoAlquiler}.`,
      'Valor final con IVA incluido por un contrato de 24 meses.',
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
          <div className="grid lg:grid-cols-2 gap-8">
            <div>
              <div className="pr-4">
                {qualification.is_quotation_only ? (
                  <>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl mb-4 font-bold text-[var(--app-green)]">
                      Tu cotización está lista
                    </h2>
                    <p className="text-2xl sm:text-3xl lg:text-4xl text-gray-900">
                      Mirá el <strong className="font-bold">valor del servicio</strong>
                      y los planes de pago disponibles.
                    </p>
                  </>
                ) : (
                  <>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl mb-4 font-bold text-[var(--app-green)]">
                      ¡Felicitaciones {name}!
                    </h2>
                    <p className="text-2xl sm:text-3xl lg:text-4xl text-gray-900">
                      Tu garantía Hoggax de alquiler{' '}
                      <strong className="font-bold">está aprobada</strong>
                    </p>
                  </>
                )}
              </div>
            </div>

            <div className="text-left">
              <p className="text-xl sm:text-2xl lg:text-3xl mb-3">
                <strong>
                  El valor de tu garantía es de{' '}
                  <span className="text-[var(--primary)]">
                    {formatArs(quoteValue)}
                  </span>
                </strong>
              </p>

              {isPartners && paymentMethods.length > 0 && (
                <div className="mt-4">
                  <p className="text-lg sm:text-xl font-bold mb-3">Planes de pago</p>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {paymentMethods.map((method) => (
                      <div
                        key={method._id}
                        className={`flex flex-col justify-between p-4 bg-[var(--app-lilac)] rounded-lg h-full ${
                          method.destacado ? 'ring-2 ring-[var(--primary)]' : ''
                        }`}
                      >
                        <div>
                          <p className="font-bold text-base text-gray-900">{method.texto}</p>
                          <p className="text-gray-500 text-sm">{method.subTexto}</p>
                          {method.infoTexto && (
                            <p className="text-gray-500 text-sm">{method.infoTexto}</p>
                          )}
                        </div>
                        <div className="mt-2 text-right">
                          <p className="font-bold text-[var(--primary)] text-xl">
                            {formatArs(method.importe)}
                          </p>
                          {method.cuotas > 1 && (
                            <p className="text-gray-500 text-sm">por cuota</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Botones de acción */}
              {isPartners && !qualification.is_quotation_only && (
                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={copyWhatsAppSummary}
                    className="px-5 py-3 border border-gray-400 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    {copied ? 'Copiado al portapapeles' : 'Copiar resumen para WhatsApp'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Pending (status_id: 6)
  if (statusId === 6) {
    return (
      <section className="py-8 sm:py-12 bg-[var(--app-lilac)]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-2xl sm:text-3xl mb-4 text-[var(--app-green)] font-bold">
                {name} ¡Ya casi está!
              </h2>
              <p className="text-xl text-gray-900">
                Para ofrecerte una garantía necesitaremos validar tu documentación e ingresos.
              </p>
            </div>
            <div>
              <p className="text-xl text-gray-900">
                {agent ? (
                  <strong className="font-bold">{agent.nombre}</strong>
                ) : (
                  'Uno de nuestros agentes'
                )}{' '}
                te va a contactar para asesorarte con tu garantía.
              </p>
              <p className="text-lg text-gray-900 mt-2">
                <strong className="font-bold">
                  Vas a recibir un email con las instrucciones para completar el proceso.
                </strong>
              </p>
              <p className="text-gray-600 mt-2">
                Si no lo recibís en tu bandeja de entrada te sugerimos que revises
                la carpeta de correo no deseado.
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Cosolicitante (status_id: 9)
  if (statusId === 9) {
    return (
      <section className="py-8 sm:py-12 bg-[var(--app-lilac)]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-2xl sm:text-3xl mb-4 text-[var(--app-green)] font-bold">
                {name} ¡Ya casi está!
              </h2>
              <p className="text-xl text-gray-900">
                Para que podamos emitir tu garantía
                <br />
                Hoggax solo{' '}
                <strong className="font-bold">
                  necesitamos sumar a otra persona a tu solicitud
                </strong>
                .
              </p>
            </div>
            <div>
              <p className="text-xl text-gray-900">
                {agent ? (
                  <strong className="font-bold">{agent.nombre}</strong>
                ) : (
                  'Uno de nuestros agentes'
                )}{' '}
                te va a contactar para asesorarte con tu garantía.
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Identidad (status_id: 11)
  if (statusId === 11) {
    return (
      <section className="py-8 sm:py-12 bg-[var(--app-lilac)]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-2xl sm:text-3xl mb-4 text-gray-900">
                {name ? `${name}, encontramos` : 'Encontramos'} información incorrecta.
              </h2>
              <p className="text-xl text-gray-900">
                Por esta razón, no nos es posible continuar.
              </p>
            </div>
            <div>
              <p className="text-xl text-gray-900">
                <strong className="font-bold">
                  Algunos de los datos que ingresaste no nos permite validar tu identidad.
                </strong>
              </p>
              <p className="text-lg text-gray-900 mt-2">
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
              <h2 className="text-2xl sm:text-3xl mb-4 text-gray-900">
                Oops!
              </h2>
              <p className="text-xl text-gray-900">
                Ocurrió un error y no pudimos procesar tu solicitud.
              </p>
            </div>
            <div>
              <p className="text-xl text-gray-900">
                <strong className="font-bold">Tuvimos un desperfecto técnico.</strong>
              </p>
              <p className="text-lg text-gray-900 mt-2">
                No te preocupes, procesaremos tu solicitud nuevamente en forma
                automática y nos pondremos en contacto con vos cuando tu solicitud sea
                aprobada.
              </p>
              <p className="text-lg text-gray-900 mt-2">
                Te pedimos disculpas por las demoras. Muchas gracias por confiar en
                Hoggax para obtener tu garantía.
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Rechazada (cualquier otro caso)
  return (
    <section className="py-8 sm:py-12 bg-[var(--app-lilac)]">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-2xl sm:text-3xl mb-4 text-gray-900">
              {name ? `${name}, no` : 'No'} podemos ofrecerte una garantía.
            </h2>
          </div>
          <div>
            <p className="text-xl text-gray-900">
              <strong className="font-bold">
                Desafortunadamente no contás con los requisitos mínimos para
                solicitar nuestra garantía.
              </strong>
            </p>
            <p className="text-lg text-gray-900 mt-2">
              Si tenés más consultas, podés ver nuestra sección de Preguntas Frecuentes.
            </p>
            <div className="mt-5">
              <a
                href="https://hoggax.com/preguntas/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-5 py-3 border border-gray-500 rounded-lg"
              >
                Ver preguntas frecuentes
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}