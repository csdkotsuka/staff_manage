'use client';

import React, { useState, useMemo } from 'react';
import { Site } from '@/lib/types';
import { GOOGLE_CALENDAR_ID } from '@/lib/mockData';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  MapPin,
  Clock,
  Building2,
  Layers,
  Plus,
  Info,
  CalendarDays,
  FileSpreadsheet,
} from 'lucide-react';

// 現場ごとのカラーパレット定義（視認性が高く識別しやすい12色）
export interface SiteColorTheme {
  id: string;
  name: string;
  bg: string;
  hoverBg: string;
  border: string;
  text: string;
  badgeBg: string;
  badgeText: string;
  dot: string;
  ring: string;
}

export const SITE_PALETTES: SiteColorTheme[] = [
  {
    id: 'blue',
    name: 'ブルー',
    bg: 'bg-blue-600',
    hoverBg: 'hover:bg-blue-700',
    border: 'border-blue-700',
    text: 'text-white',
    badgeBg: 'bg-blue-50',
    badgeText: 'text-blue-700',
    dot: 'bg-blue-500',
    ring: 'ring-blue-400',
  },
  {
    id: 'emerald',
    name: 'エメラルド',
    bg: 'bg-emerald-600',
    hoverBg: 'hover:bg-emerald-700',
    border: 'border-emerald-700',
    text: 'text-white',
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-700',
    dot: 'bg-emerald-500',
    ring: 'ring-emerald-400',
  },
  {
    id: 'amber',
    name: 'アンバーオレンジ',
    bg: 'bg-amber-600',
    hoverBg: 'hover:bg-amber-700',
    border: 'border-amber-700',
    text: 'text-white',
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-800',
    dot: 'bg-amber-500',
    ring: 'ring-amber-400',
  },
  {
    id: 'violet',
    name: 'バイオレット',
    bg: 'bg-violet-600',
    hoverBg: 'hover:bg-violet-700',
    border: 'border-violet-700',
    text: 'text-white',
    badgeBg: 'bg-violet-50',
    badgeText: 'text-violet-700',
    dot: 'bg-violet-500',
    ring: 'ring-violet-400',
  },
  {
    id: 'rose',
    name: 'ローズ',
    bg: 'bg-rose-600',
    hoverBg: 'hover:bg-rose-700',
    border: 'border-rose-700',
    text: 'text-white',
    badgeBg: 'bg-rose-50',
    badgeText: 'text-rose-700',
    dot: 'bg-rose-500',
    ring: 'ring-rose-400',
  },
  {
    id: 'cyan',
    name: 'シアン',
    bg: 'bg-cyan-600',
    hoverBg: 'hover:bg-cyan-700',
    border: 'border-cyan-700',
    text: 'text-white',
    badgeBg: 'bg-cyan-50',
    badgeText: 'text-cyan-700',
    dot: 'bg-cyan-500',
    ring: 'ring-cyan-400',
  },
  {
    id: 'teal',
    name: 'ティール',
    bg: 'bg-teal-600',
    hoverBg: 'hover:bg-teal-700',
    border: 'border-teal-700',
    text: 'text-white',
    badgeBg: 'bg-teal-50',
    badgeText: 'text-teal-700',
    dot: 'bg-teal-500',
    ring: 'ring-teal-400',
  },
  {
    id: 'indigo',
    name: 'インディゴ',
    bg: 'bg-indigo-600',
    hoverBg: 'hover:bg-indigo-700',
    border: 'border-indigo-700',
    text: 'text-white',
    badgeBg: 'bg-indigo-50',
    badgeText: 'text-indigo-700',
    dot: 'bg-indigo-500',
    ring: 'ring-indigo-400',
  },
  {
    id: 'fuchsia',
    name: 'フューシャ',
    bg: 'bg-fuchsia-600',
    hoverBg: 'hover:bg-fuchsia-700',
    border: 'border-fuchsia-700',
    text: 'text-white',
    badgeBg: 'bg-fuchsia-50',
    badgeText: 'text-fuchsia-700',
    dot: 'bg-fuchsia-500',
    ring: 'ring-fuchsia-400',
  },
  {
    id: 'lime',
    name: 'ライムグリーン',
    bg: 'bg-lime-700',
    hoverBg: 'hover:bg-lime-800',
    border: 'border-lime-800',
    text: 'text-white',
    badgeBg: 'bg-lime-50',
    badgeText: 'text-lime-800',
    dot: 'bg-lime-600',
    ring: 'ring-lime-400',
  },
  {
    id: 'orange',
    name: 'オレンジ',
    bg: 'bg-orange-600',
    hoverBg: 'hover:bg-orange-700',
    border: 'border-orange-700',
    text: 'text-white',
    badgeBg: 'bg-orange-50',
    badgeText: 'text-orange-700',
    dot: 'bg-orange-500',
    ring: 'ring-orange-400',
  },
  {
    id: 'slate',
    name: 'スレート',
    bg: 'bg-slate-700',
    hoverBg: 'hover:bg-slate-800',
    border: 'border-slate-800',
    text: 'text-white',
    badgeBg: 'bg-slate-100',
    badgeText: 'text-slate-800',
    dot: 'bg-slate-600',
    ring: 'ring-slate-400',
  },
];

// 現場IDに基づき安定した色テーマを割り当て
export const getSiteColorTheme = (siteId: string): SiteColorTheme => {
  let hash = 0;
  for (let i = 0; i < siteId.length; i++) {
    hash = (hash << 5) - hash + siteId.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % SITE_PALETTES.length;
  return SITE_PALETTES[index];
};

interface DayCell {
  date: Date;
  dateStr: string; // YYYY-MM-DD
  isCurrentMonth: boolean;
  isToday: boolean;
  dayNumber: number;
}

interface WeekSpanBar {
  site: Site;
  theme: SiteColorTheme;
  startIndex: number; // 0..6 (日〜土)
  endIndex: number;   // 0..6
  span: number;       // 1..7 (横断日数)
  isStartOfSite: boolean; // この週に現場の開始日が含まれるか
  isEndOfSite: boolean;   // この週に現場の終了日が含まれるか
  slot: number;       // 重複を避けるための行スロット番号 (0, 1, 2...)
}

interface CalendarWeek {
  days: DayCell[];
  spanBars: WeekSpanBar[];
  maxSlots: number;
}

interface SiteCalendarProps {
  sites: Site[];
  onOpenSiteManagement?: () => void;
  onFocusOnMap?: (lat: number, lng: number) => void;
}

export const SiteCalendar: React.FC<SiteCalendarProps> = ({
  sites,
  onOpenSiteManagement,
  onFocusOnMap,
}) => {
  // カレンダーの表示月（初期値: 現在年月）
  const [currentDate, setCurrentDate] = useState(() => new Date());
  // 表示モード ('site-calendar': 現場工程月間カレンダー, 'google-embed': Googleカレンダー埋め込み, 'list': 工期一覧)
  const [viewMode, setViewMode] = useState<'site-calendar' | 'google-embed' | 'list'>('site-calendar');
  // 選択中の現場（詳細モーダル/ポップアップ用）
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  // ステータスフィルター
  const [statusFilter, setStatusFilter] = useState<'all' | 'in_progress' | 'planning' | 'completed'>('all');
  // ホバーまたはハイライト中の現場ID
  const [hoveredSiteId, setHoveredSiteId] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed

  // 前月 / 次月 / 今月
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };
  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };
  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Googleカレンダー埋め込みURL
  const googleCalendarEmbedUrl = useMemo(() => {
    const encodedId = encodeURIComponent(GOOGLE_CALENDAR_ID);
    return `https://calendar.google.com/calendar/embed?src=${encodedId}&ctz=Asia%2FTokyo&hl=ja&mode=MONTH&showTitle=0&showNav=1&showDate=1&showPrint=0&showTabs=1&showCalendars=0&showTz=0&bgcolor=%23ffffff`;
  }, []);

  // Googleカレンダーで直接開くURL
  const googleCalendarDirectUrl = useMemo(() => {
    const encodedId = encodeURIComponent(GOOGLE_CALENDAR_ID);
    return `https://calendar.google.com/calendar/u/0/r?cid=${encodedId}`;
  }, []);

  // 現場をGoogleカレンダーに登録するURLを生成
  const getAddToGoogleCalendarUrl = (site: Site) => {
    const title = encodeURIComponent(`【現場工期】${site.name}`);
    const details = encodeURIComponent(
      `工種: ${site.work_description || '一般施工'}\n元請: ${site.client_name || '未設定'}\n備考: ${
        site.notes || 'なし'
      }`
    );
    const location = encodeURIComponent(site.address || '');

    let datesParam = '';
    if (site.startDate && site.endDate) {
      const s = site.startDate.replace(/-/g, '');
      const e = site.endDate.replace(/-/g, '');
      datesParam = `&dates=${s}/${e}`;
    }

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}${datesParam}`;
  };

  // カレンダーグリッドの日付計算（42枠 = 6週 × 7日）
  const calendarDays = useMemo<DayCell[]>(() => {
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const startDayOfWeek = firstDayOfMonth.getDay(); // 0: 日曜
    const totalDaysInMonth = lastDayOfMonth.getDate();

    // 先月末の補完日数
    const prevMonthDaysCount = startDayOfWeek;
    const prevMonthLastDay = new Date(year, month, 0).getDate();

    const days: DayCell[] = [];
    const todayStr = new Date().toISOString().split('T')[0];

    // 先月分の日付
    for (let i = prevMonthDaysCount - 1; i >= 0; i--) {
      const d = prevMonthLastDay - i;
      const dateObj = new Date(year, month - 1, d);
      const m = String(dateObj.getMonth() + 1).padStart(2, '0');
      const dateStr = `${dateObj.getFullYear()}-${m}-${String(d).padStart(2, '0')}`;
      days.push({
        date: dateObj,
        dateStr,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
        dayNumber: d,
      });
    }

    // 今月分の日付
    for (let d = 1; d <= totalDaysInMonth; d++) {
      const m = String(month + 1).padStart(2, '0');
      const dateStr = `${year}-${m}-${String(d).padStart(2, '0')}`;
      const dateObj = new Date(year, month, d);
      days.push({
        date: dateObj,
        dateStr,
        isCurrentMonth: true,
        isToday: dateStr === todayStr,
        dayNumber: d,
      });
    }

    // 次月分の補完（42枠に整える）
    const remainingDays = 42 - days.length;
    for (let d = 1; d <= remainingDays; d++) {
      const dateObj = new Date(year, month + 1, d);
      const m = String(dateObj.getMonth() + 1).padStart(2, '0');
      const dateStr = `${dateObj.getFullYear()}-${m}-${String(d).padStart(2, '0')}`;
      days.push({
        date: dateObj,
        dateStr,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
        dayNumber: d,
      });
    }

    return days;
  }, [year, month]);

  // フィルタリングされた現場
  const filteredSites = useMemo(() => {
    return sites.filter((site) => {
      if (statusFilter === 'all') return true;
      return site.status === statusFilter;
    });
  }, [sites, statusFilter]);

  // 表示中の月（月初〜月末）に関わる現場リスト（凡例用）
  const activeMonthSites = useMemo(() => {
    const monthStartStr = `${year}-${String(month + 1).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month + 1, 0).getDate();
    const monthEndStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    return filteredSites.filter((site) => {
      if (!site.startDate || !site.endDate) return false;
      return site.startDate <= monthEndStr && site.endDate >= monthStartStr;
    });
  }, [filteredSites, year, month]);

  // 週ごとのスパンバー（日またぎ期間バー）およびスロット（段）計算
  const calendarWeeks = useMemo<CalendarWeek[]>(() => {
    const weeks: CalendarWeek[] = [];

    for (let w = 0; w < 6; w++) {
      const weekDays = calendarDays.slice(w * 7, (w + 1) * 7);
      const weekStartStr = weekDays[0].dateStr;
      const weekEndStr = weekDays[6].dateStr;

      // この週の期間（weekStartStr 〜 weekEndStr）と重複する現場
      const intersectingSites = filteredSites.filter((site) => {
        if (!site.startDate || !site.endDate) return false;
        return site.startDate <= weekEndStr && site.endDate >= weekStartStr;
      });

      // 開始日が早い順、同じなら期間が長い順にソート（安定した配置のため）
      const sortedSites = [...intersectingSites].sort((a, b) => {
        const aStart = a.startDate || '';
        const bStart = b.startDate || '';
        if (aStart !== bStart) return aStart.localeCompare(bStart);
        const aEnd = a.endDate || '';
        const bEnd = b.endDate || '';
        return bEnd.localeCompare(aEnd);
      });

      // 各現場のその週における開始位置（0〜6）と終了位置（0〜6）を算出
      const rawSpanItems = sortedSites.map((site) => {
        const sDate = site.startDate!;
        const eDate = site.endDate!;

        let startIndex = 0;
        while (startIndex < 7 && weekDays[startIndex].dateStr < sDate) {
          startIndex++;
        }

        let endIndex = 6;
        while (endIndex >= 0 && weekDays[endIndex].dateStr > eDate) {
          endIndex--;
        }

        const span = Math.max(1, endIndex - startIndex + 1);
        const isStartOfSite = sDate >= weekStartStr && sDate <= weekEndStr;
        const isEndOfSite = eDate >= weekStartStr && eDate <= weekEndStr;

        return {
          site,
          theme: getSiteColorTheme(site.id),
          startIndex,
          endIndex,
          span,
          isStartOfSite,
          isEndOfSite,
          slot: 0,
        };
      });

      // 重複しないように縦のスロット（段）を割り当て（Interval Coloring）
      const slotsMatrix: boolean[][] = [];
      const placedBars: WeekSpanBar[] = [];

      for (const item of rawSpanItems) {
        let targetSlot = 0;
        while (true) {
          if (!slotsMatrix[targetSlot]) {
            slotsMatrix[targetSlot] = [false, false, false, false, false, false, false];
          }
          let hasConflict = false;
          for (let d = item.startIndex; d <= item.endIndex; d++) {
            if (slotsMatrix[targetSlot][d]) {
              hasConflict = true;
              break;
            }
          }
          if (!hasConflict) {
            for (let d = item.startIndex; d <= item.endIndex; d++) {
              slotsMatrix[targetSlot][d] = true;
            }
            item.slot = targetSlot;
            placedBars.push(item);
            break;
          }
          targetSlot++;
        }
      }

      const maxSlots = placedBars.length > 0 ? Math.max(...placedBars.map((b) => b.slot + 1)) : 0;

      weeks.push({
        days: weekDays,
        spanBars: placedBars,
        maxSlots,
      });
    }

    return weeks;
  }, [calendarDays, filteredSites]);

  const getStatusBadge = (status: Site['status']) => {
    switch (status) {
      case 'completed':
        return {
          bg: 'bg-slate-100 text-slate-700 border-slate-300',
          dot: 'bg-slate-400',
          label: '完了現場',
        };
      case 'in_progress':
        return {
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          dot: 'bg-emerald-500',
          label: '施工中',
        };
      case 'planning':
        return {
          bg: 'bg-sky-50 text-sky-800 border-sky-200',
          dot: 'bg-sky-500',
          label: '着工予定',
        };
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
      {/* 1. カレンダーヘッダー */}
      <div className="p-3.5 sm:p-5 border-b border-slate-200 bg-slate-50/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-sm">
            <CalendarIcon className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                現場工期・月間カレンダー
              </h2>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold border border-blue-200 flex items-center gap-1">
                Googleカレンダー連携
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              開始日〜終了日を連続した帯バーで表示。同日に複数の現場があっても色分けで一目で把握できます
            </p>
          </div>
        </div>

        {/* 右側アクション：現場追加 & Googleカレンダー直接表示 */}
        <div className="flex items-center gap-2">
          {onOpenSiteManagement && (
            <button
              onClick={onOpenSiteManagement}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg transition shadow-sm flex items-center gap-1.5 active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>現場工期を登録</span>
            </button>
          )}

          <a
            href={googleCalendarDirectUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-lg border border-slate-300 transition shadow-sm flex items-center gap-1.5"
            title="Googleカレンダーアプリ・ブラウザで直接開く"
          >
            <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Googleで開く</span>
          </a>
        </div>
      </div>

      {/* 2. ビュー切り替えタブ & 月送りナビゲーション */}
      <div className="px-3.5 sm:px-5 py-3 border-b border-slate-200 bg-white flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* ビューモードタブ */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl w-fit border border-slate-200">
          <button
            onClick={() => setViewMode('site-calendar')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              viewMode === 'site-calendar'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5 text-amber-500" />
            <span>現場工程月間カレンダー</span>
          </button>
          <button
            onClick={() => setViewMode('google-embed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              viewMode === 'google-embed'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
            <span>Googleカレンダー公式表示</span>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              viewMode === 'list'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>工期一覧リスト（{sites.length}件）</span>
          </button>
        </div>

        {/* 月送りナビゲーション（工程カレンダー表示時） */}
        {viewMode === 'site-calendar' && (
          <div className="flex items-center justify-between sm:justify-end gap-2.5">
            {/* ステータスフィルター */}
            <div className="flex items-center gap-1 text-xs">
              <span className="text-slate-500 text-[11px] hidden sm:inline mr-1">絞込:</span>
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-2 py-1 rounded text-[11px] font-bold transition ${
                  statusFilter === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                全{sites.length}件
              </button>
              <button
                onClick={() => setStatusFilter('in_progress')}
                className={`px-2 py-1 rounded text-[11px] font-bold transition ${
                  statusFilter === 'in_progress'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                }`}
              >
                施工中
              </button>
              <button
                onClick={() => setStatusFilter('planning')}
                className={`px-2 py-1 rounded text-[11px] font-bold transition ${
                  statusFilter === 'planning'
                    ? 'bg-sky-600 text-white'
                    : 'bg-sky-50 text-sky-700 hover:bg-sky-100'
                }`}
              >
                予定
              </button>
              <button
                onClick={() => setStatusFilter('completed')}
                className={`px-2 py-1 rounded text-[11px] font-bold transition ${
                  statusFilter === 'completed'
                    ? 'bg-slate-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                過去完了
              </button>
            </div>

            <div className="h-4 w-px bg-slate-300 hidden sm:block" />

            {/* 前月・今月・次月ボタン */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleToday}
                className="px-2.5 py-1 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-300 transition"
              >
                今月
              </button>
              <button
                onClick={handlePrevMonth}
                className="p-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                title="前月へ"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-sm font-black text-slate-900 min-w-[100px] text-center">
                {year}年 {month + 1}月
              </span>
              <button
                onClick={handleNextMonth}
                className="p-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                title="次月へ"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 3. メインビューエリア */}
      <div className="p-3 sm:p-5 bg-white flex-1">
        {/* A. 現場工程月間カレンダービュー（連続スパンバー表示） */}
        {viewMode === 'site-calendar' && (
          <div className="space-y-4">
            {/* 今月稼働中の現場カラー凡例（レジェンド） */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  当月の現場カラー凡例（各現場に固有の色を割り当てて視覚的に区別しています）
                </span>
                <span className="text-[11px] text-slate-500">
                  ※バーまたはタグをクリックすると現場詳細が開きます
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {activeMonthSites.length === 0 ? (
                  <span className="text-xs text-slate-400">
                    表示中の月に該当する現場はありません
                  </span>
                ) : (
                  activeMonthSites.map((site) => {
                    const theme = getSiteColorTheme(site.id);
                    const isHovered = hoveredSiteId === site.id;
                    return (
                      <button
                        key={site.id}
                        onClick={() => setSelectedSite(site)}
                        onMouseEnter={() => setHoveredSiteId(site.id)}
                        onMouseLeave={() => setHoveredSiteId(null)}
                        className={`text-xs px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1.5 font-bold ${
                          theme.badgeBg
                        } ${theme.badgeText} ${
                          isHovered
                            ? 'ring-2 ring-slate-800 scale-105 shadow-sm'
                            : 'border-slate-200 hover:shadow-xs'
                        }`}
                        title={`${site.name} (${site.startDate} 〜 ${site.endDate})`}
                      >
                        <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${theme.dot}`} />
                        <span className="truncate max-w-[170px]">{site.name}</span>
                        <span className="text-[10px] opacity-75 font-normal">
                          ({site.startDate?.slice(5)}〜{site.endDate?.slice(5)})
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* カレンダーグリッドコンテナ */}
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
              {/* 曜日ヘッダー */}
              <div className="grid grid-cols-7 bg-slate-100 border-b border-slate-200 text-center text-xs font-bold text-slate-700">
                <div className="py-2.5 text-rose-600 bg-rose-50/30">日</div>
                <div className="py-2.5">月</div>
                <div className="py-2.5">火</div>
                <div className="py-2.5">水</div>
                <div className="py-2.5">木</div>
                <div className="py-2.5">金</div>
                <div className="py-2.5 text-blue-600 bg-blue-50/30">土</div>
              </div>

              {/* 週ごとの行（6行） */}
              <div className="divide-y divide-slate-200">
                {calendarWeeks.map((week, weekIdx) => {
                  // スロット数に応じて週の高さを動的に確保（最低 96px、バーが多い場合は拡張）
                  const rowHeight = Math.max(96, 32 + week.maxSlots * 26 + 10);

                  return (
                    <div
                      key={weekIdx}
                      className="relative"
                      style={{ minHeight: `${rowHeight}px` }}
                    >
                      {/* 下層：7日分のセルマス目背景 */}
                      <div className="grid grid-cols-7 divide-x divide-slate-100 absolute inset-0">
                        {week.days.map((day, dayIdx) => {
                          const isSun = dayIdx === 0;
                          const isSat = dayIdx === 6;

                          return (
                            <div
                              key={day.dateStr}
                              className={`h-full p-1.5 flex flex-col justify-start transition ${
                                !day.isCurrentMonth
                                  ? 'bg-slate-50/60'
                                  : isSun
                                  ? 'bg-rose-50/15'
                                  : isSat
                                  ? 'bg-blue-50/15'
                                  : 'bg-white'
                              } ${day.isToday ? 'bg-amber-50/30 ring-2 ring-amber-400 ring-inset' : ''}`}
                            >
                              {/* 日付ラベル */}
                              <div className="flex items-center justify-between">
                                <span
                                  className={`text-xs font-bold inline-flex items-center justify-center w-5 h-5 rounded-full ${
                                    day.isToday
                                      ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                                      : isSun
                                      ? 'text-rose-600'
                                      : isSat
                                      ? 'text-blue-600'
                                      : day.isCurrentMonth
                                      ? 'text-slate-800'
                                      : 'text-slate-400'
                                  }`}
                                >
                                  {day.dayNumber}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* 上層：スパンバー（連続期間帯バー）描画レイヤー */}
                      <div className="absolute inset-0 top-[28px] pointer-events-none">
                        {week.spanBars.map((bar) => {
                          const isHovered = hoveredSiteId === bar.site.id;
                          const leftPercent = (bar.startIndex / 7) * 100;
                          const widthPercent = (bar.span / 7) * 100;
                          const topPx = bar.slot * 25 + 2;

                          return (
                            <button
                              key={`${bar.site.id}-w${weekIdx}`}
                              onClick={() => setSelectedSite(bar.site)}
                              onMouseEnter={() => setHoveredSiteId(bar.site.id)}
                              onMouseLeave={() => setHoveredSiteId(null)}
                              style={{
                                left: `calc(${leftPercent}% + 3px)`,
                                width: `calc(${widthPercent}% - 6px)`,
                                top: `${topPx}px`,
                                height: '23px',
                              }}
                              className={`absolute pointer-events-auto z-10 flex items-center px-2 text-[11px] font-bold text-left transition-all shadow-xs border ${
                                bar.theme.bg
                              } ${bar.theme.text} ${bar.theme.border} ${
                                bar.isStartOfSite ? 'rounded-l-md' : 'rounded-l-none border-l-0'
                              } ${
                                bar.isEndOfSite ? 'rounded-r-md' : 'rounded-r-none border-r-0'
                              } ${
                                isHovered
                                  ? 'brightness-110 ring-2 ring-slate-900 scale-[1.01] shadow-md z-20'
                                  : 'hover:brightness-105 hover:shadow-xs'
                              }`}
                              title={`${bar.site.name}\n工期: ${bar.site.startDate} 〜 ${bar.site.endDate}\n工種: ${
                                bar.site.work_description || '一般施工'
                              }`}
                            >
                              {/* 前週からの継続マーク */}
                              {!bar.isStartOfSite && (
                                <span className="mr-1 text-[10px] opacity-80 shrink-0 font-black">
                                  ◀
                                </span>
                              )}

                              {/* 現場名テキスト */}
                              <span className="truncate flex-1 font-bold">
                                {bar.site.name}
                              </span>

                              {/* 工期終了日の表示 または 次週への継続マーク */}
                              {bar.isEndOfSite ? (
                                <span className="ml-1 text-[9px] opacity-90 font-medium shrink-0 hidden sm:inline bg-black/20 px-1 rounded">
                                  完工 {bar.site.endDate?.slice(5)}
                                </span>
                              ) : (
                                <span className="ml-1 text-[10px] opacity-80 shrink-0 font-black">
                                  ▶
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* B. Googleカレンダー公式埋め込みビュー */}
        {viewMode === 'google-embed' && (
          <div className="space-y-3">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shadow-xs">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-600 shrink-0" />
                <div>
                  <strong>連携中カレンダーID:</strong>{' '}
                  <span className="font-mono text-[11px] bg-white px-2 py-0.5 rounded border border-blue-200">
                    {GOOGLE_CALENDAR_ID}
                  </span>
                </div>
              </div>
              <a
                href={googleCalendarDirectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs bg-blue-600 hover:bg-blue-500 text-white font-bold px-3 py-1.5 rounded-lg transition shrink-0 flex items-center gap-1 shadow-xs"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Googleカレンダーを開く
              </a>
            </div>

            {/* Google Calendar Iframe */}
            <div className="w-full h-[600px] rounded-xl border border-slate-300 overflow-hidden shadow-sm bg-white">
              <iframe
                src={googleCalendarEmbedUrl}
                style={{ borderWidth: 0 }}
                width="100%"
                height="100%"
                frameBorder="0"
                scrolling="no"
                title="Google Calendar"
                className="w-full h-full"
              />
            </div>
          </div>
        )}

        {/* C. 全現場工期一覧リストビュー */}
        {viewMode === 'list' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {sites.map((site) => {
                const badge = getStatusBadge(site.status);
                const theme = getSiteColorTheme(site.id);
                return (
                  <div
                    key={site.id}
                    className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:border-slate-300 transition flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${badge.bg}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                            {badge.label}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${theme.badgeBg} ${theme.badgeText} border-slate-200`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${theme.dot}`} />
                            {theme.name}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-medium">
                          {site.client_name}
                        </span>
                      </div>

                      <h4 className="font-bold text-slate-900 text-sm mt-2 leading-snug">
                        {site.name}
                      </h4>

                      <p className="text-xs text-slate-600 mt-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        {site.address}
                      </p>

                      <div className="mt-2.5 pt-2 border-t border-slate-100 space-y-1 text-xs">
                        <p className="text-amber-800 font-medium text-[11px]">
                          工種: {site.work_description || '一般施工'}
                        </p>
                        <p className="text-blue-700 font-bold text-[11px] flex items-center gap-1">
                          <Clock className="w-3 h-3 text-blue-500" />
                          工期: {site.startDate || '未定'} 〜 {site.endDate || '未定'}
                        </p>
                        {site.notes && (
                          <p className="text-slate-500 text-[10px] bg-slate-50 p-2 rounded border border-slate-100 mt-1.5">
                            <span className="font-bold text-slate-700">備考:</span> {site.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                      {onFocusOnMap && (
                        <button
                          onClick={() => onFocusOnMap(site.lat, site.lng)}
                          className="text-xs text-sky-600 hover:text-sky-700 font-bold"
                        >
                          地図で見る
                        </button>
                      )}
                      <a
                        href={getAddToGoogleCalendarUrl(site)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold px-2.5 py-1 rounded-lg transition flex items-center gap-1"
                      >
                        <CalendarIcon className="w-3 h-3 text-blue-600" />
                        Google予定追加
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 4. 現場詳細モーダル（カレンダー上の現場クリック時） */}
      {selectedSite && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-3 animate-in fade-in duration-150"
          onClick={() => setSelectedSite(null)}
        >
          <div
            className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-5 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full border inline-flex items-center gap-1 ${
                      getStatusBadge(selectedSite.status).bg
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        getStatusBadge(selectedSite.status).dot
                      }`}
                    />
                    {getStatusBadge(selectedSite.status).label}
                  </span>
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full border inline-flex items-center gap-1 ${
                      getSiteColorTheme(selectedSite.id).badgeBg
                    } ${getSiteColorTheme(selectedSite.id).badgeText}`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        getSiteColorTheme(selectedSite.id).dot
                      }`}
                    />
                    カレンダー表示色
                  </span>
                </div>
                <h3 className="text-base font-black text-slate-900 mt-1.5 leading-snug">
                  {selectedSite.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedSite(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>{selectedSite.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>元請: {selectedSite.client_name || '未設定'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>工種: {selectedSite.work_description || '一般施工'}</span>
              </div>
              <div className="flex items-center gap-2 text-blue-700 font-bold">
                <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>工期: {selectedSite.startDate || '未定'} 〜 {selectedSite.endDate || '未定'}</span>
              </div>
              {selectedSite.notes && (
                <div className="pt-2 mt-1 border-t border-slate-200 text-slate-600">
                  <span className="font-bold text-slate-800">特記事項:</span> {selectedSite.notes}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-2 pt-1">
              {onFocusOnMap && (
                <button
                  onClick={() => {
                    onFocusOnMap(selectedSite.lat, selectedSite.lng);
                    setSelectedSite(null);
                  }}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs transition"
                >
                  地図で表示
                </button>
              )}

              <a
                href={getAddToGoogleCalendarUrl(selectedSite)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition shadow-sm flex items-center justify-center gap-1.5"
              >
                <CalendarIcon className="w-4 h-4" />
                Googleカレンダーに追加する
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
