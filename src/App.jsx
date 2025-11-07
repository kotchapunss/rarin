import React, { useState } from "react";
import StepNav from "./components/StepNav";
import TypeSelector from "./components/Step0TypeSelector";
import BudgetSelector from "./components/Step1BudgetSelector";
import PackageSelect from "./components/Step2PackageSelect";
import DetailsInput from "./components/Step3DetailsInput";
import AddonsSelect from "./components/Step4AddonsSelect";
import Summary from "./components/Summary";
import LanguageToggle from "./components/LanguageToggle";
import IntroAnimation from "./components/IntroAnimation";
import { useStore } from "./store";
import { useTranslations } from "./i18n";

function Header() {
  const t = useTranslations();
  
  return (
    <header className="sticky top-0 z-10 bg-[#4e4e3d] backdrop-blur border-b border-stone-200 w-full">
      <div className="mx-auto max-w-6xl px-4 py-4 md:py-5 flex items-center justify-between w-full">
        <div className="flex items-center gap-3 md:gap-4 min-w-0 flex-1">
          <img 
            src="/logo-rarin.png" 
            alt="Rarin Logo" 
            className="h-10 md:h-12 w-auto object-contain flex-shrink-0"
          />
        </div>
        <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
          <LanguageToggle />
        </div>
      </div>
    </header>
  );
}

export default function App() {
  const { step, type, budget } = useStore();
  const [showIntro, setShowIntro] = useState(true);
  
  // For wedding type, use 4-step flow (or 5 for budget4), for others use 3-step flow (event has addons, photo doesn't)
  const isWeddingFlow = type === 'wedding';
  const isBudget4Wedding = type === 'wedding' && budget === 'budget4';
  const isEventType = type === 'event';
  const isPhotoType = type === 'photo';

  const handleIntroComplete = () => {
    setShowIntro(false);
  };
  
  return (
    <div className="min-h-screen overflow-x-hidden relative">
      {/* Background Image */}
      <div className="fixed inset-0 z-0">
        <img
          src="/Self Estimation RARIN.png"
          alt="Rarin Background"
          className="w-full h-full object-cover opacity-30"
        />
      </div>
      
      {showIntro && <IntroAnimation onComplete={handleIntroComplete} />}
      <Header />
      <main className="relative z-10 mx-auto max-w-6xl px-4 py-6 grid md:grid-cols-[1fr_380px] gap-6 w-full md:h-auto">
        <div className="space-y-4 min-w-0">
          <div className="card p-4">
            <div>
              {step === 0 && <TypeSelector />}
              {step === 1 && (
                <>
                  {isWeddingFlow ? <BudgetSelector /> : <PackageSelect />}
                </>
              )}
              {step === 2 && (
                <>
                  {isWeddingFlow ? <PackageSelect /> : <DetailsInput />}
                </>
              )}
              {step === 3 && (
                <>
                  {isWeddingFlow ? <DetailsInput /> : (isEventType ? <AddonsSelect /> : null)}
                </>
              )}
              {step === 4 && isBudget4Wedding && <AddonsSelect />}
            </div>
            
            {/* Navigation moved to bottom for all steps */}
            <div className="mt-8 pt-6">
              <StepNav />
            </div>
          </div>

          <footer className="text-xs text-stone-500 pb-4 md:pb-0">
            © 2025 Rarin Space. All rights reserved.
          </footer>
          
          {/* Spacer for mobile to prevent sticky summary from covering content */}
          <div className="h-[420px] md:hidden" aria-hidden="true"></div>
        </div>

        <aside className="hidden md:block min-w-0 overflow-y-auto max-h-[calc(100vh-120px)] sticky top-[100px]">
          <Summary />
        </aside>
      </main>

      <div className="summary-sticky">
        <div className="mx-auto max-w-6xl px-4 py-3 max-h-[50vh] overflow-y-auto w-full">
          <Summary />
        </div>
      </div>
    </div>
  );
}
