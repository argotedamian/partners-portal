'use client';

import type { PartnerMockRow } from '@/lib/partners-mock';

type HomeMainLeftPanelProps = {
  advisorEmail: string;
  partnerOptions: PartnerMockRow[];
  partnerLogoSrc: string | null;
  isCeBrokersPartner: boolean;
  onAdvisorEmailChange: (value: string) => void;
  /** Si está definido y es `true`, el asesor queda fijado (p. ej. sesión ya resuelta). */
  advisorSelectDisabled?: boolean;
};

export function HomeMainLeftPanel({
  advisorEmail,
  partnerOptions,
  partnerLogoSrc,
  isCeBrokersPartner,
  onAdvisorEmailChange,
  advisorSelectDisabled = false,
}: HomeMainLeftPanelProps) {
  return (
    <section className="flex h-full flex-col justify-between rounded-2xl bg-white p-2 sm:p-3 lg:p-0">
      <div>
        <h1 className="text-3xl font-extrabold leading-[1.05] text-label sm:text-4xl lg:text-[42px] xl:text-[44px] 2xl:text-[50px] lg:tracking-[-0.02em]">
          Cotizá una <span className="text-[var(--primary)]">garantía</span>
          <br />
          <span className="text-[var(--primary)]">Hoggax</span>
        </h1>

        <div className="mt-5 sm:mt-6 lg:mt-6">
          <label
            htmlFor="advisor-email"
            className="mb-2 block text-sm font-semibold leading-[117%] tracking-[0] text-label sm:text-base"
          >
            Asesor <span className="text-[var(--primary)]">*</span>
          </label>
          <select
            id="advisor-email"
            value={advisorEmail}
            disabled={advisorSelectDisabled}
            onChange={(event) => onAdvisorEmailChange(event.target.value)}
            className="home-advisor-select"
          >
            <option value="">Seleccioná un asesor</option>
            {partnerOptions.map((p) => (
              <option key={p.email} value={p.email}>
                {p.fullname} ({p.email})
              </option>
            ))}
          </select>
          {!advisorEmail.trim() && (
            <p className="mt-2 text-sm font-semibold text-label/60">
              Elegí un asesor para habilitar la cotización.
            </p>
          )}
        </div>
      </div>

      <div className="mt-6 flex flex-col items-center gap-3 sm:mt-8 lg:mt-7 xl:mt-6 2xl:mt-9">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/partners-abrazados.png"
          alt="Partners abrazados"
          className="h-auto w-full max-w-[300px] object-contain sm:max-w-[340px] lg:min-w-[487px] lg:min-h-[345px] lg:w-[487px] lg:h-[345px]"
          width={487}
          height={345}
        />
        <div className="flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/hoggax-logo.svg"
            alt="Hoggax"
            className="block h-[28px] w-auto object-contain sm:h-[34px]"
            width={160}
            height={41}
          />
          {partnerLogoSrc && (
            <>
              <span
                className="mx-3 text-label/50 leading-none sm:mx-4"
                aria-hidden="true"
              >
                |
              </span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={partnerLogoSrc}
                alt="Partner"
                className={`block h-[28px] w-auto object-contain sm:h-[34px]${
                  isCeBrokersPartner ? ' scale-[1.18] origin-left' : ''
                }${partnerLogoSrc.toLowerCase().includes('mob') ? ' -translate-y-px' : ''}`}
                width={175}
                height={34}
              />
            </>
          )}
        </div>
      </div>
    </section>
  );
}

type HomeMainRightPanelProps = {
  children: React.ReactNode;
};

export function HomeMainRightPanel({ children }: HomeMainRightPanelProps) {
  return <section className="w-full min-w-0 lg:w-[510px] xl:w-[560px] 2xl:w-[620px]">{children}</section>;
}
