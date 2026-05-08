import React from 'react';
import { AthkarList } from './AthkarList';
import { motion } from 'motion/react';

export const AthkarView: React.FC = () => {
    return (
        <div className="pt-6 px-4 mt-6 space-y-6 pb-24 relative max-w-full">
            <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="w-full h-32 rounded-[24px] overflow-hidden relative mb-6 shadow-sm">
                <img 
                    src="https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&q=80&w=800&h=300"
                    alt="Athkar"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-4 right-4 text-white">
                    <h2 className="text-2xl font-bold">حصن المسلم</h2>
                    <p className="text-sm opacity-90">ألا بذكر الله تطمئن القلوب</p>
                </div>
            </motion.div>

            <AthkarList />
        </div>
    );
};
