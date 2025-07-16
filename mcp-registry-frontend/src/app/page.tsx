'use client';

import { Suspense } from 'react';
import { HeroSection } from '@/components/home/HeroSection';
import { ServersList } from '@/components/home/ServersList';
import { StatsSection } from '@/components/home/StatsSection';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <HeroSection />
      
      {/* Stats Section */}
      <StatsSection />
      
      {/* Servers List */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <Suspense fallback={<div>Loading servers...</div>}>
            <ServersList />
          </Suspense>
        </div>
      </section>
    </div>
  );
}
