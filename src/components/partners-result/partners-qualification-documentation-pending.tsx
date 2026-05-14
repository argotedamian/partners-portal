'use client';

import { toast } from 'sonner';
import type { Qualification } from '@/lib/quotation.api';
import { useAppDispatch, useAppState } from '@/state/AppStateContext';
import { selectQuotationDraft } from '@/state/appState.selectors';

type DocCard = { title: string; sub: string; img: string };

const DNI_CARD: DocCard = {
  title: 'Documento de identidad vigente',
  sub: '(Documento de identidad)',
  img: '/documento.svg',
};

const PASSPORT_CARD: DocCard = {
  title: 'Documento de identidad vigente',
  sub: '(Pasaporte o documento extranjero)',
  img: '/documento.svg',
};

const DNI_FRENTE_DORSO_CARD: DocCard = {
  title: 'Foto del DNI',
  sub: '(Frente y dorso)',
  img: '/documento.svg',
};

const DOC_CARDS_BY_SITUATION: Record<number, DocCard[]> = {
  1: [
    DNI_CARD,
    { title: 'Constancia de alumno regular', sub: '(Comprobante de inscripción universitaria)', img: '/comprobante-ingresos.svg' },
  ],
  2: [
    DNI_CARD,
    { title: 'Recibos de jubilación', sub: '(Últimos 3 recibos de jubilación)', img: '/recibo-sueldo.svg' },
  ],
  3: [
    DNI_FRENTE_DORSO_CARD,
    { title: 'Recibos de monotributo', sub: '(Últimos 3 recibos de monotributo)', img: '/recibo-sueldo.svg' },
  ],
  4: [
    DNI_CARD,
    { title: 'Recibos de sueldo', sub: '(Últimos 3 recibos de sueldo)', img: '/recibo-sueldo.svg' },
  ],
  5: [
    DNI_FRENTE_DORSO_CARD,
    { title: 'Últimas DDJJ de IVA', sub: '(F. 2051)', img: '/ingresos-exterior.svg' },
  ],
};

const DEFAULT_DOC_CARDS: DocCard[] = [
  DNI_CARD,
  { title: 'Comprobantes de ingresos', sub: '(Comprobantes o contratos de trabajo)', img: '/comprobante-ingresos.svg' },
  { title: 'Ingresos del exterior', sub: '(En caso de no contar con ingresos en Argentina)', img: '/ingresos-exterior.svg' },
];

const PASSPORT_DOCUMENT_TYPE_ID = 2;
const EMPLOYMENT_STUDENT_ID = 1;

const PASSPORT_NON_STUDENT_CARDS: DocCard[] = [
  PASSPORT_CARD,
  { title: 'Comprobantes de ingresos', sub: '(Comprobantes o contratos de trabajo)', img: '/comprobante-ingresos.svg' },
  { title: 'Ingresos del exterior', sub: '(En caso de no contar con ingresos en Argentina)', img: '/ingresos-exterior.svg' },
];

function getDocCards(employmentSituationId: number | null, documentTypeId: number | null): DocCard[] {
  const isPassport = documentTypeId === PASSPORT_DOCUMENT_TYPE_ID;
  const isStudent = employmentSituationId === EMPLOYMENT_STUDENT_ID;

  if (isPassport && !isStudent) return PASSPORT_NON_STUDENT_CARDS;

  if (employmentSituationId == null) return DEFAULT_DOC_CARDS;

  const cards = DOC_CARDS_BY_SITUATION[employmentSituationId];
  if (!cards) return DEFAULT_DOC_CARDS;

  return cards.map((card) => (card === DNI_CARD || card === DNI_FRENTE_DORSO_CARD ? PASSPORT_CARD : card));
}

type PartnersQualificationDocumentationPendingProps = {
  qualification: Qualification;
};

export function PartnersQualificationDocumentationPending({
  qualification,
}: PartnersQualificationDocumentationPendingProps) {
  const agentEmail =
    qualification?.api_res_data?.front?.agente?.email?.trim() ?? '';

  const dispatch = useAppDispatch();
  const state = useAppState();
  const draft = selectQuotationDraft(state);
  const employmentSituationId =
    draft?.qualificationRequest?.user_personal_data?.employment_situation_id ?? null;
  const documentTypeId =
    draft?.qualificationRequest?.user_personal_data?.document_type_id ?? null;
  const tenantName = qualification?.api_res_data?.front?.nombre?.trim() ?? '';

  const docCards = getDocCards(employmentSituationId, documentTypeId);

  function handleSendToAdvisor() {
    if (!agentEmail) {
      toast.info('Un asesor va a contactar al inquilino con los próximos pasos.');
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
          <div className="pb-4">
            <button
              type="button"
              onClick={() => dispatch({ type: 'quotation/resetQualification' })}
              className="inline-flex items-center gap-1.5 text-[13px] font-bold text-[#837F9B] hover:opacity-70 transition-opacity"
              aria-label="Volver al formulario principal"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
          <div className="partners-doc-pending-hero mx-auto max-w-3xl text-center">
            <h2 className="partners-doc-pending-title font-extrabold text-[var(--app-green)]">
              {tenantName
                ? `¡${tenantName} está a un paso de obtener su garantía!`
                : '¡El inquilino está a un paso de obtener su garantía!'}
            </h2>
            <p className="partners-doc-pending-lead mt-4 text-[var(--label-color)]">
              Para continuar con la solicitud, necesitamos validar la documentación e ingresos del inquilino.
            </p>
          </div>

          <ul className={`partners-doc-pending-cards mt-10 grid list-none gap-4 p-0 sm:mt-12 md:gap-5 ${docCards.length === 2 ? 'mx-auto max-w-2xl md:grid-cols-2' : 'md:grid-cols-3'}`}>
            {docCards.map((card) => (
              <li key={card.title} className="partners-doc-pending-card">
                <p className="partners-doc-pending-card-title">{card.title}</p>
                <p className="partners-doc-pending-card-sub">{card.sub}</p>
                <div className="partners-doc-pending-card-icon">
                  <img src={card.img} alt="" />
                </div>
              </li>
            ))}
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
