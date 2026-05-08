import React, { useEffect, useState } from 'react';
import { getSurahs, Surah } from '../services/quranApi';
import { Search, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const QuranList: React.FC = () => {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [filteredSurahs, setFilteredSurahs] = useState<Surah[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Load Bookmarks
    const savedBookmarks = JSON.parse(localStorage.getItem('quran_bookmarks') || '[]');
    setBookmarks(savedBookmarks);

    const fetchAllSurahs = async () => {
        try {
            const data = await getSurahs();
            setSurahs(data);
            setFilteredSurahs(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };
    fetchAllSurahs();
  }, []);

  useEffect(() => {
     if (searchTerm) {
         setFilteredSurahs(surahs.filter(s => s.name.includes(searchTerm) || s.englishName.toLowerCase().includes(searchTerm.toLowerCase())));
     } else {
         setFilteredSurahs(surahs);
     }
  }, [searchTerm, surahs]);

  if (loading) {
    return <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  }

  return (
    <div className="pt-6 px-4 mt-6 space-y-6 pb-24 relative max-w-full">
      <div className="w-full h-32 rounded-[24px] overflow-hidden relative mb-6 shadow-sm">
          <img 
              src="https://images.unsplash.com/photo-1609599006353-e629aaab31ce?auto=format&fit=crop&q=80&w=800&h=300"
              alt="Quran"
              className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          <div className="absolute bottom-4 right-4 text-white">
              <h2 className="text-2xl font-bold">القرآن الكريم</h2>
              <p className="text-sm opacity-90">نور وهدى للناس</p>
          </div>
      </div>

      <div className="relative mb-6">
        <input 
          type="text" 
          placeholder="ابحث عن سورة..." 
          className="w-full pl-4 pr-12 py-4 rounded-[20px] bg-white border border-primary/10 text-text-main placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Search className="absolute right-4 top-4 text-text-muted w-6 h-6" />
      </div>

      {bookmarks.length > 0 && !searchTerm && (
        <div className="mb-6">
           <h3 className="text-lg font-bold text-gray-800 mb-3 px-2">العلامات المحفوظة</h3>
           <div className="flex gap-4 overflow-x-auto pb-4 snap-x px-2 -mx-2">
               {bookmarks.map((bookmark, index) => (
                   <div 
                       key={index} 
                       onClick={() => navigate(`/quran/${bookmark.surahId}#ayah-${bookmark.ayahNumber}`)}
                       className="glass-card rounded-[20px] p-4 min-w-[240px] max-w-[280px] shrink-0 snap-center cursor-pointer hover:shadow-md transition-shadow border-l-[4px] border-l-[#d8b472]"
                   >
                       <div className="flex justify-between items-start mb-2">
                           <h4 className="font-bold text-[#103426] font-quran text-xl">{bookmark.surahName?.replace('سُورَةُ', '').trim()}</h4>
                           <span className="text-xs bg-primary/10 text-primary-dark px-2 py-1 rounded-full font-bold">آية {bookmark.ayahNumberInSurah}</span>
                       </div>
                       <p className="text-sm text-gray-600 line-clamp-2 font-quran leading-loose">"{bookmark.text}"</p>
                   </div>
               ))}
           </div>
        </div>
      )}

      <div className="glass-card rounded-[24px] divide-y divide-primary/5 overflow-hidden">
        {filteredSurahs.map((surah) => (
          <div 
            key={surah.number} 
            className="flex items-center justify-between p-5 hover:bg-primary/5 active:bg-primary/10 transition-colors cursor-pointer group"
            onClick={() => navigate(`/quran/${surah.number}`)}
          >
            <div className="flex items-center space-x-4 space-x-reverse">
               <div className="w-12 h-12 flex items-center justify-center bg-primary/5 text-primary-dark font-bold rounded-2xl text-lg relative overflow-hidden group-hover:bg-primary/10 transition-colors">
                   <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] opacity-10 mix-blend-overlay"></div>
                   {surah.number}
               </div>
               <div>
                   <h3 className="font-bold text-text-main text-lg tracking-wide font-sans">{surah.name}</h3>
                   <div className="text-xs text-text-muted flex items-center gap-1 font-medium mt-1">
                       <span>{surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}</span>
                       <span>•</span>
                       <span>{surah.numberOfAyahs} آيات</span>
                   </div>
               </div>
            </div>
            <ChevronLeft className="w-5 h-5 text-primary/40 group-hover:text-primary transition-colors" />
          </div>
        ))}
      </div>
      {filteredSurahs.length === 0 && (
          <div className="text-center text-gray-500 py-12">لا توجد نتائج البحث.</div>
      )}
    </div>
  );
};
