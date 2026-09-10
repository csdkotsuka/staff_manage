'use client';

import React, { useState } from 'react';
import { useStaffStatus } from '@/hooks/useStaffStatus';
import { INITIAL_SITES } from '@/lib/mockData';
import { StaffStatus } from '@/lib/types';
import { Header } from '@/components/Header';
import { MapWrapper } from '@/components/MapWrapper';
import { StaffCard } from '@/components/StaffCard';
import { RescueModal } from '@/components/RescueModal';
import { AiAssistant } from '@/components/AiAssistant';
import { 
  Bell, 
  MapPin, 
  Hammer, 
  Truck, 
  Sparkles, 
  AlertCircle,
  Building2,
  Info
} from 'lucide-react';

export default function Home() {
  const {
    staffs,
    currentStaffId,
    setCurrentStaffId,
    updateStatus,
    resetToDefault,
    isLiveConnected,
    isMockMode,
    lastNotification,
  } = useStaffStatus();

  // モーダル・チャット開閉状態
  const [isRescueModalOpen, setIsRescueModalOpen] = useState(false);
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);

  // 地図のフォーカス座標
  const [focusCoord, setFocusCoord] = useState<{ lat: number; lng: number } | null>(null);
  // レスキューターゲット座標
  const [targetRescueCoord, setTargetRescueCoord] = useState<{ lat: number; lng: number; title: string } | null>(null);

  // 稼働サマリー集計
  const countWorking = staffs.filter((s) => s.status === 'working').length;
  const countMoving = staffs.filter((s) => s.status === 'moving').length;
  const countAvailable = staffs.filter((s) => s.status === 'available').length;

  // 地図を社員の位置へフォーカス
  const handleFocusOnMap = (lat: number, lng: number) => {
    setFocusCoord({ lat, lng });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // レスキュー出動要請
  const handleDispatchStaff = (staffId: string, siteName: string, note: string) => {
    updateStatus(staffId, 'moving', siteName, note);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-400 selection:text-slate-950">
      {/* 1. アプリヘッダー */}
      <Header
        staffs={staffs}
        currentStaffId={currentStaffId}
        onSelectStaff={setCurrentStaffId}
        onOpenRescueModal={() => setIsRescueModalOpen(true)}
        onToggleAiChat={() => setIsAiChatOpen(!isAiChatOpen)}
        isAiChatOpen={isAiChatOpen}
        isLiveConnected={isLiveConnected}
        isMockMode={isMockMode}
        onReset={resetToDefault}
      />

      {/* リアルタイム更新通知トースト */}
      {lastNotification && (
        <div className="fixed top-16 right-4 z-40 bg-amber-400 text-slate-950 px-4 py-2.5 rounded-xl shadow-2xl font-black text-xs flex items-center gap-2 border border-white/40 animate-in slide-in-from-top duration-200">
          <Bell className="w-4 h-4 text-slate-950 animate-bounce" />
          <span>{lastNotification}</span>
        </div>
      )}

      {/* 2. メインコンテンツエリア */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 space-y-4">
        {/* モックモードガイダンス（ユーザーが即座に動作確認できるように説明） */}
        {isMockMode && (
          <div className="bg-slate-900/90 border border-amber-500/30 rounded-xl p-3 text-xs text-slate-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shadow-md">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong>デモモード動作中:</strong> 別タブでこのURLを開いてステータスを変更すると、リアルタイムに双方向同期します。
                Supabase URLとANONキーを<code>.env.local</code>に設定すると本番Supabase Realtimeに切り替わります。
              </span>
            </div>
            <a
              href="#supabase-guide"
              className="text-amber-400 hover:text-amber-300 underline shrink-0 font-bold"
            >
              DBスキーマ(SQL)あり
            </a>
          </div>
        )}

        {/* 現場サマリーKPI（現場監督・社長が一目で状況把握） */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <div className="bg-slate-900/80 border border-emerald-500/30 rounded-xl p-2.5 sm:p-3 flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
              <Hammer className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <span className="text-[10px] sm:text-xs text-slate-400 block font-medium">
                施工作業中
              </span>
              <span className="text-base sm:text-xl font-black text-emerald-400">
                {countWorking} <span className="text-xs font-normal text-slate-400">名</span>
              </span>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-blue-500/30 rounded-xl p-2.5 sm:p-3 flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
              <Truck className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <span className="text-[10px] sm:text-xs text-slate-400 block font-medium">
                現場移動中
              </span>
              <span className="text-base sm:text-xl font-black text-blue-400">
                {countMoving} <span className="text-xs font-normal text-slate-400">名</span>
              </span>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-amber-500/40 rounded-xl p-2.5 sm:p-3 flex items-center gap-2.5 shadow-md shadow-amber-500/5">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <span className="text-[10px] sm:text-xs text-amber-300 block font-bold">
                移動可能 (急募可)
              </span>
              <span className="text-base sm:text-xl font-black text-amber-400">
                {countAvailable} <span className="text-xs font-normal text-slate-400">名</span>
              </span>
            </div>
          </div>
        </div>

        {/* 3. 現場マップコンポーネント */}
        <section className="space-y-1.5">
          <div className="flex items-center justify-between">
            <h2 className="text-xs sm:text-sm font-black text-slate-200 flex items-center gap-1.5 uppercase tracking-wider">
              <MapPin className="w-4 h-4 text-amber-400" />
              今日の現場マップ & 社員現在地
            </h2>
            <span className="text-[11px] text-slate-400">
              全{staffs.length}名の位置をピン表示
            </span>
          </div>

          <MapWrapper
            staffs={staffs}
            sites={INITIAL_SITES}
            currentStaffId={currentStaffId}
            focusCoord={focusCoord}
            targetRescueCoord={targetRescueCoord}
          />
        </section>

        {/* 4. 社員5名ステータスカード一覧 */}
        <section className="space-y-2 pt-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-black text-slate-200 flex items-center gap-1.5">
                <span>👷‍♂️ 社員ステータスボード（全5名）</span>
              </h2>
              <p className="text-[11px] text-slate-400">
                自端末の社員カードからワンタップでステータス変更可能
              </p>
            </div>
            <button
              onClick={() => setIsRescueModalOpen(true)}
              className="sm:hidden px-3 py-1 bg-red-600 text-white rounded-lg text-xs font-bold flex items-center gap-1"
            >
              急募
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {staffs.map((staff) => (
              <StaffCard
                key={staff.id}
                staff={staff}
                isCurrentUser={staff.id === currentStaffId}
                onUpdateStatus={updateStatus}
                onFocusOnMap={handleFocusOnMap}
              />
            ))}
          </div>
        </section>

        {/* 5. 今日の現場情報一覧（ミニリスト） */}
        <section className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-3">
          <h3 className="font-bold text-xs text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
            <Building2 className="w-4 h-4 text-amber-400" />
            本日稼働中の現場一覧（全{INITIAL_SITES.length}箇所）
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {INITIAL_SITES.map((site) => (
              <div
                key={site.id}
                className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80 text-xs flex flex-col justify-between"
              >
                <div>
                  <h4 className="font-bold text-slate-200 leading-snug">{site.name}</h4>
                  <p className="text-slate-400 text-[11px] mt-1">{site.address}</p>
                  <p className="text-amber-400/90 text-[11px] mt-1">工種: {site.work_description}</p>
                </div>
                <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 font-medium">{site.client_name}</span>
                  <button
                    onClick={() => handleFocusOnMap(site.lat, site.lng)}
                    className="text-[11px] text-sky-400 hover:text-sky-300 font-bold"
                  >
                    地図で見る
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* 急な呼び出し（レスキュー）モーダル */}
      <RescueModal
        isOpen={isRescueModalOpen}
        onClose={() => setIsRescueModalOpen(false)}
        staffs={staffs}
        onDispatchStaff={handleDispatchStaff}
        onPreviewLocation={setTargetRescueCoord}
      />

      {/* AI自然言語問い合わせアシスタント */}
      <AiAssistant
        isOpen={isAiChatOpen}
        onClose={() => setIsAiChatOpen(false)}
        staffs={staffs}
      />

      {/* フッター */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-4 px-4 text-center text-xs text-slate-500">
        <p>建設会社向け リアルタイム現場・位置情報・ステータス共有システム (CraftSync Prototype)</p>
      </footer>
    </div>
  );
}
