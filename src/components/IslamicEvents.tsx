import React, { useMemo, useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ChevronRight, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface IslamicEvent {
  id: string;
  nameAr: string;
  hijriMonth: number;
  hijriDay: number;
}

const CONSTANT_EVENTS: IslamicEvent[] = [
  { id: '1', nameAr: 'رأس السنة الهجرية', hijriMonth: 1, hijriDay: 1 },
  { id: '2', nameAr: 'يوم عاشوراء', hijriMonth: 1, hijriDay: 10 },
  { id: '3', nameAr: 'المولد النبوي الشريف', hijriMonth: 3, hijriDay: 12 },
  { id: '4', nameAr: 'الإسراء والمعراج', hijriMonth: 7, hijriDay: 27 },
  { id: '5', nameAr: 'النصف من شعبان', hijriMonth: 8, hijriDay: 15 },
  { id: '6', nameAr: 'بداية شهر رمضان', hijriMonth: 9, hijriDay: 1 },
  { id: '7', nameAr: 'عيد الفطر المبارك', hijriMonth: 10, hijriDay: 1 },
  { id: '8', nameAr: 'يوم عرفة', hijriMonth: 12, hijriDay: 9 },
  { id: '9', nameAr: 'عيد الأضحى المبارك', hijriMonth: 12, hijriDay: 10 },
];

const hijriMonthsAr = [
  '', 'محرم', 'صفر', 'ربيع الأول', 'ربيع الآخر', 'جمادى الأولى', 'جمادى الآخرة',
  'رجب', 'شعبان', 'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'
];

function getUpcomingEvents() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const formatter = new Intl.DateTimeFormat('en-US-u-ca-islamic-umalqura', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric'
    });

    const getHijri = (d: Date) => {
        const parts = formatter.formatToParts(d);
        const m = parseInt(parts.find(p => p.type === 'month')?.value || '0', 10);
        const day = parseInt(parts.find(p => p.type === 'day')?.value || '0', 10);
        const yStr = parts.find(p => p.type === 'year')?.value || '0';
        const y = parseInt(yStr.replace(/\D/g, ''), 10); // remove ' AH' if present
        return { m, day, y };
    };

    const eventsFound: (IslamicEvent & { gDate: Date, remainingDays: number, hijriYear: number })[] = [];
    const foundIds = new Set<string>();

    for (let i = 0; i <= 360; i++) {
        const currentDate = new Date(today);
        currentDate.setDate(today.getDate() + i);
        
        const hijri = getHijri(currentDate);

        for (const ev of CONSTANT_EVENTS) {
            if (!foundIds.has(ev.id) && ev.hijriMonth === hijri.m && ev.hijriDay === hijri.day) {
                foundIds.add(ev.id);
                eventsFound.push({
                    ...ev,
                    gDate: currentDate,
                    remainingDays: i,
                    hijriYear: hijri.y
                });
            }
        }

        if (foundIds.size === CONSTANT_EVENTS.length) break;
    }

    return eventsFound.sort((a, b) => a.remainingDays - b.remainingDays);
}

export const IslamicEvents: React.FC = () => {
    const navigate = useNavigate();
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000); // update every minute
        return () => clearInterval(timer);
    }, []);

    const upcomingEvents = useMemo(() => getUpcomingEvents(), []);

    const formatDateG = (d: Date) => {
        return new Intl.DateTimeFormat('ar-SA', { day: 'numeric', month: 'long', year: 'numeric' }).format(d);
    };

    const getRemainingTimeString = (eventDate: Date, remainingDays: number) => {
        if (remainingDays === 0) return 'اليوم';
        if (remainingDays === 1) return 'غداً';
        
        // Let's add hours/minutes for the nearest event if it's within a few days
        if (remainingDays <= 3) {
            const now = new Date();
            const target = new Date(eventDate);
            target.setHours(0,0,0,0);
            
            // If it's technically > 0ms
            const diffTime = target.getTime() - now.getTime();
            if (diffTime > 0) {
                 const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                 const diffHours = Math.floor((diffTime / (1000 * 60 * 60)) % 24);
                 return `بعد ${diffDays > 0 ? `${diffDays} يوم و ` : ''}${diffHours} ساعة`;
            }
        }
        return `بعد ${remainingDays} يوم`;
    };

    return (
        <div className="pt-6 px-4 mt-6 space-y-6 pb-24 max-w-full text-text-main">
            <div className="flex items-center space-x-3 space-x-reverse mb-6">
                <button 
                    onClick={() => navigate(-1)} 
                    className="p-2 bg-surface rounded-full shadow-sm text-text-muted hover:bg-black/5 dark:hover:bg-white/5 transition"
                >
                    <ChevronRight className="w-6 h-6" />
                </button>
                <h2 className="text-2xl font-bold text-primary-dark dark:text-primary-light">المناسبات الإسلامية</h2>
            </div>

            <div className="space-y-4">
                {upcomingEvents.map((ev, index) => {
                    const isUpcomingSoon = ev.remainingDays <= 30;
                    
                    return (
                        <motion.div 
                            key={ev.id}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: index * 0.05 }}
                            className={`rounded-[24px] p-5 shadow-sm border ${
                                index === 0 
                                  ? 'bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20' 
                                  : 'bg-surface border-black/5 dark:border-white/5'
                            }`}
                        >
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h3 className={`text-lg font-bold mb-1 ${index === 0 ? 'text-primary-dark dark:text-primary-light' : 'text-text-main'}`}>
                                        {ev.nameAr}
                                    </h3>
                                    <div className="flex items-center gap-1.5 text-sm text-text-muted font-medium">
                                        <CalendarIcon className="w-4 h-4" />
                                        <span>{ev.hijriDay} {hijriMonthsAr[ev.hijriMonth]} {ev.hijriYear} هـ</span>
                                    </div>
                                </div>
                                <div className={`flex flex-col items-center justify-center p-3 rounded-2xl min-w-[70px] ${
                                    index === 0 ? 'bg-primary text-white shadow-md' : 'bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 text-text-main'
                                }`}>
                                    <span className="text-xl font-bold leading-none mb-1">{ev.remainingDays}</span>
                                    <span className="text-[10px] font-medium">{ev.remainingDays === 1 ? 'يوم' : ev.remainingDays === 2 ? 'يومان' : ev.remainingDays <= 10 ? 'أيام' : 'يوماً'}</span>
                                </div>
                            </div>
                            
                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-black/5 dark:border-white/5">
                                <span className="text-sm text-text-muted">{formatDateG(ev.gDate)}</span>
                                <div className={`flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full ${
                                    index === 0
                                      ? 'text-primary-dark dark:text-primary-light bg-primary/10'
                                      : isUpcomingSoon 
                                        ? 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10'
                                        : 'text-text-muted bg-black/5 dark:bg-white/5'
                                }`}>
                                    <Clock className="w-3.5 h-3.5" />
                                    <span>{getRemainingTimeString(ev.gDate, ev.remainingDays)}</span>
                                </div>
                            </div>
                            
                            {/* Make a mini progress bar if it's the very next event and remaining days is low */}
                            {index === 0 && ev.remainingDays > 0 && ev.remainingDays <= 30 && (
                                <div className="mt-4 w-full h-1.5 bg-primary/10 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-primary rounded-full transition-all"
                                        style={{ width: `${Math.max(5, 100 - (ev.remainingDays / 30) * 100)}%` }}
                                    />
                                </div>
                            )}
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};
