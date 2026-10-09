'use client';

import React, { useState, useEffect } from 'react';
import { useStaffStatus } from '@/hooks/useStaffStatus';
import { useSites } from '@/hooks/useSites';
import { useCompanies } from '@/hooks/useCompanies';
import { Staff, StaffStatus, UserRole, Company } from '@/lib/types';
import { Header } from '@/components/Header';
import { MapWrapper } from '@/components/MapWrapper';
import { StaffCard } from '@/components/StaffCard';
import { RescueModal } from '@/components/RescueModal';
import { WeatherWidget } from '@/components/WeatherWidget';
import { GroupChat } from '@/components/GroupChat';
import { AuthModal } from '@/components/AuthModal';
import { MyPage } from '@/components/MyPage';
import { DailyReportModal } from '@/components/DailyReportModal';
import { DailyReportListModal } from '@/components/DailyReportListModal';
import { SiteManagementModal } from '@/components/SiteManagementModal';
import { StaffManagementModal } from '@/components/StaffManagementModal';
import { SiteCalendar } from '@/components/SiteCalendar';
import { PlatformAdminDashboard } from '@/components/PlatformAdminDashboard';
import { LoginPage } from '@/components/LoginPage';
import { useDailyReports } from '@/hooks/useDailyReports';
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
  FileText,
  Calendar,
  Users,
  ShieldCheck,
  UserCheck,
  Link as LinkIcon,
} from 'lucide-react';

interface MainAppProps {
  initialCompanyId?: string;
  initialStaffId?: string;
  initialView?: 'mypage' | 'main' | 'calendar' | 'admin' | 'login';
}

export const MainApp: React.FC<MainAppProps> = ({
  initialCompanyId,
  initialStaffId,
  initialView = 'mypage',
}) => {
  const {
    staffs,
    currentStaff,
    currentStaffId,
    setCurrentStaffId,
    updateStatus,
    updateStaffInfo,
    addStaff,
    deleteStaff,
    resetToDefault,
    isLiveConnected,
    isMockMode,
    lastNotification,
  } = useStaffStatus();

  // 現場データのリアルタイム管理
  const { sites, addSite, updateSite, deleteSite } = useSites();

  // 建設会社・自社管理者アカウント管理
  const {
    companies,
    adminPassword,
    addCompany,
    deleteCompany,
    updateAdminPassword,
  } = useCompanies();

  // 日報データのリアルタイム管理（Firestore同期）
  const { reports, deleteReport, approveReport, saveSupervisorSignature } = useDailyReports();

  // 画面ビュー切り替え ('mypage' | 'main' | 'calendar' | 'admin' | 'login')
  const [activeView, setActiveView] = useState<'mypage' | 'main' | 'calendar' | 'admin' | 'login'>(
    initialStaffId ? 'mypage' : initialView
  );

  // ユーザー認証・権限状態
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>('company_admin');
  const [currentUserEmail, setCurrentUserEmail] = useState<string>('sato@craftsync.local');
  const [currentUserName, setCurrentUserName] = useState<string>('佐藤 健一 (社長)');
  
  // 現在選択中の建設会社
  const [currentCompany, setCurrentCompany] = useState<Company>(() => {
    if (initialCompanyId) {
      const found = companies.find((c) => c.id === initialCompanyId);
      if (found) return found;
    }
    return companies[0];
  });

  // initialCompanyId または initialStaffId が変更された場合の同期
  useEffect(() => {
    if (initialCompanyId) {
      const found = companies.find((c) => c.id === initialCompanyId);
      if (found) {
        setCurrentCompany(found);
      }
    }
    if (initialStaffId) {
      const foundStaff = staffs.find((s) => s.id === initialStaffId);
      if (foundStaff) {
        setCurrentStaffId(foundStaff.id);
        setActiveView('mypage');
      }
    }
  }, [initialCompanyId, initialStaffId, companies, staffs, setCurrentStaffId]);

  // モーダル・チャット開閉状態
  const [isRescueModalOpen, setIsRescueModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isReportListModalOpen, setIsReportListModalOpen] = useState(false);
  const [isSiteModalOpen, setIsSiteModalOpen] = useState(false);
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);

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

  // 統合ログイン成功ハンドラ
  const handleUnifiedLoginSuccess = (
    role: UserRole,
    email: string,
    name: string,
    matchedStaff?: Staff,
    company?: Company
  ) => {
    setCurrentUserRole(role);
    setCurrentUserEmail(email);
    setCurrentUserName(name);

    if (company) {
      setCurrentCompany(company);
    }

    if (matchedStaff) {
      setCurrentStaffId(matchedStaff.id);
    }

    if (role === 'super_admin') {
      setActiveView('admin');
    } else if (role === 'company_admin') {
      setActiveView('main');
    } else {
      setActiveView('mypage');
    }
  };

  // 自社管理から建設会社を代理選択して現場画面へ移動
  const handleSelectCompanyAsAdmin = (company: Company) => {
    setCurrentCompany(company);
    setCurrentUserRole('company_admin');
    setCurrentUserEmail(company.presidentEmail);
    setCurrentUserName(`${company.presidentName} (社長)`);
    const matched = staffs.find((s) => s.isAdmin || s.email === company.presidentEmail);
    if (matched) {
      setCurrentStaffId(matched.id);
    }
    setActiveView('main');
  };

  // ログアウト
  const handleLogout = () => {
    setActiveView('login');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-amber-400 selection:text-slate-950">
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
        isLoggedIn={true}
        currentUserRole={currentUserRole}
        currentUserName={currentUserName}
        onOpenAuthModal={() => setActiveView('login')}
      />

      {/* リアルタイム更新通知トースト */}
      {lastNotification && (
        <div className="fixed top-16 right-4 z-40 bg-amber-400 text-slate-950 px-4 py-2.5 rounded-xl shadow-lg font-black text-xs flex items-center gap-2 border border-white/80 animate-in slide-in-from-top duration-200">
          <Bell className="w-4 h-4 text-slate-950 animate-bounce" />
          <span>{lastNotification}</span>
        </div>
      )}

      {/* 2. メインエリア */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 space-y-4">
        {/* ログイン・自社管理以外の画面では天気予報ウィジェットを表示 */}
        {activeView !== 'admin' && activeView !== 'login' && (
          <WeatherWidget />
        )}

        {/* ロールインフォメーションバナー */}
        {currentUserRole === 'super_admin' && activeView !== 'admin' && (
          <div className="bg-indigo-900 text-white rounded-xl p-3 text-xs flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2 font-bold">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                自社運営管理者（Creative SD）として現場システムをプレビュー中
              </span>
            </div>
            <button
              onClick={() => setActiveView('admin')}
              className="px-3 py-1 bg-white text-indigo-900 font-black rounded-lg text-[11px] hover:bg-slate-100 transition shadow-xs"
            >
              自社管理コンソールへ戻る
            </button>
          </div>
        )}

        {/* ────────────────────────────────────────── */}
        {/* ビュー0: 自社（Creative SD）管理ページ */}
        {/* ────────────────────────────────────────── */}
        {activeView === 'admin' && (
          <PlatformAdminDashboard
            companies={companies}
            adminPassword={adminPassword}
            onAddCompany={addCompany}
            onDeleteCompany={deleteCompany}
            onUpdateAdminPassword={updateAdminPassword}
            onSelectCompanyAsAdmin={handleSelectCompanyAsAdmin}
            staffs={staffs}
            onLogout={handleLogout}
            onOpenMainApp={() => setActiveView('main')}
          />
        )}

        {/* ────────────────────────────────────────── */}
        {/* ビュー0.5: 全スタッフ統合ログインページ */}
        {/* ────────────────────────────────────────── */}
        {activeView === 'login' && (
          <LoginPage
            staffs={staffs}
            companies={companies}
            adminPassword={adminPassword}
            onLoginSuccess={handleUnifiedLoginSuccess}
            onBackToApp={() => setActiveView('main')}
          />
        )}

        {/* ────────────────────────────────────────── */}
        {/* ビューA: マイページビュー */}
        {/* ────────────────────────────────────────── */}
        {activeView === 'mypage' && (
          <MyPage
            currentStaff={currentStaff}
            onUpdateStatus={updateStatus}
            onOpenMainBoard={() => setActiveView('main')}
            onOpenChat={() => setIsChatOpen(true)}
            onOpenDailyReport={() => setIsReportModalOpen(true)}
            onOpenReportList={() => setIsReportListModalOpen(true)}
            onOpenSiteManagement={() => setIsSiteModalOpen(true)}
            onOpenStaffManagement={() => setIsStaffModalOpen(true)}
            onLogout={handleLogout}
          />
        )}

        {/* ────────────────────────────────────────── */}
        {/* ビューB: 現場工程カレンダービュー */}
        {/* ────────────────────────────────────────── */}
        {activeView === 'calendar' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <SiteCalendar
              sites={sites}
              onOpenSiteManagement={() => setIsSiteModalOpen(true)}
              onFocusOnMap={handleFocusOnMap}
            />
          </div>
        )}

        {/* ────────────────────────────────────────── */}
        {/* ビューC: 全体現場マップ & 全員ボードビュー */}
        {/* ────────────────────────────────────────── */}
        {activeView === 'main' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* 企業・社長バナー（ユニークURL表示付き） */}
            {currentCompany && (
              <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shadow-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-700 flex items-center justify-center font-bold text-xs">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-black text-sm text-slate-900">
                        {currentCompany.name}
                      </span>
                      <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded border border-slate-200">
                        社長: {currentCompany.presidentName}
                      </span>
                      {/* 会社pkユニークURLバッジ */}
                      <span className="text-[10px] bg-indigo-50 text-indigo-700 font-mono font-bold px-2 py-0.5 rounded border border-indigo-200 flex items-center gap-1">
                        <LinkIcon className="w-3 h-3 text-indigo-500" />
                        URL: /{currentCompany.id}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500">
                      本社: {currentCompany.address} / TEL: {currentCompany.phone}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setIsStaffModalOpen(true)}
                    className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold rounded-lg transition flex items-center gap-1"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-amber-600" />
                    <span>社員アカウント作成・管理</span>
                  </button>
                  <button
                    onClick={() => setIsSiteModalOpen(true)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg transition flex items-center gap-1"
                  >
                    <span>現場を登録</span>
                  </button>
                </div>
              </div>
            )}

            {/* 現場サマリーKPI */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <div className="bg-white border border-emerald-200 rounded-xl p-2.5 sm:p-3 flex items-center gap-2.5 shadow-xs">
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                  <Hammer className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <span className="text-[10px] sm:text-xs text-slate-500 block font-medium">
                    施工作業中
                  </span>
                  <span className="text-base sm:text-xl font-black text-emerald-600">
                    {countWorking} <span className="text-xs font-normal text-slate-500">名</span>
                  </span>
                </div>
              </div>

              <div className="bg-white border border-amber-200 rounded-xl p-2.5 sm:p-3 flex items-center gap-2.5 shadow-xs">
                <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
                  <Truck className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <span className="text-[10px] sm:text-xs text-slate-500 block font-medium">
                    現場移動中
                  </span>
                  <span className="text-base sm:text-xl font-black text-amber-600">
                    {countMoving} <span className="text-xs font-normal text-slate-500">名</span>
                  </span>
                </div>
              </div>

              <div className="bg-white border border-purple-200 rounded-xl p-2.5 sm:p-3 flex items-center gap-2.5 shadow-xs">
                <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <span className="text-[10px] sm:text-xs text-slate-500 block font-medium">
                    移動可能(空き)
                  </span>
                  <span className="text-base sm:text-xl font-black text-purple-600">
                    {countAvailable} <span className="text-xs font-normal text-slate-500">名</span>
                  </span>
                </div>
              </div>
            </div>

            {/* 3. リアルタイム現場マップ */}
            <section className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
              <div className="p-3 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-amber-500" />
                  <h2 className="font-bold text-xs sm:text-sm text-slate-800">
                    今日の現場 & 社員位置マップ
                  </h2>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium">
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> 作業中
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> 移動中
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> 空き
                  </span>
                </div>
              </div>
              <div className="h-[340px] sm:h-[420px] w-full relative">
                <MapWrapper
                  staffs={staffs}
                  sites={sites}
                  currentStaffId={currentStaffId}
                  focusCoord={focusCoord}
                  targetRescueCoord={targetRescueCoord}
                />
              </div>
            </section>

            {/* 4. 社員ステータスカード一覧（全員・スタッフpkユニークURL付き） */}
            <section className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 px-1">
                <h2 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <span>社員ステータスボード（全{staffs.length}名）</span>
                  <span className="text-xs font-normal text-slate-500">
                    ※各カードにスタッフ固有のユニークURLあり
                  </span>
                </h2>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <button
                    onClick={() => setActiveView('calendar')}
                    className="text-xs bg-white hover:bg-slate-50 text-blue-700 font-bold px-3 py-1.5 rounded-lg border border-blue-200 flex items-center gap-1.5 transition shadow-xs active:scale-95"
                  >
                    <Calendar className="w-3.5 h-3.5 text-blue-600" />
                    現場カレンダー
                  </button>
                  <button
                    onClick={() => setIsReportListModalOpen(true)}
                    className="text-xs bg-white hover:bg-slate-50 text-amber-700 font-bold px-3 py-1.5 rounded-lg border border-amber-300 flex items-center gap-1.5 transition shadow-xs active:scale-95"
                  >
                    <FileText className="w-3.5 h-3.5 text-amber-600" />
                    日報一覧・PDF
                  </button>
                  <button
                    onClick={() => setIsStaffModalOpen(true)}
                    className="text-xs bg-white hover:bg-slate-50 text-sky-700 font-bold px-3 py-1.5 rounded-lg border border-sky-300 flex items-center gap-1.5 transition shadow-xs active:scale-95"
                  >
                    <Users className="w-3.5 h-3.5 text-sky-600" />
                    社員アカウント作成・管理
                  </button>
                  <button
                    onClick={() => setActiveView('mypage')}
                    className="text-xs text-amber-600 hover:text-amber-700 font-bold underline flex items-center gap-1"
                  >
                    <User className="w-3.5 h-3.5" />
                    自分のマイページ
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {staffs.map((staff) => (
                  <div key={staff.id} className="relative group">
                    <StaffCard
                      staff={staff}
                      isCurrentUser={staff.id === currentStaffId}
                      onUpdateStatus={(staffId: string, status: StaffStatus, siteName?: string, note?: string) =>
                        updateStatus(staffId, status, siteName, note)
                      }
                      onFocusOnMap={(lat: number, lng: number) => handleFocusOnMap(lat, lng)}
                    />
                    {/* スタッフのユニークURLリンクバッジ */}
                    <div className="px-3 pb-1 pt-0.5 -mt-1 bg-white border-x border-b border-slate-200 rounded-b-xl flex items-center justify-between text-[10px] text-slate-500">
                      <span className="font-mono text-slate-400">ID: {staff.id}</span>
                      <a
                        href={`/${currentCompany.id}/${staff.id}`}
                        className="text-indigo-600 hover:text-indigo-700 font-mono font-bold flex items-center gap-1 hover:underline"
                        title="このスタッフの個別URLを開く"
                      >
                        <LinkIcon className="w-3 h-3" />
                        <span>/{currentCompany.id}/{staff.id}</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </main>

      {/* 5. 各種ポップアップ・モーダル */}
      <RescueModal
        isOpen={isRescueModalOpen}
        onClose={() => setIsRescueModalOpen(false)}
        staffs={staffs}
        onDispatchStaff={handleDispatchStaff}
        onPreviewLocation={(coord: { lat: number; lng: number; title: string } | null) => {
          setTargetRescueCoord(coord);
          if (coord) {
            setActiveView('main');
            setFocusCoord({ lat: coord.lat, lng: coord.lng });
          }
        }}
      />

      <SiteManagementModal
        isOpen={isSiteModalOpen}
        onClose={() => setIsSiteModalOpen(false)}
        sites={sites}
        onAddSite={addSite}
        onUpdateSite={updateSite}
        onDeleteSite={deleteSite}
      />

      <StaffManagementModal
        isOpen={isStaffModalOpen}
        onClose={() => setIsStaffModalOpen(false)}
        staffs={staffs}
        currentStaffId={currentStaffId}
        onAddStaff={addStaff}
        onUpdateStaff={updateStaffInfo}
        onDeleteStaff={deleteStaff}
      />

      <DailyReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        currentStaff={currentStaff}
      />

      <DailyReportListModal
        isOpen={isReportListModalOpen}
        onClose={() => setIsReportListModalOpen(false)}
        reports={reports}
        currentStaff={currentStaff}
        onDeleteReport={deleteReport}
        onApproveReport={approveReport}
        onSaveSupervisorSignature={saveSupervisorSignature}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        staffs={staffs}
        onSelectStaff={setCurrentStaffId}
        onLoginSuccess={(email, matched) => {
          handleUnifiedLoginSuccess('staff', email, matched?.name || email, matched);
        }}
      />

      {/* グループトークチャット */}
      <GroupChat
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        currentStaff={currentStaff}
      />
    </div>
  );
};
