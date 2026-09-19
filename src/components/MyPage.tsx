'use client';

import React, { useState, useEffect } from 'react';
import { Staff, StaffStatus, STATUS_MAP } from '@/lib/types';
import { INITIAL_SITES } from '@/lib/mockData';
import {
  User,
  HardHat,
  MapPin,
  Phone,
  Mail,
  Clock,
  LogOut,
  Map,
  Hammer,
  Truck,
  CheckCircle2,
  Sparkles,
  MessageSquare,
  Edit3,
  Check,
  Building2,
  ShieldCheck,
} from 'lucide-react';

interface MyPageProps {
  currentStaff: Staff;
  onUpdateStatus: (
    staffId: string,
    status: StaffStatus,
    siteName?: string,
    note?: string
  ) => void;
  onOpenMainBoard: () => void;
  onOpenChat: () => void;
  onLogout: () => void;
}

export const MyPage: React.FC<MyPageProps> = ({
  currentStaff,
  onUpdateStatus,
  onOpenMainBoard,
  onOpenChat,
  onLogout,
}) => {
  const [note, setNote] = useState(currentStaff.status_note || '');
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setNote(currentStaff.status_note || '');
  }, [currentStaff.status_note]);

  const currentStatusConfig = STATUS_MAP[currentStaff.status];

  // ステータス変更ハンドラ
  const handleStatusChange = (newStatus: StaffStatus) => {
    onUpdateStatus(currentStaff.id, newStatus, undefined, note);
  };

  // メモ保存
  const handleSaveNote = () => {
    onUpdateStatus(currentStaff.id, currentStaff.status, undefined, note);
    setIsEditingNote(false);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  // 担当現場情報（一致する現場があれば取得）
  const assignedSite = INITIAL_SITES.find((s) =>
    currentStaff.current_site_name.includes(s.name.substring(0, 4))
  );

  return (
    <div className="max-w-2xl mx-auto p-3 sm:p-5 space-y-4 animate-in fade-in duration-200">
      {/* 1. マイプロフィールヘッダー */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            {/* アバター */}
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black text-white shadow-lg border-2 border-slate-700/50"
              style={{ backgroundColor: currentStaff.avatar_color }}
            >
              {currentStaff.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-100">
                  {currentStaff.name}
                </h2>
                <span className="text-[11px] bg-slate-800 text-slate-300 font-bold px-2 py-0.5 rounded-full border border-slate-700">
                  {currentStaff.role}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
                <span className="flex items-center gap-1">
                  <Phone className="w-3 h-3 text-slate-500" />
                  {currentStaff.phone}
                </span>
                {currentStaff.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="w-3 h-3 text-slate-500" />
                    {currentStaff.email}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* ログアウトボタン */}
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-rose-400 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl transition hover:border-rose-500/40"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>ログアウト</span>
          </button>
        </div>
      </div>

      {/* 2. 本日のステータス即時更新エリア */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HardHat className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-sm text-slate-200">
              いまの作業状況（ワンタップ更新）
            </h3>
          </div>
          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            最終更新: {new Date(currentStaff.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        {/* 現在のステータス表示 */}
        <div className={`p-3 rounded-xl border flex items-center justify-between ${currentStatusConfig.bgLight} ${currentStatusConfig.borderColor}`}>
          <div className="flex items-center gap-2.5">
            <div
              className="w-3 h-3 rounded-full animate-ping"
              style={{ backgroundColor: currentStatusConfig.color }}
            />
            <div>
              <span className="text-[10px] text-slate-400 block font-medium">現在のステータス</span>
              <span className={`text-base font-black ${currentStatusConfig.textColor}`}>
                {currentStatusConfig.label}
              </span>
            </div>
          </div>
          <span className="text-xs text-slate-300 font-medium">
            全社の地図・ボードに即時反映中
          </span>
        </div>

        {/* ワンタップ切り替えボタングリッド */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
          <button
            onClick={() => handleStatusChange('working')}
            className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition active:scale-95 ${
              currentStaff.status === 'working'
                ? 'bg-emerald-600 border-emerald-400 text-white shadow-lg ring-2 ring-emerald-400/50'
                : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-emerald-500/50 hover:bg-slate-800'
            }`}
          >
            <Hammer className="w-5 h-5 text-emerald-400" />
            <span className="text-xs font-black">作業中</span>
            <span className="text-[9px] opacity-75">施工中</span>
          </button>

          <button
            onClick={() => handleStatusChange('moving')}
            className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition active:scale-95 ${
              currentStaff.status === 'moving'
                ? 'bg-amber-600 border-amber-400 text-white shadow-lg ring-2 ring-amber-400/50'
                : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-amber-500/50 hover:bg-slate-800'
            }`}
          >
            <Truck className="w-5 h-5 text-amber-400" />
            <span className="text-xs font-black">移動中</span>
            <span className="text-[9px] opacity-75">現場移動</span>
          </button>

          <button
            onClick={() => handleStatusChange('available')}
            className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition active:scale-95 ${
              currentStaff.status === 'available'
                ? 'bg-purple-600 border-purple-400 text-white shadow-lg ring-2 ring-purple-400/50'
                : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-purple-500/50 hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-5 h-5 text-purple-400" />
            <span className="text-xs font-black">移動可能</span>
            <span className="text-[9px] opacity-75">急募対応OK</span>
          </button>

          <button
            onClick={() => handleStatusChange('completed')}
            className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition active:scale-95 ${
              currentStaff.status === 'completed'
                ? 'bg-blue-600 border-blue-400 text-white shadow-lg ring-2 ring-blue-400/50'
                : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-blue-500/50 hover:bg-slate-800'
            }`}
          >
            <CheckCircle2 className="w-5 h-5 text-blue-400" />
            <span className="text-xs font-black">本日完了</span>
            <span className="text-[9px] opacity-75">作業終了</span>
          </button>
        </div>
      </div>

      {/* 3. 本日の伝言メモ */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-sm text-slate-200">
              全社への伝言メモ
            </h3>
          </div>
          {isSaved && (
            <span className="text-xs text-emerald-400 font-bold flex items-center gap-1 animate-in fade-in">
              <Check className="w-3.5 h-3.5" /> 保存しました
            </span>
          )}
        </div>

        <div className="space-y-2">
          <textarea
            value={note}
            onChange={(e) => {
              setNote(e.target.value);
              setIsEditingNote(true);
            }}
            placeholder="例: 分電盤結線作業中。15:00頃完了予定。午後の応援可能です。"
            rows={3}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition leading-relaxed"
          />
          {isEditingNote && (
            <button
              onClick={handleSaveNote}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition ml-auto shadow"
            >
              <Check className="w-4 h-4" />
              <span>メモを全員に共有</span>
            </button>
          )}
        </div>
      </div>

      {/* 4. 担当現場情報 */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-2.5">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-amber-400" />
          <h3 className="font-bold text-sm text-slate-200">
            今日の滞在・担当現場
          </h3>
        </div>

        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 text-xs space-y-1.5">
          <div className="text-slate-100 font-bold text-sm flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
            {currentStaff.current_site_name}
          </div>
          {assignedSite && (
            <>
              <p className="text-slate-400 text-[11px] pl-6">
                住所: {assignedSite.address}
              </p>
              <p className="text-amber-400/90 text-[11px] pl-6 font-medium">
                工事内容: {assignedSite.work_description}
              </p>
            </>
          )}
        </div>
      </div>

      {/* 5. 画面切り替え大ボタン（全体ボードへ / チャットを開く） */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        <button
          onClick={onOpenMainBoard}
          className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black p-4 rounded-2xl text-sm flex items-center justify-center gap-2.5 shadow-xl transition active:scale-98"
        >
          <Map className="w-5 h-5" />
          <span>現場マップ・みんなの状況を見る</span>
        </button>

        <button
          onClick={onOpenChat}
          className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-100 font-bold p-4 rounded-2xl text-sm flex items-center justify-center gap-2.5 shadow-lg transition active:scale-98"
        >
          <MessageSquare className="w-5 h-5 text-emerald-400" />
          <span>全社現場グループトークを開く</span>
        </button>
      </div>
    </div>
  );
};
