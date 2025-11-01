import React from 'react';
import { useStore } from '../store';
import { getBudgetRanges, getTranslations } from '../data';

export default function BudgetSelector() {
    const { budget, setBudget, language } = useStore();
    const budgetRanges = getBudgetRanges();
    const configTranslations = getTranslations(language);

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
            {/* Step Header */}
            <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">{configTranslations.step2Title}</h2>
                <p className="text-gray-600">{configTranslations.step2Description}</p>
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
                                ? 'border-orange-500 shadow-md'
                                : 'border-gray-200 hover:border-orange-300 hover:shadow-sm'
                            }
                        `}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                    {budgetRange.name[language]}
                                </h3>
                                <div className="text-sm text-gray-600">
                                    {budgetRange.description[language]}
                                </div>
                            </div>
                            <div className={`
                                w-6 h-6 rounded-full border-2 flex items-center justify-center
                                ${budget === budgetRange.id
                                    ? 'border-orange-500 bg-orange-500'
                                    : 'border-gray-300'
                                }
                            `}>
                                {budget === budgetRange.id && (
                                    <div className="w-2 h-2 bg-white rounded-full"></div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}