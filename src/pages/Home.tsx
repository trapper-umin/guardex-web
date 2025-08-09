import React from 'react';
import { Footer } from '../components';
import {
  HeroSection,
  SellersSection,
  BuyersSection,
  HowItWorksSection,
  TrustSection,
  FinalCtaSection
} from '../components/home';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <HeroSection />
      <SellersSection />
      <BuyersSection />
      <HowItWorksSection />
      <TrustSection />
      <FinalCtaSection />
      <Footer />
    </div>
  );
};

export default Home; 