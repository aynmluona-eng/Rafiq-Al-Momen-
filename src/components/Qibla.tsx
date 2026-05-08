import React, { useEffect, useState, useMemo } from 'react';
import { useGeolocation } from '../hooks/useGeolocation';
import { getQiblaDirection } from '../services/alAdhan';
import { Compass, MapPin, Navigation } from 'lucide-react';
import { motion } from 'motion/react';
import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for leaflet marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom SVG Kaaba for elegant rendering
const KaabaSvg = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg" fill="none">
    <ellipse cx="50" cy="92" rx="35" ry="5" fill="rgba(0,0,0,0.2)"/>
    <path d="M25 35 a5 5 0 0 1 5 -5 h40 a5 5 0 0 1 5 5 v55 a2 2 0 0 1 -2 2 h-46 a2 2 0 0 1 -2 -2 Z" fill="#1b1c1e"/>
    <path d="M25 48 h50 v14 h-50 z" fill="#D8B472"/>
    <path d="M25 48 h50 v2 h-50 z" fill="#F4D03F"/>
    <path d="M25 60 h50 v2 h-50 z" fill="#F4D03F"/>
    <path d="M35 52 h10 v4 h-10 z M55 52 h10 v4 h-10 z" fill="#B8860B"/>
    <path d="M42 68 h16 v22 h-16 z" fill="#AA8030"/>
    <path d="M43 69 h14 v21 h-14 z" fill="#D8B472"/>
    <path d="M45 71 h10 v19 h-10 z" fill="#5c4033"/>
    <path d="M47 73 h6 v17 h-6 z" fill="#1b1c1e"/>
  </svg>
);

const kaabaSvgString = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" fill="none"><ellipse cx="50" cy="92" rx="35" ry="5" fill="rgba(0,0,0,0.2)"/><path d="M25 35 a5 5 0 0 1 5 -5 h40 a5 5 0 0 1 5 5 v55 a2 2 0 0 1 -2 2 h-46 a2 2 0 0 1 -2 -2 Z" fill="#1b1c1e"/><path d="M25 48 h50 v14 h-50 z" fill="#D8B472"/><path d="M25 48 h50 v2 h-50 z" fill="#F4D03F"/><path d="M25 60 h50 v2 h-50 z" fill="#F4D03F"/><path d="M35 52 h10 v4 h-10 z M55 52 h10 v4 h-10 z" fill="#B8860B"/><path d="M42 68 h16 v22 h-16 z" fill="#AA8030"/><path d="M43 69 h14 v21 h-14 z" fill="#D8B472"/><path d="M45 71 h10 v19 h-10 z" fill="#5c4033"/><path d="M47 73 h6 v17 h-6 z" fill="#1b1c1e"/></svg>`;

// Mecca Icon
const MeccaIcon = L.divIcon({
  html: kaabaSvgString,
  className: 'bg-transparent border-none drop-shadow-lg',
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

export const Qibla: React.FC = () => {
  const { location, loading: geoLoading } = useGeolocation({ ignoreCustom: true });
  const [qiblaAngle, setQiblaAngle] = useState<number | null>(null);
  const [deviceHeading, setDeviceHeading] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Tripoli fallback
  const defaultLocation = { latitude: 32.8872, longitude: 13.1913 };
  const MeccaLocation: [number, number] = [21.422487, 39.826206];

  useEffect(() => {
    const fetchQibla = async () => {
      setLoading(true);
      try {
        const lat = location?.latitude || defaultLocation.latitude;
        const lng = location?.longitude || defaultLocation.longitude;
        const angle = await getQiblaDirection(lat, lng);
        setQiblaAngle(angle);
      } catch (err) {
        setError('تعذر تحديد اتجاه القبلة');
      } finally {
        setLoading(false);
      }
    };
    if (!geoLoading) {
      fetchQibla();
    }
  }, [location, geoLoading]);

  useEffect(() => {
    let lastTime = 0;
    // Determine device orientation
    const handleOrientation = (event: DeviceOrientationEvent) => {
      const now = Date.now();
      if (now - lastTime < 50) return; // Throttle to 20fps for performance
      lastTime = now;

      if ((event as any).webkitCompassHeading !== undefined) {
        // iOS
        setDeviceHeading((event as any).webkitCompassHeading);
      } else if (event.alpha !== null) {
        // Android
        setDeviceHeading(360 - event.alpha);
      }
    };

    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleOrientation, true);
    }

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation, true);
    };
  }, []);

  // Request permissions for iOS 13+ devices
  const requestCompassPermission = async () => {
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        const permissionState = await (DeviceOrientationEvent as any).requestPermission();
        if (permissionState === 'granted') {
          // Re-attach listener
          window.addEventListener('deviceorientation', (event: any) => {
              if ((event as any).webkitCompassHeading !== undefined) {
                  setDeviceHeading((event as any).webkitCompassHeading);
              }
          }, true);
        } else {
          setError('يجب إعطاء صلاحية البوصلة لتحديد القبلة');
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const userLat = location?.latitude || defaultLocation.latitude;
  const userLng = location?.longitude || defaultLocation.longitude;
  const bounds: L.LatLngBoundsExpression = [
    [userLat, userLng],
    MeccaLocation
  ];

  const getDistanceToMecca = () => {
    const lat1 = userLat;
    const lon1 = userLng;
    const lat2 = MeccaLocation[0];
    const lon2 = MeccaLocation[1];
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
      ; 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
    const d = R * c; // Distance in km
    return Math.round(d);
  };

  const renderCompassMarkers = () => {
    const markers = [];
    for (let i = 0; i < 360; i += 15) {
      const isCard = i % 90 === 0;
      const isSub = i % 45 === 0;
      let label = '';
      if (i === 0) label = 'N';
      if (i === 90) label = 'E';
      if (i === 180) label = 'S';
      if (i === 270) label = 'W';

      markers.push(
        <div 
          key={i}
          className="absolute w-full h-full flex items-start justify-center"
          style={{ transform: `rotate(${i}deg)` }}
        >
          <div className={`w-[2px] ${isCard ? 'h-4 bg-gray-400 dark:bg-gray-500' : isSub ? 'h-3 bg-gray-300 dark:bg-gray-600' : 'h-2 bg-gray-200 dark:bg-gray-700'}`}></div>
          {label && (
            <div className={`absolute top-5 font-bold ${i === 0 ? 'text-[#D8B472]' : 'text-gray-400 dark:text-gray-500'} ${isCard ? 'text-lg' : 'text-sm'}`} style={{ transform: `rotate(${-i}deg)` }}>
              {label}
            </div>
          )}
        </div>
      );
    }
    return markers;
  };

  if (loading || geoLoading) {
    return <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  }

  // Determine if the phone is pointing towards Qibla (within 5 degrees)
  const isFacingQibla = deviceHeading !== null && qiblaAngle !== null && 
    Math.abs((deviceHeading - qiblaAngle + 540) % 360 - 180) < 5;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pt-6 px-4 pb-32 max-w-lg mx-auto">
      <div className="bg-white dark:bg-[#141F1A] rounded-[32px] p-8 shadow-sm border border-gray-100 dark:border-white/5 flex flex-col items-center justify-center min-h-[450px] relative overflow-hidden mt-6">
        <h2 className="text-xl font-bold text-[#103426] dark:text-[#A3B18A] mb-8 z-10 font-[Tajawal]">البوصلة الذكية</h2>
        
        {error ? (
          <div className="text-red-500 bg-red-50 dark:bg-red-500/10 rounded-xl text-center p-4 z-10 font-medium font-[Tajawal]">{error}</div>
        ) : (
          <div className="relative w-72 h-72 flex flex-col items-center justify-center bg-gray-50 dark:bg-black/20 rounded-full border border-gray-100 dark:border-white/5 shadow-inner z-10 transform-gpu mb-4">
            {/* Compass Ring Container */}
            <div 
              className="absolute inset-2 rounded-full border border-gray-200 dark:border-gray-800 transition-transform duration-150 ease-linear"
              style={{ transform: `rotate(${-(deviceHeading || 0)}deg)` }}
            >
              {renderCompassMarkers()}

              {/* Qibla Direction Indicator attached to the ring */}
              {qiblaAngle !== null && (
                <div 
                  className="absolute w-full h-full flex items-start justify-center"
                  style={{ transform: `rotate(${qiblaAngle}deg)` }}
                >
                  {/* Kaaba pointer */}
                  <div className="flex flex-col items-center -mt-2">
                    <KaabaSvg className="w-10 h-10 drop-shadow-xl z-20" />
                    <div className="w-1.5 h-10 bg-gradient-to-b from-[#8A9E59] to-transparent rounded-full mt-1"></div>
                  </div>
                </div>
              )}
            </div>

            {/* Fixed Phone Direction Indicator */}
            {deviceHeading !== null && (
              <div className="absolute inset-0 flex flex-col items-center justify-start z-30 pointer-events-none">
                <div className={`mt-0 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-b-[16px] transition-colors duration-300 ${isFacingQibla ? 'border-b-[#D8B472] drop-shadow-[0_0_8px_rgba(216,180,114,0.8)]' : 'border-b-gray-800 dark:border-b-white opacity-50'}`}></div>
              </div>
            )}
            
            {/* Center dot/Compass background blur */}
            <div className={`absolute w-12 h-12 rounded-full z-20 shadow-md ring-4 ring-white/50 dark:ring-black/50 flex items-center justify-center transition-colors duration-300 ${isFacingQibla ? 'bg-[#D8B472] text-[#111624]' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'}`}>
                <Navigation className={`w-5 h-5 ${isFacingQibla ? 'animate-pulse' : ''}`} />
            </div>
          </div>
        )}

        <div className="mt-4 flex flex-col items-center justify-center z-10 w-full space-y-4">
            {isFacingQibla && (
               <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#D8B472]/20 text-[#D8B472] px-4 py-1.5 rounded-full text-sm font-bold animate-pulse font-[Tajawal]">
                   أنت متجه نحو القبلة
               </motion.div>
            )}
            
            <div className="flex gap-4 w-full px-4 justify-center">
                {qiblaAngle !== null && (
                    <div className="bg-gray-50 dark:bg-white/5 px-4 py-3 rounded-2xl flex flex-col items-center flex-1 border border-gray-100 dark:border-white/5">
                        <span className="text-xs text-gray-400 dark:text-gray-500 font-medium mb-1 font-[Tajawal]">زاوية القبلة</span>
                        <span className="text-2xl font-bold font-mono text-[#103426] dark:text-white">
                            {Math.round(qiblaAngle)}°
                        </span>
                    </div>
                )}
                
                {location !== null && (
                    <div className="bg-gray-50 dark:bg-white/5 px-4 py-3 rounded-2xl flex flex-col items-center flex-1 border border-gray-100 dark:border-white/5">
                        <span className="text-xs text-gray-400 dark:text-gray-500 font-medium mb-1 font-[Tajawal]">المسافة إلى مكة</span>
                        <div className="flex items-baseline gap-1 text-[#103426] dark:text-white">
                            <span className="text-2xl font-bold font-mono flex items-center">
                                {getDistanceToMecca().toLocaleString('ar-SA')}
                            </span>
                            <span className="text-xs font-bold font-[Tajawal] opacity-80">كم</span>
                        </div>
                    </div>
                )}
            </div>
        </div>

        {typeof (DeviceOrientationEvent as any).requestPermission === 'function' && deviceHeading === null && !error && (
          <button 
            onClick={requestCompassPermission}
            className="mt-6 px-8 py-3.5 bg-[#8A9E59] hover:bg-[#7a8c4f] text-white rounded-2xl shadow-lg transition z-10 font-bold tracking-wide cursor-pointer font-[Tajawal]"
          >
            السماح بالوصول للبوصلة
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-[#141F1A] rounded-[32px] p-6 shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden relative">
         <div className="flex items-center justify-between mb-4">
             <h3 className="text-lg font-bold text-[#103426] dark:text-[#A3B18A] font-[Tajawal]">موقعك على الخريطة</h3>
             <MapPin className="w-5 h-5 text-gray-400" />
         </div>
         <div className="h-[250px] w-full rounded-2xl overflow-hidden relative z-0 border border-gray-100 dark:border-white/10 shadow-inner">
             <MapContainer bounds={bounds} zoom={3} style={{ height: '100%', width: '100%' }} zoomControl={false} dragging={false} scrollWheelZoom={false}>
               <TileLayer
                 url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                 attribution='&copy; <a href="https://carto.com/">Carto</a>'
               />
               <Marker position={[userLat, userLng]} />
               <Marker position={MeccaLocation} icon={MeccaIcon} />
               <Polyline 
                 positions={[[userLat, userLng], MeccaLocation]} 
                 color="#8A9E59" 
                 weight={3} 
                 dashArray="8, 12" 
                 opacity={0.9}
               />
             </MapContainer>
         </div>
      </div>
      
      {!location && !geoLoading && (
        <div className="text-xs text-center text-gray-500 dark:text-gray-400 flex items-center justify-center space-x-1 space-x-reverse mt-6 bg-white dark:bg-white/5 p-3 rounded-2xl mx-auto w-fit border border-gray-100 dark:border-white/5 font-[Tajawal]">
          <MapPin className="w-4 h-4 ml-1" />
          <span>يتم عرض اتجاه القبلة من مدينة طرابلس كإفتراضي لتوضيح الميزة.</span>
        </div>
      )}
    </motion.div>
  );
};

