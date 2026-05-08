import React, { useEffect, useState, useRef } from 'react';
import { useGeolocation } from '../hooks/useGeolocation';
import { getPrayerTimesByCoordinates, PrayerTimings } from '../services/alAdhan';
import { VolumeX, Volume2, X } from 'lucide-react';

export const azanReciters = [
  { id: 'makkah', name: 'أذان مكة المكرمة', url: 'https://masjidussunnah.co.uk/wp-content/uploads/2021/04/Makkah-Adhan.mp3' },
  { id: 'madinah', name: 'أذان المدينة المنورة', url: 'https://masjidussunnah.co.uk/wp-content/uploads/2021/04/Madinah-Adhan.mp3' },
  { id: 'egypt', name: 'الأذان المصري', url: 'https://masjidussunnah.co.uk/wp-content/uploads/2021/04/Egypt-Adhan.mp3' },
  { id: 'mishary', name: 'مشاري العفاسي', url: 'https://masjidussunnah.co.uk/wp-content/uploads/2021/04/Mishary-Alafasi-Adhan.mp3' }
];

export const AzanPlayer: React.FC = () => {
  const { location, loading: geoLoading } = useGeolocation();
  const [timings, setTimings] = useState<PrayerTimings | null>(null);
  const [currentPrayer, setCurrentPrayer] = useState<{name: string, time: string, type?: string} | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [adhanPlayedToday, setAdhanPlayedToday] = useState<Set<string>>(new Set());

  // Tripoli fallback
  const defaultLocation = { latitude: 32.8872, longitude: 13.1913 };

  // Fetch timings daily
  useEffect(() => {
    const fetchTimings = async () => {
      try {
        const lat = location?.latitude || defaultLocation.latitude;
        const lng = location?.longitude || defaultLocation.longitude;
        const data = await getPrayerTimesByCoordinates(lat, lng, new Date());
        setTimings(data.data.timings);
      } catch (err) {
        console.error("Failed to fetch timings for Azan", err);
      }
    };
    if (!geoLoading) {
      fetchTimings();
    }
    
    // Refresh timings at midnight
    const now = new Date();
    const msToMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime() - now.getTime();
    const timeout = setTimeout(() => {
      fetchTimings();
      setAdhanPlayedToday(new Set()); // Reset played prayers
    }, msToMidnight);
    
    return () => clearTimeout(timeout);
  }, [location, geoLoading]);

  // Check time every 10 seconds
  useEffect(() => {
    if (!timings) return;
        const interval = setInterval(() => {
      const now = new Date();
      const currentH = now.getHours().toString().padStart(2, '0');
      const currentM = now.getMinutes().toString().padStart(2, '0');
      const currentTimeString = `${currentH}:${currentM}`;

      const addMinutes = (timeStr: string, mins: number) => {
          const [h, m] = timeStr.split(':').map(Number);
          const d = new Date();
          d.setHours(h, m + mins, 0, 0);
          return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
      };

      const prayersToAlert = [
        { id: 'Fajr', name: 'الفجر', type: 'azan', time: timings.Fajr.split(' ')[0] },
        { id: 'Dhuhr', name: 'الظهر', type: 'azan', time: timings.Dhuhr.split(' ')[0] },
        { id: 'Asr', name: 'العصر', type: 'azan', time: timings.Asr.split(' ')[0] },
        { id: 'Maghrib', name: 'المغرب', type: 'azan', time: timings.Maghrib.split(' ')[0] },
        { id: 'Isha', name: 'العشاء', type: 'azan', time: timings.Isha.split(' ')[0] },
        
        { id: 'Fajr_Iqamah', name: 'الفجر', type: 'iqamah', time: addMinutes(timings.Fajr.split(' ')[0], 20) },
        { id: 'Dhuhr_Iqamah', name: 'الظهر', type: 'iqamah', time: addMinutes(timings.Dhuhr.split(' ')[0], 15) },
        { id: 'Asr_Iqamah', name: 'العصر', type: 'iqamah', time: addMinutes(timings.Asr.split(' ')[0], 15) },
        { id: 'Maghrib_Iqamah', name: 'المغرب', type: 'iqamah', time: addMinutes(timings.Maghrib.split(' ')[0], 10) },
        { id: 'Isha_Iqamah', name: 'العشاء', type: 'iqamah', time: addMinutes(timings.Isha.split(' ')[0], 15) }
      ];

      for (const prayer of prayersToAlert) {
         if (prayer.time === currentTimeString) {
             const key = `${prayer.id}-${new Date().toLocaleDateString()}`;
             if (!adhanPlayedToday.has(key)) {
                 const settingsEnabled = localStorage.getItem('azan_notifications') !== 'false';
                 if (settingsEnabled) {
                     setCurrentPrayer({ name: prayer.name, time: prayer.time, type: prayer.type });
                     if (prayer.type === 'azan') {
                         handlePlayAzan();
                     } else {
                         // Vibrate for Iqamah if supported
                         if (navigator.vibrate) {
                             navigator.vibrate([500, 200, 500]);
                         }
                     }
                 }
                 setAdhanPlayedToday(prev => new Set(prev).add(key));
             }
         }
      }
    }, 10000); // Check every 10 sec

    return () => clearInterval(interval);
  }, [timings, adhanPlayedToday]);

  const handlePlayAzan = () => {
      if (audioRef.current) {
          audioRef.current.play().then(() => {
              setIsPlaying(true);
          }).catch((err) => {
              console.log("Audio play blocked by browser. User interaction needed.", err);
              // Show prompt anyway even if not auto-played
          });
      }
  };

  const stopAzan = () => {
      if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
          setIsPlaying(false);
      }
      setCurrentPrayer(null);
  };

  const getAudioUrl = () => {
      const savedId = localStorage.getItem('azan_reciter') || 'makkah';
      const reciter = azanReciters.find(r => r.id === savedId) || azanReciters[0];
      return reciter.url;
  };

  return (
      <>
        <audio ref={audioRef} src={getAudioUrl()} onEnded={() => { setIsPlaying(false); setCurrentPrayer(null); }} />
        {currentPrayer && (
          <div className="fixed top-0 left-0 right-0 z-[100] p-4 pt-safe animate-in slide-in-from-top-4 fade-in duration-300 pointer-events-none">
              <div className="bg-gradient-to-r from-green-800 to-green-900 rounded-2xl p-4 shadow-2xl border border-green-500/30 flex items-center justify-between pointer-events-auto max-w-sm mx-auto">
                  <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center shrink-0">
                          <Volume2 className="w-5 h-5 text-green-300 animate-pulse" />
                      </div>
                      <div className="flex flex-col">
                          <span className="text-white font-bold text-sm">
                              {currentPrayer.type === 'iqamah' ? `إقامة صلاة ${currentPrayer.name}` : `أذان ${currentPrayer.name}`}
                          </span>
                          <span className="text-green-200 text-xs font-mono">{currentPrayer.time}</span>
                      </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                       {currentPrayer.type === 'iqamah' ? (
                          <button 
                              onClick={stopAzan}
                              className="w-8 h-8 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full text-white transition"
                          >
                              <X className="w-4 h-4" />
                          </button>
                       ) : isPlaying ? (
                          <button 
                              onClick={stopAzan}
                              className="w-8 h-8 flex items-center justify-center bg-red-500/20 hover:bg-red-500/30 rounded-full text-red-200 transition"
                              title="إيقاف الأذان"
                          >
                              <VolumeX className="w-4 h-4" />
                          </button>
                       ) : (
                          <button 
                              onClick={handlePlayAzan}
                              className="px-3 py-1.5 bg-green-500 text-white hover:bg-green-400 rounded-xl font-bold text-xs shadow-lg shadow-green-500/30 transition flex items-center gap-1"
                          >
                              <Volume2 className="w-3 h-3" />
                              تشغيل
                          </button>
                       )}
                  </div>
              </div>
          </div>
        )}
      </>
  );
};
