'use client';

import React from 'react';
import { Staff } from '@/lib/types';
import {
  Radio,
  Siren,
  MessageSquare,
  UserCheck,
  RefreshCw,
  User,
  Map,
  LogIn,
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
  activeView: 'main' | 'mypage';
  onChangeView: (view: 'main' | 'mypage') => void;
  isLoggedIn: boolean;
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
  onOpenAuthModal,
}) => {
  const currentStaff = staffs.find((s) => s.id === currentStaffId) || staffs[0];

  return (
    <header className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 text-white px-3 py-2 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2.5">
        {/* 左側：ロゴ & 画面切り替えタブ & 接続バッジ */}
        <div className="flex items-center justify-between w-full md:w-auto gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center font-black text-slate-950 shadow-md shadow-amber-500/20">
              建
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black tracking-tight text-base sm:text-lg text-slate-100">
                  現場NOW
                </span>
                <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  PWA
                </span>
              </div>
            </div>
          </div>

          {/* ビュー切り替えタブ（マイページ ⇄ 現場マップ） */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 gap-1">
            <button
              onClick={() => onChangeView('mypage')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition ${
                activeView === 'mypage'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>マイページ</span>
            </button>
            <button
              onClick={() => onChangeView('main')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition ${
                activeView === 'main'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Map className="w-3.5 h-3.5" />
              <span>現場マップ</span>
            </button>
          </div>

          {/* 接続バッジ */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs">
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                isLiveConnected
                  ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/40'
                  : 'bg-rose-950/80 text-rose-400 border border-rose-500/40'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isLiveConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
                }`}
              />
              <Radio className="w-3 h-3" />
              {isMockMode ? 'デモ稼働中' : 'Firebase Live'}
            </span>
          </div>
        </div>

        {/* 右側：操作社員 & アクションボタン */}
        <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-2">
          {/* 現在操作中の社員選択（クイック切り替え） */}
          <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-700/80 rounded-lg px-2 py-1">
            <UserCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <select
              id="staff-selector"
              aria-label="操作する社員を選択"
              value={currentStaffId}
              onChange={(e) => onSelectStaff(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-200 focus:outline-none cursor-pointer pr-1"
            >
              {staffs.map((staff) => (
                <option key={staff.id} value={staff.id} className="bg-slate-900 text-white">
                  {staff.name}
                </option>
              ))}
            </select>
          </div>

          {/* ログインボタン */}
          {!isLoggedIn ? (
            <button
              onClick={onOpenAuthModal}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-lg text-xs font-bold transition"
            >
              <LogIn className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden xs:inline">ログイン</span>
            </button>
          ) : (
            <div
              onClick={() => onChangeView('mypage')}
              className="cursor-pointer flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-300 hover:border-amber-500/50 transition"
              title="マイページを開く"
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: currentStaff.avatar_color }}
              />
              <span className="font-bold">{currentStaff.name.split(' ')[0]}</span>
            </div>
          )}

          {/* 全社チャットトグルボタン */}
          <button
            id="btn-group-chat"
            onClick={onToggleChat}
            className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
              isChatOpen
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-600/30'
                : 'bg-slate-900 text-emerald-400 border-emerald-500/30 hover:bg-emerald-950/40'
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
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white rounded-lg text-xs font-bold shadow-lg shadow-red-600/30 active:scale-95 transition-all"
            title="急な呼び出しシミュレーション"
          >
            <Siren className="w-4 h-4 animate-bounce" />
            <span className="hidden sm:inline">急募レスキュー</span>
          </button>

          {/* リセット */}
          <button
            onClick={onReset}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
            title="データを初期状態に戻す"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
