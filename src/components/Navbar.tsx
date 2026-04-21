'use client';

import { useState, useRef } from 'react';

const NAV_LINKS = [
  { label: 'Inquilinos', href: 'https://hoggax.com/inquilinos/', external: true },
  { label: 'Empresas', href: 'https://hoggax.com/empresas/', external: true },
  { label: 'Propiedades', href: 'https://propiedades.hoggax.com/', external: true },
  { label: 'Seguros', href: 'https://hoggax.com/seguros/', external: true },
];

const AYUDA_ITEMS = [
  { label: 'Blog', href: 'https://hoggax.com/blog/blog_puerta_abierta/' },
  { label: 'Preguntas Frecuentes', href: 'https://hoggax.com/preguntas/' },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [ayudaOpen, setAyudaOpen] = useState(false);
  const ayudaTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function openAyuda() {
    if (ayudaTimer.current) clearTimeout(ayudaTimer.current);
    setAyudaOpen(true);
  }

  function closeAyuda() {
    ayudaTimer.current = setTimeout(() => setAyudaOpen(false), 120);
  }

  return (
    <>
      <nav className="navbar-host">
        <div className="navbar-inner">
          {/* Brand */}
          <a href="https://hoggax.com/" className="navbar-brand" aria-label="Hoggax" target="_blank" rel="noopener noreferrer">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/hoggax-logo.svg" alt="Hoggax" className="navbar-logo" />
            <strong className="navbar-badge">(partners)</strong>
          </a>

          {/* Desktop links */}
          <ul className="navbar-desktop-links">
            {NAV_LINKS.map(({ label, href, external }) => (
              <li key={href}>
                {external ? (
                  <a className="nav-link" href={href} target="_blank" rel="noopener noreferrer">
                    {label}
                  </a>
                ) : (
                  <a className="nav-link" href={href}>
                    {label}
                  </a>
                )}
              </li>
            ))}

            {/* Ayuda dropdown */}
            <li className="nav-dropdown-wrapper" onMouseEnter={openAyuda} onMouseLeave={closeAyuda}>
              <a
                className="nav-link"
                href="https://hoggax.com/preguntas/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Ayuda
                <svg
                  className="nav-dropdown-chevron"
                  width="10"
                  height="10"
                  viewBox="0 0 12 12"
                  aria-hidden="true"
                >
                  <path fill="currentColor" d="M6 8L1 3h10z" />
                </svg>
              </a>
              {ayudaOpen && (
                <div className="nav-dropdown-menu" onMouseEnter={openAyuda} onMouseLeave={closeAyuda}>
                  {AYUDA_ITEMS.map(({ label, href }) => (
                    <a
                      key={href}
                      className="nav-dropdown-item"
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {label}
                    </a>
                  ))}
                </div>
              )}
            </li>
          </ul>

          {/* Hamburger — mobile only */}
          <button
            className="navbar-hamburger"
            aria-label="Abrir navegación"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((o) => !o)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="navbar-mobile-menu">
            {NAV_LINKS.map(({ label, href }) => (
              <a key={href} className="navbar-mobile-link" href={href} target="_blank" rel="noopener noreferrer" onClick={() => setMobileOpen(false)}>
                {label}
              </a>
            ))}
            {AYUDA_ITEMS.map(({ label, href }) => (
              <a key={href} className="navbar-mobile-link navbar-mobile-sub" href={href} target="_blank" rel="noopener noreferrer" onClick={() => setMobileOpen(false)}>
                {label}
              </a>
            ))}
          </div>
        )}
      </nav>

      {/* Spacer para que el contenido no quede bajo el nav fixed */}
      <div className="navbar-spacer" aria-hidden="true" />
    </>
  );
}
