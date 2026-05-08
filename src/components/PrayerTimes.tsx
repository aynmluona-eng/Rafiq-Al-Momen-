import React, { useEffect, useState, useRef } from 'react';
import { getPrayerTimesByCoordinates, PrayerTimings, HijriDate } from '../services/alAdhan';
import { useGeolocation } from '../hooks/useGeolocation';
import { MapPin, Bell, Share2, X, Moon, Sun, Sunrise, Sunset, BookOpen, Compass, Fingerprint, Volume2, VolumeX, Check, AlertCircle, Download, Image as ImageIcon } from 'lucide-react';
import { parse, format, differenceInSeconds, addDays, isSameDay, getDayOfYear } from 'date-fns';
import { ar } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';
import * as htmlToImage from 'html-to-image';
import { MonthlyPrayerTimes } from './MonthlyPrayerTimes';

const DAILY_AYAAT = [
    { ayah: "وَقَالَ رَبُّكُمُ ادْعُونِي أَسْتَجِبْ لَكُمْ", tafseer: "هذا من فضله تبارك وتعالى، وكرمه أن ندب عباده إلى دعائه، وتكفل لهم بالإجابة." },
    { ayah: "إِنَّ مَعَ الْعُسْرِ يُسْرًا", tafseer: "بشارة عظيمة، أنه كلما وُجِدَ عسر وصعوبة، فإن اليسر يقارنه ويصاحبه." },
    { ayah: "وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا", tafseer: "من يتقي الله في أموره كلها، يجعل له مخرجاً من كل ضيق وييسر له أمره." },
    { ayah: "فَاذْكُرُونِي أَذْكُرْكُمْ", tafseer: "وهذا ثواب الذاكرين، أن يذكرهم الله برحمته وفضله، فمن ذكره في نفسه ذكره الله في نفسه." },
];

const DAILY_AHADITH = [
    "من سلك طريقاً يلتمس فيه علماً سهّل الله له به طريقاً إلى الجنة.",
    "كلمتان خفيفتان على اللسان، ثقيلتان في الميزان، حبيبتان إلى الرحمن: سبحان الله وبحمده، سبحان الله العظيم.",
    "الطهور شطر الإيمان، والحمد لله تمْلأ الميزان.",
    "من صام رمضان إيماناً واحتساباً، غُفر له ما تقدم من ذنبه.",
];

const DAILY_DUAAS = [
    "اللهم إني أسألك علماً نافعاً، ورزقاً طيباً، وعملاً متقبلاً.",
    "يا مقلب القلوب ثبت قلبي على دينك.",
    "اللهم آتنا في الدنيا حسنة، وفي الآخرة حسنة، وقنا عذاب النار.",
    "اللهم إنك عفو تحب العفو فاعف عني.",
];

export const PrayerTimes: React.FC = () => {
  const { location, loading: geoLoading } = useGeolocation();
  const { t } = useLanguage();
  const [liveTimings, setLiveTimings] = useState<PrayerTimings | null>(null);
  const [displayTimings, setDisplayTimings] = useState<PrayerTimings | null>(null);
  const [hijriDate, setHijriDate] = useState<HijriDate | null>(null);
  const [loading, setLoading] = useState(false);
  const [timezone, setTimezone] = useState<string>('طرابلس');
  const [now, setNow] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [soundEnabled, setSoundEnabled] = useState(localStorage.getItem('azan_notifications') !== 'false');
  const [showElapsed, setShowElapsed] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showMonthlyModal, setShowMonthlyModal] = useState(false);
  const [shareThemeIndex, setShareThemeIndex] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const shareCardRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const dailyIndex = getDayOfYear(now);
  const dailyAyah = DAILY_AYAAT[dailyIndex % DAILY_AYAAT.length];
  const dailyHadith = DAILY_AHADITH[dailyIndex % DAILY_AHADITH.length];
  const dailyDuaa = DAILY_DUAAS[dailyIndex % DAILY_DUAAS.length];

  // Tripoli fallback
  const defaultLocation = { latitude: 32.8872, longitude: 13.1913 };

  useEffect(() => {
     if (soundEnabled) {
         localStorage.setItem('azan_notifications', 'true');
     } else {
         localStorage.setItem('azan_notifications', 'false');
     }
  }, [soundEnabled]);

  // Fetch Live Timings (for Countdown)
  useEffect(() => {
    const fetchLiveTimings = async () => {
      try {
        const lat = location?.latitude || defaultLocation.latitude;
        const lng = location?.longitude || defaultLocation.longitude;
        const data = await getPrayerTimesByCoordinates(lat, lng, new Date());
        setLiveTimings(data.data.timings);
        
        // Update timezone display
        if (location && 'name' in location && location.name) {
           setTimezone(location.name.split(',')[0]);
        } else if (data.data.meta && data.data.meta.timezone) {
           setTimezone(data.data.meta.timezone.split('/').pop()?.replace('_', ' ') || 'موقعك التلقائي');
        }
      } catch (err) {
        console.error(err);
      }
    };
    if (!geoLoading) {
      fetchLiveTimings();
    }
  }, [location, geoLoading]);

  // Fetch Display Timings (for the selected date table)
  useEffect(() => {
    const fetchDisplayTimings = async () => {
      setLoading(true);
      try {
        const lat = location?.latitude || defaultLocation.latitude;
        const lng = location?.longitude || defaultLocation.longitude;
        const data = await getPrayerTimesByCoordinates(lat, lng, selectedDate);
        setDisplayTimings(data.data.timings);
        setHijriDate(data.data.date.hijri);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (!geoLoading) {
      fetchDisplayTimings();
    }
  }, [location, geoLoading, selectedDate]);

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const calculateTimingStatus = () => {
    if (!liveTimings) return { current: null, next: null, progress: 0, timeLeft: '00:00:00' };

    const prayers = [
      { id: 'Fajr', name: t('fajr'), icon: <Moon className="w-5 h-5"/>, time: liveTimings.Fajr },
      { id: 'Sunrise', name: t('sunrise'), icon: <Sunrise className="w-5 h-5"/>, time: liveTimings.Sunrise },
      { id: 'Dhuhr', name: t('dhuhr'), icon: <Sun className="w-5 h-5"/>, time: liveTimings.Dhuhr },
      { id: 'Asr', name: t('asr'), icon: <Sun className="w-5 h-5"/>, time: liveTimings.Asr },
      { id: 'Maghrib', name: t('maghrib'), icon: <Sunset className="w-5 h-5"/>, time: liveTimings.Maghrib },
      { id: 'Isha', name: t('isha'), icon: <Moon className="w-5 h-5 text-gray-200"/>, time: liveTimings.Isha }
    ];

    let nextPrayerIndex = prayers.findIndex(p => {
      const pTime = parse(p.time, 'HH:mm', now);
      return pTime > now;
    });

    let currentPrayerIndex = nextPrayerIndex - 1;
    let nextDate = new Date();
    let prevDate = new Date();

    if (nextPrayerIndex === -1) {
      // Past Isha, next is Fajr tomorrow
      nextPrayerIndex = 0;
      currentPrayerIndex = 5; // Isha today
      nextDate.setDate(nextDate.getDate() + 1);
    } else if (nextPrayerIndex === 0) {
      // Before Fajr, current is Isha yesterday
      currentPrayerIndex = 5;
      prevDate.setDate(prevDate.getDate() - 1);
    }

    const nextPrayer = prayers[nextPrayerIndex];
    const prevPrayer = prayers[currentPrayerIndex];

    const nextTimeParsed = parse(nextPrayer.time, 'HH:mm', nextDate);
    const prevTimeParsed = parse(prevPrayer.time, 'HH:mm', prevDate);

    const diffTotal = Math.abs(differenceInSeconds(nextTimeParsed, prevTimeParsed));
    const diffNow = Math.abs(differenceInSeconds(nextTimeParsed, now));
    const diffElapsed = Math.abs(differenceInSeconds(now, prevTimeParsed));

    const timeLeft = diffNow;
    
    const progress = Math.max(0, Math.min(100, ((diffTotal - diffNow) / diffTotal) * 100));

    // format hh:mm:ss
    const hours = Math.floor(timeLeft / 3600);
    const minutes = Math.floor((timeLeft % 3600) / 60);
    const seconds = timeLeft % 60;

    const eHours = Math.floor(diffElapsed / 3600);
    const eMinutes = Math.floor((diffElapsed % 3600) / 60);
    const eSeconds = diffElapsed % 60;
    
    const pad = (n: number) => n.toString().padStart(2, '0');

    return {
      prev: prevPrayer,
      next: nextPrayer,
      progress,
      timeLeft: `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`,
      timeElapsed: `${pad(eHours)}:${pad(eMinutes)}:${pad(eSeconds)}`
    };
  };

  const selectedDisplayPrayers = displayTimings ? [
    { id: 'Fajr', name: t('fajr'), icon: <Moon className="w-5 h-5"/>, time: displayTimings.Fajr },
    { id: 'Sunrise', name: t('sunrise'), icon: <Sunrise className="w-5 h-5"/>, time: displayTimings.Sunrise },
    { id: 'Dhuhr', name: t('dhuhr'), icon: <Sun className="w-5 h-5"/>, time: displayTimings.Dhuhr },
    { id: 'Asr', name: t('asr'), icon: <Sun className="w-5 h-5"/>, time: displayTimings.Asr },
    { id: 'Maghrib', name: t('maghrib'), icon: <Sunset className="w-5 h-5"/>, time: displayTimings.Maghrib },
    { id: 'Isha', name: t('isha'), icon: <Moon className="w-5 h-5 text-gray-200"/>, time: displayTimings.Isha }
  ] : [];

  const status = calculateTimingStatus();

  if (geoLoading || (!liveTimings && loading)) {
    return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-10 w-10 border-b-4 border-primary"></div></div>;
  }

  // Format time to 12h for Maghrib display
  const formatTime12h = (time24h: string) => {
    if (!time24h) return '';
    try {
        return format(parse(time24h, 'HH:mm', new Date()), 'h:mm a', { locale: ar }).replace('ص', 'ص').replace('م', 'م');
    } catch {
        return time24h;
    }
  };

  const SHARE_THEMES = [
    { bg: 'bg-[#103426] bg-[url("https://images.unsplash.com/photo-1542176342-a25ebbbdc1db?q=80&w=600&auto=format&fit=crop")]', overlay: 'bg-gradient-to-b from-black/80 to-[#103426]/90', text: 'text-emerald-50', accent: 'text-[#d8b472]' },
    { bg: 'bg-[#1e1b4b] bg-[url("https://images.unsplash.com/photo-1506452819128-4e8c177ce71b?q=80&w=600&auto=format&fit=crop")]', overlay: 'bg-gradient-to-b from-black/70 to-indigo-950/90', text: 'text-blue-50', accent: 'text-indigo-300' },
    { bg: 'bg-[#451a03] bg-[url("https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=600&auto=format&fit=crop")]', overlay: 'bg-gradient-to-b from-black/60 to-amber-950/90', text: 'text-amber-50', accent: 'text-amber-300' },
    { bg: 'bg-[#3b0764] bg-[url("https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=600&auto=format&fit=crop")]', overlay: 'bg-gradient-to-b from-black/70 to-purple-950/90', text: 'text-purple-50', accent: 'text-purple-300' },
    { bg: 'bg-[#0f172a] bg-[url("https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?q=80&w=600&auto=format&fit=crop")]', overlay: 'bg-gradient-to-b from-transparent to-slate-950/90', text: 'text-gray-100', accent: 'text-teal-300' },
  ];

  const shareTheme = SHARE_THEMES[shareThemeIndex];

  const handleDownload = async () => {
    if (!shareCardRef.current) return;
    try {
        setIsDownloading(true);
        const dataUrl = await htmlToImage.toPng(shareCardRef.current, { cacheBust: true });
        const link = document.createElement('a');
        link.download = `prayer-times-${timezone}.png`;
        link.href = dataUrl;
        link.click();
    } catch (err) {
        console.error('Error generating image', err);
    } finally {
        setIsDownloading(false);
    }
  };

  return (
    <div className="relative pt-6 px-4 pb-32 min-h-[100dvh] flex flex-col w-full">
      {/* Share Modal */}
      <AnimatePresence>
        {showShareModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm overflow-y-auto"
          >
            <div className="relative w-full max-w-[340px] sm:max-w-sm my-auto py-8 flex flex-col">
                <div className="flex justify-end mb-3">
                  <button 
                    onClick={() => setShowShareModal(false)}
                    className="p-2 text-white hover:text-white bg-white/20 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div 
                  id="share-card" 
                  ref={shareCardRef}
                  className={`relative overflow-hidden rounded-3xl shadow-2xl p-5 bg-cover bg-center ${shareTheme.bg}`}
                >
                  <div className={`absolute inset-0 ${shareTheme.overlay}`}></div>
                  
                  <div className="relative z-10 flex flex-col items-center text-center">
                    <h2 className={`text-xl font-bold mb-1.5 ${shareTheme.text}`}>{t('prayerTimes')}</h2>
                    <div className="flex items-center gap-1.5 opacity-90 mb-2 bg-white/10 px-3 py-1 rounded-full border border-white/5 backdrop-blur-sm">
                        <MapPin className={`w-3 h-3 ${shareTheme.text}`} />
                        <span className={`text-[11px] ${shareTheme.text}`}>{timezone}</span>
                    </div>
                    {hijriDate && (
                      <p className={`text-xs font-medium mb-3 ${shareTheme.accent}`}>
                        {localStorage.getItem('date_format') === 'short'
                            ? `${hijriDate.day} ${hijriDate.month.ar} ${hijriDate.year}`
                            : `${hijriDate.weekday.ar}، ${hijriDate.day} ${hijriDate.month.ar} ${hijriDate.year} هـ`}
                      </p>
                    )}

                    <div className="w-full space-y-1.5">
                      {selectedDisplayPrayers.map((p) => {
                        const isNext = p.id === status.next?.id && isSameDay(selectedDate, now);
                        return (
                          <div key={p.id} className={`flex justify-between items-center rounded-xl px-4 py-2 border ${isNext ? 'bg-white/20 border-white/30 backdrop-blur-md shadow-lg scale-[1.02] transition-transform' : 'bg-white/5 border-white/5 backdrop-blur-sm'}`}>
                            <div className="flex items-center gap-2">
                              <span className={shareTheme.text}>{p.icon}</span>
                              <span className={`text-[13px] font-bold ${shareTheme.text}`}>{p.name}</span>
                            </div>
                            <span className={`font-mono text-[15px] font-bold tracking-tight ${isNext ? shareTheme.accent : shareTheme.text}`}>{p.time}</span>
                          </div>
                        );
                      })}
                    </div>
                    
                    <div className="mt-4 pt-3 border-t border-white/10 w-full">
                        <p className={`text-[9px] opacity-80 ${shareTheme.text}`}>{t('createdBy')}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                   <button 
                      onClick={() => {
                          if (navigator.share) {
                              navigator.share({
                                  title: t('prayerTimes'),
                                  text: `${t('prayerTimes')} in ${timezone} - ${t('companion')}\n${t('fajr')}: ${displayTimings?.Fajr}\n${t('dhuhr')}: ${displayTimings?.Dhuhr}\n${t('asr')}: ${displayTimings?.Asr}\n${t('maghrib')}: ${displayTimings?.Maghrib}\n${t('isha')}: ${displayTimings?.Isha}`,
                              }).catch(() => {});
                          }
                      }}
                      className="bg-white/10 backdrop-blur-md text-white border border-white/20 py-2.5 rounded-xl font-bold shadow-lg hover:bg-white/20 transition-all flex items-center justify-center gap-2 text-sm"
                   >
                     <Share2 className="w-4 h-4" />
                     {t('shareText')}
                   </button>
                   <button 
                      onClick={handleDownload}
                      disabled={isDownloading}
                      className="bg-white text-[#103426] py-2.5 rounded-xl font-bold shadow-lg hover:scale-[1.02] transition-transform flex items-center justify-center gap-2 disabled:opacity-50 text-sm"
                   >
                     {isDownloading ? <AlertCircle className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                     حفظ الصورة
                   </button>
                </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background shape for top section */}
      <div className="absolute top-0 left-0 right-0 h-[380px] bg-gradient-to-br from-primary to-primary-dark rounded-b-[40px] -z-10 shadow-xl overflow-hidden">
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] mix-blend-overlay"></div>
          {/* Mosque Silhouette at the bottom of the green section */}
          <div className="absolute bottom-0 left-0 right-0 h-40 bg-[url('https://www.transparenttextures.com/patterns/mosque.png')] opacity-20 bg-repeat-x bg-bottom bg-contain mix-blend-plus-lighter"></div>
      </div>

      {/* Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }} 
        animate={{ y: 0, opacity: 1 }} 
        className="flex justify-between items-start text-white pb-6 pt-2"
      >
        <button 
          onClick={() => {
            setShareThemeIndex(Math.floor(Math.random() * 5));
            setShowShareModal(true);
          }} 
          className="p-2 hover:bg-white/10 rounded-full transition active:scale-95"
        >
          <Share2 className="w-6 h-6"/>
        </button>
        <div className="flex flex-col items-center text-center space-y-1">
           <h1 className="font-bold text-lg drop-shadow-sm mb-1 tracking-wide">{t('companion')}</h1>
           <div className="flex items-center space-x-1 space-x-reverse font-bold text-sm bg-black/10 px-3 py-1 rounded-full border border-white/10 backdrop-blur-sm">
               <MapPin className="w-3.5 h-3.5"/>
               <span>{timezone}</span>
           </div>
           {hijriDate && (
               <div className="text-xs text-white/90 pb-1 mt-1 font-medium">
                   {localStorage.getItem('date_format') === 'short' 
                       ? `${hijriDate.day} ${hijriDate.month.ar} ${hijriDate.year}`
                       : `${hijriDate.weekday.ar}، ${hijriDate.day} ${hijriDate.month.ar} ${hijriDate.year} هـ`}
               </div>
           )}
           <div className="text-[10px] text-white/70">
               {format(selectedDate, 'd MMMM yyyy م', { locale: ar })}
           </div>
        </div>
        <button onClick={() => navigate('/alerts')} className="p-2 hover:bg-white/10 rounded-full transition active:scale-95 relative">
          <AlertCircle className="w-6 h-6"/>
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
      </motion.div>

      {/* Main Counter Focus */}
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }} 
        transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 20 }}
        className="text-center w-full mt-4 mb-8"
      >
         <div 
             onClick={() => setShowElapsed(!showElapsed)}
             className="relative inline-block border border-secondary/30 rounded-[32px] p-6 bg-black/10 hover:bg-black/20 transition-colors backdrop-blur-md min-w-[280px] shadow-2xl cursor-pointer select-none"
         >
             <p className="text-lg text-white font-medium mb-1 opacity-90" dir="rtl">
                 {showElapsed ? `صلاة ${status.prev?.name}` : status.next?.name}
             </p>
             <div className="flex justify-center items-center gap-2 mb-4">
                 <div className="text-5xl font-bold tracking-tight text-white drop-shadow-md font-sans" dir="ltr">
                     {formatTime12h(showElapsed ? (status.prev?.time || '') : (status.next?.time || ''))}
                 </div>
             </div>
             <div className="inline-flex items-center justify-center gap-2.5 bg-white/10 px-4 py-1.5 rounded-full border border-white/10" dir="rtl">
                 <span className="text-xs text-white/90 font-medium">{showElapsed ? 'مضى عليها' : t('timeRemaining')}</span>
                 <span className="font-mono font-bold text-secondary text-sm" dir="ltr">{showElapsed ? status.timeElapsed : status.timeLeft}</span>
             </div>
             
             <button 
                 onClick={(e) => { e.stopPropagation(); setSoundEnabled(!soundEnabled); }}
                 className="absolute top-5 left-5 text-white opacity-70 hover:opacity-100 hover:scale-110 transition-transform"
             >
                 {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
             </button>
         </div>
      </motion.div>

      {/* Prayer Times Row Card */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }} 
        animate={{ y: 0, opacity: 1 }} 
        transition={{ delay: 0.2 }}
        onClick={() => setShowMonthlyModal(true)}
        className="glass-card rounded-[28px] p-5 relative w-full mb-8 shadow-sm cursor-pointer hover:shadow-md transition-shadow group"
      >
         <div className="absolute top-3 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-[10px] text-white/50">{t('prayerTimes')} الشهرية</span>
         </div>
         {loading && (
             <div className="absolute inset-0 bg-white/60 rounded-[28px] flex items-center justify-center z-10 backdrop-blur-sm">
                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
             </div>
         )}
         <div className="flex justify-between items-end text-center w-full overflow-x-auto hide-scrollbar py-2">
            {selectedDisplayPrayers.slice().reverse().map(p => {
               const isNext = p.id === status.next?.id && isSameDay(selectedDate, now);
               return (
                 <div key={p.id} className={`flex flex-col items-center space-y-2 px-1 sm:px-2 transition-transform duration-300 ${isNext ? 'text-primary font-bold scale-110 origin-bottom shadow-sm' : 'text-text-muted hover:text-text-main'}`}>
                    <span className="text-xs font-semibold whitespace-nowrap">{p.name}</span>
                    <span className="text-[0.95rem] font-mono tracking-tighter whitespace-nowrap">{p.time}</span>
                 </div>
               )
            })}
         </div>
      </motion.div>

      {/* Daily Content Sections */}
      <motion.div 
        initial={{ y: 30, opacity: 0 }} 
        animate={{ y: 0, opacity: 1 }} 
        transition={{ delay: 0.3 }}
        className="flex flex-col gap-4 mt-6 px-2 relative z-10 pb-4"
      >
          {/* Ayah & Tafseer - Larger */}
          <div className="glass-card rounded-[28px] shadow-sm p-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform duration-700">
                  <BookOpen className="w-32 h-32" />
              </div>
              <div className="flex items-center gap-3 mb-4 text-primary">
                  <BookOpen className="w-5 h-5 text-secondary" />
                  <h3 className="font-bold text-sm text-text-main">{t('ayahAndTafseer')}</h3>
              </div>
              <p className="text-xl font-quran text-text-main leading-loose mb-4 text-center">
                  "{dailyAyah.ayah}"
              </p>
              <p className="text-sm text-text-muted leading-relaxed">
                  تفسير السعدي: {dailyAyah.tafseer}
              </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
              {/* Daily Hadith */}
              <div className="glass-card rounded-[28px] shadow-sm p-5 relative overflow-hidden group">
                  <div className="flex items-center gap-2 mb-3 text-primary">
                      <BookOpen className="w-4 h-4 text-secondary" />
                      <h3 className="font-bold text-sm text-text-main">{t('dailyHadith')}</h3>
                  </div>
                  <p className="text-sm text-text-main leading-relaxed font-sans font-medium line-clamp-4">
                      قال رسول الله ﷺ: "{dailyHadith}"
                  </p>
              </div>

              {/* Daily Duaa */}
              <div className="glass-card rounded-[28px] shadow-sm p-5 relative overflow-hidden group">
                  <div className="flex items-center gap-2 mb-3 text-primary">
                      <BookOpen className="w-4 h-4 text-secondary" />
                      <h3 className="font-bold text-sm text-text-main">{t('dailyDuaa')}</h3>
                  </div>
                  <p className="text-sm text-text-main leading-relaxed font-sans font-medium line-clamp-4">
                      "{dailyDuaa}"
                  </p>
              </div>
          </div>

          {/* Daily Deeds Link */}
          <div onClick={() => navigate('/deeds')} className="glass-card rounded-[28px] shadow-sm hover:shadow-md transition-all p-5 flex flex-row items-center justify-between cursor-pointer group">
              <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/5 rounded-[18px] flex items-center justify-center group-hover:bg-primary/10 transition-colors shrink-0">
                      <Check className="w-6 h-6 text-secondary" />
                  </div>
                  <div>
                      <h3 className="font-bold text-text-main">{t('dailyDeeds')}</h3>
                      <p className="text-xs text-text-muted mt-1">{t('dailyDeedsDesc')}</p>
                  </div>
              </div>
          </div>
      </motion.div>

      <MonthlyPrayerTimes isOpen={showMonthlyModal} onClose={() => setShowMonthlyModal(false)} />
    </div>
  );
};
