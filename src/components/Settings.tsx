import React, { useState, useEffect, useRef } from 'react';
import { Globe, Moon, Download, Info, Bell, Map as MapIcon, ChevronLeft, Volume2, Check, BookOpen, Calculator, CalendarDays, MapPin, Clock, Calendar, LayoutGrid, MoreHorizontal, BellRing, BellMinus, BellPlus, MessageCircle, MoonStar, Smartphone, Type, Timer, Settings2, Search, Loader2 } from 'lucide-react';
import { azanReciters } from './AzanPlayer';
import { ZakatCalculator } from './ZakatCalculator';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage, Language } from '../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { registerPlugin, Capacitor } from '@capacitor/core';

const WidgetPlugin = registerPlugin('WidgetPlugin');

export const quranRecitersList = [
  { id: 'ar.alafasy', name: 'مشاري العفاسي' },
  { id: 'ar.abdulbasitmurattal', name: 'عبد الباسط عبد الصمد' },
  { id: 'ar.mahermuaiqly', name: 'ماهر المعيقلي' },
  { id: 'ar.minshawi', name: 'محمد صديق المنشاوي' },
  { id: 'ar.husary', name: 'محمود خليل الحصري' },
  { id: 'ar.saoodshuraym', name: 'سعود الشريم' },
  { id: 'ar.hudhaify', name: 'علي الحذيفي' },
  { id: 'ar.ahmedajamy', name: 'أحمد بن علي العجمي' },
  { id: 'ar.shaatree', name: 'أبو بكر الشاطري' },
  { id: 'ar.muhammadayyoub', name: 'محمد أيوب' }
];

export const calculationMethodsList = [
    { id: '4', name: 'أم القرى (مكة المكرمة)' },
    { id: '5', name: 'الهيئة العامة المصرية للمساحة' },
    { id: '3', name: 'رابطة العالم الإسلامي' },
    { id: '1', name: 'جامعة العلوم الإسلامية بكراتشي' },
    { id: '2', name: 'الجمعية الإسلامية لأمريكا الشمالية (ISNA)' },
    { id: '8', name: 'الخليج' },
    { id: '13', name: 'رئاسة الشؤون الدينية (تركيا)' }
];

export const defaultCommonCities = [
    { id: 'auto', name: 'تلقائي (حسب موقعك)', lat: 0, lng: 0 },
    { id: 'makkah', name: 'مكة المكرمة, السعودية', lat: 21.4225, lng: 39.8262 },
    { id: 'madinah', name: 'المدينة المنورة, السعودية', lat: 24.4672, lng: 39.6112 },
    { id: 'riyadh', name: 'الرياض, السعودية', lat: 24.7136, lng: 46.6753 },
    { id: 'cairo', name: 'القاهرة, مصر', lat: 30.0444, lng: 31.2357 },
];

export const Settings: React.FC = () => {
    const navigate = useNavigate();
    const [azanEnabled, setAzanEnabled] = useState(true);
    const [athkarEnabled, setAthkarEnabled] = useState(false);
    const [selectedReciter, setSelectedReciter] = useState('makkah');
    const [selectedQuranReciter, setSelectedQuranReciter] = useState('ar.alafasy');
    const [selectedMethod, setSelectedMethod] = useState('4');
    const [selectedCity, setSelectedCity] = useState('auto');
    const [customCityName, setCustomCityName] = useState('تلقائي');
    
    // UI states
    const [showReciterMenu, setShowReciterMenu] = useState(false);
    const [showQuranReciterMenu, setShowQuranReciterMenu] = useState(false);
    const [showMethodMenu, setShowMethodMenu] = useState(false);
    const [showCityMenu, setShowCityMenu] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    const [installPrompt, setInstallPrompt] = useState<any>(null);
    const { lang: language, setLang: setLanguage, t } = useLanguage();

    // Additional Notification States
    const [beforeAzan, setBeforeAzan] = useState(false);
    const [atAzan, setAtAzan] = useState(true);
    const [afterAzan, setAfterAzan] = useState(false);

    // City Search States
    const [citySearchQuery, setCitySearchQuery] = useState('');
    const [citySearchResults, setCitySearchResults] = useState<any[]>([]);
    const [isSearchingCity, setIsSearchingCity] = useState(false);
    const searchTimeoutRef = useRef<NodeJS.Timeout>();

    // Date & Widget States
    const [showDateMenu, setShowDateMenu] = useState(false);
    const [hijriOffset, setHijriOffset] = useState(0);
    const [dateFormat, setDateFormat] = useState('full');
    
    const [showWidgetMenu, setShowWidgetMenu] = useState(false);
    const [widgetTransparent, setWidgetTransparent] = useState(false);
    const [widgetSeconds, setWidgetSeconds] = useState(true);

    const [convGregorian, setConvGregorian] = useState(new Date().toISOString().split('T')[0]);
    const [convHijri, setConvHijri] = useState('');


    useEffect(() => {
        const savedAzan = localStorage.getItem('azan_notifications');
        if (savedAzan !== null) setAzanEnabled(savedAzan === 'true');
        
        const savedBefore = localStorage.getItem('before_azan');
        if (savedBefore !== null) setBeforeAzan(savedBefore === 'true');
        
        const savedAt = localStorage.getItem('at_azan');
        if (savedAt !== null) setAtAzan(savedAt === 'true');

        const savedAfter = localStorage.getItem('after_azan');
        if (savedAfter !== null) setAfterAzan(savedAfter === 'true');

        const savedAthkar = localStorage.getItem('athkar_notifications');
        if (savedAthkar !== null) setAthkarEnabled(savedAthkar === 'true');

        const savedReciter = localStorage.getItem('azan_reciter');
        if (savedReciter) setSelectedReciter(savedReciter);
        
        const savedQuranReciter = localStorage.getItem('quran_reciter');
        if (savedQuranReciter) setSelectedQuranReciter(savedQuranReciter);
        
        const savedMethod = localStorage.getItem('calculation_method');
        if (savedMethod) setSelectedMethod(savedMethod);
        
        const savedCity = localStorage.getItem('custom_location');
        if (savedCity) {
            try {
                const parsedCity = JSON.parse(savedCity);
                if (parsedCity.id) {
                    setSelectedCity(parsedCity.id);
                    setCustomCityName(parsedCity.name);
                }
            } catch (e) {}
        }
        
        const savedOffset = localStorage.getItem('hijri_offset');
        if (savedOffset) setHijriOffset(parseInt(savedOffset, 10));

        const savedFormat = localStorage.getItem('date_format');
        if (savedFormat) setDateFormat(savedFormat);

        const savedWT = localStorage.getItem('widget_transparent');
        if (savedWT !== null) setWidgetTransparent(savedWT === 'true');

        const savedWS = localStorage.getItem('widget_seconds');
        if (savedWS !== null) setWidgetSeconds(savedWS === 'true');

        const savedSilent = localStorage.getItem('silent_alert');
        if (savedSilent !== null) setSilentAlert(savedSilent === 'true');

        const savedLockScreen = localStorage.getItem('lock_screen');
        if (savedLockScreen !== null) setLockScreenN(savedLockScreen === 'true');

        const savedIntlMode = localStorage.getItem('intl_mode');
        if (savedIntlMode !== null) setIntlMode(savedIntlMode === 'true');

        const savedFontSize = localStorage.getItem('font_size');
        if (savedFontSize) setFontSize(savedFontSize);

        const savedCountdown = localStorage.getItem('countdown_time');
        if (savedCountdown) setCountdownTime(parseInt(savedCountdown, 10));

        const savedIqamah = localStorage.getItem('iqamah_times');
        if (savedIqamah) {
            try {
                setIqamahTimes(JSON.parse(savedIqamah));
            } catch (e) {}
        }

        setDarkMode(document.documentElement.classList.contains('dark'));

        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            setInstallPrompt(e);
        });
    }, []);

    const toggleDarkMode = () => {
        const isDark = !darkMode;
        setDarkMode(isDark);
        if (isDark) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    };

    const toggleLanguage = () => {
        const newLang = language === 'ar' ? 'en' : 'ar';
        setLanguage(newLang);
    };

    const handleInstallPWA = async () => {
        if (Capacitor.isNativePlatform()) return;
        if (installPrompt) {
            installPrompt.prompt();
            const { outcome } = await installPrompt.userChoice;
            if (outcome === 'accepted') setInstallPrompt(null);
        } else {
            alert('لإضافة التطبيق كـ ويدجت/تطبيق على شاشتك الرئيسية، اضغط على زر "المشاركة" (Share) في متصفحك ثم اختر "إضافة إلى الشاشة الرئيسية" (Add to Home Screen).');
        }
    };

    const handleAddWidget = async (type: string) => {
        if (Capacitor.isNativePlatform()) {
            try {
                await WidgetPlugin.addWidget({ type });
            } catch (error: any) {
                alert(error.message || 'حدث خطأ أثناء إضافة الويدجيت');
            }
        } else {
            handleInstallPWA();
        }
    };


    useEffect(() => {
        try {
            const date = new Date(convGregorian);
            date.setDate(date.getDate() + hijriOffset);
            const formatter = new Intl.DateTimeFormat('ar-SA-u-ca-islamic', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
            setConvHijri(formatter.format(date));
        } catch (e) {
            setConvHijri('');
        }
    }, [convGregorian, hijriOffset]);

    const handleSelectReciter = (id: string) => {
        setSelectedReciter(id);
        localStorage.setItem('azan_reciter', id);
        setShowReciterMenu(false);
    };

    const handleSelectMethod = (id: string) => {
        setSelectedMethod(id);
        localStorage.setItem('calculation_method', id);
        setShowMethodMenu(false);
    };
    
    const handleSelectCity = (cityObj: any) => {
        setSelectedCity(cityObj.id);
        setCustomCityName(cityObj.name);
        
        // Save to local storage
        localStorage.setItem('custom_location', JSON.stringify({
           id: cityObj.id,
           name: cityObj.name,
           lat: cityObj.lat,
           lng: cityObj.lng
        }));
        window.dispatchEvent(new Event('location_changed'));
        
        setShowCityMenu(false);
        setCitySearchQuery('');
        setCitySearchResults([]);
    };

    // Handle city search typing
    const handleCitySearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setCitySearchQuery(query);
        
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        if (query.trim().length > 2) {
            setIsSearchingCity(true);
            searchTimeoutRef.current = setTimeout(async () => {
                try {
                    const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&accept-language=ar`);
                    const data = await res.json();
                    
                    const mappedResults = data.map((item: any) => ({
                        id: `custom_${item.place_id}`,
                        name: item.display_name.split(',').slice(0, 2).join(','),
                        fullName: item.display_name,
                        lat: parseFloat(item.lat),
                        lng: parseFloat(item.lon)
                    }));
                    setCitySearchResults(mappedResults);
                } catch (err) {
                    console.error("City search failed", err);
                } finally {
                    setIsSearchingCity(false);
                }
            }, 800); // debounce 800ms
        } else {
            setCitySearchResults([]);
            setIsSearchingCity(false);
        }
    };

    const currentReciterName = azanReciters.find(r => r.id === selectedReciter)?.name || '';
    const currentMethodName = calculationMethodsList.find(r => r.id === selectedMethod)?.name || '';
    const currentCityNameDisplay = selectedCity === 'auto' ? 'تلقائي' : customCityName.split(',')[0];

    // Modern Settings Item Component
    const SettingsItem = ({ icon: Icon, title, subtitle, onClick, hasChevron = true, extra }: any) => (
        <div 
            onClick={onClick}
            className="flex items-center justify-between p-4 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer active:bg-black/10 dark:active:bg-white/10 group"
        >
            <div className="flex items-center space-x-3 space-x-reverse">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-primary/10 text-primary flex-shrink-0 group-hover:scale-105 transition-transform">
                    <Icon className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                    <span className="font-bold text-text-main text-[15px]">{title}</span>
                    {subtitle && <span className="text-xs text-text-muted mt-0.5">{subtitle}</span>}
                </div>
            </div>
            <div className="flex items-center space-x-2 space-x-reverse flex-shrink-0">
                {extra}
                {hasChevron && <ChevronLeft className="w-5 h-5 text-text-muted group-hover:text-primary transition-colors" />}
            </div>
        </div>
    );

    const [showMoreMenu, setShowMoreMenu] = useState(false);
    const [fontSize, setFontSize] = useState('1.0x');
    const [countdownTime, setCountdownTime] = useState(40);
    const [showCountdownMenu, setShowCountdownMenu] = useState(false);
    const [showIqamahMenu, setShowIqamahMenu] = useState(false);
    const [iqamahTimes, setIqamahTimes] = useState({
        Fajr: 20, Dhuhr: 15, Asr: 15, Maghrib: 10, Isha: 15
    });

    const [silentAlert, setSilentAlert] = useState(false);
    const [lockScreenN, setLockScreenN] = useState(true);
    const [intlMode, setIntlMode] = useState(false);

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pt-8 px-4 space-y-6 pb-24 max-w-full min-h-screen">
            <div className="flex items-center justify-between mb-2 px-2">
                <ChevronLeft className="w-6 h-6 invisible" />
                <h2 className="text-xl font-bold text-text-main">الإعدادات</h2>
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition relative left-2">
                    <ChevronLeft className="w-6 h-6 text-text-main" />
                </button>
            </div>

            {/* Section 1: General Options */}
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
                <div className="glass-card rounded-2xl divide-y divide-gray-100 dark:divide-white/5 overflow-hidden">
                    <SettingsItem icon={MapPin} title="المدينة" onClick={() => setShowCityMenu(!showCityMenu)} extra={<span className="text-xs text-primary font-bold px-2 bg-primary/10 rounded-md py-1">{currentCityNameDisplay}</span>} />
                    {showCityMenu && (
                        <div className="bg-primary/5 p-3 shadow-inner">
                            <div className="relative mb-3">
                                <Search className="w-5 h-5 absolute right-3 top-2.5 text-text-muted" />
                                <input 
                                    type="text" 
                                    placeholder="ابحث عن مدينة..." 
                                    value={citySearchQuery}
                                    onChange={handleCitySearch}
                                    className="w-full bg-white dark:bg-[#1f2937] text-text-main placeholder-text-muted rounded-xl py-2.5 pr-10 pl-4 border border-gray-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                                />
                                {isSearchingCity && <Loader2 className="w-4 h-4 absolute left-3 top-3 animate-spin text-primary" />}
                            </div>
                            
                            <div className="divide-y divide-gray-200 dark:divide-white/5 max-h-64 overflow-y-auto rounded-xl bg-white/50 dark:bg-black/20">
                                {citySearchQuery.length > 2 ? (
                                    citySearchResults.length > 0 ? (
                                        citySearchResults.map(city => (
                                            <div key={city.id} onClick={() => handleSelectCity(city)} className="p-3 px-4 flex flex-col hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer text-sm gap-1">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-text-main font-bold">{city.name}</span>
                                                    {selectedCity === city.id && <Check className="w-4 h-4 text-primary flex-shrink-0" />}
                                                </div>
                                                <span className="text-xs text-text-muted line-clamp-1">{city.fullName}</span>
                                            </div>
                                        ))
                                    ) : (
                                        !isSearchingCity && <div className="p-4 text-center text-sm text-text-muted">لا توجد نتائج مطابقة</div>
                                    )
                                ) : (
                                    defaultCommonCities.map(city => (
                                        <div key={city.id} onClick={() => handleSelectCity(city)} className="p-3 px-4 flex items-center justify-between hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer text-sm gap-2">
                                            <span className="text-text-main font-bold">{city.name}</span>
                                            {selectedCity === city.id && <Check className="w-4 h-4 text-primary flex-shrink-0" />}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                    <SettingsItem icon={Clock} title="أوقات الصلاة" onClick={() => setShowMethodMenu(!showMethodMenu)} />
                    {showMethodMenu && (
                        <div className="bg-primary/5 divide-y divide-gray-200 dark:divide-white/5 animate-in slide-in-from-top-2 p-2 relative shadow-inner">
                            {calculationMethodsList.map(method => (
                                <div key={method.id} onClick={() => handleSelectMethod(method.id)} className="p-3 px-4 flex items-center justify-between hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer rounded-xl text-sm gap-2">
                                    <span className="text-text-main font-bold">{method.name}</span>
                                    {selectedMethod === method.id && <Check className="w-4 h-4 text-primary flex-shrink-0" />}
                                </div>
                            ))}
                        </div>
                    )}
                    <SettingsItem icon={Globe} title="اللغة" onClick={toggleLanguage} extra={<span className="text-xs text-primary font-bold px-2 bg-primary/10 rounded-md py-1">{language === 'ar' ? 'العربية' : 'English'}</span>} />
                    <SettingsItem icon={Calendar} title="التاريخ" onClick={() => setShowDateMenu(!showDateMenu)} />
                    {showDateMenu && (
                        <div className="bg-primary/5 p-4 shadow-inner space-y-4">
                            <div>
                                <label className="text-sm font-bold text-text-main block mb-2">تصحيح التاريخ الهجري</label>
                                <div className="flex items-center justify-between bg-white dark:bg-[#1f2937] p-2 rounded-xl">
                                    <button onClick={() => {
                                        const newOffset = Math.max(-2, hijriOffset - 1);
                                        setHijriOffset(newOffset);
                                        localStorage.setItem('hijri_offset', newOffset.toString());
                                    }} className="w-10 h-10 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition font-bold text-text-main">-</button>
                                    <span className="font-bold text-lg text-primary" dir="ltr">{hijriOffset > 0 ? `+${hijriOffset}` : hijriOffset} يوم</span>
                                    <button onClick={() => {
                                        const newOffset = Math.min(2, hijriOffset + 1);
                                        setHijriOffset(newOffset);
                                        localStorage.setItem('hijri_offset', newOffset.toString());
                                    }} className="w-10 h-10 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition font-bold text-text-main">+</button>
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-bold text-text-main block mb-2">تنسيق التاريخ في الرئيسية</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button 
                                        onClick={() => {
                                            setDateFormat('full');
                                            localStorage.setItem('date_format', 'full');
                                        }}
                                        className={`p-2 rounded-xl text-xs font-bold text-center border-2 transition ${dateFormat === 'full' ? 'border-primary bg-primary/10 text-primary' : 'border-transparent bg-white dark:bg-[#1f2937] text-text-muted'}`}>كامل <br/><span className="text-[10px] font-normal opacity-80">(الجمعية، 1 رمضان 1445)</span></button>
                                    <button 
                                        onClick={() => {
                                            setDateFormat('short');
                                            localStorage.setItem('date_format', 'short');
                                        }}
                                        className={`p-2 rounded-xl text-xs font-bold text-center border-2 transition ${dateFormat === 'short' ? 'border-primary bg-primary/10 text-primary' : 'border-transparent bg-white dark:bg-[#1f2937] text-text-muted'}`}>مختصر <br/><span className="text-[10px] font-normal opacity-80">(1 رمضان 1445)</span></button>
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-bold text-text-main block mb-2">تحويل من ميلادي إلى هجري</label>
                                <div className="bg-white dark:bg-[#1f2937] p-3 rounded-xl space-y-3">
                                    <input 
                                        type="date"
                                        value={convGregorian}
                                        onChange={(e) => setConvGregorian(e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-gray-800 text-text-main rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
                                        lang="en-US"
                                    />
                                    <div className="flex items-center justify-center p-2 bg-primary/10 rounded-lg">
                                        <span className="font-bold text-primary">{convHijri || '...'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    <SettingsItem icon={MoonStar} title="المظهر" onClick={toggleDarkMode} extra={
                        <div className={`w-10 h-6 pl-0.5 rounded-full relative transition-colors ${darkMode ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'}`}>
                            <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all ${darkMode ? 'left-0.5' : 'left-4'}`}></div>
                        </div>
                    } hasChevron={false} />
                    <SettingsItem icon={Smartphone} title="الويدجت" onClick={() => setShowWidgetMenu(!showWidgetMenu)} />
                    {showWidgetMenu && (
                        <div className="bg-primary/5 p-4 shadow-inner space-y-4">
                            <div className="flex items-center justify-between bg-white dark:bg-[#1f2937] p-3 rounded-xl cursor-pointer" onClick={() => {
                                setWidgetTransparent(!widgetTransparent);
                                localStorage.setItem('widget_transparent', (!widgetTransparent).toString());
                            }}>
                                <span className="font-bold text-sm text-text-main">خلفية ويدجت شفافة</span>
                                <div className={`w-10 h-6 pl-0.5 rounded-full relative transition-colors ${widgetTransparent ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'}`}>
                                    <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all ${widgetTransparent ? 'left-0.5' : 'left-4'}`}></div>
                                </div>
                            </div>
                            
                            <div className="flex items-center justify-between bg-white dark:bg-[#1f2937] p-3 rounded-xl cursor-pointer" onClick={() => {
                                setWidgetSeconds(!widgetSeconds);
                                localStorage.setItem('widget_seconds', (!widgetSeconds).toString());
                            }}>
                                <div>
                                    <span className="font-bold text-sm text-text-main block">تفعيل الثواني في الويدجت</span>
                                    <span className="text-[10px] text-text-muted mt-0.5">قم بإيقافه إذا واجهت مشاكل في العداد</span>
                                </div>
                                <div className={`w-10 h-6 pl-0.5 rounded-full relative transition-colors ${widgetSeconds ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'}`}>
                                    <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all ${widgetSeconds ? 'left-0.5' : 'left-4'}`}></div>
                                </div>
                            </div>

                            <div className="pt-2 space-y-3">
                                <button className="w-full flex items-center justify-between bg-white dark:bg-[#1f2937] p-3 rounded-xl hover:bg-black/5 transition" onClick={() => handleAddWidget('prayer')}>
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center border border-primary/20">
                                            <div className="grid grid-cols-2 gap-1 w-6 h-6">
                                                <div className="bg-primary/40 rounded-sm"></div><div className="bg-primary/40 rounded-sm"></div>
                                                <div className="bg-primary/40 rounded-sm"></div><div className="bg-primary/40 rounded-sm"></div>
                                            </div>
                                        </div>
                                        <span className="font-bold text-sm text-text-main">إضافة ويدجت صغير</span>
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-lg leading-none pb-0.5">+</div>
                                </button>
                                
                                <button className="w-full flex items-center justify-between bg-white dark:bg-[#1f2937] p-3 rounded-xl hover:bg-black/5 transition" onClick={() => handleAddWidget('prayer')}>
                                    <div className="flex items-center gap-3">
                                        <div className="w-16 h-12 bg-primary/10 rounded-lg flex items-center justify-center border border-primary/20">
                                            <div className="w-10 h-3 bg-primary/40 rounded-sm"></div>
                                        </div>
                                        <span className="font-bold text-sm text-text-main">إضافة ويدجت متوسط</span>
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-lg leading-none pb-0.5">+</div>
                                </button>

                                <button className="w-full flex items-center justify-between bg-white dark:bg-[#1f2937] p-3 rounded-xl hover:bg-black/5 transition" onClick={() => handleAddWidget('prayer')}>
                                    <div className="flex items-center gap-3">
                                        <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center border border-primary/20 flex-col gap-1 px-2">
                                            <div className="w-full h-2 bg-primary/40 rounded-sm"></div>
                                            <div className="w-full h-2 bg-primary/40 rounded-sm"></div>
                                            <div className="w-full h-2 bg-primary/40 rounded-sm"></div>
                                        </div>
                                        <span className="font-bold text-sm text-text-main">إضافة ويدجت كبير</span>
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-lg leading-none pb-0.5">+</div>

                                </button>
                            </div>
                        </div>
                    )}
                    <SettingsItem icon={CalendarDays} title="المناسبات الإسلامية" onClick={() => navigate('/events')} />
                    
                    {/* Exiting Zakat out of More menu */}
                    <div className="flex flex-col">
                        <SettingsItem icon={Calculator} title="حساب الزكاة" onClick={() => setAthkarEnabled(!athkarEnabled)} 
                            extra={<ChevronLeft className={`w-5 h-5 text-gray-400 transition-transform ${athkarEnabled ? '-rotate-90' : ''}`} />} hasChevron={false} />
                        {athkarEnabled && <div className="p-4 bg-primary/5 border-t border-primary/10"><ZakatCalculator /></div>}
                    </div>

                    <SettingsItem icon={Settings2} title="المزيد" onClick={() => setShowMoreMenu(!showMoreMenu)} 
                        extra={<ChevronLeft className={`w-5 h-5 text-gray-400 transition-transform ${showMoreMenu ? '-rotate-90' : ''}`} />} hasChevron={false} />
                    
                    {showMoreMenu && (
                        <div className="bg-primary/5 divide-y divide-gray-200 dark:divide-white/5 border-t border-primary/10 animate-in slide-in-from-top-2 shadow-inner">
                           <SettingsItem 
                                icon={Volume2} title="التنبيه خلال الوضع الصامت" subtitle="التحويل للوضع العام مؤقتا لسماع التنبيه *" 
                                onClick={() => {
                                    setSilentAlert(!silentAlert);
                                    localStorage.setItem('silent_alert', (!silentAlert).toString());
                                }} hasChevron={false} 
                                extra={
                                    <div className={`w-10 h-6 pl-0.5 rounded-full relative transition-colors ${silentAlert ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'}`}>
                                        <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all ${silentAlert ? 'left-0.5' : 'left-4'}`}></div>
                                    </div>
                                }
                           />
                           <SettingsItem 
                                icon={BellRing} title="إشعار شاشة القفل الدائم" subtitle="أوقات الصلاة في مركز الإشعارات" 
                                onClick={() => {
                                    setLockScreenN(!lockScreenN);
                                    localStorage.setItem('lock_screen', (!lockScreenN).toString());
                                }} hasChevron={false} 
                                extra={
                                    <div className={`w-10 h-6 pl-0.5 rounded-full relative transition-colors ${lockScreenN ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'}`}>
                                        <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all ${lockScreenN ? 'left-0.5' : 'left-4'}`}></div>
                                    </div>
                                }
                           />
                           <SettingsItem 
                                icon={MapIcon} title="الوضع الدولي" subtitle="عند انتقالك خارج البلاد" 
                                onClick={() => {
                                    setIntlMode(!intlMode);
                                    localStorage.setItem('intl_mode', (!intlMode).toString());
                                }} hasChevron={false} 
                                extra={
                                    <div className={`w-10 h-6 pl-0.5 rounded-full relative transition-colors ${intlMode ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'}`}>
                                        <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all ${intlMode ? 'left-0.5' : 'left-4'}`}></div>
                                    </div>
                                }
                           />
                           <SettingsItem 
                                icon={Type} title="حجم الخط" 
                                onClick={() => {
                                    const sizes = ['0.9x', '1.0x', '1.1x', '1.2x'];
                                    const nextIndex = (sizes.indexOf(fontSize) + 1) % sizes.length;
                                    const newFSize = sizes[nextIndex];
                                    setFontSize(newFSize);
                                    localStorage.setItem('font_size', newFSize);
                                    let px = '16px';
                                    if (newFSize === '0.9x') px = '14.4px';
                                    if (newFSize === '1.1x') px = '17.6px';
                                    if (newFSize === '1.2x') px = '19.2px';
                                    document.documentElement.style.fontSize = px;
                                }} hasChevron={false} 
                                extra={<span className="text-sm text-text-main font-bold">{fontSize}</span>}
                           />
                           <SettingsItem 
                                icon={Timer} title="العد إلى الصلاة القادمة" 
                                onClick={() => setShowCountdownMenu(!showCountdownMenu)} hasChevron={false} 
                                extra={<span className="text-sm text-text-main font-bold">{countdownTime} د</span>}
                           />
                           {showCountdownMenu && (
                               <div className="bg-black/5 dark:bg-black/20 p-3 grid grid-cols-4 gap-2">
                                   {[15, 20, 30, 40].map(time => (
                                       <button 
                                           key={time}
                                           onClick={() => {
                                               setCountdownTime(time);
                                               localStorage.setItem('countdown_time', time.toString());
                                           }}
                                           className={`py-2 rounded-lg text-sm font-bold transition ${countdownTime === time ? 'bg-primary text-white' : 'bg-white dark:bg-gray-800 text-text-main hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                                       >
                                           {time} د
                                       </button>
                                   ))}
                               </div>
                           )}
                           <SettingsItem 
                                icon={Clock} title="أوقات الإقامة" 
                                onClick={() => setShowIqamahMenu(!showIqamahMenu)} hasChevron={false} 
                                extra={<ChevronLeft className={`w-5 h-5 text-gray-400 transition-transform ${showIqamahMenu ? '-rotate-90' : ''}`} />}
                           />
                           {showIqamahMenu && (
                               <div className="bg-black/5 dark:bg-black/20 p-4 space-y-3">
                                   {Object.entries({ Fajr: 'الفجر', Dhuhr: 'الظهر', Asr: 'العصر', Maghrib: 'المغرب', Isha: 'العشاء' }).map(([key, name]) => (
                                       <div key={key} className="flex items-center justify-between">
                                           <span className="text-sm font-bold text-text-main">{name}</span>
                                           <div className="flex items-center gap-3 bg-white dark:bg-gray-800 rounded-lg p-1 px-2">
                                               <button onClick={() => {
                                                   const newVal = Math.max(0, iqamahTimes[key as keyof typeof iqamahTimes] - 1);
                                                   const newTimes = { ...iqamahTimes, [key]: newVal };
                                                   setIqamahTimes(newTimes);
                                                   localStorage.setItem('iqamah_times', JSON.stringify(newTimes));
                                               }} className="text-text-muted hover:text-primary transition font-bold text-lg px-2">-</button>
                                               <span className="w-6 text-center font-bold text-primary">{iqamahTimes[key as keyof typeof iqamahTimes]}</span>
                                               <button onClick={() => {
                                                   const newVal = Math.min(60, iqamahTimes[key as keyof typeof iqamahTimes] + 1);
                                                   const newTimes = { ...iqamahTimes, [key]: newVal };
                                                   setIqamahTimes(newTimes);
                                                   localStorage.setItem('iqamah_times', JSON.stringify(newTimes));
                                               }} className="text-text-muted hover:text-primary transition font-bold text-lg px-2">+</button>
                                           </div>
                                       </div>
                                   ))}
                               </div>
                           )}
                           <div className="p-4 text-xs text-text-muted leading-relaxed text-right border-t border-primary/10">
                               * لكي تعمل هذه الميزة بشكل صحيح، يرجى <a href="#" className="text-primary font-bold hover:underline">الضغط هنا</a> ثم السماح للتطبيق بتغيير وضع هاتفك.
                           </div>
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Section 2: Notifications */}
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
                <div className="glass-card rounded-2xl overflow-hidden">
                    <div className="flex items-center justify-between p-4 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer" onClick={() => {
                        const newVal = !azanEnabled;
                        setAzanEnabled(newVal);
                        localStorage.setItem('azan_notifications', newVal.toString());
                    }}>
                        <div className="flex items-center space-x-3 space-x-reverse">
                            <h3 className="font-bold text-text-main text-[15px]">تفعيل التنبيهات</h3>
                        </div>
                        <div className={`w-12 h-7 rounded-full relative transition-colors ${azanEnabled ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-700'}`}>
                            <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-sm transition-all ${azanEnabled ? 'left-1' : 'left-6'}`}></div>
                        </div>
                    </div>
                </div>

                {azanEnabled && (
                  <div className="glass-card rounded-2xl divide-y divide-gray-100 dark:divide-white/5 overflow-hidden mt-4">
                      <SettingsItem 
                          icon={BellMinus} title="قبل الأذان" 
                          onClick={() => {
                              const val = !beforeAzan;
                              setBeforeAzan(val);
                              localStorage.setItem('before_azan', val.toString());
                          }}
                          hasChevron={false}
                          extra={<div className={`w-10 h-5 rounded-full relative transition-colors ${beforeAzan ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'}`}><div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${beforeAzan ? 'left-0.5' : 'left-5'}`}></div></div>}
                      />
                      <SettingsItem 
                          icon={Clock} title="عند الأذان" 
                          onClick={() => {
                              const val = !atAzan;
                              setAtAzan(val);
                              localStorage.setItem('at_azan', val.toString());
                          }}
                          hasChevron={false}
                          extra={<div className={`w-10 h-5 rounded-full relative transition-colors ${atAzan ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'}`}><div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${atAzan ? 'left-0.5' : 'left-5'}`}></div></div>}
                      />
                      <SettingsItem 
                          icon={BellPlus} title="بعد الأذان" 
                          onClick={() => {
                              const val = !afterAzan;
                              setAfterAzan(val);
                              localStorage.setItem('after_azan', val.toString());
                          }}
                          hasChevron={false}
                          extra={<div className={`w-10 h-5 rounded-full relative transition-colors ${afterAzan ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'}`}><div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${afterAzan ? 'left-0.5' : 'left-5'}`}></div></div>}
                      />
                      <SettingsItem icon={Bell} title="تنبيهات أخرى" onClick={() => setShowReciterMenu(!showReciterMenu)} extra={
                          currentReciterName !== '' && <span className="text-xs text-text-muted font-bold px-2">{currentReciterName}</span>
                      }/>
                      {showReciterMenu && (
                          <div className="bg-primary/5 divide-y divide-gray-200 dark:divide-white/5 border-t border-primary/10 animate-in slide-in-from-top-2 p-2 shadow-inner">
                              {azanReciters.map(reciter => (
                                  <div key={reciter.id} onClick={() => handleSelectReciter(reciter.id)} className="p-3 px-4 flex items-center justify-between hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer rounded-xl text-sm gap-2">
                                      <span className="text-text-main font-bold">{reciter.name}</span>
                                      {selectedReciter === reciter.id && <Check className="w-4 h-4 text-primary flex-shrink-0" />}
                                  </div>
                              ))}
                          </div>
                      )}
                  </div>
                )}
            </motion.div>

            {/* Section 3: About */}
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="pt-2">
                <div className="glass-card rounded-2xl overflow-hidden">
                    <SettingsItem icon={Info} title="عن رفيق المؤمن" onClick={() => navigate('/about')} hasChevron={false} 
                        extra={<span className="text-xs text-text-muted font-bold font-mono">v1.1.0</span>} />
                </div>
                <div className="flex flex-col items-center justify-center mt-6 mb-10">
                    <button 
                        onClick={() => {
                            window.location.href = "intent:#Intent;action=android.settings.APPLICATION_DETAILS_SETTINGS;data=package:com.rafiq.almomen;end";
                        }}
                        className="relative group mb-3"
                    >
                        <div className="w-16 h-16 bg-white dark:bg-[#1a1d2d] rounded-2xl flex items-center justify-center border border-gray-100 dark:border-white/10 shadow-sm group-hover:scale-105 active:scale-95 transition-all">
                            <img src="/icons/icon-192x192.svg" alt="رفيق المؤمن" className="w-10 h-10" />
                        </div>
                    </button>
                    <div className="text-center">
                        <p className="text-xs font-mono text-text-muted font-bold">الإصدار 1.1.0</p>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

