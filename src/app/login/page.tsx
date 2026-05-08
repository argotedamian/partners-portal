'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import Footer from '@/components/Footer';
import { PARTNERS_MOCK_LIST } from '@/lib/partners-mock';
import { isValidPartnerMockCredentials } from '@/lib/partner-users-mock';
import { writeSession } from '@/lib/auth-session';
import { useAppDispatch } from '@/state/AppStateContext';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();

  const rememberId = useMemo(() => 'remember-me', []);

  const nextPath = (searchParams?.get('next') ?? '/').trim() || '/';
  const partnerOptions = useMemo(
    () => PARTNERS_MOCK_LIST.map((p) => ({ email: p.email, label: `${p.fullname} (${p.email})` })),
    [],
  );

  const [email, setEmail] = useState(partnerOptions[0]?.email ?? '');
  const [password, setPassword] = useState('');
  const [hasError, setHasError] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('partnersPortalRememberedEmail') ?? '';
    const normalized = saved.trim().toLowerCase();
    if (!normalized) return;
    const isAllowed = partnerOptions.some((p) => p.email.trim().toLowerCase() === normalized);
    if (isAllowed) setEmail(saved);
  }, [partnerOptions]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setHasError(false);

    if (!isValidPartnerMockCredentials({ email, password })) {
      setHasError(true);
      return;
    }

    writeSession({ email });
    if (rememberMe) localStorage.setItem('partnersPortalRememberedEmail', email);
    else localStorage.removeItem('partnersPortalRememberedEmail');
    dispatch({ type: 'quotation/setAdvisorEmail', payload: email });
    router.replace(nextPath);
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <main className="flex-1">
        <div className="mx-auto flex w-full max-w-[1536px] flex-col px-4 pb-10 pt-[5.25rem] sm:px-6 lg:flex-row lg:items-center lg:gap-10 lg:px-8 lg:pb-12 lg:pt-[6.25rem] xl:px-10 2xl:px-14">
          <section className="flex min-w-0 flex-1 flex-col justify-center">
            <h1 className="text-[34px] font-extrabold leading-[1.05] text-label sm:text-[42px] lg:text-[48px]">
              Cotizá una <span className="text-[var(--primary)]">garantía</span>
              <br />
              <span className="text-[var(--primary)]">Hoggax</span> en segundos
            </h1>
            <p className="mt-3 text-[15px] font-semibold text-label/70 sm:text-[16px]">
              Y compartila en el momento.
            </p>

            <div className="mt-6 w-full max-w-[920px]">
              <Image
                src="/mujer-leyendo-sentada.svg"
                alt=""
                width={1200}
                height={520}
                priority
                className="h-auto w-full"
                unoptimized
              />
            </div>
          </section>

          <aside className="mt-8 w-full max-w-[520px] self-center lg:mt-0 lg:self-auto">
            <div className="min-h-[497px] rounded-2xl border border-[rgba(15,0,84,0.2)] bg-white p-6 shadow-[0_18px_50px_rgba(15,0,84,0.08)] sm:min-h-[497px] sm:min-w-[456px] sm:p-8">
              <h2 className="text-[18px] font-extrabold text-label">Iniciar sesión</h2>

              <form onSubmit={onSubmit} className="mt-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-[13px] font-extrabold text-label">Email</label>
                  {/*
                  <select
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-lg bg-[var(--app-lilac)] px-4 py-3 text-[14px] font-bold text-label outline-none ring-[rgba(15,0,84,0.18)] focus:ring-2"
                  >
                    {partnerOptions.map((o) => (
                      <option key={o.email} value={o.email}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                  */}
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    autoComplete="username"
                    inputMode="email"
                    className="w-full rounded-lg bg-[var(--app-lilac)] px-4 py-3 text-[14px] font-bold text-label outline-none ring-[rgba(15,0,84,0.18)] placeholder:text-label/35 focus:ring-2"
                    placeholder="tunombre@gmail.com"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[13px] font-extrabold text-label">Contraseña</label>
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type="password"
                    autoComplete="current-password"
                    className="w-full rounded-lg bg-[var(--app-lilac)] px-4 py-3 text-[14px] font-bold text-label outline-none ring-[rgba(15,0,84,0.18)] placeholder:text-label/35 focus:ring-2"
                    placeholder="••••••••"
                  />
                </div>

                {hasError ? (
                  <p className="rounded-lg bg-red-50 px-4 py-3 text-[13px] font-bold text-red-700">
                    Credenciales inválidas.
                  </p>
                ) : null}

              <div className="flex items-center justify-between gap-4 pt-1">
                <label
                  htmlFor={rememberId}
                  className="flex cursor-pointer select-none items-center gap-2 text-[12px] font-semibold text-label/65"
                >
                  <input
                    id={rememberId}
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-[rgba(15,0,84,0.25)] text-[var(--primary)] accent-[var(--primary)]"
                  />
                  Recordarme
                </label>

                <button
                  type="button"
                  onClick={() => toast.info('Este portal usa login mock. Pedile la clave al administrador.')}
                  className="text-[12px] font-semibold text-label/65 hover:text-label underline underline-offset-2"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

                <button
                  type="submit"
                  className="w-full rounded-lg bg-[var(--primary)] px-5 py-3 text-[14px] font-extrabold text-white hover:bg-[var(--primary-hover)] active:opacity-95"
                >
                  Ingresar
                </button>
              </form>
            </div>
          </aside>
        </div>
      </main>

      <div>
        <Footer />
      </div>
    </div>
  );
}

