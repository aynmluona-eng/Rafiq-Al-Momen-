import React, { useEffect, useState } from 'react';
import { getMonthlyPrayerTimesByCoordinates, AlAdhanResponse } from '../services/alAdhan';
import { useGeolocation } from '../hooks/useGeolocation';
import { format, isSameDay } from 'date-fns';
import { ar } from 'date-fns/locale';
import { X, Calendar as CalendarIcon, ChevronRight, ChevronLeft, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';

interface MonthlyPrayerTimesProps {
    isOpen: boolean;
    onClose: () => void;
}

export const MonthlyPrayerTimes: React.FC<MonthlyPrayerTimesProps> = ({ isOpen, onClose }) => {
    const { location } = useGeolocation();
    const { t } = useLanguage();
    const [monthlyData, setMonthlyData] = useState<AlAdhanResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [currentDate, setCurrentDate] = useState(new Date());

    const defaultLocation = { latitude: 32.8872, longitude: 13.1913 }; // Tripoli fallback

    useEffect(() => {
        if (!isOpen) return;

        const fetchMonthlyData = async () => {
            setLoading(true);
            try {
                const lat = location?.latitude || defaultLocation.latitude;
                const lng = location?.longitude || defaultLocation.longitude;
                const data = await getMonthlyPrayerTimesByCoordinates(lat, lng, currentDate.getFullYear(), currentDate.getMonth() + 1); // Note: getMonth() is 0-indexed, but API expects 1-12. Assuming API handles this or needs +1, check logic. AlAdhan API expects month 1-12.
                setMonthlyData(data);
            } catch (err) {
                console.error("Error fetching monthly prayer times:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchMonthlyData();
    }, [isOpen, location, currentDate]);

    const handlePreviousMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="fixed inset-0 z-[60] flex flex-col bg-[#f8fafc] dark:bg-[#0f111a] text-text-main overflow-hidden"
            >
                {/* Header */}
                <div className="bg-white/80 dark:bg-[#0f111a]/80 backdrop-blur-xl p-4 flex items-center justify-between z-20 border-b border-gray-200 dark:border-white/5 pt-10 sm:pt-6 shrink-0">
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors"
                    >
                        <X className="w-6 h-6 text-text-main" />
                    </button>
                    <div className="flex items-center gap-2">
                        <h2 className="font-bold text-lg text-text-main">{t('prayerTimes')} - شهري</h2>
                        <CalendarIcon className="w-5 h-5 text-primary" />
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-4 py-6 scroll-smooth space-y-4">
                    {/* Month Navigator */}
                    <div className="flex items-center justify-between glass-card rounded-2xl p-4 sticky top-0 z-10 shadow-sm border border-gray-200 dark:border-white/5 bg-white/90 dark:bg-[#1a1d2d]/90 backdrop-blur-md">
                        <button onClick={handlePreviousMonth} className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition text-text-main">
                            <ChevronRight className="w-5 h-5" />
                        </button>
                        <h3 className="font-bold text-lg text-primary drop-shadow-sm">
                            {format(currentDate, 'MMMM yyyy', { locale: ar })}
                        </h3>
                        <button onClick={handleNextMonth} className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition text-text-main">
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center py-20 flex-col gap-4">
                            <Loader2 className="w-10 h-10 animate-spin text-primary" />
                            <span className="text-text-muted text-sm font-medium">جاري التحميل...</span>
                        </div>
                    ) : (
                        <div className="space-y-3 pb-8">
                            {monthlyData.map((dayData, index) => {
                                const timeStamp = Number(dayData.data.date.timestamp) * 1000;
                                const isToday = isSameDay(new Date(timeStamp), new Date());
                                const dateObj = new Date(timeStamp);
                                
                                const prayerTimes = [
                                    { name: t('fajr'), time: dayData.data.timings.Fajr },
                                    { name: t('sunrise'), time: dayData.data.timings.Sunrise },
                                    { name: t('dhuhr'), time: dayData.data.timings.Dhuhr },
                                    { name: t('asr'), time: dayData.data.timings.Asr },
                                    { name: t('maghrib'), time: dayData.data.timings.Maghrib },
                                    { name: t('isha'), time: dayData.data.timings.Isha },
                                ];

                                return (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.02 }}
                                        key={index} 
                                        className={`glass-card rounded-2xl p-4 border transition-colors ${isToday ? 'border-primary shadow-md bg-primary/5' : 'border-gray-100 dark:border-white/5'}`}
                                    >
                                        <div className="flex justify-between items-center mb-4 border-b border-gray-100 dark:border-white/5 pb-2">
                                            <div className="flex items-center gap-2">
                                                <span className={`text-xl font-bold ${isToday ? 'text-primary' : 'text-text-main'}`}>
                                                    {format(dateObj, 'dd')}
                                                </span>
                                                <span className={`text-sm font-medium ${isToday ? 'text-primary/80' : 'text-text-muted'}`}>
                                                    {format(dateObj, 'MMMM', { locale: ar })}
                                                </span>
                                            </div>
                                            <span className={`text-sm font-bold ${isToday ? 'text-primary' : 'text-text-muted'}`}>
                                                {format(dateObj, 'EEEE', { locale: ar })}
                                            </span>
                                        </div>
                                        
                                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-y-4 gap-x-2">
                                            {prayerTimes.map((pt, idx) => (
                                                <div key={idx} className="flex flex-col items-center justify-center bg-gray-50 dark:bg-white/5 rounded-xl py-2 px-1">
                                                    <span className="text-[10px] text-text-muted mb-1 font-medium">{pt.name}</span>
                                                    <span className={`text-xs xl:text-sm font-bold font-mono ${isToday ? 'text-primary' : 'text-text-main'}`}>
                                                        {pt.time.replace(/ *\([^)]*\) */g, "")}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </motion.div>
        </AnimatePresence>
    );
};
