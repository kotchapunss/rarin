import React from 'react';
import { useStore } from '../store';
import { useTranslations, getBudgetRangeName, getBudgetRangeDescription } from '../i18n';
import { getBudgetRanges } from '../data';

export default function BudgetSelector() {
    const { budget, setBudget, language } = useStore();
    const budgetRanges = getBudgetRanges();
    const translations = useTranslations();

    // Debug logging
    console.log('Debug BudgetSelector:');
    console.log('- Current language:', language);
    console.log('- Budget ranges from config:', budgetRanges);
    console.log('- Translations budgetRanges:', translations.budgetRanges);
    
    const handleBudgetSelect = (budgetId) => {
        setBudget(budgetId);
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat(language === 'th' ? 'th-TH' : 'en-US', {
            style: 'currency',
            currency: 'THB'
        }).format(price);
    };

    return (
        <div className="space-y-6">
            {/* Step Header - Wedding Budget Selector */}
            <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">{translations.step1WeddingTitle}</h2>
                <p className="text-gray-600">{translations.step1WeddingDescription}</p>
                {translations.step1WeddingSubDescription && (
                    <p className="text-sm text-gray-500 mt-2">{translations.step1WeddingSubDescription}</p>
                )}
            </div>

            {/* Budget Options */}
            <div className="grid grid-cols-1 gap-4">
                {budgetRanges.map((budgetRange) => (
                    <div
                        key={budgetRange.id}
                        onClick={() => handleBudgetSelect(budgetRange.id)}
                        className={`
                            border-2 rounded-2xl p-6 cursor-pointer transition-all duration-200
                            ${budget === budgetRange.id
                                ? 'border-[#B8846B] bg-[#f9f5f3] shadow-md'
                                : 'border-gray-200 hover:border-[#d4b5a0] hover:shadow-sm'
                            }
                        `}
                    >
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                {getBudgetRangeName(budgetRange.id, language)}
                            </h3>
                            <div className="text-sm text-gray-600">
                                {getBudgetRangeDescription(budgetRange.id, language)}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}