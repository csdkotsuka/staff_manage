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
  CalendarDays,
  FileSpreadsheet,
  Download,
} from 'lucide-react';

// カラーテーマ定義
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

// ── 【過去の現場（完了）: すべて同一のスレートグレー色で統一】 ──
export const PAST_SITE_THEME: SiteColorTheme = {
  id: 'past-completed',
  name: '完了現場',
  bg: 'bg-slate-500',
  hoverBg: 'hover:bg-slate-600',
  border: 'border-slate-600',
  text: 'text-white',
  badgeBg: 'bg-slate-100',
  badgeText: 'text-slate-700',
  dot: 'bg-slate-500',
  ring: 'ring-slate-400',
};

// ── 【未来の現場（着工予定）: すべて同一のスカイブルー色で統一】 ──
export const FUTURE_SITE_THEME: SiteColorTheme = {
  id: 'future-planning',
  name: '着工予定',
  bg: 'bg-sky-500',
  hoverBg: 'hover:bg-sky-600',
  border: 'border-sky-600',
  text: 'text-white',
  badgeBg: 'bg-sky-50',
  badgeText: 'text-sky-700',
  dot: 'bg-sky-500',
  ring: 'ring-sky-400',
};

// ── 【現在進行形の現場（施工中）: 現場ごとに異なる鮮やかな個別色】 ──
export const IN_PROGRESS_PALETTES: SiteColorTheme[] = [
  {
    id: 'blue',
    name: '現場カラー: ブルー',
    bg: 'bg-blue-600',
    hoverBg: 'hover:bg-blue-700',
    border: 'border-blue-700',
    text: 'text-white',
    badgeBg: 'bg-blue-50',
    badgeText: 'text-blue-800',
    dot: 'bg-blue-500',
    ring: 'ring-blue-400',
  },
  {
    id: 'emerald',
    name: '現場カラー: エメラルド',
    bg: 'bg-emerald-600',
    hoverBg: 'hover:bg-emerald-700',
    border: 'border-emerald-700',
    text: 'text-white',
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-800',
    dot: 'bg-emerald-500',
    ring: 'ring-emerald-400',
  },
  {
    id: 'amber',
    name: '現場カラー: アンバー',
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
    name: '現場カラー: バイオレット',
    bg: 'bg-violet-600',
    hoverBg: 'hover:bg-violet-700',
    border: 'border-violet-700',
    text: 'text-white',
    badgeBg: 'bg-violet-50',
    badgeText: 'text-violet-800',
    dot: 'bg-violet-500',
    ring: 'ring-violet-400',
  },
  {
    id: 'rose',
    name: '現場カラー: ローズ',
    bg: 'bg-rose-600',
    hoverBg: 'hover:bg-rose-700',
    border: 'border-rose-700',
    text: 'text-white',
    badgeBg: 'bg-rose-50',
    badgeText: 'text-rose-800',
    dot: 'bg-rose-500',
    ring: 'ring-rose-400',
  },
  {
    id: 'teal',
    name: '現場カラー: ティール',
    bg: 'bg-teal-600',
    hoverBg: 'hover:bg-teal-700',
    border: 'border-teal-700',
    text: 'text-white',
    badgeBg: 'bg-teal-50',
    badgeText: 'text-teal-800',
    dot: 'bg-teal-500',
    ring: 'ring-teal-400',
  },
  {
    id: 'orange',
    name: '現場カラー: オレンジ',
    bg: 'bg-orange-600',
    hoverBg: 'hover:bg-orange-700',
    border: 'border-orange-700',
    text: 'text-white',
    badgeBg: 'bg-orange-50',
    badgeText: 'text-orange-800',
    dot: 'bg-orange-500',
    ring: 'ring-orange-400',
  },
  {
    id: 'indigo',
    name: '現場カラー: インディゴ',
    bg: 'bg-indigo-600',
    hoverBg: 'hover:bg-indigo-700',
    border: 'border-indigo-700',
    text: 'text-white',
    badgeBg: 'bg-indigo-50',
    badgeText: 'text-indigo-800',
    dot: 'bg-indigo-500',
    ring: 'ring-indigo-400',
  },
];

// 現場ステータスおよびIDに応じて色テーマを取得
export const getSiteColorTheme = (site: Site): SiteColorTheme => {
  if (site.status === 'completed') {
    return PAST_SITE_THEME;
  }
  if (site.status === 'planning') {
    return FUTURE_SITE_THEME;
  }

  // in_progress の現場: 現場IDのハッシュで安定して色分け
  let hash = 0;
  const idStr = site.id || site.name;
  for (let i = 0; i < idStr.length; i++) {
    hash = (hash << 5) - hash + idStr.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % IN_PROGRESS_PALETTES.length;
  return IN_PROGRESS_PALETTES[index];
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
  // 表示モード ('site-calendar': 現場工程月間カレンダー, 'list': 工期一覧リスト)
  const [viewMode, setViewMode] = useState<'site-calendar' | 'list'>('site-calendar');
  // 選択中の現場（詳細モーダル用）
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
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

  // Googleカレンダー一括投入用 iCalendar (.ics) ファイルの生成・ダウンロード
  const handleDownloadIcs = () => {
    const eventsWithDates = sites.filter((s) => s.startDate && s.endDate);
    if (eventsWithDates.length === 0) {
      alert('工期が設定された現場がありません');
      return;
    }

    let icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//CraftSync//Site Calendar//JA',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'X-WR-CALNAME:現場NOW 工期カレンダー',
      'X-WR-TIMEZONE:Asia/Tokyo',
    ];

    eventsWithDates.forEach((site) => {
      const sDate = site.startDate!.replace(/-/g, '');
      // 終日イベント終了日は+1日
      const eObj = new Date(site.endDate!);
      eObj.setDate(eObj.getDate() + 1);
      const eY = eObj.getFullYear();
      const eM = String(eObj.getMonth() + 1).padStart(2, '0');
      const eD = String(eObj.getDate()).padStart(2, '0');
      const eDate = `${eY}${eM}${eD}`;

      const desc = `工種: ${site.work_description || '一般施工'}\\n元請: ${site.client_name || '未設定'}\\n備考: ${site.notes || 'なし'}`;

      icsContent.push(
        'BEGIN:VEVENT',
        `UID:${site.id}-${Date.now()}@craftsync.local`,
        `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
        `DTSTART;VALUE=DATE:${sDate}`,
        `DTEND;VALUE=DATE:${eDate}`,
        `SUMMARY:【現場工期】${site.name}`,
        `DESCRIPTION:${desc}`,
        `LOCATION:${site.address || ''}`,
        `STATUS:CONFIRMED`,
        'END:VEVENT'
      );
    });

    icsContent.push('END:VCALENDAR');

    const blob = new Blob([icsContent.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `現場工期一括取込_${year}年${month + 1}月.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

  // 週ごとのスパンバー（日またぎ期間バー）およびスロット（段）計算
  const calendarWeeks = useMemo<CalendarWeek[]>(() => {
    const weeks: CalendarWeek[] = [];

    for (let w = 0; w < 6; w++) {
      const weekDays = calendarDays.slice(w * 7, (w + 1) * 7);
      const weekStartStr = weekDays[0].dateStr;
      const weekEndStr = weekDays[6].dateStr;

      // この週の期間（weekStartStr 〜 weekEndStr）と重複する現場
      const intersectingSites = sites.filter((site) => {
        if (!site.startDate || !site.endDate) return false;
        return site.startDate <= weekEndStr && site.endDate >= weekStartStr;
      });

      // 並び順：施工中（in_progress）を最優先にし、開始日昇順、期間降順
      const sortedSites = [...intersectingSites].sort((a, b) => {
        if (a.status === 'in_progress' && b.status !== 'in_progress') return -1;
        if (a.status !== 'in_progress' && b.status === 'in_progress') return 1;
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
          theme: getSiteColorTheme(site),
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
  }, [calendarDays, sites]);

  const getStatusBadge = (status: Site['status']) => {
    switch (status) {
      case 'completed':
        return {
          bg: 'bg-slate-100 text-slate-700 border-slate-300',
          dot: 'bg-slate-400',
          label: '過去完了現場',
        };
      case 'in_progress':
        return {
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          dot: 'bg-emerald-500',
          label: '施工中現場',
        };
      case 'planning':
        return {
          bg: 'bg-sky-50 text-sky-800 border-sky-200',
          dot: 'bg-sky-500',
          label: '着工予定現場',
        };
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
      {/* 1. カレンダーヘッダー */}
      <div className="p-3 sm:p-4 border-b border-slate-200 bg-slate-50/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-sm">
            <CalendarIcon className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-black text-slate-900 leading-tight">
              現場工程・月間カレンダー
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              各現場の工期を帯バー表示。施工中現場は固有色で識別できます
            </p>
          </div>
        </div>

        {/* 右側アクション：Googleカレンダー投入 & 現場追加 & Google開く */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Googleカレンダー一括投入ボタン (.ics) */}
          <button
            onClick={handleDownloadIcs}
            className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-lg border border-blue-200 transition shadow-xs flex items-center gap-1.5 active:scale-95"
            title="Googleカレンダーに一括で取り込めるファイル(.ics)をダウンロード"
          >
            <Download className="w-3.5 h-3.5 text-blue-600" />
            <span>Googleカレンダー一括取込 (.ics)</span>
          </button>

          {onOpenSiteManagement && (
            <button
              onClick={onOpenSiteManagement}
              className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg transition shadow-xs flex items-center gap-1 active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>現場登録</span>
            </button>
          )}

          <a
            href={googleCalendarDirectUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-lg border border-slate-300 transition shadow-xs flex items-center gap-1"
            title="Googleカレンダーアプリ・ブラウザで開く"
          >
            <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
            <span>Googleで開く</span>
          </a>
        </div>
      </div>

      {/* 2. ビュー切り替えタブ & 月送りナビゲーション（余分な絞り込みボタンや凡例テキストは完全撤廃） */}
      <div className="px-3 sm:px-4 py-2 border-b border-slate-200 bg-white flex items-center justify-between gap-2">
        {/* ビューモードタブ */}
        <div className="flex items-center bg-slate-100 p-0.5 rounded-lg w-fit border border-slate-200">
          <button
            onClick={() => setViewMode('site-calendar')}
            className={`px-2.5 py-1 rounded-md text-xs font-bold transition flex items-center gap-1.5 ${
              viewMode === 'site-calendar'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5 text-amber-500" />
            <span>月間カレンダー</span>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-2.5 py-1 rounded-md text-xs font-bold transition flex items-center gap-1.5 ${
              viewMode === 'list'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>工期一覧リスト ({sites.length})</span>
          </button>
        </div>

        {/* 月送りナビゲーション（シンプルに配置） */}
        {viewMode === 'site-calendar' && (
          <div className="flex items-center gap-1">
            <button
              onClick={handleToday}
              className="px-2 py-1 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-md border border-slate-300 transition"
            >
              今月
            </button>
            <button
              onClick={handlePrevMonth}
              className="p-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition"
              title="前月へ"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs sm:text-sm font-black text-slate-900 min-w-[90px] text-center">
              {year}年 {month + 1}月
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition"
              title="次月へ"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* 3. メインビューエリア */}
      <div className="p-2 sm:p-3 bg-white flex-1">
        {/* A. 現場工程月間カレンダービュー（連続スパンバー表示・余白削減＆低くスマートに） */}
        {viewMode === 'site-calendar' && (
          <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
            {/* 曜日ヘッダー */}
            <div className="grid grid-cols-7 bg-slate-100 border-b border-slate-200 text-center text-xs font-bold text-slate-700">
              <div className="py-1.5 text-rose-600 bg-rose-50/30">日</div>
              <div className="py-1.5">月</div>
              <div className="py-1.5">火</div>
              <div className="py-1.5">水</div>
              <div className="py-1.5">木</div>
              <div className="py-1.5">金</div>
              <div className="py-1.5 text-blue-600 bg-blue-50/30">土</div>
            </div>

            {/* 週ごとの行（6行・高さを低く、バーの余白を詰める） */}
            <div className="divide-y divide-slate-150">
              {calendarWeeks.map((week, weekIdx) => {
                // スロット数に応じて週の高さを計算（低く設定: 最低76px）
                const rowHeight = Math.max(76, 26 + week.maxSlots * 22 + 6);

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
                            className={`h-full p-1 flex flex-col justify-start transition ${
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
                                className={`text-[11px] font-bold inline-flex items-center justify-center w-4.5 h-4.5 rounded-full ${
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

                    {/* 上層：スパンバー（連続期間帯バー・余白削減でスリム化） */}
                    <div className="absolute inset-0 top-[23px] pointer-events-none">
                      {week.spanBars.map((bar) => {
                        const isHovered = hoveredSiteId === bar.site.id;
                        const leftPercent = (bar.startIndex / 7) * 100;
                        const widthPercent = (bar.span / 7) * 100;
                        const topPx = bar.slot * 22 + 1;

                        return (
                          <button
                            key={`${bar.site.id}-w${weekIdx}`}
                            onClick={() => setSelectedSite(bar.site)}
                            onMouseEnter={() => setHoveredSiteId(bar.site.id)}
                            onMouseLeave={() => setHoveredSiteId(null)}
                            style={{
                              left: `calc(${leftPercent}% + 2px)`,
                              width: `calc(${widthPercent}% - 4px)`,
                              top: `${topPx}px`,
                              height: '20px', // 高さをスリム化
                            }}
                            className={`absolute pointer-events-auto z-10 flex items-center px-1.5 text-[10px] font-bold text-left transition-all shadow-xs border ${
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
                            title={`${bar.site.name}\nステータス: ${
                              bar.site.status === 'in_progress'
                                ? '施工中'
                                : bar.site.status === 'completed'
                                ? '完了現場'
                                : '着工予定'
                            }\n工期: ${bar.site.startDate} 〜 ${bar.site.endDate}\n工種: ${
                              bar.site.work_description || '一般施工'
                            }`}
                          >
                            {/* 前週からの継続マーク */}
                            {!bar.isStartOfSite && (
                              <span className="mr-0.5 text-[9px] opacity-80 shrink-0 font-black">
                                ◀
                              </span>
                            )}

                            {/* 現場名テキスト */}
                            <span className="truncate flex-1 font-bold leading-tight">
                              {bar.site.name}
                            </span>

                            {/* 工期終了日の表示 または 次週への継続マーク */}
                            {bar.isEndOfSite ? (
                              <span className="ml-1 text-[8.5px] opacity-90 font-medium shrink-0 hidden sm:inline bg-black/20 px-1 py-0.2 rounded">
                                完 {bar.site.endDate?.slice(5)}
                              </span>
                            ) : (
                              <span className="ml-0.5 text-[9px] opacity-80 shrink-0 font-black">
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
        )}

        {/* B. 全現場工期一覧リストビュー */}
        {viewMode === 'list' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {sites.map((site) => {
                const badge = getStatusBadge(site.status);
                const theme = getSiteColorTheme(site);
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
                            {site.status === 'in_progress' ? '施工中' : site.status === 'completed' ? '過去完了' : '着工予定'}
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
                    {selectedSite.status === 'in_progress' ? '施工中現場' : selectedSite.status === 'completed' ? '過去完了現場' : '着工予定現場'}
                  </span>
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full border inline-flex items-center gap-1 ${
                      getSiteColorTheme(selectedSite).badgeBg
                    } ${getSiteColorTheme(selectedSite).badgeText}`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        getSiteColorTheme(selectedSite).dot
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
