'use client';

import Image from 'next/image';
import { useAppDispatch } from '@/state/AppStateContext';

const FAQ_URL = 'https://hoggax.com/preguntas/';

type PartnersQualificationRejectedProps = {
  tenantName?: string;
};

export function PartnersQualificationRejected({ tenantName }: PartnersQualificationRejectedProps) {
  const dispatch = useAppDispatch();

  return (
    <div className="qualification-rejected">
      <div className="px-4 sm:px-8 pt-5 pb-1 max-w-6xl mx-auto">
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
      <section className="qualification-rejected-hero" aria-labelledby="qualification-rejected-title">
        <div className="qualification-rejected-hero-inner">
          <div className="qualification-rejected-copy">
            <h1 id="qualification-rejected-title" className="qualification-rejected-title">
              {tenantName
                ? `No podemos aprobar la garantía de ${tenantName} en este momento`
                : 'No podemos aprobar la garantía en este momento'}
            </h1>
            <p className="qualification-rejected-lead">
              Según la información ingresada, el inquilino no cumple con los requisitos para obtener una garantía Hoggax.
            </p>
            <p className="qualification-rejected-hint">
              Si querés que revisemos el caso o conocer otras alternativas, contactanos.
            </p>
          </div>
          <div className="qualification-rejected-art" aria-hidden="true">
            <Image
              src="/mujer-centada.svg"
              alt=""
              width={489}
              height={345}
              className="qualification-rejected-illustration"
              priority
              unoptimized
            />
          </div>
        </div>
      </section>

      <section className="qualification-rejected-cta-band" aria-labelledby="qualification-rejected-cta-title">
        <div className="qualification-rejected-cta-inner">
          <div className="qualification-rejected-cta-text">
            <h2 id="qualification-rejected-cta-title" className="qualification-rejected-cta-title">
              ¿Necesitás más información?
            </h2>
            <p className="qualification-rejected-cta-desc">
              Conocé los requisitos de aprobación y las opciones disponibles, como la posibilidad de sumar un
              co-garante.
            </p>
          </div>
          <div className="qualification-rejected-cta-action">
            <a
              href={FAQ_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="qualification-rejected-cta-button"
            >
              Ir a preguntas frecuentes
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
