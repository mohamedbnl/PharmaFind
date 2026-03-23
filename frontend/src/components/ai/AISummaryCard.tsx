
import React from 'react';
import { Bot } from 'lucide-react';

interface AISummaryCardProps {
  summary: string;
  detectedLanguage: string;
}

export function AISummaryCard({ summary, detectedLanguage }: AISummaryCardProps) {
  if (!summary) return null;

  const isRTL = detectedLanguage === 'ar';

  return (
    <div className={`bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-4 items-start ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="bg-blue-100 p-2 rounded-full shrink-0">
        <Bot className="w-6 h-6 text-blue-600" />
      </div>
      <div>
        <h3 className="font-semibold text-blue-900 mb-1">
          {isRTL ? 'مساعد الذكاء الاصطناعي' : 'Assistant IA'}
        </h3>
        <p className="text-blue-800 text-sm">
          {summary}
        </p>
      </div>

      </div>
      );
}
