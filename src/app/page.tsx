'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Toaster } from 'sonner';
import { Form } from '@/components/form';
import { Result } from '@/components/result';
import { RiveAnimation } from '@/components/rive-animation';
import Footer from '@/components/Footer';

type Qualification = {
  status_id: number;
  is_quotation_only?: boolean;
  api_res_data?: {
    idHoggax?: number | null;
    front?: {
      nombre?: string;
      agente?: {
        nombre?: string;
        email?: string;
        telefono?: string;
        foto?: string | null;
      };
    };
    cotizacion?: {
      costoServicio?: number;
      costoServicioRaw?: number;
      legales?: string;
      facilite_desPago?: Array<{
        _id: string;
        orden: number;
        cuotas: number;
        visible: boolean;
        destacado?: boolean;
        texto: string;
        subTexto?: string;
        precioTexto?: string;
        infoTexto?: string;
        importe: number;
        importeTotal?: number;
      }>;
      discount?: number;
      discountRef?: number | null;
    };
  };
};

export default function Home() {
  const [qualification, setQualification] = useState<Qualification | null>(null);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!searchParams) return;
    if (!searchParams.get('reset')) return;
    setQualification(null);
    router.replace('/');
  }, [router, searchParams]);

  if (!mounted) {
    return <div className="min-h-screen bg-[var(--app-lilac)]" />;
  }

  if (qualification) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1">
          <Result qualification={qualification} isPartners={true} />
        </main>
        <div className="mt-auto">
          <Footer />
        </div>
        <Toaster position="top-right" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="bg-[var(--app-lilac)] flex-1">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="flex flex-col lg:flex-row lg:gap-10 lg:items-start">

            {/* Columna izquierda: título + animación */}
            <div className="flex flex-col min-w-0 flex-1 pt-6 pb-4 lg:py-6 lg:sticky lg:top-16">
              <h1 className="text-2xl lg:text-3xl xl:text-4xl font-extrabold text-[#171717] mb-4 lg:mb-5">
                Partners
              </h1>
              <div className="min-h-[200px] flex flex-col justify-center">
                <RiveAnimation name="09_personas_cocinando" />
              </div>
            </div>

            {/* Columna derecha: formulario */}
            <div className="w-full lg:w-[400px] xl:w-[460px] flex-shrink-0 lg:py-6 pb-8">
              <Form onComplete={setQualification} />
            </div>
          </div>
        </div>
      </main>

      <div className="mt-auto">
        <Footer />
      </div>
      <Toaster position="top-right" />
    </div>
  );
}