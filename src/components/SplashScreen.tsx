import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export const SplashScreen: React.FC<{ onFinish: () => void }> = ({ onFinish }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onFinish, 600); // give time for exit animation
    }, 2500); // show for 2.5 seconds

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#FCFBFA] dark:bg-[#0B110E]"
        >
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none" 
               style={{ 
                   backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l15 15-15 15L15 15 30 0zm0 60l15-15-15-15-15 15 30 15zM0 30l15 15L30 30 15 15 0 30zm60 0l-15 15-15-15 15-15 15 15z' fill='%238A9E59' fill-opacity='1' fill-rule='evenodd'/%3E")`,
                   backgroundSize: '40px 40px' 
               }} 
          />

          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="relative z-10 flex flex-col items-center"
          >
            {/* Logo Image */}
            <motion.div
              initial={{ scale: 0.8, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', damping: 15, stiffness: 100, delay: 0.4 }}
              className="w-32 h-32 mb-8 rounded-3xl shadow-2xl overflow-hidden border-4 border-white dark:border-[#141F1A] bg-[#FCFBFA] flex items-center justify-center p-2"
            >
               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="w-full h-full drop-shadow-md">
                 <path d="M256 80c-70 0-130 45-150 110-3 10-14 15-24 12-10-3-15-14-12-24 25-80 98-138 186-138 107 0 194 87 194 194S363 428 256 428v-40c85 0 154-69 154-154 0-82-65-150-145-154z" fill="#8A9E59"/>
                 <circle cx="256" cy="180" r="35" fill="#D8B472"/>
                 <path d="M256 260c-25 0-45 15-55 35-4 8-15 12-23 8-8-5-12-15-8-24 15-35 55-60 86-60s71 25 86 60c4 9 0 19-8 24-8 4-19 0-23-8-10-20-30-35-55-35z" fill="#8A9E59"/>
               </svg>
            </motion.div>

            <motion.h1 
              className="text-4xl font-bold text-primary dark:text-[#9FB074] font-sans tracking-tight drop-shadow-sm"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              رفيق المؤمن
            </motion.h1>
            
            <motion.p 
              className="mt-3 text-lg text-text-muted font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.8 }}
            >
              طريقك إلى الإيمان والمعرفة
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
