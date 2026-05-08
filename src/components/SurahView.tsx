import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSurah, getAyahTafsir, SurahDetails, Ayah } from '../services/quranApi';
import { ChevronRight, ChevronLeft, Settings2, Minus, Plus, Copy, Bookmark, Play, Pause, Share2, X, Check, SkipForward, SkipBack, Menu, BookOpen } from 'lucide-react';
import { quranRecitersList } from './Settings';
import { motion, AnimatePresence } from 'motion/react';

const AyahText = React.memo(({ ayah, isPlaying, isSelected, isBookmarked, onSelect, surahNumber }: { ayah: Ayah, isPlaying: boolean, isSelected: boolean, isBookmarked: boolean, onSelect: (ayah: Ayah) => void, surahNumber: number }) => {
   let text = ayah.text;
   if (surahNumber !== 1 && ayah.numberInSurah === 1 && text.startsWith('بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ ')) {
       text = text.replace('بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ ', '');
   }

   const toArabicNumerals = (num: number) => {
       const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
       return num.toString().split('').map(n => arabicNumbers[parseInt(n)]).join('');
   };

   return (
       <span 
           id={`ayah-${ayah.number}`}
           onClick={(e) => {
               e.stopPropagation();
               onSelect(ayah);
           }}
           className={`inline cursor-pointer transition-colors duration-200 rounded-lg px-1 relative ${
               isPlaying ? 'text-[#d8b472]' : 
               isSelected ? 'bg-white/10 text-white shadow-[0_0_10px_rgba(255,255,255,0.1)]' : 
               isBookmarked ? 'bg-white/5 text-white' :
               'hover:bg-white/5'
           }`}
       >
          {' '}{text}
          <span className={`inline-flex items-center justify-center mx-1.5 select-none transition-colors duration-200 ${isPlaying ? 'text-white' : 'text-[#d8b472]'} text-[0.8em] relative`}>
             ﴿{toArabicNumerals(ayah.numberInSurah)}﴾
             {isBookmarked && (
                 <Bookmark className="w-[0.5em] h-[0.5em] absolute -top-[0.2em] -right-[0.2em] text-[#d8b472] fill-current" />
             )}
          </span>
       </span>
   );
});

export const SurahView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [surah, setSurah] = useState<SurahDetails | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [playingAyah, setPlayingAyah] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playPromiseRef = useRef<Promise<void> | null>(null);

  // New Features States
  const [fontSize, setFontSize] = useState<number>(2.5); // rem
  const [quranReciter, setQuranReciter] = useState<string>('ar.alafasy');
  const [selectedAyah, setSelectedAyah] = useState<Ayah | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [copiedStatus, setCopiedStatus] = useState<number | null>(null);
  const [savedBookmarks, setSavedBookmarks] = useState<number[]>([]);
  const [tafsirEdition, setTafsirEdition] = useState<string>('ar.muyassar');
  const [tafsirText, setTafsirText] = useState<string | null>(null);
  const [loadingTafsir, setLoadingTafsir] = useState(false);
  const [showTafsir, setShowTafsir] = useState(false);

  const tafsirSources = [
    { id: 'ar.muyassar', name: ' التفسير الميسر' },
    { id: 'ar.jalalayn', name: 'تفسير الجلالين' },
    { id: 'ar.qurtubi', name: 'تفسير القرطبي' }
  ];

  useEffect(() => {
    // Load saved settings
    const savedFontSize = localStorage.getItem('quran_font_size');
    if (savedFontSize) setFontSize(parseFloat(savedFontSize));
    
    const savedReciter = localStorage.getItem('quran_reciter');
    if (savedReciter) setQuranReciter(savedReciter);

    const bookmarks = JSON.parse(localStorage.getItem('quran_bookmarks') || '[]');
    setSavedBookmarks(bookmarks.map((b: any) => b.ayahNumber));
  }, []);

  useEffect(() => {
    const fetchSurah = async () => {
      try {
        const data = await getSurah(Number(id), quranReciter);
        setSurah(data);
        localStorage.setItem('last_surah', id || '1');
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    if (id && quranReciter) fetchSurah();
  }, [id, quranReciter]);

  useEffect(() => {
     if (surah && window.location.hash) {
         setTimeout(() => {
             const hash = window.location.hash.replace('#', '');
             const el = document.getElementById(hash);
             if (el) {
                 el.scrollIntoView({ behavior: 'smooth', block: 'center' });
             }
         }, 300);
     }
  }, [surah]);

  const handleAudioEnded = () => {
      if (playingAyah !== null && surah) {
          const currentIndex = surah.ayahs.findIndex(a => a.number === playingAyah);
          if (currentIndex !== -1 && currentIndex + 1 < surah.ayahs.length) {
              const nextAyah = surah.ayahs[currentIndex + 1];
              playAudio(nextAyah.number, nextAyah.audio);
              
              // Smooth scroll to next ayah
              setTimeout(() => {
                  const el = document.getElementById(`ayah-${nextAyah.number}`);
                  if (el) {
                      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }
              }, 100);
          } else {
              setPlayingAyah(null);
              // Next surah
              const currentId = parseInt(id || '1', 10);
              const nextId = currentId < 114 ? currentId + 1 : 1;
              navigate(`/quran/${nextId}`);
          }
      } else {
          setPlayingAyah(null);
      }
  };

  const pauseAudio = () => {
      if (!audioRef.current) return;
      
      setPlayingAyah(null);
      if (playPromiseRef.current !== null) {
          playPromiseRef.current.then(() => {
              audioRef.current?.pause();
          }).catch(() => {});
      } else {
          audioRef.current.pause();
      }
  };

  const playAudio = (ayahNumber: number, audioUrl: string) => {
      if (playingAyah === ayahNumber) {
          pauseAudio();
      } else {
          setPlayingAyah(ayahNumber);
          if (audioRef.current) {
              if (audioUrl) {
                  audioRef.current.src = audioUrl;
                  audioRef.current.load();
                  const playPromise = audioRef.current.play();
                  if (playPromise !== undefined) {
                      playPromiseRef.current = playPromise;
                      playPromise.catch(e => {
                          if (e.name !== 'AbortError') {
                              console.error("Audio playback error:", e);
                              // Auto-skip to next ayah if cannot play
                              setTimeout(() => {
                                  if (playingAyah === ayahNumber) handleAudioEnded();
                              }, 1000);
                          }
                      });
                  }
              } else {
                  console.warn("No audio URL provided for this Ayah.");
              }
          }
      }
  };

  const toArabicNumerals = (num: number) => {
      const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
      return num.toString().split('').map(n => arabicNumbers[parseInt(n)]).join('');
  };

  const handleCopy = (ayah: Ayah) => {
      navigator.clipboard.writeText(`${ayah.text} ﴿${toArabicNumerals(ayah.numberInSurah)}﴾ [سورة ${surah?.name.replace('سُورَةُ', '').trim()} - ${ayah.numberInSurah}]`);
      setCopiedStatus(ayah.number);
      setTimeout(() => setCopiedStatus(null), 2000);
  };

  const toggleBookmark = (ayah: Ayah) => {
      let bookmarks = JSON.parse(localStorage.getItem('quran_bookmarks') || '[]');
      const exists = bookmarks.find((b: any) => b.ayahNumber === ayah.number);
      
      if (exists) {
          bookmarks = bookmarks.filter((b: any) => b.ayahNumber !== ayah.number);
          setSavedBookmarks(prev => prev.filter(n => n !== ayah.number));
      } else {
          bookmarks.push({ 
              surahId: id, 
              surahName: surah?.name,
              ayahNumber: ayah.number, 
              ayahNumberInSurah: ayah.numberInSurah,
              text: ayah.text
          });
          setSavedBookmarks(prev => [...prev, ayah.number]);
      }
      localStorage.setItem('quran_bookmarks', JSON.stringify(bookmarks));
  };

  const changeFontSize = (delta: number) => {
      const newSize = Math.max(1.5, Math.min(4.5, fontSize + delta));
      setFontSize(newSize);
      localStorage.setItem('quran_font_size', newSize.toString());
  };

  const changeReciter = (reciterId: string) => {
      setQuranReciter(reciterId);
      localStorage.setItem('quran_reciter', reciterId);
  };

  const playSurah = () => {
      if (surah && surah.ayahs.length > 0) {
          playAudio(surah.ayahs[0].number, surah.ayahs[0].audio);
      }
  };

  const handleShowTafsir = async (ayahNumber: number, edition: string = tafsirEdition) => {
      if (edition !== tafsirEdition) setTafsirEdition(edition);
      setShowTafsir(true);
      setLoadingTafsir(true);
      setTafsirText(null);
      try {
          const text = await getAyahTafsir(ayahNumber, edition);
          setTafsirText(text);
      } catch (e) {
          setTafsirText("عذراً، لم نتمكن من جلب التفسير حالياً.");
      } finally {
          setLoadingTafsir(false);
      }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen bg-[#111624]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#d8b472]"></div></div>;
  }

  if (!surah) {
     return <div className="text-center p-4 text-white bg-[#111624] h-screen">لم يتم العثور على السورة</div>;
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="bg-[#111624] min-h-screen z-[60] absolute top-0 left-0 right-0 bottom-0 overflow-hidden flex flex-col">
      <audio ref={audioRef} className="hidden" onEnded={handleAudioEnded} preload="none" />
      
      {/* Top Navbar */}
      <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="bg-[#111624]/95 backdrop-blur-xl p-4 flex items-center justify-between z-20 border-b border-white/5 pt-10 sm:pt-6 shrink-0">
         <div className="flex items-center gap-2 -ml-2">
           <button onClick={() => setShowSettings(true)} className="p-2 rounded-full text-white hover:bg-white/10 transition-colors">
               <Settings2 className="w-6 h-6" />
           </button>
         </div>
         
         <div className="text-center absolute left-1/2 -translate-x-1/2 flex flex-col items-center max-w-[200px]">
            <div className="text-[#d8b472] font-quran text-xl tracking-wide truncate w-full" dir="rtl">{surah.name}</div>
            <div className="text-white/70 text-xs font-sans mt-0.5">الجزء {surah.ayahs[0].juz}</div>
         </div>
         
         <button onClick={() => navigate('/quran')} className="p-2 -mr-2 rounded-full text-white hover:bg-white/10 transition-colors">
             <ChevronRight className="w-6 h-6" />
         </button>
      </motion.div>

      <div className="flex-1 overflow-y-auto px-4 py-8 sm:px-8 sm:py-12" dir="rtl" onClick={() => selectedAyah && setSelectedAyah(null)}>
        <div className="max-w-2xl mx-auto pb-32">
          {/* Header Title */}
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="flex flex-col items-center justify-center mb-6 opacity-90 relative">
              <div className="w-3/4 h-[1px] bg-gradient-to-r from-transparent via-[#d8b472]/30 to-transparent mb-4"></div>
              <div className="text-center font-quran text-4xl sm:text-5xl text-[#d8b472] drop-shadow-md">
                 {surah.name}
              </div>
              <div className="w-3/4 h-[1px] bg-gradient-to-r from-transparent via-[#d8b472]/30 to-transparent mt-4"></div>
              
              {/* Play All Button */}
              <button 
                  onClick={(e) => {
                      e.stopPropagation();
                      if (playingAyah) {
                          pauseAudio();
                      } else {
                          playSurah();
                      }
                  }}
                  className="mt-6 flex gap-2 items-center px-6 py-2.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-[#d8b472]"
              >
                  {playingAyah ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-1" />}
                  <span className="font-sans font-medium">{playingAyah ? 'إيقاف التلاوة' : 'تشغيل السورة'}</span>
              </button>
          </motion.div>

          {/* Bismillah */}
          {surah.number !== 1 && surah.number !== 9 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="text-center font-quran text-3xl sm:text-4xl mb-10 text-white drop-shadow-sm opacity-90">
                  بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
              </motion.div>
          )}
          
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="text-justify text-white font-quran relative" style={{ textJustify: 'inter-word', lineHeight: '2.8', fontSize: `${fontSize}rem` }}>
            {surah.ayahs.map((ayah) => (
                <AyahText
                    key={ayah.number}
                    ayah={ayah}
                    isPlaying={playingAyah === ayah.number}
                    isSelected={selectedAyah?.number === ayah.number}
                    isBookmarked={savedBookmarks.includes(ayah.number)}
                    onSelect={setSelectedAyah}
                    surahNumber={surah.number}
                />
            ))}
          </motion.div>
        </div>
        
        {/* Next/Prev Surah buttons */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="max-w-2xl mx-auto px-4 mt-12 flex justify-between items-center mb-32 pointer-events-auto">
            <button 
                onClick={() => navigate(`/quran/${parseInt(id || '1') < 114 ? parseInt(id || '1') + 1 : 1}`)}
                className="flex items-center gap-2 p-3 sm:px-6 sm:py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white/80 transition-colors text-sm sm:text-base border border-white/5"
            >
                <div className="flex items-center gap-1">
                    <SkipForward className="w-4 h-4 ml-1 opacity-70" />
                    <span>السورة التالية</span>
                </div>
            </button>
            <button 
                onClick={() => navigate(`/quran/${parseInt(id || '1') > 1 ? parseInt(id || '1') - 1 : 114}`)}
                className="flex items-center gap-2 p-3 sm:px-6 sm:py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white/80 transition-colors text-sm sm:text-base border border-white/5"
            >
                <div className="flex items-center gap-1">
                    <span>السورة السابقة</span>
                    <SkipBack className="w-4 h-4 mr-1 opacity-70" />
                </div>
            </button>
        </motion.div>
      </div>

      {/* Settings Modal */}
      <AnimatePresence>
      {showSettings && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-[70] flex items-end sm:items-center justify-center pointer-events-none" dir="rtl">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto transition-opacity" onClick={() => setShowSettings(false)}></div>
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="bg-[#1a2133] w-full sm:w-96 rounded-t-3xl sm:rounded-3xl p-6 pointer-events-auto shadow-2xl border border-white/10 relative z-10 m-0 sm:m-4 pb-safe border-b-0 sm:border-b border-white/10">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-white font-sans">إعدادات القراءة</h3>
                    <button onClick={() => setShowSettings(false)} className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                <div className="space-y-6">
                    <div>
                        <label className="text-sm text-[#d8b472] font-semibold mb-3 block font-sans">حجم الخط</label>
                        <div className="flex items-center space-x-4 space-x-reverse bg-white/5 rounded-2xl p-2 border border-white/10">
                            <button onClick={() => changeFontSize(0.2)} className="p-3 text-white hover:bg-white/10 rounded-xl transition-colors">
                                <Plus className="w-6 h-6" />
                            </button>
                            <div className="flex-1 text-center text-[#d8b472] font-mono text-xl font-bold">
                                {Math.round((fontSize / 2.5) * 100)}%
                            </div>
                            <button onClick={() => changeFontSize(-0.2)} className="p-3 text-white hover:bg-white/10 rounded-xl transition-colors">
                                <Minus className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="mt-5 text-center text-white/90 font-quran drop-shadow-sm" style={{ fontSize: `${fontSize * 0.5}rem`, lineHeight: '1.5' }}>
                            بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
                        </div>
                    </div>
                    
                    <div>
                        <label className="text-sm text-[#d8b472] font-semibold mb-3 block font-sans">القارئ</label>
                        <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden divide-y divide-white/5 max-h-[40vh] overflow-y-auto">
                            {quranRecitersList.map((reciter) => (
                                <button
                                    key={reciter.id}
                                    onClick={() => changeReciter(reciter.id)}
                                    className={`w-full text-right px-4 py-3.5 text-sm font-sans flex justify-between items-center hover:bg-white/10 transition-colors ${
                                        quranReciter === reciter.id ? 'text-[#d8b472] bg-white/10' : 'text-white/80'
                                    }`}
                                >
                                    <span>{reciter.name}</span>
                                    {quranReciter === reciter.id && <Check className="w-4 h-4" />}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
      )}
      </AnimatePresence>

      {/* Ayah Actions Bottom Sheet */}
      <AnimatePresence>
      {selectedAyah && (
      <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className={`absolute bottom-0 left-0 right-0 z-[60]`} dir="rtl">
          <div className="bg-[#111624]/90 backdrop-blur-2xl border-t border-white/10 shadow-[0_-20px_40px_rgba(0,0,0,0.5)] rounded-t-[2rem] pt-2 pb-safe pb-8 mb-safe px-4 sm:px-8">
             <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-4"></div>
             
                 <div className="max-w-md mx-auto">
                     <div className="text-center mb-6">
                         <div className="text-[#d8b472] font-sans text-sm font-bold mb-1">
                             الآية {selectedAyah.numberInSurah}
                         </div>
                         <div className="text-white/70 text-xs font-sans line-clamp-1 opacity-60">
                             {selectedAyah.text}
                         </div>
                     </div>
                     
                     <div className="flex justify-around items-center bg-white/5 rounded-2xl p-2 mb-4 border border-white/5">
                         <button 
                            onClick={() => playAudio(selectedAyah.number, selectedAyah.audio)}
                            className="flex-1 flex flex-col items-center justify-center py-2 px-1 text-white hover:bg-white/10 rounded-xl transition-colors"
                         >
                            <div className={`p-3 rounded-full mb-1 border transition-colors ${playingAyah === selectedAyah.number ? 'bg-[#d8b472] text-[#111624] border-transparent' : 'bg-transparent text-[#d8b472] border-[#d8b472]/30'}`}>
                                {playingAyah === selectedAyah.number ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-1" />}
                            </div>
                            <span className="text-[10px] font-bold font-sans">{playingAyah === selectedAyah.number ? 'إيقاف' : 'استماع'}</span>
                         </button>
                         
                         <button 
                            onClick={() => handleCopy(selectedAyah)}
                            className="flex-1 flex flex-col items-center justify-center py-2 px-1 text-white hover:bg-white/10 rounded-xl transition-colors"
                         >
                            <div className="p-3 bg-white/5 rounded-full mb-1 text-white border border-white/5">
                                {copiedStatus === selectedAyah.number ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
                            </div>
                            <span className="text-[10px] font-bold font-sans">{copiedStatus === selectedAyah.number ? 'تم النسخ' : 'نسخ'}</span>
                         </button>

                         <button 
                            onClick={() => toggleBookmark(selectedAyah)}
                            className="flex-1 flex flex-col items-center justify-center py-2 px-1 text-white hover:bg-white/10 rounded-xl transition-colors"
                         >
                            <div className={`p-3 rounded-full mb-1 border transition-colors ${savedBookmarks.includes(selectedAyah.number) ? 'bg-[#d8b472] text-[#111624] border-transparent' : 'bg-white/5 text-white border-white/5'}`}>
                                <Bookmark className={`w-5 h-5 ${savedBookmarks.includes(selectedAyah.number) ? 'fill-current' : ''}`} />
                            </div>
                            <span className="text-[10px] font-bold font-sans">{savedBookmarks.includes(selectedAyah.number) ? 'محفوظ' : 'حفظ'}</span>
                         </button>
                         
                         <button 
                            onClick={() => {
                                if (navigator.share) {
                                    navigator.share({
                                        title: 'آية من القرآن الكريم',
                                        text: `${selectedAyah.text} ﴿${toArabicNumerals(selectedAyah.numberInSurah)}﴾ [سورة ${surah.name.replace('سُورَةُ', '').trim()}]`
                                    }).catch(() => {});
                                }
                            }}
                            className="flex-1 flex flex-col items-center justify-center py-2 px-1 text-white hover:bg-white/10 rounded-xl transition-colors"
                         >
                            <div className="p-3 bg-white/5 rounded-full mb-1 text-white border border-white/5">
                                <Share2 className="w-5 h-5" />
                            </div>
                            <span className="text-[10px] font-bold font-sans">مشاركة</span>
                         </button>
                         <button 
                            onClick={() => handleShowTafsir(selectedAyah.number)}
                            className="flex-1 flex flex-col items-center justify-center py-2 px-1 text-white hover:bg-white/10 rounded-xl transition-colors"
                         >
                            <div className="p-3 bg-white/5 rounded-full mb-1 text-white border border-white/5">
                                <BookOpen className="w-5 h-5" />
                            </div>
                            <span className="text-[10px] font-bold font-sans">تفسير</span>
                         </button>
                     </div>

                     <AnimatePresence>
                         {showTafsir && (
                             <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                 <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mt-2 mb-2 relative flex flex-col gap-3 max-h-[60vh] overflow-y-auto">
                                     <button onClick={() => setShowTafsir(false)} className="absolute top-3 left-3 text-white/50 hover:text-white p-1 bg-white/10 rounded-full z-10">
                                         <X className="w-4 h-4" />
                                     </button>
                                     <div className="flex flex-wrap gap-2 pr-2">
                                         {tafsirSources.map(source => (
                                             <button 
                                                key={source.id}
                                                onClick={() => handleShowTafsir(selectedAyah.number, source.id)}
                                                className={`text-xs px-3 py-1.5 rounded-full transition-colors ${tafsirEdition === source.id ? 'bg-[#d8b472] text-[#111624] font-bold' : 'bg-white/10 text-white/80 hover:bg-white/20'}`}
                                             >
                                                {source.name}
                                             </button>
                                         ))}
                                     </div>
                                     {loadingTafsir ? (
                                         <div className="flex justify-center items-center py-4">
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#d8b472]"></div>
                                         </div>
                                     ) : (
                                         <p className="text-white/90 text-sm leading-relaxed text-justify font-sans">{tafsirText}</p>
                                     )}
                                 </div>
                             </motion.div>
                         )}
                     </AnimatePresence>
                 </div>
          </div>
      </motion.div>
      )}
      </AnimatePresence>
    </motion.div>
  );
};

