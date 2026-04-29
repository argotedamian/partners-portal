'use client';

import Link from 'next/link';

/**
 * Mock hasta integrar autenticación real.
 * Cambiar a `true` para previsualizar la barra con usuario.
 */
const MOCK_IS_AUTHENTICATED = true;

/** Mock: datos del asesor (nombre o etiqueta mostrada a la derecha) */
const MOCK_DATOS_ASESOR = 'Datos del asesor';

export function Navbar() {
  if (!MOCK_IS_AUTHENTICATED) {
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
              <span className="navbar-auth-wordmark">hoggax</span>
            </Link>
            <span className="navbar-auth-sep" aria-hidden="true">
              |
            </span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo-partner-mock.svg"
              alt="Logo del partner"
              className="navbar-auth-partner-logo"
              width={122}
              height={29}
            />
          </div>

          <div className="navbar-auth-right">
            <span className="navbar-auth-advisor">{MOCK_DATOS_ASESOR}</span>
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
