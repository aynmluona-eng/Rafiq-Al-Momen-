import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Download, Share2 } from 'lucide-react';
import { toPng, toBlob } from 'html-to-image';

interface ShareImageModalProps {
    isOpen: boolean;
    onClose: () => void;
    duaaText: string;
}

export const ShareImageModal: React.FC<ShareImageModalProps> = ({ isOpen, onClose, duaaText }) => {
    const previewRef = useRef<HTMLDivElement>(null);
    const [hijriDay, setHijriDay] = useState('');
    const [hijriMonth, setHijriMonth] = useState('');
    const [hijriYear, setHijriYear] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        if (!isOpen) return;
        const today = new Date();
        const formatterDay = new Intl.DateTimeFormat('ar-SA-u-ca-islamic', { day: 'numeric' });
        const formatterMonth = new Intl.DateTimeFormat('ar-SA-u-ca-islamic', { month: 'long' });
        const formatterYear = new Intl.DateTimeFormat('ar-SA-u-ca-islamic', { year: 'numeric' });

        setHijriDay(formatterDay.format(today));
        setHijriMonth(formatterMonth.format(today));
        setHijriYear(formatterYear.format(today));
    }, [isOpen]);

    const handleSave = async () => {
        if (!previewRef.current) return;
        try {
            setIsGenerating(true);
            const dataUrl = await toPng(previewRef.current, { quality: 1, pixelRatio: 3, cacheBust: true });
            const link = document.createElement('a');
            link.download = `duaa-${new Date().getTime()}.png`;
            link.href = dataUrl;
            link.click();
        } catch (error) {
            console.error('Error saving image', error);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleShare = async () => {
        if (!previewRef.current) return;
        try {
            setIsGenerating(true);
            const blob = await toBlob(previewRef.current, { quality: 1, pixelRatio: 3, cacheBust: true });
            if (blob && navigator.share) {
                const file = new File([blob], `duaa-${new Date().getTime()}.png`, { type: 'image/png' });
                try {
                    await navigator.share({
                        files: [file],
                        title: 'دعاء',
                        text: 'شارك هذا الدعاء',
                    });
                } catch (err) {
                    console.log('Share canceled', err);
                }
            } else if (blob) {
                // Fallback for browsers that don't support file sharing
                const dataUrl = await toPng(previewRef.current, { quality: 1, pixelRatio: 3, cacheBust: true });
                const link = document.createElement('a');
                link.download = `duaa-${new Date().getTime()}.png`;
                link.href = dataUrl;
                link.click();
            }
        } catch (error) {
            console.error('Error sharing image', error);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm overflow-y-auto" dir="rtl">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="w-full max-w-[340px] sm:max-w-sm bg-surface rounded-3xl overflow-hidden shadow-2xl flex flex-col my-auto shrink-0"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex justify-between items-center p-4 border-b border-primary/10">
                            <h3 className="font-bold text-lg text-text-main">مشاركة الدعاء</h3>
                            <button onClick={onClose} className="p-2 bg-black/5 hover:bg-black/10 rounded-full transition text-text-muted">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Image Preview Container */}
                        <div className="p-4 sm:p-6 bg-background flex flex-col items-center justify-center relative">
                            {/* The actually rendered element */}
                            <div 
                                ref={previewRef}
                                className="w-full aspect-[4/5] rounded-2xl relative overflow-hidden flex flex-col bg-primary shadow-xl"
                            >
                                {/* Background Image */}
                                <img 
                                    src="https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&q=80&w=800&h=1000"
                                    alt="Background" 
                                    className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-overlay"
                                    crossOrigin="anonymous"
                                />
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/95 via-primary/70 to-[#103426]/90"></div>

                                {/* Content wrapper */}
                                <div className="relative z-10 w-full h-full flex flex-col p-6">
                                    {/* Top Row: Title & Hijri Date Square */}
                                    <div className="flex justify-between items-start w-full">
                                        <div className="text-white mt-1">
                                            <h2 className="text-2xl font-bold font-sans tracking-tight drop-shadow-md">رفيق المؤمن</h2>
                                            <p className="text-sm opacity-90 drop-shadow-sm font-medium mt-1">ألا بذكر الله تطمئن القلوب</p>
                                        </div>
                                        {/* Hijri Date Square Box */}
                                        <div className="bg-[#103426]/30 backdrop-blur-md border border-white/30 rounded-xl flex flex-col items-center justify-center w-[72px] h-[72px] shadow-lg relative overflow-hidden shrink-0">
                                            <div className="absolute top-0 left-0 right-0 h-1.5 bg-secondary/90"></div>
                                            <span className="text-xl font-black text-white leading-none mt-1.5 drop-shadow-md">{hijriDay}</span>
                                            <span className="text-[10px] text-white/95 font-bold mt-1 drop-shadow-sm">{hijriMonth}</span>
                                            <span className="text-[8px] text-white/70 mt-0.5">{hijriYear}</span>
                                        </div>
                                    </div>

                                    {/* Spacer to push Duaa window to center visually */}
                                    <div className="flex-1"></div>

                                    {/* Duaa Window (Glassmorphism) */}
                                    <div className="w-full bg-white/95 backdrop-blur-xl border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.15)] rounded-2xl p-6 relative">
                                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-secondary text-primary-dark px-6 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center justify-center border border-white/20">
                                            دعاء اليوم
                                        </div>
                                        
                                        <div className="flex flex-col items-center justify-center mt-2">
                                           <p 
                                               className={`text-primary-dark text-center font-quran leading-[2.2] w-full ${duaaText.length > 200 ? 'text-base' : duaaText.length > 100 ? 'text-lg' : 'text-xl'}`}
                                           >
                                               {duaaText.length > 350 ? duaaText.substring(0, 347) + '...' : duaaText}
                                           </p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex-1"></div>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="p-4 grid grid-cols-2 gap-3 border-t border-primary/10 bg-surface">
                            <button 
                                onClick={handleSave} 
                                disabled={isGenerating}
                                className="flex items-center justify-center space-x-2 space-x-reverse bg-primary/10 text-primary-dark hover:bg-primary/20 py-2.5 rounded-xl font-bold transition disabled:opacity-50 text-sm"
                            >
                                {isGenerating ? (
                                   <div className="w-4 h-4 border-2 border-primary-dark border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                   <Download className="w-4 h-4" />
                                )}
                                <span>حفظ الصورة</span>
                            </button>
                            <button 
                                onClick={handleShare}
                                disabled={isGenerating}
                                className="flex items-center justify-center space-x-2 space-x-reverse bg-primary text-white hover:bg-primary-dark py-2.5 rounded-xl font-bold transition shadow-md disabled:opacity-50 text-sm"
                            >
                                <Share2 className="w-4 h-4" />
                                <span>مشاركة</span>
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
