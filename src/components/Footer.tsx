const footerText = '#0F0054';
const footerBg = '#E4E9FD';

const Footer = () => (
  <footer style={{ backgroundColor: footerBg, borderTop: '1px solid #e5e7eb' }}>
    <div className="max-w-6xl mx-auto px-4 py-8 sm:px-5 md:px-6 md:py-10 lg:py-12">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-8 lg:grid-cols-4 lg:gap-6">
        <div className="text-left">
          <a href="https://hoggax.com" target="_blank" rel="noopener noreferrer" className="inline-block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/hoggax-logo.svg"
              alt="Hoggax"
              className="footer-hoggax-logo block h-7 w-auto max-w-[min(100%,148px)] sm:h-8 sm:max-w-[160px]"
              width={160}
              height={41}
            />
          </a>
          <p
            className="max-w-prose text-pretty"
            style={{
              color: footerText,
              fontWeight: 600,
              fontSize: '0.875rem',
              lineHeight: '117%',
              letterSpacing: '0',
              marginTop: '1rem',
            }}
          >
            Garantías de alquiler 100% online. Conseguí ese departamento, de la garantía nos encargamos nosotros.
          </p>
        </div>

        <div className="text-left">
          <h4 style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '0.875rem', marginBottom: '1rem' }}>
            Contacto
          </h4>
          <ul
            style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              fontSize: '0.875rem',
              fontWeight: 600,
              lineHeight: '117%',
              letterSpacing: '0',
              color: footerText,
            }}
          >
            <li style={{ marginBottom: '0.5rem' }}>
              <a href="mailto:info@hoggax.com" style={{ color: footerText, textDecoration: 'none' }}>
                info@hoggax.com
              </a>
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              <span>0810 220 AVAL (2825)</span>
            </li>
            <li>
              <a
                href="https://maps.google.com/?q=Av.+Córdoba+1255+piso+8,+CABA,+Argentina"
                target="_blank"
                rel="noopener noreferrer"
                className="break-words"
                style={{ color: footerText, textDecoration: 'underline' }}
              >
                Av. Córdoba 1255 piso 8, CABA, Argentina
              </a>
            </li>
          </ul>
        </div>

        <div className="text-left">
          <h4 style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '0.875rem', marginBottom: '1rem' }}>
            Redes sociales
          </h4>
          <div className="flex flex-wrap gap-3 justify-start">
            <a
              href="https://www.instagram.com/hoggax"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-full border flex items-center justify-center"
              style={{ borderColor: footerText, color: footerText }}
              aria-label="Instagram"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
              </svg>
            </a>
            <a
              href="https://www.linkedin.com/company/hoggax"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-full border flex items-center justify-center"
              style={{ borderColor: footerText, color: footerText }}
              aria-label="LinkedIn"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </a>
            <a
              href="https://www.facebook.com/hoggax"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-full border flex items-center justify-center"
              style={{ borderColor: footerText, color: footerText }}
              aria-label="Facebook"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </a>
          </div>
        </div>

        <div className="flex flex-col gap-4 items-center lg:items-end">
          <img
            src="/gptw-badge-certificada.png"
            alt="Great Place to Work certificada"
            className="mx-auto block h-[228px] w-[161px] max-w-full min-h-[228px] min-w-[161px] shrink-0 object-contain lg:ml-auto lg:mr-0"
            width={161}
            height={228}
          />
          <div className="flex w-full max-w-full flex-col items-center gap-4 sm:flex-row sm:flex-wrap sm:justify-center lg:justify-end">
            <img
              src="/CAEFA.svg"
              alt="CAEFA — Cámara Argentina de Empresas de Fianzas para Alquiler"
              className="min-w-[85px] min-h-[35px] w-[85px] h-[35px] object-contain"
              width={85}
              height={35}
            />
            <img
              src="/data-fiscal.svg"
              alt="Data fiscal"
              className="min-w-[38px] min-h-[52px] w-[38px] h-[52px] object-contain"
              width={38}
              height={52}
            />
          </div>
        </div>
      </div>
    </div>

    <div style={{ borderTop: '1px solid rgba(0, 0, 102, 0.15)' }}>
      <div
        className="mx-auto flex max-w-6xl flex-col items-center justify-center gap-3 px-4 py-4 text-center sm:flex-row sm:flex-nowrap sm:items-center sm:justify-between sm:gap-4 sm:text-left"
        style={{ fontSize: '0.875rem', fontWeight: 600, lineHeight: '117%', letterSpacing: '0', color: footerText }}
      >
        <span className="w-full shrink-0 sm:w-auto">Hoggax © {new Date().getFullYear()} - Argentina</span>
        <span className="w-full max-w-[22rem] shrink-0 leading-snug sm:w-auto sm:max-w-none sm:text-right">
          Todos los derechos reservados{' '}
          <span style={{ opacity: 0.7 }}>|</span>{' '}
          <a
            href="https://hoggax.com/terminos-y-condiciones"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: footerText, textDecoration: 'underline' }}
          >
            Términos y condiciones
          </a>
        </span>
      </div>
    </div>
  </footer>
);

export default Footer;
