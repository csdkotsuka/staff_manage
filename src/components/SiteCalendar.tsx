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
  CheckCircle2,
  CalendarCheck2,
  Layers,
  Plus,
  Info,
  CalendarDays,
  FileSpreadsheet,
} from 'lucide-react';

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

    // 日付フォーマット YYYYMMDD
    let datesParam = '';
    if (site.startDate && site.endDate) {
      const s = site.startDate.replace(/-/g, '');
      // 終了日は終日イベントの場合、翌日とするか同日を含めるため同日を指定
      const e = site.endDate.replace(/-/g, '');
      datesParam = `&dates=${s}/${e}`;
    }

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}${datesParam}`;
  };

  // カレンダーグリッドの日付計算
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const startDayOfWeek = firstDayOfMonth.getDay(); // 0: 日曜, 1: 月曜, ...
    const totalDaysInMonth = lastDayOfMonth.getDate();

    // 先月末の補完日数
    const prevMonthDaysCount = startDayOfWeek;
    const prevMonthLastDay = new Date(year, month, 0).getDate();

    const days: {
      date: Date;
      dateStr: string; // YYYY-MM-DD
      isCurrentMonth: boolean;
      isToday: boolean;
      dayNumber: number;
    }[] = [];

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

    // 次月分の補完（42枠 = 6行 × 7列に整える）
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

  // 各日付に該当する現場をマッピング
  const filteredSites = useMemo(() => {
    return sites.filter((site) => {
      if (statusFilter === 'all') return true;
      return site.status === statusFilter;
    });
  }, [sites, statusFilter]);

  // 日付文字列(YYYY-MM-DD)にヒットする現場を取得
  const getSitesForDate = (dateStr: string) => {
    return filteredSites.filter((site) => {
      if (!site.startDate || !site.endDate) return false;
      return dateStr >= site.startDate && dateStr <= site.endDate;
    });
  };

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
              各現場の開始日〜終了日を月間表示。Googleカレンダーとシームレスに同期・確認できます
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
        {/* A. 現場工程月間カレンダービュー */}
        {viewMode === 'site-calendar' && (
          <div className="space-y-3">
            {/* カレンダー凡例 */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs px-1">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-emerald-800 font-bold">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  施工中現場
                </span>
                <span className="flex items-center gap-1 text-sky-800 font-bold">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                  着工予定現場
                </span>
                <span className="flex items-center gap-1 text-slate-600 font-bold">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                  過去完了現場
                </span>
              </div>
              <span className="text-[11px] text-slate-500">
                ※バーをクリックすると現場詳細＆Googleカレンダー追加が開きます
              </span>
            </div>

            {/* カレンダーグリッドテーブル */}
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
              {/* 曜日ヘッダー */}
              <div className="grid grid-cols-7 bg-slate-100 border-b border-slate-200 text-center text-xs font-bold text-slate-700">
                <div className="py-2 text-rose-600">日</div>
                <div className="py-2">月</div>
                <div className="py-2">火</div>
                <div className="py-2">水</div>
                <div className="py-2">木</div>
                <div className="py-2">金</div>
                <div className="py-2 text-blue-600">土</div>
              </div>

              {/* 7列 × 6行の日付セルグリッド */}
              <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100">
                {calendarDays.map((day, idx) => {
                  const daySites = getSitesForDate(day.dateStr);
                  const isSun = idx % 7 === 0;
                  const isSat = idx % 7 === 6;

                  return (
                    <div
                      key={day.dateStr}
                      className={`min-h-[92px] sm:min-h-[115px] p-1 sm:p-1.5 flex flex-col transition hover:bg-slate-50/60 ${
                        !day.isCurrentMonth ? 'bg-slate-50/50 text-slate-400' : 'bg-white'
                      } ${day.isToday ? 'ring-2 ring-amber-400 ring-inset bg-amber-50/20' : ''}`}
                    >
                      {/* 日付ラベル */}
                      <div className="flex items-center justify-between mb-1">
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
                        {daySites.length > 0 && (
                          <span className="text-[10px] text-slate-400 font-medium hidden sm:inline">
                            {daySites.length}件
                          </span>
                        )}
                      </div>

                      {/* 該当現場のバー・バッジ一覧 */}
                      <div className="space-y-1 flex-1 overflow-y-auto max-h-[85px] scrollbar-none">
                        {daySites.map((site) => {
                          const badge = getStatusBadge(site.status);
                          return (
                            <button
                              key={site.id}
                              onClick={() => setSelectedSite(site)}
                              className={`w-full text-left text-[10px] sm:text-[11px] font-bold px-1.5 py-0.5 rounded truncate border transition-all hover:scale-[1.02] active:scale-98 flex items-center gap-1 ${badge.bg}`}
                              title={`${site.name} (${site.startDate} 〜 ${site.endDate})`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${badge.dot}`} />
                              <span className="truncate">{site.name}</span>
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
                return (
                  <div
                    key={site.id}
                    className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:border-slate-300 transition flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${badge.bg}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                          {badge.label}
                        </span>
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
                <h3 className="text-base font-black text-slate-900 mt-1.5 leading-snug">
                  {selectedSite.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedSite(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
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
