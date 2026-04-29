'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Toaster } from 'sonner';
import { Form } from '@/components/form';
import { Result } from '@/components/result';
import Footer from '@/components/Footer';
import { HomeMainLeftPanel, HomeMainRightPanel } from '@/components/home-main-panels';
import type { Qualification } from '@/lib/quotation.api';

export function HomeClient() {
  const [qualification, setQualification] = useState<Qualification | null>(null);
  const [mounted, setMounted] = useState(false);
  const [advisorEmail, setAdvisorEmail] = useState('');
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
        <div>
          <Footer />
        </div>
        <Toaster position="top-right" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="bg-white flex-1 py-3 sm:py-4 lg:flex lg:items-start lg:py-5">
        <div className="mx-auto w-full max-w-[1536px] px-4 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-2 xl:px-9 xl:py-2 2xl:px-14 2xl:py-3">
          <div className="grid grid-cols-1 gap-6 md:gap-7 lg:grid-cols-[minmax(0,1fr)_minmax(0,555px)] lg:items-start lg:gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,560px)] xl:gap-7 2xl:grid-cols-[minmax(0,1fr)_minmax(0,620px)]">
            <HomeMainLeftPanel advisorEmail={advisorEmail} onAdvisorEmailChange={setAdvisorEmail} />
            <HomeMainRightPanel>
              <Form onComplete={setQualification} />
            </HomeMainRightPanel>
          </div>
        </div>
      </main>

      <div>
        <Footer />
      </div>
      <Toaster position="top-right" />
    </div>
  );
}

