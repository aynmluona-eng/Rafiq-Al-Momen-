import React from 'react';
import { motion } from 'motion/react';
import { ChevronRight, Heart, Info, Users, Gift, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const About: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0f111a] text-text-main pb-24">
            {/* Header */}
            <div className="bg-white/80 dark:bg-[#1a1d2d]/80 backdrop-blur-xl p-4 flex items-center justify-between sticky top-0 z-20 border-b border-gray-200 dark:border-white/5 pt-10 sm:pt-6">
                <button 
                    onClick={() => navigate(-1)}
                    className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors"
                >
                    <ChevronRight className="w-6 h-6 text-text-main" />
                </button>
                <div className="flex items-center gap-2">
                    <h2 className="font-bold text-lg text-text-main">عن رفيق المؤمن</h2>
                    <Info className="w-5 h-5 text-primary" />
                </div>
            </div>

            <div className="p-4 space-y-6 max-w-lg mx-auto mt-4">
                {/* Logo / Title Area */}
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }} 
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex flex-col items-center justify-center text-center py-6"
                >
                    <div className="w-24 h-24 bg-primary/10 rounded-3xl flex items-center justify-center mb-4 border border-primary/20 shadow-lg shadow-primary/5">
                        <Heart className="w-12 h-12 text-primary" fill="currentColor" />
                    </div>
                    <h1 className="text-2xl font-bold text-primary mb-2">رفيق المؤمن</h1>
                    <p className="text-sm text-text-muted font-medium bg-black/5 dark:bg-white/5 px-4 py-1.5 rounded-full">الإصدار 1.1.0</p>
                </motion.div>

                {/* Main Content Cards */}
                <motion.div 
                    initial={{ y: 20, opacity: 0 }} 
                    animate={{ y: 0, opacity: 1 }} 
                    transition={{ delay: 0.1 }}
                    className="space-y-4"
                >
                    <div className="glass-card rounded-2xl p-5 border border-primary/10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-bl-full pointer-events-none"></div>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Star className="w-4 h-4 text-primary" />
                            </div>
                            <h3 className="font-bold text-lg text-primary">فكرة البرنامج</h3>
                        </div>
                        <p className="text-sm leading-loose text-text-main/90 font-medium">
                            جاءت فكرة "رفيق المؤمن" لتوفير تطبيق إسلامي شامل يجمع بين أوقات الصلاة الدقيقة، قراءة القرآن الكريم، الأذكار، اتجاه القبلة، والسبحة الإلكترونية، وغيرها من الخدمات الأساسية بأسلوب عصري وبسيط يركز على راحة المستخدم وبدون أي إعلانات مزعجة.
                        </p>
                    </div>

                    <div className="glass-card rounded-2xl p-5 border border-gray-100 dark:border-white/5">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                <Users className="w-4 h-4 text-blue-500" />
                            </div>
                            <h3 className="font-bold text-lg text-blue-500 dark:text-blue-400">إلى من موجه؟</h3>
                        </div>
                        <p className="text-sm leading-loose text-text-main/90 font-medium">
                            هذا التطبيق موجه لكل مسلم ومسلمة يبحثون عن أداة متكاملة تعينهم على أداء العبادات والمحافظة على الأذكار والصلاة في أوقاتها. بفضل واجهته السهلة والواضحة، يمكن للجميع استخدامه باختلاف أعمارهم بكل يسر.
                        </p>
                    </div>

                    <div className="glass-card rounded-2xl p-5 border border-green-500/20 bg-green-500/5">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                                <Gift className="w-4 h-4 text-green-500" />
                            </div>
                            <h3 className="font-bold text-lg text-green-600 dark:text-green-400">صدقة جارية</h3>
                        </div>
                        <p className="text-sm leading-loose text-green-800 dark:text-green-200 font-medium">
                            هذا التطبيق هو <span className="font-bold">صدقة جارية</span> لجميع المسلمين والمسلمات، الأحياء منهم والأموات. نسأل الله سبحانه وتعالى أن يتقبله بقبول حسن، وأن يجعله في ميزان حسنات كل من استخدمه ونشره وساهم فيه.
                            لا تنسونا من صالح دعائكم.
                        </p>
                    </div>
                </motion.div>

                {/* Footer text */}
                <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    transition={{ delay: 0.3 }}
                    className="flex flex-col items-center justify-center pt-8 pb-4"
                >
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
                </motion.div>
            </div>
        </div>
    );
};
