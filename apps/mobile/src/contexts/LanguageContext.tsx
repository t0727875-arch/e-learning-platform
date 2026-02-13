import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'ar' | 'fr';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  const isRTL = language === 'ar';

  return (
    <LanguageContext.Provider value={{ language, setLanguage, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

export function getLocalizedText(
  item: Record<string, any> | null | undefined,
  language: Language,
  field: 'title' | 'description' | 'content' | 'question' | 'text' = 'title'
): string {
  if (!item) return '';
  
  const fieldMap: Record<string, { en: string; ar: string; fr: string }> = {
    title: { en: 'titleEn', ar: 'titleAr', fr: 'titleFr' },
    description: { en: 'descriptionEn', ar: 'descriptionAr', fr: 'descriptionFr' },
    content: { en: 'contentEn', ar: 'contentAr', fr: 'contentFr' },
    question: { en: 'questionEn', ar: 'questionAr', fr: 'questionFr' },
    text: { en: 'textEn', ar: 'textAr', fr: 'textFr' },
  };
  
  const fields = fieldMap[field];
  
  return item[fields[language]] || item[fields.en] || '';
}
