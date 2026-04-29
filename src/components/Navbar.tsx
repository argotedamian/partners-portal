'use client';

import Link from 'next/link';
import { useNavbarState } from '@/hooks/useNavbarState';

export function Navbar() {
  const { isAuthenticated, advisorLabel, partnerLogoSrc } = useNavbarState();

  if (!isAuthenticated) {
    return (
      <>
        <nav className="navbar-host navbar-host--guest" aria-label="Principal">
          <div className="navbar-inner navbar-inner--guest">
            <p className="navbar-guest-title">Cotizador de garantías</p>
          </div>
        </nav>
        <div className="navbar-spacer" aria-hidden="true" />
      </>
    );
  }

  return (
    <>
      <nav className="navbar-host navbar-host--auth" aria-label="Principal">
        <div className="navbar-inner navbar-inner--auth">
          <div className="navbar-auth-left">
            <Link href="/?reset=1" className="navbar-auth-brand" aria-label="Hoggax — inicio">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/hoggax-logo.svg"
                alt="Hoggax"
                className="navbar-auth-logo"
                width={160}
                height={41}
              />
            </Link>
            <span className="navbar-auth-sep" aria-hidden="true">
              |
            </span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={partnerLogoSrc}
              alt="Logo del partner"
              className="navbar-auth-partner-logo"
              width={122}
              height={29}
            />
          </div>

          <div className="navbar-auth-right">
            <span className="navbar-auth-advisor">{advisorLabel}</span>
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
