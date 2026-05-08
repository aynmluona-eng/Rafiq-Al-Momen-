import React, { useState, useEffect } from 'react';
import { ATHKAR, Thikr } from '../data/athkar';
import { CheckCircle, Share2 } from 'lucide-react';
import { format } from 'date-fns';
import { ShareImageModal } from './ShareImageModal';

export const AthkarList: React.FC = () => {
    const [selectedCategory, setSelectedCategory] = useState<string>('الصباح');
    const [progress, setProgress] = useState<Record<number, number>>({});
    const [shareModalOpen, setShareModalOpen] = useState(false);
    const [selectedDuaaToShare, setSelectedDuaaToShare] = useState('');

    useEffect(() => {
        // Load progress from localStorage
        const savedProgress = localStorage.getItem('athkar_progress');
        const savedDate = localStorage.getItem('athkar_date');
        const today = format(new Date(), 'yyyy-MM-dd');

        if (savedDate === today && savedProgress) {
            setProgress(JSON.parse(savedProgress));
        } else {
            // Reset for a new day
            setProgress({});
            localStorage.setItem('athkar_date', today);
        }
    }, []);

    const handleThikrClick = (thikr: Thikr) => {
        const currentCount = progress[thikr.id] || 0;
        if (currentCount < thikr.count) {
            const newProgress = { ...progress, [thikr.id]: currentCount + 1 };
            setProgress(newProgress);
            localStorage.setItem('athkar_progress', JSON.stringify(newProgress));
        }
    };

    const handleShareClick = (e: React.MouseEvent, thikr: Thikr) => {
        e.stopPropagation();
        setSelectedDuaaToShare(thikr.text);
        setShareModalOpen(true);
    };

    const categories = Object.keys(ATHKAR);

    return (
        <div className="space-y-6">
            <div className="flex space-x-2 space-x-reverse overflow-x-auto hide-scrollbar pb-2 py-2">
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`whitespace-nowrap px-6 py-2.5 rounded-[16px] font-bold tracking-wide transition-colors ${selectedCategory === cat ? 'bg-primary text-white shadow-md' : 'glass-card text-text-muted hover:text-text-main hover:bg-primary/5 shadow-sm border border-primary/10'}`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            <div className="space-y-4 pb-12">
                {ATHKAR[selectedCategory].map(thikr => {
                    const currentCount = progress[thikr.id] || 0;
                    const isDone = currentCount >= thikr.count;

                    return (
                        <div 
                           key={thikr.id} 
                           className={`glass-card rounded-[28px] p-6 shadow-sm border transition-all cursor-pointer active:scale-[0.98] ${isDone ? 'border-primary/30 bg-primary/5' : 'border-primary/10 hover:border-primary/30'}`}
                           onClick={() => handleThikrClick(thikr)}
                        >
                            <p className="text-text-main text-[1.35rem] leading-loose font-quran text-justify" style={{ textJustify: 'inter-word' }}>{thikr.text}</p>
                            
                            <div className="flex justify-between items-center border-t border-primary/10 pt-4 mt-6">
                               <div className="text-sm font-medium text-text-muted bg-primary/5 px-3 py-1 rounded-lg">
                                   التكرار: {thikr.count}
                               </div>
                               
                               <div className="flex items-center space-x-3 space-x-reverse">
                                   <button 
                                      onClick={(e) => handleShareClick(e, thikr)}
                                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-primary hover:bg-primary/10 transition-colors"
                                      title="مشاركة الصورة"
                                   >
                                       <Share2 className="w-5 h-5" />
                                   </button>
                                   <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-xl transition-all ${isDone ? 'bg-primary text-white shadow-md' : 'bg-primary/5 text-primary-dark'}`}>
                                       {isDone ? <CheckCircle className="w-6 h-6" /> : currentCount}
                                   </div>
                               </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            <ShareImageModal 
                isOpen={shareModalOpen} 
                onClose={() => setShareModalOpen(false)} 
                duaaText={selectedDuaaToShare} 
            />
        </div>
    );
};
