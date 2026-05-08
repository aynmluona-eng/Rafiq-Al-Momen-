import axios from 'axios';

export interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
}

export interface Ayah {
  number: number;
  audio: string;
  audioSecondary: string[];
  text: string;
  numberInSurah: number;
  juz: number;
  manzil: number;
  page: number;
  ruku: number;
  hizbQuarter: number;
  sajda: boolean | object;
}

export interface SurahDetails extends Surah {
  ayahs: Ayah[];
}

// Fetch all Surahs
export const getSurahs = async (): Promise<Surah[]> => {
  const response = await axios.get('https://api.alquran.cloud/v1/surah');
  return response.data.data;
};

// Fetch a specific Surah with Audio
export const getSurah = async (number: number, edition?: string): Promise<SurahDetails> => {
  let selectedEdition = edition || localStorage.getItem('quran_reciter') || 'ar.alafasy';
  try {
    const response = await axios.get(`https://api.alquran.cloud/v1/surah/${number}/${selectedEdition}`);
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
        // Fallback to default if the saved reciter doesn't exist on this API format
        localStorage.removeItem('quran_reciter');
        const fallbackResponse = await axios.get(`https://api.alquran.cloud/v1/surah/${number}/ar.alafasy`);
        return fallbackResponse.data.data;
    }
    throw error;
  }
};

export const getAyahTafsir = async (ayahNumber: number, edition: string = 'ar.muyassar'): Promise<string> => {
  const response = await axios.get(`https://api.alquran.cloud/v1/ayah/${ayahNumber}/${edition}`);
  return response.data.data.text;
};

