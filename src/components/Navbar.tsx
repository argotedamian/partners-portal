'use client';

import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useNavbarState } from '@/hooks/useNavbarState';
import { clearSession } from '@/lib/auth-session';
import { useAppDispatch } from '@/state/AppStateContext';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated, advisorLabel, partnerLogoSrc, partner } = useNavbarState();

  if (pathname?.startsWith('/compartir-certificado')) {
    return null;
  }

  if (!isAuthenticated) {
    return (
      <>
        <nav className="navbar-host navbar-host--guest" aria-label="Principal">
          <div className="navbar-inner navbar-inner--guest">
            <p className="navbar-guest-title">Gestor de garantías</p>
          </div>
        </nav>
        <div className="navbar-spacer" aria-hidden="true" />
      </>
    );
  }

  function onLogout() {
    clearSession();
    dispatch({ type: 'quotation/resetQualification' });
    dispatch({ type: 'quotation/setAdvisorEmail', payload: '' });
    router.replace('/login');
  }

  return (
    <>
      <nav className="navbar-host navbar-host--auth" aria-label="Principal">
        <div className="navbar-inner navbar-inner--auth">
          <div className="navbar-auth-left">
            <button
              type="button"
              className="navbar-auth-brand"
              aria-label="Hoggax — inicio"
              onClick={() => dispatch({ type: 'quotation/resetQualification' })}
            >
              <span className="navbar-auth-logos-row">
                <span className="navbar-auth-logo-box navbar-auth-logo-box--hoggax">
                  <Image
                    src="/hoggax-logo.svg"
                    alt="Hoggax"
                    className="navbar-auth-logo-img"
                    fill
                    sizes="(max-width: 640px) 92px, 124px"
                    unoptimized
                    priority
                  />
                </span>
                <span className="navbar-auth-sep" aria-hidden="true">
                  |
                </span>
                <span
                  className={`navbar-auth-logo-box navbar-auth-logo-box--partner${
                    partner?.email?.toLowerCase().endsWith('@cebrokers.com') ? ' navbar-auth-logo-box--ce' : ''
                  }${
                    partner?.email?.toLowerCase().endsWith('@mob.com') ? ' navbar-auth-logo-box--mob' : ''
                  }`}
                >
                  <Image
                    src={partnerLogoSrc}
                    alt="Logo del partner"
                    className="navbar-auth-logo-img"
                    fill
                    sizes="(max-width: 640px) 108px, 128px"
                    unoptimized
                  />
                </span>
              </span>
            </button>
          </div>

          <div className="navbar-auth-right">
            <span className="navbar-auth-advisor">{advisorLabel}</span>
            <button
              type="button"
              onClick={onLogout}
              className="ml-3 rounded-lg border border-[rgba(15,0,84,0.18)] bg-white px-3 py-1 text-[12px] font-extrabold text-[var(--primary)] hover:bg-[rgba(15,0,84,0.04)] active:bg-[rgba(15,0,84,0.06)]"
            >
              Salir
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/user-logo.svg"
              alt=""
              className="navbar-auth-user-img"
              width={31}
              height={31}
              aria-hidden={true}
            />
          </div>
        </div>
      </nav>
      <div className="navbar-spacer" aria-hidden="true" />
    </>
  );
}
