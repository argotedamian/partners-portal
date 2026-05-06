'use client';

import { toast } from 'sonner';
import type { Qualification } from '@/lib/quotation.api';

type PartnersQualificationDocumentationPendingProps = {
  qualification: Qualification;
};

export function PartnersQualificationDocumentationPending({
  qualification,
}: PartnersQualificationDocumentationPendingProps) {
  const agentEmail =
    qualification?.api_res_data?.front?.agente?.email?.trim() ?? '';

  function handleSendToAdvisor() {
    if (!agentEmail) {
      toast.info('Tu asesor te va a contactar con los próximos pasos.');
      return;
    }
    const subject = encodeURIComponent('Documentación — garantía Hoggax');
    const body = encodeURIComponent(
      'Hola, quiero enviar mi documentación para continuar con la solicitud de garantía.\n',
    );
    window.location.href = `mailto:${encodeURIComponent(agentEmail)}?subject=${subject}&body=${body}`;
  }

  return (
    <div className="partners-doc-pending overflow-x-hidden bg-white">
      <section className="partners-doc-pending-inner relative pb-10 pt-8 sm:pb-14 sm:pt-10">
        <div className="partners-doc-pending-decor" aria-hidden />

        <div className="relative mx-auto max-w-6xl px-4">
          <div className="partners-doc-pending-hero mx-auto max-w-3xl text-center">
            <h2 className="partners-doc-pending-title font-extrabold text-[var(--app-green)]">
              ¡Estás a un paso de obtener tu garantía!
            </h2>
            <p className="partners-doc-pending-lead mt-4 text-[var(--label-color)]">
              Para continuar con la solicitud, necesitamos validar tu documentación e ingresos.
            </p>
          </div>

          <ul className="partners-doc-pending-cards mt-10 grid list-none gap-4 p-0 sm:mt-12 md:grid-cols-3 md:gap-5">
            <li className="partners-doc-pending-card">
              <p className="partners-doc-pending-card-title">Documento de identidad vigente</p>
              <p className="partners-doc-pending-card-sub">(Pasaporte o documento extranjero)</p>
              <div className="partners-doc-pending-card-icon">
                <img src="/documento.svg" alt="" />
              </div>
            </li>
            <li className="partners-doc-pending-card">
              <p className="partners-doc-pending-card-title">Comprobantes de ingresos</p>
              <p className="partners-doc-pending-card-sub">(Comprobantes o contratos de trabajo)</p>
              <div className="partners-doc-pending-card-icon">
                <img src="/comprobante-ingresos.svg" alt="" />
              </div>
            </li>
            <li className="partners-doc-pending-card">
              <p className="partners-doc-pending-card-title">Ingresos del exterior</p>
              <p className="partners-doc-pending-card-sub">
                (En caso de no contar con ingresos en Argentina)
              </p>
              <div className="partners-doc-pending-card-icon">
                <img src="/ingresos-exterior.svg" alt="" />
              </div>
            </li>
          </ul>

          <div className="partners-doc-pending-cta mx-auto mt-10 max-w-md text-center sm:mt-12">
            <button
              type="button"
              onClick={handleSendToAdvisor}
              className="partners-doc-pending-button w-full rounded-xl px-6 py-4 font-extrabold text-white transition-colors hover:bg-[var(--primary-hover)] sm:py-[1.05rem]"
            >
              Enviar a un asesor
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
