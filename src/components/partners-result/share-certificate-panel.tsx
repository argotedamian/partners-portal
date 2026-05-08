'use client';

import { type FormEvent, useCallback, useId, useState } from 'react';
import { toast } from 'sonner';

type ShareCertificatePanelProps = {
  qrValue: string;
};

const SHARE_SUBJECT = 'Certificado de aprobación Hoggax';

function buildShareBody(link: string): string {
  return `Te comparto el link para descargar el certificado de aprobación:\n\n${link}`;
}

export function ShareCertificatePanel({ qrValue }: ShareCertificatePanelProps) {
  const value = qrValue.trim() || 'https://www.hoggax.com';
  const emailInputId = useId();

  const [shareEmail, setShareEmail] = useState('');
  const [canNativeShare] = useState(() => typeof navigator !== 'undefined' && typeof navigator.share === 'function');

  const handleNativeShare = useCallback(async () => {
    try {
      await navigator.share({
        title: SHARE_SUBJECT,
        text: buildShareBody(value),
        url: value,
      });
    } catch (err) {
      const name = err instanceof Error ? err.name : '';
      if (name === 'AbortError') return;
      toast.error('No se pudo abrir el cuadro de compartir.');
    }
  }, [value]);

  const handleEmailSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      const raw = shareEmail.trim();
      if (!raw) {
        toast.error('Ingresá un correo.');
        return;
      }
      const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw);
      if (!ok) {
        toast.error('Ingresá un correo válido.');
        return;
      }

      const mailto = `mailto:${encodeURIComponent(raw)}?subject=${encodeURIComponent(SHARE_SUBJECT)}&body=${encodeURIComponent(buildShareBody(value))}`;
      window.open(mailto, '_blank', 'noopener,noreferrer');
    },
    [shareEmail, value],
  );

  return (
    <div
      className="partners-result-share-panel grid w-full gap-4 rounded-xl border border-[rgba(15,0,84,0.1)] bg-white/90 p-4 text-left shadow-[0_8px_24px_rgba(15,0,84,0.06)]"
      role="region"
      aria-label="Opciones para compartir el certificado"
    >
      {canNativeShare && (
        <div className="grid gap-2">
          <span className="text-[12px] font-bold uppercase tracking-wide text-label/55">Tu dispositivo</span>
          <button
            type="button"
            className="rounded-lg bg-[var(--primary)] px-4 py-2.5 text-[14px] font-extrabold text-white"
            onClick={handleNativeShare}
          >
            Compartir con el sistema
          </button>
        </div>
      )}

      <div className={`grid gap-2 ${canNativeShare ? 'border-t border-[rgba(15,0,84,0.08)] pt-4' : ''}`}>
        <span className="text-[12px] font-bold uppercase tracking-wide text-label/55">Por correo</span>
        <form onSubmit={handleEmailSubmit} className="grid gap-2">
          <label htmlFor={emailInputId} className="sr-only">
            Correo del destinatario
          </label>
          <input
            id={emailInputId}
            type="email"
            name="share-email"
            autoComplete="email"
            placeholder="correo@ejemplo.com"
            value={shareEmail}
            onChange={(e) => setShareEmail(e.target.value)}
            className="w-full rounded-lg border border-[rgba(15,0,84,0.15)] bg-white px-3 py-2 text-[14px] text-label outline-none ring-[var(--primary)] placeholder:text-label/35 focus:ring-2"
          />
          <button
            type="submit"
            className="rounded-lg border border-[rgba(15,0,84,0.12)] bg-white px-4 py-2 text-[14px] font-extrabold text-label/85"
          >
            Abrir correo con el link
          </button>
        </form>
        <p className="text-[11px] leading-snug text-label/45">
          Se abre el cliente de correo en una pestaña nueva con el mensaje listo; no enviamos el mail desde el servidor.
        </p>
      </div>
    </div>
  );
}
