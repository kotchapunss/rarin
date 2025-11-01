import React from "react";
import StepNav from "./components/StepNav";
import TypeSelector from "./components/Step0TypeSelector";
import BudgetSelector from "./components/Step1BudgetSelector";
import PackageSelect from "./components/Step2PackageSelect";
import DetailsInput from "./components/Step3DetailsInput";
import AddonsSelect from "./components/Step4AddonsSelect";
import Summary from "./components/Summary";
import LanguageToggle from "./components/LanguageToggle";
import { useStore } from "./store";
import { getTranslations } from "./data";

function Header() {
  const { language } = useStore();
  const t = getTranslations(language);
  
  return (
    <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-stone-200">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-orange-500"></div>
          <div className="font-semibold text-stone-800">Rarin Space</div>
          <div className="text-xs px-2 py-1 rounded-lg bg-orange-100 text-orange-700 ml-2">
            Calculator
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-stone-500">Demo</div>
          <LanguageToggle />
        </div>
      </div>
    </header>
  );
}

export default function App() {
  const { step, type } = useStore();
  
  // For wedding type, use 4-step flow, for others use 3-step flow
  const isWeddingFlow = type === 'wedding';
  
  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-6 grid md:grid-cols-[1fr_380px] gap-6">
        <div className="space-y-4">
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
                  {isWeddingFlow ? <DetailsInput /> : <AddonsSelect />}
                </>
              )}
              {step === 4 && isWeddingFlow && <AddonsSelect />}
            </div>
            
            {/* Navigation moved to bottom for all steps */}
            <div className="mt-8 pt-6">
              <StepNav />
            </div>
          </div>

          <footer className="text-xs text-stone-500 pb-24 md:pb-0">
            © 2025 Rarin Space. All rights reserved.
          </footer>
        </div>

        <aside className="hidden md:block">
          <Summary />
        </aside>
      </main>

      <div className="summary-sticky">
        <div className="mx-auto max-w-6xl px-4 py-3">
          <Summary />
        </div>
      </div>
    </div>
  );
}
