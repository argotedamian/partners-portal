'use client';

type HomeMainLeftPanelProps = {
  partnerLogoSrc: string | null;
  isCeBrokersPartner: boolean;
};

export function HomeMainLeftPanel({
  partnerLogoSrc,
  isCeBrokersPartner,
}: HomeMainLeftPanelProps) {
  return (
    <section className="flex h-full flex-col rounded-2xl bg-white p-3 sm:p-4 lg:p-0">
      <div className="pt-1 sm:pt-2 lg:pt-0">
        <h1 className="text-3xl font-extrabold leading-[1.05] text-label sm:text-4xl lg:text-[42px] xl:text-[44px] 2xl:text-[50px] lg:tracking-[-0.02em]">
          Cotizá una <span className="text-[var(--primary)]">garantía</span>
          <br />
          <span className="text-[var(--primary)]">Hoggax</span>
        </h1>
        <p className="mt-3 max-w-[560px] text-[14px] font-semibold text-label/65 sm:text-[15px]">
          Bienvenido/a al portal de Partners. Cotizá una garantía Hoggax en minutos.
        </p>
      </div>

      <div className="mt-5 flex flex-1 flex-col items-center justify-center gap-3 sm:mt-6 lg:mt-7 xl:mt-6 2xl:mt-8">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/partners-abrazados.png"
          alt="Partners abrazados"
          className="h-auto w-full max-w-[280px] object-contain sm:max-w-[330px] lg:min-w-[487px] lg:min-h-[345px] lg:w-[487px] lg:h-[345px]"
          width={487}
          height={345}
        />
        <div className="flex items-center justify-center pt-2">
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
