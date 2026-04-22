import { Suspense } from 'react';
import { HomeClient } from './HomeClient';

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--app-lilac)]" />}>
      <HomeClient />
    </Suspense>
  );
}