import React, { useState } from 'react';
import { MessageSquare, Copy, Check } from 'lucide-react';

interface UnavailableDraftEditorProps {
  draft: { language: string; message: string };
  language?: string;
}

export function UnavailableDraftEditor({ draft, language = 'fr' }: UnavailableDraftEditorProps) {
  const [text, setText] = useState(draft.message);
  const [copied, setCopied] = useState(false);

  const isRTL = draft.language === 'ar';
  const uiRTL = language === 'ar';

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white border rounded-xl overflow-hidden shadow-sm" dir={uiRTL ? 'rtl' : 'ltr'}>
      <div className="bg-gray-50 border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-gray-700">
          <MessageSquare className="w-4 h-4" />
          <span className="font-medium text-sm">
            {uiRTL ? 'مسودة طلب للأدوية غير المتوفرة' : 'Brouillon de demande (médicaments indisponibles)'}
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="text-gray-500 hover:text-gray-700 transition flex items-center gap-1 text-xs font-medium"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3" /> {uiRTL ? 'تم النسخ' : 'Copié'}
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" /> {uiRTL ? 'نسخ' : 'Copier'}
            </>
          )}
        </button>
      </div>
      <div className="p-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className={`w-full h-32 p-3 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none resize-none ${isRTL ? 'text-right' : 'text-left'}`}
          dir={isRTL ? 'rtl' : 'ltr'}
        />
        <p className="text-xs text-gray-500 mt-2">
          {uiRTL 
            ? 'يمكنك تعديل هذه الرسالة وإرسالها للصيدليات القريبة للاستفسار.' 
            : 'Vous pouvez modifier ce message et l\'envoyer aux pharmacies à proximité pour vous renseigner.'}
        </p>
      </div>
    </div>
  );
}
