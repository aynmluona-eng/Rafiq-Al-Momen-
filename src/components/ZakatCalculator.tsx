import React, { useState } from 'react';
import { Calculator } from 'lucide-react';

export const ZakatCalculator: React.FC = () => {
    const [gold, setGold] = useState('');
    const [silver, setSilver] = useState('');
    const [cash, setCash] = useState('');
    const [business, setBusiness] = useState('');
    const [debts, setDebts] = useState('');
    
    // Hardcoded Nisab values (approximate or can be fetched from API in a real app)
    const NISAB_GOLD = 85; // 85 grams of gold
    const NISAB_SILVER = 595; // 595 grams of silver
    const GOLD_PRICE_PER_GRAM = 85; // Example in USD or local currency, better left as general
    
    const calculateZakat = () => {
        const goldVal = parseFloat(gold) || 0;
        const silverVal = parseFloat(silver) || 0;
        const cashVal = parseFloat(cash) || 0;
        const businessVal = parseFloat(business) || 0;
        const debtsVal = parseFloat(debts) || 0;

        const totalWealth = goldVal + silverVal + cashVal + businessVal - debtsVal;
        
        // Simple logic for calculation (just 2.5% on total wealth if > 0)
        // In real world, Nisab check should be applied based on local currency
        if (totalWealth > 0) {
            return (totalWealth * 0.025).toFixed(2);
        }
        return '0.00';
    };

    return (
        <div className="space-y-6 pb-4 animate-in fade-in duration-500">
            <div className="bg-primary rounded-[24px] p-6 shadow-xl relative overflow-hidden text-center">
                <div className="absolute top-0 right-0 p-4 opacity-10 mix-blend-overlay pointer-events-none">
                     <Calculator className="w-24 h-24" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2 font-sans tracking-wide">زكاة المال</h3>
                <p className="text-sm text-green-100/80 mb-6">احسب زكاة مالك المقدرة بـ 2.5% بناءً على مدخراتك التي حال عليها الحول.</p>
                
                <div className="text-4xl font-mono font-bold text-green-300 drop-shadow-md tabular-nums my-4">
                    {calculateZakat()}
                </div>
                <p className="text-xs text-white/50 mb-2">المقدار الواجب إخراجه (بالعملة المحلية)</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-[24px] shadow-sm divide-y divide-gray-100 dark:divide-gray-700 px-4 py-2 border border-gray-100 dark:border-gray-700">
                <div className="py-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">المدخرات النقدية (سيولة)</label>
                    <input 
                        type="number" 
                        value={cash}
                        onChange={(e) => setCash(e.target.value)}
                        placeholder="0.00"
                        className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary placeholder-gray-400 font-mono transition-shadow"
                    />
                </div>
                <div className="py-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">قيمة الذهب والفضة (إن وجدت)</label>
                     <input 
                        type="number" 
                        value={gold}
                        onChange={(e) => setGold(e.target.value)}
                        placeholder="0.00"
                        className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary placeholder-gray-400 font-mono transition-shadow"
                    />
                </div>
                <div className="py-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">قيمة عروض التجارة</label>
                     <input 
                        type="number" 
                        value={business}
                        onChange={(e) => setBusiness(e.target.value)}
                        placeholder="0.00"
                        className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary placeholder-gray-400 font-mono transition-shadow"
                    />
                </div>
                <div className="py-4">
                    <label className="block text-sm font-medium text-red-600 dark:text-red-400 mb-2">الديون التي عليك (تخصم)</label>
                     <input 
                        type="number" 
                        value={debts}
                        onChange={(e) => setDebts(e.target.value)}
                        placeholder="0.00"
                        className="w-full bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-400 placeholder-gray-400 font-mono transition-shadow"
                    />
                </div>
            </div>
            
            <p className="text-center text-xs text-gray-500 dark:text-gray-400 px-4 leading-relaxed pb-2">
                تنبيه: يجب إخراج الزكاة إذا بلغ إجمالي المال المدخر النصاب وحال عليه الحول الهجري كاملاً. الرجاء استشارة أهل العلم للحالات المعقدة.
            </p>
        </div>
    );
};
