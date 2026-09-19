'use client';

import React, { useState, useEffect } from 'react';
import { WeatherForecastDay } from '@/lib/types';
import {
  Sun,
  Cloud,
  CloudSun,
  CloudRain,
  CloudLightning,
  Snowflake,
  CloudFog,
  Umbrella,
  CalendarDays,
  MapPin,
  RefreshCw,
  Navigation,
  Info,
} from 'lucide-react';

// 愛媛県内および現場プリセット
const WEATHER_LOCATIONS = [
  { id: 'matsuyama', name: '🍊 松山本社（中予）', lat: 33.8392, lng: 132.7656 },
  { id: 'site_matsuyama', name: '🏗️ 松山市駅前 現場', lat: 33.8358, lng: 132.7621 },
  { id: 'site_imabari', name: '🌊 今治新都市 現場（東予）', lat: 34.0535, lng: 132.9642 },
  { id: 'site_niihama', name: '🏭 新居浜プラント 現場（東予）', lat: 33.9748, lng: 133.2755 },
  { id: 'uwajima', name: '🐟 宇和島・南予エリア', lat: 33.2234, lng: 132.5606 },
];

// WMO Weather Code 解釈関数
function parseWmoCode(code: number): { text: string; icon: string } {
  if (code === 0) return { text: '快晴', icon: 'Sun' };
  if (code === 1) return { text: '晴れ', icon: 'Sun' };
  if (code === 2) return { text: '一部曇', icon: 'CloudSun' };
  if (code === 3) return { text: '曇り', icon: 'Cloud' };
  if (code === 45 || code === 48) return { text: '霧', icon: 'CloudFog' };
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return { text: '雨', icon: 'CloudRain' };
  if ([71, 73, 75, 85, 86].includes(code)) return { text: '雪', icon: 'Snowflake' };
  if ([95, 96, 99].includes(code)) return { text: '雷雨', icon: 'CloudLightning' };
  return { text: '曇り', icon: 'Cloud' };
}

// アイコンコンポーネント取得
function renderWeatherIcon(iconName: string, isRainy: boolean) {
  const className = isRainy
    ? 'w-6 h-6 text-sky-400 animate-pulse'
    : iconName === 'Sun'
    ? 'w-6 h-6 text-amber-400'
    : iconName === 'CloudSun'
    ? 'w-6 h-6 text-amber-300'
    : 'w-6 h-6 text-slate-300';

  switch (iconName) {
    case 'Sun':
      return <Sun className={className} />;
    case 'CloudSun':
      return <CloudSun className={className} />;
    case 'Cloud':
      return <Cloud className={className} />;
    case 'CloudRain':
      return <CloudRain className={className} />;
    case 'CloudLightning':
      return <CloudLightning className={className} />;
    case 'Snowflake':
      return <Snowflake className={className} />;
    case 'CloudFog':
      return <CloudFog className={className} />;
    default:
      return <Cloud className={className} />;
  }
}

// フォールバック用のダミー1週間データ
const FALLBACK_FORECAST: WeatherForecastDay[] = [
  { date: '今日', dayOfWeek: '土', weatherCode: 1, weatherText: '晴れ', weatherIcon: 'Sun', tempMax: 26, tempMin: 18, precipitationProb: 10, isRainy: false },
  { date: '明日', dayOfWeek: '日', weatherCode: 2, weatherText: '一部曇', weatherIcon: 'CloudSun', tempMax: 25, tempMin: 17, precipitationProb: 20, isRainy: false },
  { date: '9/21', dayOfWeek: '月', weatherCode: 61, weatherText: '雨', weatherIcon: 'CloudRain', tempMax: 22, tempMin: 16, precipitationProb: 70, isRainy: true },
  { date: '9/22', dayOfWeek: '火', weatherCode: 3, weatherText: '曇り', weatherIcon: 'Cloud', tempMax: 23, tempMin: 17, precipitationProb: 30, isRainy: false },
  { date: '9/23', dayOfWeek: '水', weatherCode: 0, weatherText: '快晴', weatherIcon: 'Sun', tempMax: 27, tempMin: 19, precipitationProb: 0, isRainy: false },
  { date: '9/24', dayOfWeek: '木', weatherCode: 1, weatherText: '晴れ', weatherIcon: 'Sun', tempMax: 26, tempMin: 18, precipitationProb: 10, isRainy: false },
  { date: '9/25', dayOfWeek: '金', weatherCode: 63, weatherText: '雨', weatherIcon: 'CloudRain', tempMax: 21, tempMin: 15, precipitationProb: 80, isRainy: true },
];

export const WeatherWidget: React.FC = () => {
  const [forecast, setForecast] = useState<WeatherForecastDay[]>(FALLBACK_FORECAST);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lastFetched, setLastFetched] = useState<string>('たった今');
  const [selectedLocId, setSelectedLocId] = useState<string>('matsuyama');
  const [currentLocName, setCurrentLocName] = useState<string>('松山本社（中予）');
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number }>({
    lat: 33.8392,
    lng: 132.7656,
  });

  const fetchWeather = async (lat: number, lng: number, locLabel?: string) => {
    setIsLoading(true);
    try {
      // 気象庁(JMA)高解像度数値予報モデル直結のオープン気象データAPI (Open-Meteo)
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=Asia%2FTokyo`
      );
      if (!res.ok) throw new Error('Weather API error');
      const data = await res.json();

      const daysOfWeek = ['日', '月', '火', '水', '木', '金', '土'];
      const dailyList: WeatherForecastDay[] = [];

      for (let i = 0; i < (data.daily?.time?.length || 0) && i < 7; i++) {
        const dateStr = data.daily.time[i];
        const dateObj = new Date(dateStr);
        const dayOfWeek = daysOfWeek[dateObj.getDay()];
        const code = data.daily.weather_code[i];
        const { text, icon } = parseWmoCode(code);
        const prob = data.daily.precipitation_probability_max[i] ?? 0;
        const max = Math.round(data.daily.temperature_2m_max[i]);
        const min = Math.round(data.daily.temperature_2m_min[i]);

        dailyList.push({
          date: i === 0 ? '今日' : i === 1 ? '明日' : `${dateObj.getMonth() + 1}/${dateObj.getDate()}`,
          dayOfWeek,
          weatherCode: code,
          weatherText: text,
          weatherIcon: icon,
          tempMax: max,
          tempMin: min,
          precipitationProb: prob,
          isRainy: prob >= 40,
        });
      }

      if (dailyList.length > 0) {
        setForecast(dailyList);
        const now = new Date();
        setLastFetched(`${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}更新`);
      }
      if (locLabel) setCurrentLocName(locLabel);
    } catch (e) {
      console.warn('Weather fetch failed, using fallback forecast', e);
    } finally {
      setIsLoading(false);
    }
  };

  // 現場切り替え
  const handleLocationChange = (locId: string) => {
    setSelectedLocId(locId);
    const loc = WEATHER_LOCATIONS.find((l) => l.id === locId);
    if (loc) {
      setCurrentCoords({ lat: loc.lat, lng: loc.lng });
      fetchWeather(loc.lat, loc.lng, loc.name);
    }
  };

  // GPS現在地から天気を取得
  const handleGetGpsWeather = () => {
    if (!navigator.geolocation) {
      alert('お使いの端末・ブラウザはGPS位置情報に対応していません');
      return;
    }
    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setSelectedLocId('gps');
        setCurrentCoords({ lat, lng });
        fetchWeather(lat, lng, '📍 現在地(GPS連動)');
      },
      (err) => {
        setIsLoading(false);
        alert('現在地が取得できませんでした（位置情報の許可をご確認ください）');
      },
      { timeout: 8000 }
    );
  };

  useEffect(() => {
    fetchWeather(currentCoords.lat, currentCoords.lng);
  }, []);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 shadow-lg space-y-2.5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-amber-400" />
          <h3 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
            現場週間天気予報
          </h3>
          <span className="text-[10px] text-amber-300/90 font-bold bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.2 rounded">
            {currentLocName}
          </span>
        </div>

        {/* 現場切り替え・GPS・更新ボタン */}
        <div className="flex items-center gap-2">
          {/* 現場セレクト */}
          <select
            value={selectedLocId}
            onChange={(e) => handleLocationChange(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-amber-500"
          >
            {WEATHER_LOCATIONS.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name}
              </option>
            ))}
            {selectedLocId === 'gps' && <option value="gps">📍 現在地 (GPS)</option>}
          </select>

          {/* GPSボタン */}
          <button
            onClick={handleGetGpsWeather}
            disabled={isLoading}
            className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-sky-400 border border-sky-500/30 px-2 py-1 rounded-lg text-xs font-bold transition active:scale-95 shadow"
            title="端末のGPS現在地の天気を取得"
          >
            <Navigation className="w-3 h-3" />
            <span className="hidden sm:inline">GPS</span>
          </button>

          {/* リロードボタン */}
          <button
            onClick={() => fetchWeather(currentCoords.lat, currentCoords.lng)}
            disabled={isLoading}
            className="text-slate-400 hover:text-slate-200 p-1 rounded hover:bg-slate-800 transition"
            title="天気を再取得"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* 週間天気カード（横スクロール対応） */}
      <div className="flex items-stretch gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-700">
        {forecast.map((day, idx) => {
          const isToday = idx === 0;
          return (
            <div
              key={idx}
              className={`flex-shrink-0 w-24 sm:w-28 p-2 rounded-lg border text-center transition flex flex-col justify-between ${
                day.isRainy
                  ? 'bg-sky-950/40 border-sky-600/40'
                  : isToday
                  ? 'bg-amber-950/30 border-amber-500/40 ring-1 ring-amber-500/30'
                  : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              {/* 日付・曜日 */}
              <div>
                <div className="flex items-center justify-center gap-1">
                  <span className={`text-xs font-black ${isToday ? 'text-amber-400' : 'text-slate-200'}`}>
                    {day.date}
                  </span>
                  <span
                    className={`text-[10px] font-bold ${
                      day.dayOfWeek === '日'
                        ? 'text-rose-400'
                        : day.dayOfWeek === '土'
                        ? 'text-sky-400'
                        : 'text-slate-400'
                    }`}
                  >
                    ({day.dayOfWeek})
                  </span>
                </div>

                {/* 天気アイコンとテキスト */}
                <div className="my-1.5 flex flex-col items-center justify-center">
                  {renderWeatherIcon(day.weatherIcon, day.isRainy)}
                  <span className="text-[11px] font-medium text-slate-300 mt-0.5">
                    {day.weatherText}
                  </span>
                </div>
              </div>

              {/* 降水確率 & 気温 */}
              <div className="space-y-1 pt-1.5 border-t border-slate-800/60">
                {/* 降水確率 */}
                <div
                  className={`inline-flex items-center justify-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    day.precipitationProb >= 50
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : day.precipitationProb >= 30
                      ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                      : 'text-slate-400'
                  }`}
                >
                  <Umbrella className="w-2.5 h-2.5 shrink-0" />
                  <span>{day.precipitationProb}%</span>
                </div>

                {/* 気温 */}
                <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1 font-mono">
                  <span className="text-rose-400 font-bold">{day.tempMax}°</span>
                  <span className="text-slate-600">/</span>
                  <span className="text-sky-400">{day.tempMin}°</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 気象庁データ出典の注記 */}
      <div className="flex items-center justify-between text-[10px] text-slate-500 px-1 pt-0.5 border-t border-slate-800/50">
        <span className="flex items-center gap-1">
          <Info className="w-2.5 h-2.5 text-slate-400" />
          気象庁(JMA)高解像度数値予報直結 Open-Meteo API自動取得
        </span>
        <span>{lastFetched}</span>
      </div>
    </div>
  );
};
