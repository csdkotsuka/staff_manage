'use client';

import React, { useState } from 'react';
import { useStaffStatus } from '@/hooks/useStaffStatus';
import { INITIAL_SITES } from '@/lib/mockData';
import { Staff, StaffStatus } from '@/lib/types';
import { Header } from '@/components/Header';
import { MapWrapper } from '@/components/MapWrapper';
import { StaffCard } from '@/components/StaffCard';
import { RescueModal } from '@/components/RescueModal';
import { WeatherWidget } from '@/components/WeatherWidget';
import { GroupChat } from '@/components/GroupChat';
import { AuthModal } from '@/components/AuthModal';
import { MyPage } from '@/components/MyPage';
import { DailyReportModal } from '@/components/DailyReportModal';
import {
  Bell,
  MapPin,
  Hammer,
  Truck,
  Sparkles,
  Building2,
  Info,
  User,
  Map,
} from 'lucide-react';

export default function Home() {
  const {
    staffs,
    currentStaff,
    currentStaffId,
    setCurrentStaffId,
    updateStatus,
    resetToDefault,
    isLiveConnected,
    isMockMode,
    lastNotification,
  } = useStaffStatus();

  // 画面ビュー切り替え ('mypage' または 'main')
  const [activeView, setActiveView] = useState<'mypage' | 'main'>('mypage');

  // モーダル・チャット開閉状態
  const [isRescueModalOpen, setIsRescueModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // ログイン状態
  const [isLoggedIn, setIsLoggedIn] = useState(true); // 初期状態で操作可能な社員にログイン済み扱い
  const [userEmail, setUserEmail] = useState<string>('sato@craftsync.local');

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
    setActiveView('main');
    setFocusCoord({ lat, lng });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // レスキュー出動要請
  const handleDispatchStaff = (staffId: string, siteName: string, note: string) => {
    updateStatus(staffId, 'moving', siteName, note);
  };

  // ログイン成功ハンドラ
  const handleLoginSuccess = (email: string, matchedStaff?: Staff) => {
    setIsLoggedIn(true);
    setUserEmail(email);
    if (matchedStaff) {
      setCurrentStaffId(matchedStaff.id);
    }
    setActiveView('mypage');
  };

  // ログアウト
  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserEmail('');
    setIsAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-400 selection:text-slate-950">
      {/* 1. アプリヘッダー */}
      <Header
        staffs={staffs}
        currentStaffId={currentStaffId}
        onSelectStaff={setCurrentStaffId}
        onOpenRescueModal={() => setIsRescueModalOpen(true)}
        onToggleChat={() => setIsChatOpen(!isChatOpen)}
        isChatOpen={isChatOpen}
        isLiveConnected={isLiveConnected}
        isMockMode={isMockMode}
        onReset={resetToDefault}
        activeView={activeView}
        onChangeView={setActiveView}
        isLoggedIn={isLoggedIn}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* リアルタイム更新通知トースト */}
      {lastNotification && (
        <div className="fixed top-16 right-4 z-40 bg-amber-400 text-slate-950 px-4 py-2.5 rounded-xl shadow-2xl font-black text-xs flex items-center gap-2 border border-white/40 animate-in slide-in-from-top duration-200">
          <Bell className="w-4 h-4 text-slate-950 animate-bounce" />
          <span>{lastNotification}</span>
        </div>
      )}

      {/* 2. メインエリア */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 space-y-4">
        {/* 週間天気予報ウィジェット（常時トップに表示） */}
        <WeatherWidget />

        {/* モックモードガイダンス */}
        {isMockMode && (
          <div className="bg-slate-900/90 border border-amber-500/30 rounded-xl p-3 text-xs text-slate-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shadow-md">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong>デモモード動作中:</strong> 別タブや別端末で開くとリアルタイムに双方向同期します。
                Firebase設定を投入すると完全クラウド同期（Firebase Live）に切り替わります。
              </span>
            </div>
          </div>
        )}

        {/* A. マイページビュー */}
        {activeView === 'mypage' && (
          <MyPage
            currentStaff={currentStaff}
            onUpdateStatus={updateStatus}
            onOpenMainBoard={() => setActiveView('main')}
            onOpenChat={() => setIsChatOpen(true)}
            onOpenDailyReport={() => setIsReportModalOpen(true)}
            onLogout={handleLogout}
          />
        )}

        {/* B. 全体現場マップ & 全員ボードビュー */}
        {activeView === 'main' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* 現場サマリーKPI */}
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

              <div className="bg-slate-900/80 border border-amber-500/30 rounded-xl p-2.5 sm:p-3 flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
                  <Truck className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <span className="text-[10px] sm:text-xs text-slate-400 block font-medium">
                    現場移動中
                  </span>
                  <span className="text-base sm:text-xl font-black text-amber-400">
                    {countMoving} <span className="text-xs font-normal text-slate-400">名</span>
                  </span>
                </div>
              </div>

              <div className="bg-slate-900/80 border border-purple-500/30 rounded-xl p-2.5 sm:p-3 flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400">
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <span className="text-[10px] sm:text-xs text-slate-400 block font-medium">
                    移動可能(空き)
                  </span>
                  <span className="text-base sm:text-xl font-black text-purple-400">
                    {countAvailable} <span className="text-xs font-normal text-slate-400">名</span>
                  </span>
                </div>
              </div>
            </div>

            {/* 3. リアルタイム現場マップ */}
            <section className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="p-3 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-amber-400" />
                  <h2 className="font-bold text-xs sm:text-sm text-slate-200">
                    今日の現場 & 社員位置マップ
                  </h2>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-slate-400 font-medium">
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> 作業中
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> 移動中
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-400" /> 空き
                  </span>
                </div>
              </div>
              <div className="h-[340px] sm:h-[420px] w-full relative">
                <MapWrapper
                  staffs={staffs}
                  sites={INITIAL_SITES}
                  currentStaffId={currentStaffId}
                  focusCoord={focusCoord}
                  targetRescueCoord={targetRescueCoord}
                />
              </div>
            </section>

            {/* 4. 社員ステータスカード一覧（全員） */}
            <section className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <h2 className="font-bold text-sm text-slate-200 flex items-center gap-2">
                  <span>社員ステータスボード（全{staffs.length}名）</span>
                  <span className="text-xs font-normal text-slate-400">
                    ※各カードから直接ステータス変更可能
                  </span>
                </h2>
                <button
                  onClick={() => setActiveView('mypage')}
                  className="text-xs text-amber-400 hover:text-amber-300 font-bold underline flex items-center gap-1"
                >
                  <User className="w-3.5 h-3.5" />
                  自分のマイページを開く
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {staffs.map((staff) => (
                  <div
                    key={staff.id}
                    className={
                      staff.id === currentStaffId
                        ? 'ring-2 ring-amber-400/80 rounded-2xl shadow-lg shadow-amber-500/10'
                        : ''
                    }
                  >
                    <StaffCard
                      staff={staff}
                      isCurrentUser={staff.id === currentStaffId}
                      onUpdateStatus={updateStatus}
                      onFocusOnMap={handleFocusOnMap}
                    />
                  </div>
                ))}
              </div>
            </section>

            {/* 5. 今日の現場情報一覧 */}
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
          </div>
        )}
      </main>

      {/* 急な呼び出し（レスキュー）モーダル */}
      <RescueModal
        isOpen={isRescueModalOpen}
        onClose={() => setIsRescueModalOpen(false)}
        staffs={staffs}
        onDispatchStaff={handleDispatchStaff}
        onPreviewLocation={setTargetRescueCoord}
      />

      {/* 全社現場グループトーク（LINE風チャット） */}
      <GroupChat
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        currentStaff={currentStaff}
      />

      {/* 社員認証・ログインモーダル */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        staffs={staffs}
        onSelectStaff={setCurrentStaffId}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* 音声＋Gemini AI日報モーダル */}
      <DailyReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        currentStaff={currentStaff}
      />

      {/* フッター */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-4 px-4 text-center text-xs text-slate-500">
        <p>建設会社向け リアルタイム現場・位置情報・ステータス共有システム (CraftSync)</p>
      </footer>
    </div>
  );
}
