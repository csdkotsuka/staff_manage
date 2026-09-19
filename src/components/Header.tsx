'use client';

import React from 'react';
import { Staff } from '@/lib/types';
import { Radio, Siren, Bot, UserCheck, RefreshCw } from 'lucide-react';

interface HeaderProps {
  staffs: Staff[];
  currentStaffId: string;
  onSelectStaff: (id: string) => void;
  onOpenRescueModal: () => void;
  onToggleAiChat: () => void;
  isAiChatOpen: boolean;
  isLiveConnected: boolean;
  isMockMode: boolean;
  onReset: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  staffs,
  currentStaffId,
  onSelectStaff,
  onOpenRescueModal,
  onToggleAiChat,
  isAiChatOpen,
  isLiveConnected,
  isMockMode,
  onReset,
}) => {
  const currentStaff = staffs.find((s) => s.id === currentStaffId);

  return (
    <header className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 text-white px-3 py-2.5 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
        {/* 左側：ロゴ & ステータス表示 */}
        <div className="flex items-center justify-between w-full sm:w-auto gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center font-black text-slate-950 shadow-md shadow-amber-500/20">
              建
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black tracking-tight text-base sm:text-lg text-slate-100">
                  現場NOW
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  PROTOTYPE
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden xs:block">
                社員5名リアルタイム動態共有
              </p>
            </div>
          </div>

          {/* 接続バッジ */}
          <div className="flex items-center gap-1.5 text-xs">
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
              {isMockMode ? 'デモ同期稼働中' : 'Firebase Live'}
            </span>
          </div>
        </div>

        {/* 右側：操作社員スイッチャー & アクションボタン */}
        <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-2">
          {/* 現在操作中の社員選択（デモ用クイック切り替え） */}
          <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-700/80 rounded-lg px-2 py-1">
            <UserCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="text-xs text-slate-400 hidden sm:inline">自端末:</span>
            <select
              id="staff-selector"
              aria-label="操作する社員を選択"
              value={currentStaffId}
              onChange={(e) => onSelectStaff(e.target.value)}
              className="bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer pr-1"
            >
              {staffs.map((staff) => (
                <option key={staff.id} value={staff.id} className="bg-slate-900 text-white">
                  {staff.name} ({staff.role.split('・')[0]})
                </option>
              ))}
            </select>
          </div>

          {/* 緊急案件発行 (レスキュー) ボタン */}
          <button
            id="btn-rescue-modal"
            onClick={onOpenRescueModal}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white rounded-lg text-xs font-bold shadow-lg shadow-red-600/30 active:scale-95 transition-all"
            title="急な呼び出しシミュレーション"
          >
            <Siren className="w-4 h-4 animate-bounce" />
            <span>急募レスキュー</span>
          </button>

          {/* AI問い合わせトグルボタン */}
          <button
            id="btn-ai-assistant"
            onClick={onToggleAiChat}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-all ${
              isAiChatOpen
                ? 'bg-sky-500 text-slate-950 border-sky-400 shadow-md shadow-sky-500/30'
                : 'bg-slate-900 text-sky-400 border-sky-500/30 hover:bg-sky-950/40'
            }`}
            title="AI現場アシスタント"
          >
            <Bot className="w-4 h-4" />
            <span className="hidden xs:inline">AI質問</span>
          </button>

          {/* デモデータリセット */}
          <button
            onClick={onReset}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
            title="デモ状態を初期状態に戻す"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
