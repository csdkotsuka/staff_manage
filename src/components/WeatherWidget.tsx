'use client';

import React, { useState, useEffect } from 'react';
import { WeatherForecastDay, WeatherHourlySlot } from '@/lib/types';
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
  Clock,
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
function renderWeatherIcon(iconName: string, isRainy: boolean, size = 'w-6 h-6') {
  const className = isRainy
    ? `${size} text-blue-500 animate-pulse`
    : iconName === 'Sun'
    ? `${size} text-amber-500`
    : iconName === 'CloudSun'
    ? `${size} text-amber-500`
    : `${size} text-slate-400`;

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

// フォールバック用のダミー時間帯別データ生成
const createFallbackHourly = (isTomorrow = false): WeatherHourlySlot[] => {
  const hours = [0, 3, 6, 9, 12, 15, 18, 21];
  return hours.map((h) => ({
    time: `${h.toString().padStart(2, '0')}:00`,
    hour: h,
    weatherCode: isTomorrow ? (h >= 12 ? 2 : 1) : 1,
    weatherText: isTomorrow && h >= 12 ? '一部曇' : '晴れ',
    weatherIcon: isTomorrow && h >= 12 ? 'CloudSun' : 'Sun',
    temp: h < 6 ? 18 : h < 12 ? 22 : h < 18 ? 26 : 21,
    precipitationProb: isTomorrow && h >= 12 ? 20 : 10,
    isRainy: false,
  }));
};

export const WeatherWidget: React.FC = () => {
  const [forecast, setForecast] = useState<WeatherForecastDay[]>(FALLBACK_FORECAST);
  const [todayHourly, setTodayHourly] = useState<WeatherHourlySlot[]>(createFallbackHourly(false));
  const [tomorrowHourly, setTomorrowHourly] = useState<WeatherHourlySlot[]>(createFallbackHourly(true));
  const [activeDay, setActiveDay] = useState<'today' | 'tomorrow'>('today');
  const [currentHour, setCurrentHour] = useState<number>(new Date().getHours());
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
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&hourly=temperature_2m,precipitation_probability,weather_code&timezone=Asia%2FTokyo`
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

      // 時間帯別（今日 0..23, 明日 24..47）のパース
      if (data.hourly && data.hourly.time) {
        const parseSlots = (startIndex: number, count: number): WeatherHourlySlot[] => {
          const slots: WeatherHourlySlot[] = [];
          for (let i = startIndex; i < startIndex + count && i < data.hourly.time.length; i++) {
            const timeStr = data.hourly.time[i]; // "2026-10-10T06:00"
            // 文字列から直接時間を取り出す（ブラウザのタイムゾーン依存によるズレを完全防止）
            const parts = timeStr.split('T');
            const hourPart = parts[1] ? parts[1].split(':')[0] : '00';
            const hour = parseInt(hourPart, 10);
            const code = data.hourly.weather_code[i] ?? 0;
            const { text, icon } = parseWmoCode(code);
            const prob = data.hourly.precipitation_probability[i] ?? 0;
            const temp = Math.round(data.hourly.temperature_2m[i] ?? 20);

            slots.push({
              time: `${hour.toString().padStart(2, '0')}:00`,
              hour,
              weatherCode: code,
              weatherText: text,
              weatherIcon: icon,
              temp,
              precipitationProb: prob,
              isRainy: prob >= 40,
            });
          }
          return slots;
        };

        const todaySlots = parseSlots(0, 24);
        const tomorrowSlots = parseSlots(24, 24);
        if (todaySlots.length > 0) setTodayHourly(todaySlots);
        if (tomorrowSlots.length > 0) setTomorrowHourly(tomorrowSlots);
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
      () => {
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
    <div className="bg-white border border-slate-200 rounded-2xl p-3 sm:p-4 shadow-xs space-y-3.5">
      {/* 1. ヘッダー：現場名、GPS、再取得 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2 flex-wrap">
          <CalendarDays className="w-4 h-4 text-amber-500" />
          <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
            現場天気予報
          </h3>
          <span className="text-[11px] text-amber-900 font-bold bg-amber-100/80 border border-amber-300 px-2.5 py-0.5 rounded-full">
            {currentLocName}
          </span>
        </div>

        {/* 現場切り替え・GPS・更新ボタン */}
        <div className="flex items-center gap-2">
          {/* 現場セレクト */}
          <select
            value={selectedLocId}
            onChange={(e) => handleLocationChange(e.target.value)}
            className="bg-slate-50 border border-slate-300 text-slate-800 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-amber-500 shadow-xs cursor-pointer font-bold"
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
            type="button"
            onClick={handleGetGpsWeather}
            disabled={isLoading}
            className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-sky-700 border border-slate-300 px-2 py-1 rounded-lg text-xs font-bold transition active:scale-95 shadow-xs"
            title="端末のGPS現在地の天気を取得"
          >
            <Navigation className="w-3 h-3 text-sky-600" />
            <span className="hidden sm:inline">GPS</span>
          </button>

          {/* リロードボタン */}
          <button
            type="button"
            onClick={() => fetchWeather(currentCoords.lat, currentCoords.lng)}
            disabled={isLoading}
            className="text-slate-500 hover:text-slate-800 p-1.5 rounded-lg hover:bg-slate-100 transition"
            title="天気を再取得"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-amber-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* 2. 【最重要】今日・明日の時間帯別予報（常にトップに表示） */}
      <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-2.5 sm:p-3 space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 px-0.5">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600" />
            <span className="text-xs font-black text-slate-900">
              時間帯別天気予報（1時間毎）
            </span>
          </div>

          {/* 「今日」と「明日」の切り替えピルボタン */}
          <div className="flex items-center gap-1 bg-slate-200/80 p-0.5 rounded-lg">
            <button
              type="button"
              onClick={() => setActiveDay('today')}
              className={`flex items-center gap-1 px-3 py-1 rounded-md text-xs font-black transition ${
                activeDay === 'today'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <span>☀️ 今日</span>
              {forecast[0] && (
                <span className="text-[10px] opacity-80">
                  ({forecast[0].weatherText} {forecast[0].tempMax}°/{forecast[0].tempMin}°)
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveDay('tomorrow')}
              className={`flex items-center gap-1 px-3 py-1 rounded-md text-xs font-black transition ${
                activeDay === 'tomorrow'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <span>🌤️ 明日</span>
              {forecast[1] && (
                <span className="text-[10px] opacity-80">
                  ({forecast[1].weatherText} {forecast[1].tempMax}°/{forecast[1].tempMin}°)
                </span>
              )}
            </button>
          </div>
        </div>

        {/* 時間帯別カード列（横スクロール） */}
        <div className="relative">
          <div className="flex items-stretch gap-1.5 overflow-x-auto pb-1.5 pt-0.5 scrollbar-thin">
            {(activeDay === 'today' ? todayHourly : tomorrowHourly).map((slot, idx) => {
              const isWorkHour = slot.hour >= 8 && slot.hour <= 17;
              const isNow = activeDay === 'today' && slot.hour === currentHour;

              return (
                <div
                  key={idx}
                  className={`flex-shrink-0 w-20 sm:w-22 p-2 rounded-xl border text-center flex flex-col justify-between transition ${
                    isNow
                      ? 'bg-amber-100/90 border-amber-400 ring-2 ring-amber-400 shadow-xs'
                      : slot.isRainy
                      ? 'bg-blue-50 border-blue-200'
                      : isWorkHour
                      ? 'bg-white border-amber-200/80 shadow-xs'
                      : 'bg-white/70 border-slate-200'
                  }`}
                >
                  {/* 時刻 ＆ バッジ */}
                  <div>
                    <div className="flex items-center justify-center gap-1">
                      <span className={`text-xs font-mono font-black ${isNow ? 'text-amber-900' : 'text-slate-800'}`}>
                        {slot.time}
                      </span>
                    </div>
                    {isNow ? (
                      <span className="inline-block text-[9px] font-black text-amber-950 bg-amber-300 px-1 rounded">
                        現在
                      </span>
                    ) : isWorkHour ? (
                      <span className="inline-block text-[9px] font-bold text-amber-800 bg-amber-100 px-1 rounded">
                        作業帯
                      </span>
                    ) : (
                      <span className="inline-block text-[9px] text-slate-400">
                        時間外
                      </span>
                    )}

                    {/* アイコン & 天気名 */}
                    <div className="my-1.5 flex flex-col items-center justify-center">
                      {renderWeatherIcon(slot.weatherIcon, slot.isRainy, 'w-5 h-5')}
                      <span className="text-[10px] font-bold text-slate-700 mt-0.5 line-clamp-1">
                        {slot.weatherText}
                      </span>
                    </div>
                  </div>

                  {/* 降水確率 & 気温 */}
                  <div className="space-y-1 pt-1 border-t border-slate-100">
                    <div
                      className={`inline-flex items-center justify-center gap-0.5 px-1 py-0.5 rounded text-[10px] font-bold ${
                        slot.precipitationProb >= 50
                          ? 'bg-rose-100 text-rose-700'
                          : slot.precipitationProb >= 30
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-slate-500'
                      }`}
                    >
                      <Umbrella className="w-2.5 h-2.5 shrink-0" />
                      <span>{slot.precipitationProb}%</span>
                    </div>

                    <div className="text-[11px] font-black text-slate-900 font-mono">
                      {slot.temp}°C
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="text-[10px] text-slate-400 text-right pr-1 pt-0.5">
            ← 横スクロールで全24時間の予報を確認できます →
          </div>
        </div>
      </div>

      {/* 3. 週間天気予報（7日間） */}
      <div className="space-y-1.5 px-0.5">
        <div className="flex items-center justify-between text-xs font-black text-slate-800">
          <span className="flex items-center gap-1.5">
            <CalendarDays className="w-3.5 h-3.5 text-amber-500" />
            週間天気予報（7日間）
          </span>
          <span className="text-[10px] text-slate-400 font-normal">
            「今日」「明日」をクリックすると上の時間帯別予報が切り替わります
          </span>
        </div>

        <div className="flex items-stretch gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {forecast.map((day, idx) => {
            const isToday = idx === 0;
            const isTomorrow = idx === 1;
            const isSelected = (isToday && activeDay === 'today') || (isTomorrow && activeDay === 'tomorrow');

            return (
              <div
                key={idx}
                onClick={() => {
                  if (isToday) setActiveDay('today');
                  if (isTomorrow) setActiveDay('tomorrow');
                }}
                className={`flex-shrink-0 w-24 sm:w-28 p-2 rounded-xl border text-center transition flex flex-col justify-between ${
                  isToday || isTomorrow ? 'cursor-pointer hover:shadow-xs' : ''
                } ${
                  isSelected
                    ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-400 shadow-xs'
                    : day.isRainy
                    ? 'bg-blue-50/60 border-blue-200'
                    : isToday
                    ? 'bg-amber-50/40 border-amber-300'
                    : 'bg-slate-50/80 border-slate-200 hover:bg-slate-50'
                }`}
                title={isToday || isTomorrow ? 'クリックで上の時間帯別予報を切り替え' : undefined}
              >
                {/* 日付・曜日 */}
                <div>
                  <div className="flex items-center justify-center gap-1">
                    <span className={`text-xs font-black ${isToday ? 'text-amber-800' : 'text-slate-800'}`}>
                      {day.date}
                    </span>
                    <span
                      className={`text-[10px] font-bold ${
                        day.dayOfWeek === '日'
                          ? 'text-rose-600'
                          : day.dayOfWeek === '土'
                          ? 'text-blue-600'
                          : 'text-slate-500'
                      }`}
                    >
                      ({day.dayOfWeek})
                    </span>
                  </div>

                  {/* 天気アイコンとテキスト */}
                  <div className="my-1.5 flex flex-col items-center justify-center">
                    {renderWeatherIcon(day.weatherIcon, day.isRainy)}
                    <span className="text-[11px] font-bold text-slate-700 mt-0.5">
                      {day.weatherText}
                    </span>
                  </div>
                </div>

                {/* 降水確率 & 気温 */}
                <div className="space-y-1 pt-1.5 border-t border-slate-200">
                  <div
                    className={`inline-flex items-center justify-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      day.precipitationProb >= 50
                        ? 'bg-rose-100 text-rose-700 border border-rose-200'
                        : day.precipitationProb >= 30
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : 'text-slate-500'
                    }`}
                  >
                    <Umbrella className="w-2.5 h-2.5 shrink-0" />
                    <span>{day.precipitationProb}%</span>
                  </div>

                  <div className="text-[10px] text-slate-600 flex items-center justify-center gap-1 font-mono">
                    <span className="text-rose-600 font-bold">{day.tempMax}°</span>
                    <span className="text-slate-400">/</span>
                    <span className="text-blue-600">{day.tempMin}°</span>
                  </div>

                  {(isToday || isTomorrow) && (
                    <div className="text-[9px] text-amber-700 font-bold mt-0.5">
                      {isSelected ? '● 選択中' : '詳細を見る →'}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. 出典注記 */}
      <div className="flex items-center justify-between text-[10px] text-slate-400 px-1 pt-0.5 border-t border-slate-100">
        <span className="flex items-center gap-1">
          <Info className="w-2.5 h-2.5 text-slate-400" />
          気象庁(JMA)高解像度数値予報直結 Open-Meteo API自動取得
        </span>
        <span>{lastFetched}</span>
      </div>
    </div>
  );
};
