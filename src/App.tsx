import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { AzanPlayer } from './components/AzanPlayer';
import { BookOpen, Compass, Settings as SettingsIcon, BookOpenText, Home, Loader2, MoonStar, MoreHorizontal, Fingerprint } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useLanguage } from './contexts/LanguageContext';

const PrayerTimes = React.lazy(() => import('./components/PrayerTimes').then(m => ({ default: m.PrayerTimes })));
const Qibla = React.lazy(() => import('./components/Qibla').then(m => ({ default: m.Qibla })));
const QuranList = React.lazy(() => import('./components/QuranList').then(m => ({ default: m.QuranList })));
const AthkarView = React.lazy(() => import('./components/AthkarView').then(m => ({ default: m.AthkarView })));
const SurahView = React.lazy(() => import('./components/SurahView').then(m => ({ default: m.SurahView })));
const Settings = React.lazy(() => import('./components/Settings').then(m => ({ default: m.Settings })));
const About = React.lazy(() => import('./components/About').then(m => ({ default: m.About })));
const Tasbeeh = React.lazy(() => import('./components/Tasbeeh').then(m => ({ default: m.Tasbeeh })));
const AlertsView = React.lazy(() => import('./components/AlertsView').then(m => ({ default: m.AlertsView })));
const DailyDeeds = React.lazy(() => import('./components/DailyDeeds').then(m => ({ default: m.DailyDeeds })));
const IslamicEvents = React.lazy(() => import('./components/IslamicEvents').then(m => ({ default: m.IslamicEvents })));

import { SplashScreen } from './components/SplashScreen';

const LoadingScreen = () => (
  <div className="flex-1 flex items-center justify-center h-full w-full">
     <div className="w-10 h-10 border-4 border-[#103426]/20 border-t-[#103426] rounded-full animate-spin"></div>
  </div>
);

const AnimatedRoutes = () => {
  const location = useLocation();

  React.useEffect(() => {
    const fsize = localStorage.getItem('font_size');
    if (fsize) {
        let px = '16px';
        if (fsize === '0.9x') px = '14.4px';
        if (fsize === '1.1x') px = '17.6px';
        if (fsize === '1.2x') px = '19.2px';
        document.documentElement.style.fontSize = px;
    }
  }, []);

    return (
    <AnimatePresence mode="popLayout" initial={false}>
      {/* @ts-ignore */}
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="w-full"><PrayerTimes /></motion.div>} />
        <Route path="/qibla" element={<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="w-full"><Qibla /></motion.div>} />
        <Route path="/quran" element={<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="w-full"><QuranList /></motion.div>} />
        <Route path="/quran/:id" element={<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="w-full"><SurahView /></motion.div>} />
        <Route path="/athkar" element={<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="w-full"><AthkarView /></motion.div>} />
        <Route path="/tasbeeh" element={<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="w-full"><Tasbeeh /></motion.div>} />
        <Route path="/alerts" element={<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="w-full"><AlertsView /></motion.div>} />
        <Route path="/deeds" element={<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="w-full"><DailyDeeds /></motion.div>} />
        <Route path="/events" element={<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="w-full"><IslamicEvents /></motion.div>} />
        <Route path="/settings" element={<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="w-full"><Settings /></motion.div>} />
        <Route path="/about" element={<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="w-full"><About /></motion.div>} />
      </Routes>
    </AnimatePresence>
  );
};

const ScrollToTop = () => {
  const location = useLocation();
  React.useEffect(() => {
    const mainElement = document.getElementById('main-scroll-container');
    if (mainElement) {
      mainElement.scrollTo(0, 0);
    }
  }, [location.pathname]);
  return null;
};

function AppContent() {
  const [direction, setDirection] = React.useState('rtl');
  const location = useLocation();
  const navigate = useNavigate();
  const isSurahView = location.pathname.startsWith('/quran/') && location.pathname !== '/quran';
  const { t } = useLanguage();

  React.useEffect(() => {
    // Check local storage for theme
    const theme = localStorage.getItem('theme');
    if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Check language
    const lang = localStorage.getItem('app_language') || 'ar';
    setDirection(lang === 'ar' ? 'rtl' : 'ltr');

    // Setup Athkar Notifications
    const checkNotifications = (forceTest = false) => {
      const enabled = localStorage.getItem('athkar_notifications') === 'true';
      if (!enabled || !("Notification" in window) || Notification.permission !== 'granted') return;
      
      const lastNotify = localStorage.getItem('last_athkar_notify');
      const now = Date.now();
      
      // Calculate mins since last notification
      const elapsedMins = lastNotify ? Math.floor((now - parseInt(lastNotify)) / (1000 * 60)) : Infinity;
      
      // Show if forced or every 30 mins
      if (forceTest || elapsedMins >= 30) {
         const athkarList = [
           "سبحان الله وبحمده",
           "استغفر الله العظيم واتوب اليه",
           "لا إله إلا الله وحده لا شريك له",
           "اللهم صل وسلم على نبينا محمد",
           "سبحان الله العظيم",
           "لا حول ولا قوة إلا بالله"
         ];
         const thikr = athkarList[Math.floor(Math.random() * athkarList.length)];
         
         try {
           new Notification("ألا بذكر الله تطمئن القلوب 🌙", {
              body: thikr,
              icon: "/icons/icon-192x192.png", // Will default if icon is not found
              tag: "athkar-notify",
              requireInteraction: false
           });
           localStorage.setItem('last_athkar_notify', now.toString());
         } catch(e) {
           console.log("Notifications not supported or blocked.", e);
         }
      }
    };
    
    // Test on load if enabled
    checkNotifications();
    
    // Check every 5 minutes
    const interval = setInterval(() => checkNotifications(false), 1000 * 60 * 5); 
    
    // Keep reference globally so settings toggle can trigger it immediately
    (window as any).triggerAthkarNotification = () => checkNotifications(true);

    return () => clearInterval(interval);
  }, []);

  return (
    <div dir={direction} className="h-[100dvh] w-full bg-background text-text-main font-sans relative overflow-hidden flex flex-col">
      <AzanPlayer />
      <main id="main-scroll-container" className="max-w-md w-full mx-auto relative z-10 flex-1 overflow-y-auto overflow-x-hidden hide-scrollbar">
        <Suspense fallback={<LoadingScreen />}>
           <AnimatedRoutes />
        </Suspense>
      </main>

      <AnimatePresence>
        {!isSurahView && (
          <motion.nav 
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-0 left-0 right-0 glass-nav safe-area-pb pb-safe z-40 text-text-muted shadow-[0_-10px_30px_rgba(138,158,89,0.05)] rounded-t-[32px]"
          >
            <div className="flex justify-between items-center h-[70px] sm:h-[80px] max-w-md mx-auto px-6 w-full relative">
              <NavLink 
                to="/" 
                className={({isActive}) => `flex flex-col items-center justify-center flex-1 h-full space-y-1 transition-all outline-none duration-300 ease-out group relative z-10 ${isActive ? 'text-primary' : 'text-text-muted hover:text-primary-light'}`}
              >
                {({isActive}) => (
                  <>
                     {isActive && <motion.div layoutId="nav-bg" className="absolute top-1 bottom-1 left-2 right-2 sm:left-3 sm:right-3 bg-primary/10 rounded-2xl -z-10"></motion.div>}
                     <Home className={`transition-all duration-300 ${isActive ? 'w-6 h-6' : 'w-5 h-5'}`} strokeWidth={isActive ? 2.5 : 2} />
                     <span className={`text-[9px] sm:text-[11px] font-bold tracking-wide transition-opacity duration-300 hidden sm:block md:block lg:block ${isActive ? '!block' : ''}`}>{t('home')}</span>
                  </>
                )}
              </NavLink>
              
              <NavLink 
                to="/quran" 
                onClick={(e) => {
                   e.preventDefault();
                   const lastRead = localStorage.getItem('last_surah') || '1';
                   navigate(`/quran/${lastRead}`);
                }}
                className={({isActive}) => {
                  return `flex flex-col items-center justify-center flex-1 h-full space-y-1 transition-all outline-none duration-300 ease-out group relative z-10 ${isActive ? 'text-primary' : 'text-text-muted hover:text-primary-light'}`;
                }}
              >
                {({isActive}) => {
                   return (
                   <>
                     {isActive && <motion.div layoutId="nav-bg" className="absolute top-1 bottom-1 left-2 right-2 sm:left-3 sm:right-3 bg-primary/10 rounded-2xl -z-10"></motion.div>}
                     <BookOpenText className={`transition-all duration-300 ${isActive ? 'w-6 h-6' : 'w-5 h-5'}`} strokeWidth={isActive ? 2.5 : 2} />
                     <span className={`text-[9px] sm:text-[11px] font-bold tracking-wide transition-opacity duration-300 hidden sm:block md:block lg:block ${isActive ? '!block' : ''}`}>{t('quran')}</span>
                   </>
                )}}
              </NavLink>

              <NavLink 
                to="/athkar" 
                className={({isActive}) => {
                   return `flex flex-col items-center justify-center flex-1 h-full space-y-1 transition-all outline-none duration-300 ease-out group relative z-10 ${isActive ? 'text-primary' : 'text-text-muted hover:text-primary-light'}`;
                }}
              >
                {({isActive}) => {
                   return (
                   <>
                     {isActive && <motion.div layoutId="nav-bg" className="absolute top-1 bottom-1 left-2 right-2 sm:left-3 sm:right-3 bg-primary/10 rounded-2xl -z-10"></motion.div>}
                     <MoonStar className={`transition-all duration-300 ${isActive ? 'w-6 h-6' : 'w-5 h-5'}`} strokeWidth={isActive ? 2.5 : 2} />
                     <span className={`text-[9px] sm:text-[11px] font-bold tracking-wide transition-opacity duration-300 hidden sm:block md:block lg:block ${isActive ? '!block' : ''}`}>{t('athkar')}</span>
                   </>
                )}}
              </NavLink>

              <NavLink 
                to="/qibla" 
                className={({isActive}) => {
                   return `flex flex-col items-center justify-center flex-1 h-full space-y-1 transition-all outline-none duration-300 ease-out group relative z-10 ${isActive ? 'text-primary' : 'text-text-muted hover:text-primary-light'}`;
                }}
              >
                {({isActive}) => {
                   return (
                   <>
                     {isActive && <motion.div layoutId="nav-bg" className="absolute top-1 bottom-1 left-2 right-2 sm:left-3 sm:right-3 bg-primary/10 rounded-2xl -z-10"></motion.div>}
                     <Compass className={`transition-all duration-300 ${isActive ? 'w-6 h-6' : 'w-5 h-5'}`} strokeWidth={isActive ? 2.5 : 2} />
                     <span className={`text-[9px] sm:text-[11px] font-bold tracking-wide transition-opacity duration-300 hidden sm:block md:block lg:block ${isActive ? '!block' : ''}`}>{t('qibla')}</span>
                   </>
                )}}
              </NavLink>

              <NavLink 
                to="/tasbeeh" 
                className={({isActive}) => {
                   return `flex flex-col items-center justify-center flex-1 h-full space-y-1 transition-all outline-none duration-300 ease-out group relative z-10 ${isActive ? 'text-primary' : 'text-text-muted hover:text-primary-light'}`;
                }}
              >
                {({isActive}) => {
                   return (
                   <>
                     {isActive && <motion.div layoutId="nav-bg" className="absolute top-1 bottom-1 left-2 right-2 sm:left-3 sm:right-3 bg-primary/10 rounded-2xl -z-10"></motion.div>}
                     <Fingerprint className={`transition-all duration-300 ${isActive ? 'w-6 h-6' : 'w-5 h-5'}`} strokeWidth={isActive ? 2.5 : 2} />
                     <span className={`text-[9px] sm:text-[11px] font-bold tracking-wide transition-opacity duration-300 hidden sm:block md:block lg:block ${isActive ? '!block' : ''}`}>{t('tasbeeh')}</span>
                   </>
                )}}
              </NavLink>

              <NavLink 
                to="/settings" 
                className={({isActive}) => `flex flex-col items-center justify-center flex-1 h-full space-y-1 transition-all outline-none duration-300 ease-out group relative z-10 ${isActive ? 'text-primary' : 'text-text-muted hover:text-primary-light'}`}
              >
                {({isActive}) => (
                  <>
                     {isActive && <motion.div layoutId="nav-bg" className="absolute top-1 bottom-1 left-2 right-2 sm:left-3 sm:right-3 bg-primary/10 rounded-2xl -z-10"></motion.div>}
                     <MoreHorizontal className={`transition-all duration-300 ${isActive ? 'w-6 h-6' : 'w-5 h-5'}`} strokeWidth={isActive ? 2.5 : 2} />
                     <span className={`text-[9px] sm:text-[11px] font-bold tracking-wide transition-opacity duration-300 hidden sm:block md:block lg:block ${isActive ? '!block' : ''}`}>{t('more')}</span>
                  </>
                )}
              </NavLink>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </div>
  );
}

const AppWrapper = () => {
  const [showSplash, setShowSplash] = React.useState(true);

  return (
    <BrowserRouter>
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
      <AppContent />
    </BrowserRouter>
  );
};

export default AppWrapper;

