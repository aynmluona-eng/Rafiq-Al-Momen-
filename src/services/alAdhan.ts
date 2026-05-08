import { Coordinates, CalculationMethod, PrayerTimes } from 'adhan';
import { format } from 'date-fns';

export interface PrayerTimings {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

export interface HijriDate {
  date: string;
  format: string;
  day: string;
  weekday: {
    en: string;
    ar: string;
  };
  month: {
    number: number;
    en: string;
    ar: string;
  };
  year: string;
  designation: {
    abbreviated: string;
    expanded: string;
  };
  holidays: string[];
}

export interface AlAdhanResponse {
  data: {
    timings: PrayerTimings;
    date: {
      readable: string;
      timestamp: string;
      hijri: HijriDate;
    };
    meta: {
      timezone: string;
    };
  };
}

export const getPrayerTimesByCoordinates = async (
  latitude: number,
  longitude: number,
  date: Date = new Date()
): Promise<AlAdhanResponse> => {
  const coordinates = new Coordinates(latitude, longitude);
  const methodStr = localStorage.getItem('calculation_method') || '4';
  let params = CalculationMethod.UmmAlQura();
  
  switch (methodStr) {
    case '2': params = CalculationMethod.NorthAmerica(); break;
    case '3': params = CalculationMethod.MuslimWorldLeague(); break;
    case '4': params = CalculationMethod.UmmAlQura(); break;
    case '5': params = CalculationMethod.Egyptian(); break;
    case '8': params = CalculationMethod.Dubai(); break; // Gulf fallback
    case '9': params = CalculationMethod.Kuwait(); break;
    case '10': params = CalculationMethod.Qatar(); break;
    case '11': params = CalculationMethod.Singapore(); break;
    case '13': params = CalculationMethod.Turkey(); break;
    case '15': params = CalculationMethod.MoonsightingCommittee(); break;
    case '16': params = CalculationMethod.Dubai(); break;
    default: params = CalculationMethod.MuslimWorldLeague(); break;
  }

  const prayerTimes = new PrayerTimes(coordinates, date, params);

  const hijriOffsetStr = localStorage.getItem('hijri_offset') || '0';
  const hijriOffset = parseInt(hijriOffsetStr, 10);
  const hijriDateToFormat = new Date(date);
  hijriDateToFormat.setDate(hijriDateToFormat.getDate() + hijriOffset);

  const formatter = new Intl.DateTimeFormat('ar-SA-u-ca-islamic', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    weekday: 'long'
  });
  const parts = formatter.formatToParts(hijriDateToFormat);
  
  const hijriDay = parts.find(p => p.type === 'day')?.value || '';
  const hijriMonth = parts.find(p => p.type === 'month')?.value || '';
  const hijriYear = parts.find(p => p.type === 'year')?.value || '';
  const hijriWeekday = parts.find(p => p.type === 'weekday')?.value || '';

  return {
    data: {
      timings: {
        Fajr: format(prayerTimes.fajr, 'HH:mm'),
        Sunrise: format(prayerTimes.sunrise, 'HH:mm'),
        Dhuhr: format(prayerTimes.dhuhr, 'HH:mm'),
        Asr: format(prayerTimes.asr, 'HH:mm'),
        Maghrib: format(prayerTimes.maghrib, 'HH:mm'),
        Isha: format(prayerTimes.isha, 'HH:mm'),
      },
      date: {
        readable: format(date, 'dd MMM yyyy'),
        timestamp: Math.floor(date.getTime() / 1000).toString(),
        hijri: {
           date: `${hijriDay}-${hijriMonth}-${hijriYear}`,
           format: 'DD-MM-YYYY',
           day: hijriDay,
           weekday: { en: '', ar: hijriWeekday },
           month: { number: 1, en: '', ar: hijriMonth },
           year: hijriYear.replace(/هـ/g, '').trim(),
           designation: { abbreviated: 'AH', expanded: 'Anno Hegirae' },
           holidays: []
        }
      },
      meta: {
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
      }
    }
  };
};

export const getMonthlyPrayerTimesByCoordinates = async (
  latitude: number,
  longitude: number,
  year: number,
  month: number // 0-11
): Promise<AlAdhanResponse[]> => {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const responses: AlAdhanResponse[] = [];
  
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const response = await getPrayerTimesByCoordinates(latitude, longitude, date);
    responses.push(response);
  }
  
  return responses;
};

export const getQiblaDirection = async (
  latitude: number,
  longitude: number
): Promise<number> => {
  // Calculate Qibla direction offline using formula
  const makkahLat = 21.422487;
  const makkahLng = 39.826206;
  
  const latR = latitude * Math.PI / 180;
  const lngR = longitude * Math.PI / 180;
  const makkahLatR = makkahLat * Math.PI / 180;
  const makkahLngR = makkahLng * Math.PI / 180;
  
  const y = Math.sin(makkahLngR - lngR);
  const x = Math.cos(latR) * Math.tan(makkahLatR) - Math.sin(latR) * Math.cos(makkahLngR - lngR);
  
  let qiblaStr = Math.atan2(y, x) * 180 / Math.PI;
  if (qiblaStr < 0) {
    qiblaStr += 360;
  }
  return Number(qiblaStr.toFixed(2));
};
