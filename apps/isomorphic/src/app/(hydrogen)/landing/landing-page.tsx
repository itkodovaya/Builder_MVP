'use client';

import HeroSection from './hero-section';
import FeaturesSection from './features-section';
import CTASection from './cta-section';

interface LandingPageProps {
  onStartClick: () => void;
}

export default function LandingPage({ onStartClick }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-r from-[#136A8A] to-[#267871]">
      <HeroSection onStartClick={onStartClick} />
      <FeaturesSection />
      <CTASection onStartClick={onStartClick} />
    </div>
  );
}

