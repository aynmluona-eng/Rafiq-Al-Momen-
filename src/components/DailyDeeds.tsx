import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Check, Calendar, Sun, Moon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const DailyDeeds: React.FC = () => {
    const navigate = useNavigate();
    const [done, setDone] = useState<number[]>([]);

    const toggleDone = (id: number) => {
        if (done.includes(id)) {
            setDone(done.filter(i => i !== id));
        } else {
            setDone([...done, id]);
        }
    };

    const deeds = [
        { id: 1, title: 'أذكار الصباح', period: 'صباحاً', icon: <Sun className="w-4 h-4" /> },
        { id: 2, title: 'صلاة الضحى', period: 'صباحاً', icon: <Sun className="w-4 h-4" /> },
        { id: 3, title: 'قراءة ورد من القرآن', period: 'عام', icon: <Calendar className="w-4 h-4" /> },
        { id: 4, title: 'أذكار المساء', period: 'مساءً', icon: <Moon className="w-4 h-4" /> },
        { id: 5, title: 'صلاة الوتر', period: 'مساءً', icon: <Moon className="w-4 h-4" /> },
        { id: 6, title: 'أذكار النوم', period: 'مساءً', icon: <Moon className="w-4 h-4" /> },
    ];

    return (
        <div className="pt-6 px-4 pb-24 mt-6 space-y-6 relative max-w-full">
            <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mb-6">
                <h2 className="text-2xl font-bold text-text-main flex items-center gap-2">
                    <Check className="w-8 h-8 text-primary" />
                    أعمال اليوم والليلة
                </h2>
                <p className="text-sm text-text-muted mt-1">سجل أهم أعمالك اليومية الصالحة</p>
            </motion.div>

            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="space-y-3">
                {deeds.map((deed, index) => (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        transition={{ delay: 0.1 + (index * 0.05) }}
                        key={deed.id}
                        onClick={() => toggleDone(deed.id)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between glass-card ${
                            done.includes(deed.id) 
                                ? 'bg-primary/5 border-primary/20 shadow-sm' 
                                : 'hover:border-primary/30 shadow-sm'
                        }`}
                    >
                        <div className="flex items-center gap-4">
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                                done.includes(deed.id) ? 'bg-primary border-primary' : 'border-gray-400 dark:border-gray-600'
                            }`}>
                                {done.includes(deed.id) && <Check className="w-4 h-4 text-white" />}
                            </div>
                            <div>
                                <h3 className={`font-bold transition-colors ${done.includes(deed.id) ? 'text-primary' : 'text-text-main'}`}>{deed.title}</h3>
                                <p className="text-xs text-text-muted flex items-center gap-1 mt-1">
                                    {deed.icon}
                                    {deed.period}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </motion.div>
        </div>
    );
};
