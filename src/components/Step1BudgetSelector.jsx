import React from 'react';
import { useStore } from '../store';
import { useTranslations } from '../i18n';
import { getBudgetRanges } from '../data';

export default function BudgetSelector() {
    const { budget, setBudget, language } = useStore();
    const budgetRanges = getBudgetRanges();
    const translations = useTranslations();

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
                            border-2 rounded-lg p-6 cursor-pointer transition-all duration-200
                            ${budget === budgetRange.id
                                ? 'border-orange-500 bg-orange-50 shadow-md'
                                : 'border-gray-200 hover:border-orange-300 hover:shadow-sm'
                            }
                        `}
                    >
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                {typeof budgetRange.name === 'object' 
                                    ? (budgetRange.name[language] || budgetRange.name.th || budgetRange.name.en || '')
                                    : (budgetRange.name || '')
                                }
                            </h3>
                            <div className="text-sm text-gray-600">
                                {typeof budgetRange.description === 'object'
                                    ? (budgetRange.description[language] || budgetRange.description.th || budgetRange.description.en || '')
                                    : (budgetRange.description || '')
                                }
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}