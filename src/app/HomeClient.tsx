'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Toaster } from 'sonner';
import { Form } from '@/components/form';
import { Result } from '@/components/result';
import Footer from '@/components/Footer';
import type { Qualification } from '@/lib/quotation.api';

export function HomeClient() {
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
          <div className="flex flex-col gap-6 lg:flex-row lg:gap-10 lg:items-start">
            <div className="flex flex-col min-w-0 flex-1 pt-5 pb-2 sm:pt-6 sm:pb-4 lg:py-6 lg:sticky lg:top-16">
              <h1 className="text-xl font-extrabold text-label sm:text-2xl lg:text-3xl xl:text-4xl text-pretty mb-3 sm:mb-4 lg:mb-5">
                Partners
              </h1>
            </div>

            <div className="w-full min-w-0 lg:w-[400px] xl:w-[460px] flex-shrink-0 pb-6 sm:pb-8 lg:py-6">
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

