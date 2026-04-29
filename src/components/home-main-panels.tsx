'use client';

type HomeMainLeftPanelProps = {
  advisorEmail: string;
  onAdvisorEmailChange: (value: string) => void;
};

export function HomeMainLeftPanel({ advisorEmail, onAdvisorEmailChange }: HomeMainLeftPanelProps) {
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
            Correo electrónico del asesor <span className="text-[var(--primary)]">*</span>
          </label>
          <input
            id="advisor-email"
            type="email"
            value={advisorEmail}
            onChange={(event) => onAdvisorEmailChange(event.target.value)}
            placeholder="tunombre@mail.com"
            className="h-11 w-full rounded-md border border-[rgba(15,0,84,0.12)] bg-[var(--app-lilac-light)] px-4 text-sm font-semibold text-label outline-none placeholder:text-label/45 focus:border-[var(--primary)]"
          />
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
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/hoggax-logo.svg"
          alt="Hoggax"
          className="h-auto w-full max-w-[142px] object-contain sm:max-w-[160px]"
          width={160}
          height={41}
        />
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
