import React, { useState, useEffect } from 'react';
import { RefreshCcw } from 'lucide-react';

export const Tasbeeh: React.FC = () => {
    const [count, setCount] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const [activeZikr, setActiveZikr] = useState('سُبْحَانَ اللَّهِ');
    const [isPressed, setIsPressed] = useState(false);

    const zikrList = [
        'سُبْحَانَ اللَّهِ',
        'الْحَمْدُ لِلَّهِ',
        'لَا إِلَهَ إِلَّا اللَّهُ',
        'اللَّهُ أَكْبَرُ',
        'أَسْتَغْفِرُ اللَّهَ',
        'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ'
    ];

    useEffect(() => {
        const savedCount = localStorage.getItem('tasbeeh_count');
        const savedTotal = localStorage.getItem('tasbeeh_total');
        if (savedCount) setCount(parseInt(savedCount, 10));
        if (savedTotal) setTotalCount(parseInt(savedTotal, 10));
    }, []);

    const handlePress = () => {
        setIsPressed(true);
        setTimeout(() => setIsPressed(false), 150);

        const newCount = count + 1;
        const newTotal = totalCount + 1;
        
        setCount(newCount);
        setTotalCount(newTotal);
        
        localStorage.setItem('tasbeeh_count', newCount.toString());
        localStorage.setItem('tasbeeh_total', newTotal.toString());

        // Haptic feedback
        if (window.navigator && window.navigator.vibrate) {
            if (newCount % 33 === 0) {
                window.navigator.vibrate([100, 50, 100, 50, 100]); // Pattern for completing 33
            } else {
                window.navigator.vibrate(50); // Short vibration
            }
        }
    };

    const handleReset = () => {
        setCount(0);
        localStorage.setItem('tasbeeh_count', '0');
    };

    return (
        <div className="pt-6 px-4 mt-6 min-h-full flex flex-col pb-32 relative max-w-md mx-auto">
            <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-primary-dark mb-2 font-quran drop-shadow-sm">التسبيح</h2>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center relative z-10">
                {/* Zikr Selection */}
                <div className="mb-8 w-full overflow-x-auto hide-scrollbar pb-2 relative z-20">
                    <div className="flex space-x-3 space-x-reverse px-2">
                        {zikrList.map((zikr, idx) => (
                            <button
                                key={idx}
                                onClick={() => setActiveZikr(zikr)}
                                className={`whitespace-nowrap px-6 py-3 rounded-full font-bold transition-all ${
                                    activeZikr === zikr 
                                    ? 'bg-primary text-white shadow-md shadow-primary/20' 
                                    : 'glass-card text-text-muted hover:text-text-main hover:bg-primary/5 shadow-sm border border-primary/10'
                                }`}
                            >
                                {zikr}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Counters */}
                <div className="glass-card w-full max-w-sm rounded-[32px] p-8 flex flex-col items-center relative overflow-hidden shadow-xl border border-primary/10">
                    
                    <button 
                        onClick={handleReset}
                        className="absolute top-6 left-6 p-2 rounded-full bg-primary/5 hover:bg-primary/10 text-text-muted hover:text-text-main transition-colors"
                        title="تصفير العداد"
                    >
                        <RefreshCcw className="w-5 h-5" />
                    </button>

                    <div className="text-center mb-6">
                        <div className="text-text-muted text-sm font-bold mb-1">المجموع الكلي</div>
                        <div className="text-xl font-mono text-primary-dark bg-primary/5 px-4 py-1 rounded-full inline-block border border-primary/10">{totalCount}</div>
                    </div>

                    <div className="text-center mb-8">
                        <div className="text-[2rem] font-bold text-text-main mb-2 leading-relaxed font-quran tracking-wide">{activeZikr}</div>
                        <div className="text-7xl font-mono text-primary drop-shadow-sm mt-4">
                            {count}
                        </div>
                    </div>

                    {/* Big Button with circular progress */}
                    <div className="relative flex items-center justify-center">
                        <svg className="absolute -inset-4 w-[calc(100%+2rem)] h-[calc(100%+2rem)] pointer-events-none transform -rotate-90">
                            <circle
                                cx="50%"
                                cy="50%"
                                r="46%"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="4"
                                className="text-primary/10"
                            />
                            <circle
                                cx="50%"
                                cy="50%"
                                r="46%"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="4"
                                strokeDasharray="289"
                                strokeDashoffset={289 - (289 * (count % 33 === 0 && count > 0 ? 33 : count % 33)) / 33}
                                strokeLinecap="round"
                                className="text-primary transition-all duration-300 ease-out"
                            />
                        </svg>

                        <button
                            onClick={handlePress}
                            className={`w-32 h-32 rounded-full relative bg-gradient-to-br from-primary to-primary-dark shadow-[0_15px_30px_rgba(138,158,89,0.3),inset_0_-5px_15px_rgba(0,0,0,0.3)] transition-all duration-100 flex items-center justify-center select-none touch-manipulation ${isPressed ? 'transform scale-[0.97] translate-y-2 shadow-[0_5px_10px_rgba(138,158,89,0.3),inset_0_-2px_5px_rgba(0,0,0,0.3)]' : ''}`}
                        >
                            {/* Ripple Effect */}
                            {isPressed && <div className="absolute inset-0 rounded-full border-4 border-primary-light opacity-50 animate-ping"></div>}
                            <div className="w-24 h-24 rounded-full border-4 border-white/20"></div>
                        </button>
                    </div>
                </div>
            </div>
            
            {/* Additional CSS for hiding scrollbar */}
            <style>{`
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .hide-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                
                @keyframes ping {
                    0% {
                        transform: scale(1);
                        opacity: 0.5;
                    }
                    100% {
                        transform: scale(1.5);
                        opacity: 0;
                    }
                }
            `}</style>
        </div>
    );
};
