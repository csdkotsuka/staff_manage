'use client';

import React from 'react';
import { Staff, UserRole } from '@/lib/types';
import {
  Siren,
  MessageSquare,
  UserCheck,
  RefreshCw,
  User,
  Map,
  Calendar,
  LogIn,
  BookOpen,
  Info,
  ShieldCheck,
  Building2,
} from 'lucide-react';

interface HeaderProps {
  staffs: Staff[];
  currentStaffId: string;
  onSelectStaff: (id: string) => void;
  onOpenRescueModal: () => void;
  onToggleChat: () => void;
  isChatOpen: boolean;
  isLiveConnected: boolean;
  isMockMode: boolean;
  onReset: () => void;
  activeView: 'main' | 'mypage' | 'calendar' | 'admin' | 'login';
  onChangeView: (view: 'main' | 'mypage' | 'calendar' | 'admin' | 'login') => void;
  isLoggedIn: boolean;
  currentUserRole?: UserRole;
  currentUserName?: string;
  onOpenAuthModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  staffs,
  currentStaffId,
  onSelectStaff,
  onOpenRescueModal,
  onToggleChat,
  isChatOpen,
  isLiveConnected,
  isMockMode,
  onReset,
  activeView,
  onChangeView,
  isLoggedIn,
  currentUserRole = 'staff',
  currentUserName,
  onOpenAuthModal,
}) => {
  const currentStaff = staffs.find((s) => s.id === currentStaffId) || staffs[0];

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 text-slate-800 px-3 py-2 sm:px-6 shadow-xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2.5">
        {/* 左側：ロゴ & 画面切り替えタブ & 接続バッジ */}
        <div className="flex items-center justify-between w-full md:w-auto gap-3">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => onChangeView('mypage')}>
            <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center font-black text-slate-950 shadow-sm">
              建
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black tracking-tight text-base sm:text-lg text-slate-900">
                  現場NOW
                </span>
                <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300">
                  PWA
                </span>
              </div>
            </div>
          </div>

          {/* ビュー切り替えタブ */}
          <div className="flex items-center bg-slate-100 border border-slate-200 rounded-xl p-1 gap-1">
            {/* 自社管理タブ（自社管理者のみ、またはクリックで開ける） */}
            {currentUserRole === 'super_admin' && (
              <button
                onClick={() => onChangeView('admin')}
                className={`flex items-center gap-1 px-2.5 sm:px-3 py-1 rounded-lg text-xs font-black transition ${
                  activeView === 'admin'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-indigo-700 hover:text-indigo-900 bg-indigo-50/60'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>自社管理</span>
              </button>
            )}

            <button
              onClick={() => onChangeView('mypage')}
              className={`flex items-center gap-1 px-2.5 sm:px-3 py-1 rounded-lg text-xs font-bold transition ${
                activeView === 'mypage'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>マイページ</span>
            </button>
            <button
              onClick={() => onChangeView('main')}
              className={`flex items-center gap-1 px-2.5 sm:px-3 py-1 rounded-lg text-xs font-bold transition ${
                activeView === 'main'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Map className="w-3.5 h-3.5" />
              <span>現場マップ</span>
            </button>
            <button
              onClick={() => onChangeView('calendar')}
              className={`flex items-center gap-1 px-2.5 sm:px-3 py-1 rounded-lg text-xs font-bold transition ${
                activeView === 'calendar'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              <span>現場工程カレンダー</span>
            </button>
          </div>
        </div>

        {/* 右側：操作社員 & アクションボタン */}
        <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-2">
          {/* 現在操作中の社員選択（クイック切り替え） */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 shadow-xs">
            <UserCheck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <select
              id="staff-selector"
              aria-label="操作する社員を選択"
              value={currentStaffId}
              onChange={(e) => onSelectStaff(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer pr-1"
            >
              {staffs.map((staff) => (
                <option key={staff.id} value={staff.id} className="bg-white text-slate-900">
                  {staff.name} {staff.isAdmin ? '(社長)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* 全スタッフ・自社ログインページボタン */}
          <button
            onClick={() => onChangeView('login')}
            className={`flex items-center gap-1 px-2.5 py-1.5 border rounded-lg text-xs font-bold transition shadow-xs ${
              activeView === 'login'
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800'
            }`}
            title="全スタッフ・自社・社長の統合ログインページを開く"
          >
            <LogIn className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden xs:inline">
              {currentUserRole === 'super_admin' ? '自社' : currentUserRole === 'company_admin' ? '社長' : 'ログイン'}
            </span>
          </button>

          {/* 全社チャットトグルボタン */}
          <button
            id="btn-group-chat"
            onClick={onToggleChat}
            className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
              isChatOpen
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                : 'bg-white text-emerald-700 border-emerald-300 hover:bg-emerald-50'
            }`}
            title="全社現場グループトーク"
          >
            <MessageSquare className="w-4 h-4" />
            <span className="hidden xs:inline">全社トーク</span>
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full animate-pulse" />
          </button>

          {/* 緊急案件発行 (レスキュー) ボタン */}
          <button
            id="btn-rescue-modal"
            onClick={onOpenRescueModal}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white rounded-lg text-xs font-bold shadow-sm active:scale-95 transition-all"
            title="急な呼び出しシミュレーション"
          >
            <Siren className="w-4 h-4 animate-bounce" />
            <span className="hidden sm:inline">急募レスキュー</span>
          </button>

          {/* 自社管理コンソールボタン（スーパー管理者の常時ショートカット） */}
          <button
            onClick={() => onChangeView('admin')}
            className={`p-1.5 rounded-lg border transition shadow-xs ${
              activeView === 'admin'
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white hover:bg-slate-100 border-slate-200 text-indigo-700'
            }`}
            title="自社管理ページ（Creative SD）を開く"
          >
            <ShieldCheck className="w-4 h-4" />
          </button>

          {/* リセット */}
          <button
            onClick={onReset}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
            title="データを初期状態に戻す"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
