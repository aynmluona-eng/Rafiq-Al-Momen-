import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { AlertCircle, WifiOff, MapPinOff, RefreshCcw, HelpCircle, ChevronLeft, Check } from 'lucide-react';
import { useGeolocation } from '../hooks/useGeolocation';

export const AlertsView: React.FC = () => {
    const { error: geoError } = useGeolocation();
    const [isOffline, setIsOffline] = useState(!navigator.onLine);
    const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

    useEffect(() => {
        const handleOnline = () => setIsOffline(false);
        const handleOffline = () => setIsOffline(true);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const faqs = [
        {
            question: "كيف يتم حساب أوقات الصلاة؟",
            answer: "نقوم بحساب أوقات الصلاة بناءً على موقعك الجغرافي الحالي باستخدام معادلات دقيقة معتمدة."
        },
        {
            question: "هل التطبيق يحتاج للإنترنت دائمًا؟",
            answer: "يحتاج التطبيق للإنترنت لتحديث أوقات الصلاة لأول مرة أو عند تغيير الموقع، بالإضافة لتحميل صفحات القرآن الكريم."
        },
        {
            question: "لماذا بوصلة القبلة لا تعمل بشكل صحيح؟",
            answer: "تأكد من تفعيل مستشعر البوصلة في هاتفك وإبعاد الهاتف عن أية مجالات مغناطيسية، وقم بتحريك الهاتف على شكل رقم 8 (بالعربي ٨) لمعايرة البوصلة."
        }
    ];

    return (
        <div className="pt-6 px-4 pb-24 mt-6 space-y-6 relative max-w-full">
            <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    <AlertCircle className="w-8 h-8 text-primary" />
                    التنبيهات
                </h2>
                <p className="text-sm text-gray-500 mt-1">حالة التطبيق والأسئلة الشائعة</p>
            </motion.div>

            {/* System Alerts */}
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="space-y-4">
                <h3 className="text-lg font-bold text-[#103426]">تنبيهات النظام</h3>
                
                {isOffline && (
                    <div className="bg-red-50/80 border border-red-100 rounded-2xl p-4 flex items-start gap-3 shadow-sm">
                        <WifiOff className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
                        <div>
                            <h4 className="font-bold text-red-800">لا يوجد اتصال بالإنترنت</h4>
                            <p className="text-sm text-red-600/90 mt-1">بعض الميزات مثل قراءة سور لم يتم تحميلها مسبقاً قد لا تعمل بشكل صحيح.</p>
                        </div>
                    </div>
                )}

                {geoError && (
                    <div className="bg-yellow-50/80 border border-yellow-100 rounded-2xl p-4 flex items-start gap-3 shadow-sm">
                        <MapPinOff className="w-6 h-6 text-yellow-600 shrink-0 mt-0.5" />
                        <div>
                            <h4 className="font-bold text-yellow-800">الموقع الجغرافي غير مفعل</h4>
                            <p className="text-sm text-yellow-700/90 mt-1">يجب تفعيل الموقع الجغرافي لحساب أوقات الصلاة واتجاه القبلة بدقة.</p>
                        </div>
                    </div>
                )}

                {!isOffline && !geoError && (
                    <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4 flex items-start gap-3 shadow-sm">
                        <Check className="w-6 h-6 text-primary shrink-0 mt-0.5" />
                        <div>
                            <h4 className="font-bold text-primary-dark">جميع الأنظمة تعمل جيداً</h4>
                            <p className="text-sm text-primary-dark/80 mt-1">لا توجد تنبيهات في الوقت الحالي. اتصالك بالإنترنت ممتاز والموقع مفعل.</p>
                        </div>
                    </div>
                )}

                <div className="bg-blue-50/80 border border-blue-100 rounded-2xl p-4 flex items-start gap-3 shadow-sm">
                    <RefreshCcw className="w-6 h-6 text-blue-500 shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-bold text-blue-800">تحديثات التطبيق</h4>
                        <p className="text-sm text-blue-600/90 mt-1">أنت تستخدم أحدث نسخة من التطبيق المتاحة حالياً.</p>
                    </div>
                </div>
            </motion.div>

            {/* FAQs */}
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="mt-8">
                <h3 className="text-lg font-bold text-[#103426] mb-4 flex items-center gap-2">
                    <HelpCircle className="w-6 h-6 text-primary" />
                    الأسئلة الشائعة
                </h3>
                
                <div className="bg-white rounded-[24px] shadow-sm border border-primary/5 divide-y divide-primary/5 overflow-hidden">
                    {faqs.map((faq, index) => (
                        <div key={index} className="overflow-hidden">
                            <button 
                                onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                                className="w-full p-5 flex items-center justify-between text-right bg-white hover:bg-primary/5 transition-colors"
                            >
                                <span className="font-bold text-text-main font-sans">{faq.question}</span>
                                <ChevronLeft className={`w-5 h-5 text-primary transition-transform ${expandedFaq === index ? '-rotate-90' : ''}`} />
                            </button>
                            {expandedFaq === index && (
                                <div className="p-5 bg-primary/5 text-text-muted text-sm leading-relaxed border-t border-primary/5 font-sans">
                                    {faq.answer}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
};
