import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'ar' | 'en';

export const translations = {
  ar: {
    // Navigation
    home: 'الرئيسية',
    quran: 'المصحف',
    athkar: 'الأذكار',
    qibla: 'القبلة',
    tasbeeh: 'التسبيح',
    more: 'المزيد',
    
    // Prayer Times
    prayerTimes: 'مواقيت الصلاة',
    companion: 'رفيق المؤمن',
    fajr: 'الفجر',
    sunrise: 'الشروق',
    dhuhr: 'الظهر',
    asr: 'العصر',
    maghrib: 'المغرب',
    isha: 'العشاء',
    timeRemaining: 'الوقت المتبقي',
    ayahAndTafseer: 'آية وتفسير',
    dailyHadith: 'حديث اليوم',
    dailyDuaa: 'دعاء اليوم',
    dailyDeeds: 'أعمال اليوم والليلة',
    dailyDeedsDesc: 'قائمة بأهم الأعمال اليومية للمسلم',
    shareText: 'مشاركة النص',
    createdBy: 'تم الإنشاء بواسطة رفيق المؤمن',
    
    // Settings & Alerts
    settings: 'إعدادات',
    alerts: 'تنبيهات',
    language: 'اللغة',
    arabic: 'العربية',
    english: 'English',
  },
  en: {
    // Navigation
    home: 'Home',
    quran: 'Quran',
    athkar: 'Dhikr',
    qibla: 'Qibla',
    tasbeeh: 'Tasbeeh',
    more: 'More',
    
    // Prayer Times
    prayerTimes: 'Prayer Times',
    companion: 'Muslim Companion',
    fajr: 'Fajr',
    sunrise: 'Sunrise',
    dhuhr: 'Dhuhr',
    asr: 'Asr',
    maghrib: 'Maghrib',
    isha: 'Isha',
    timeRemaining: 'Time Remaining',
    ayahAndTafseer: 'Ayah & Tafseer',
    dailyHadith: 'Daily Hadith',
    dailyDuaa: 'Daily Duaa',
    dailyDeeds: 'Daily Deeds',
    dailyDeedsDesc: 'List of important daily deeds for a Muslim',
    shareText: 'Share Text',
    createdBy: 'Created by Muslim Companion',

    // Settings
    settings: 'Settings',
    alerts: 'Alerts',
    language: 'Language',
    arabic: 'العربية',
    english: 'English',
  }
};

export type TranslationKey = keyof typeof translations.ar;

const LanguageContext = createContext({
  lang: 'ar' as Language,
  setLang: (lang: Language) => {},
  t: (key: TranslationKey) => key as string,
  isRtl: true,
});

export const LanguageProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [lang, setLangState] = useState<Language>(localStorage.getItem('appLang') as Language || 'ar');

  const setLang = (l: Language) => {
    localStorage.setItem('appLang', l);
    setLangState(l);
  };

  const t = (key: TranslationKey) => {
    return translations[lang][key] || translations['ar'][key] || key;
  };

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, isRtl: lang === 'ar' }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
