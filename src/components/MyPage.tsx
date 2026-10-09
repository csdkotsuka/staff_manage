'use client';

import React, { useState, useEffect } from 'react';
import { Staff, StaffStatus, STATUS_MAP } from '@/lib/types';
import { INITIAL_SITES } from '@/lib/mockData';
import {
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
  FileText,
  Mic,
  Printer,
  Calendar,
  Users,
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
  onOpenDailyReport: () => void;
  onOpenReportList?: () => void;
  onOpenSiteManagement?: () => void;
  onOpenStaffManagement?: () => void;
  onLogout: () => void;
}

export const MyPage: React.FC<MyPageProps> = ({
  currentStaff,
  onUpdateStatus,
  onOpenMainBoard,
  onOpenChat,
  onOpenDailyReport,
  onOpenReportList,
  onOpenSiteManagement,
  onOpenStaffManagement,
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

  // 管理者判定（社長、統括、またはisAdminフラグ）
  const isAdmin = Boolean(
    currentStaff.isAdmin ||
    currentStaff.role.includes('社長') ||
    currentStaff.role.includes('統括')
  );

  return (
    <div className="max-w-2xl mx-auto p-3 sm:p-5 space-y-4 animate-in fade-in duration-200">
      {/* 1. マイプロフィールヘッダー */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            {/* アバター */}
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black text-white shadow-md border-2 border-white ring-2 ring-slate-200"
              style={{ backgroundColor: currentStaff.avatar_color }}
            >
              {currentStaff.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-900">
                  {currentStaff.name}
                </h2>
                <span className="text-[11px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-full border border-slate-200">
                  {currentStaff.role}
                </span>
                {isAdmin && (
                  <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full border border-amber-300">
                    🛡️ 管理者
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                <span className="flex items-center gap-1">
                  <Phone className="w-3 h-3 text-slate-400" />
                  {currentStaff.phone}
                </span>
                {currentStaff.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="w-3 h-3 text-slate-400" />
                    {currentStaff.email}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* ログアウトボタン */}
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-rose-600 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl transition hover:border-rose-300 shadow-xs"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>ログアウト</span>
          </button>
        </div>
      </div>

      {/* 2. 本日のステータス即時更新エリア */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HardHat className="w-4 h-4 text-amber-600" />
            <h3 className="font-bold text-sm text-slate-900">
              いまの作業状況（ワンタップ更新）
            </h3>
          </div>
          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            最終更新: {new Date(currentStaff.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        {/* 現在のステータス表示 */}
        <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className="w-3 h-3 rounded-full animate-ping"
              style={{ backgroundColor: currentStatusConfig.color }}
            />
            <div>
              <span className="text-[10px] text-slate-500 block font-medium">現在のステータス</span>
              <span className="text-base font-black text-slate-900">
                {currentStatusConfig.label}
              </span>
            </div>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            全社の地図・ボードに即時反映中
          </span>
        </div>

        {/* ワンタップ切り替えボタングリッド */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
          <button
            onClick={() => handleStatusChange('working')}
            className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition active:scale-95 ${
              currentStaff.status === 'working'
                ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm ring-2 ring-emerald-300'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-emerald-400 hover:bg-emerald-50/50'
            }`}
          >
            <Hammer className={`w-5 h-5 ${currentStaff.status === 'working' ? 'text-white' : 'text-emerald-600'}`} />
            <span className="text-xs font-black">作業中</span>
            <span className="text-[9px] opacity-75">施工中</span>
          </button>

          <button
            onClick={() => handleStatusChange('moving')}
            className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition active:scale-95 ${
              currentStaff.status === 'moving'
                ? 'bg-amber-500 border-amber-500 text-slate-950 shadow-sm ring-2 ring-amber-300'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-amber-400 hover:bg-amber-50/50'
            }`}
          >
            <Truck className={`w-5 h-5 ${currentStaff.status === 'moving' ? 'text-slate-950' : 'text-amber-600'}`} />
            <span className="text-xs font-black">移動中</span>
            <span className="text-[9px] opacity-75">現場移動</span>
          </button>

          <button
            onClick={() => handleStatusChange('available')}
            className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition active:scale-95 ${
              currentStaff.status === 'available'
                ? 'bg-purple-600 border-purple-600 text-white shadow-sm ring-2 ring-purple-300'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-purple-400 hover:bg-purple-50/50'
            }`}
          >
            <Sparkles className={`w-5 h-5 ${currentStaff.status === 'available' ? 'text-white' : 'text-purple-600'}`} />
            <span className="text-xs font-black">移動可能</span>
            <span className="text-[9px] opacity-75">急募対応OK</span>
          </button>

          <button
            onClick={() => handleStatusChange('completed')}
            className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition active:scale-95 ${
              currentStaff.status === 'completed'
                ? 'bg-blue-600 border-blue-600 text-white shadow-sm ring-2 ring-blue-300'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-blue-400 hover:bg-blue-50/50'
            }`}
          >
            <CheckCircle2 className={`w-5 h-5 ${currentStaff.status === 'completed' ? 'text-white' : 'text-blue-600'}`} />
            <span className="text-xs font-black">本日完了</span>
            <span className="text-[9px] opacity-75">作業終了</span>
          </button>
        </div>
      </div>

      {/* 3. 本日の伝言メモ */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-amber-600" />
            <h3 className="font-bold text-sm text-slate-900">
              全社への伝言メモ
            </h3>
          </div>
          {isSaved && (
            <span className="text-xs text-emerald-600 font-bold flex items-center gap-1 animate-in fade-in">
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
            className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white transition leading-relaxed"
          />
          {isEditingNote && (
            <button
              onClick={handleSaveNote}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition ml-auto shadow-xs"
            >
              <Check className="w-4 h-4" />
              <span>メモを全員に共有</span>
            </button>
          )}
        </div>
      </div>

      {/* 4. 担当現場情報 */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-2.5">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-amber-600" />
          <h3 className="font-bold text-sm text-slate-900">
            今日の滞在・担当現場
          </h3>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs space-y-1.5">
          <div className="text-slate-900 font-bold text-sm flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
            {currentStaff.current_site_name}
          </div>
          {assignedSite && (
            <>
              <p className="text-slate-600 text-[11px] pl-6">
                住所: {assignedSite.address}
              </p>
              <p className="text-amber-800 text-[11px] pl-6 font-medium">
                工事内容: {assignedSite.work_description}
              </p>
              {(assignedSite.startDate || assignedSite.endDate) && (
                <p className="text-blue-700 text-[11px] pl-6 font-bold flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  工期: {assignedSite.startDate || '未定'} 〜 {assignedSite.endDate || '未定'}
                </p>
              )}
              {assignedSite.notes && (
                <p className="text-slate-600 text-[11px] ml-6 mt-1 p-2 bg-white rounded-lg border border-slate-200">
                  <span className="text-amber-700 font-bold">現場備考:</span> {assignedSite.notes}
                </p>
              )}
            </>
          )}
        </div>
      </div>

      {/* 5. 音声＋AI作業日報アシスタント */}
      <div className="bg-amber-50/50 border border-amber-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-700 flex items-center justify-center border border-amber-300">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                AI作業日報アシスタント
                <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded border border-amber-300">
                  音声 ＋ Gemini 3.8 Flash
                </span>
              </h3>
              <p className="text-[11px] text-slate-500">
                スマホで話すだけでプロの日報フォーマットに自動整形
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          <button
            onClick={onOpenDailyReport}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black p-3.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition active:scale-98"
          >
            <Mic className="w-4 h-4" />
            <span>本日の日報を作成・AI校正</span>
          </button>
          <button
            onClick={onOpenReportList}
            className="bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-bold p-3.5 rounded-xl text-xs flex items-center justify-center gap-2 transition active:scale-98 shadow-xs"
          >
            <Printer className="w-4 h-4 text-amber-600" />
            <span>提出済み日報一覧・PDF出力</span>
          </button>
        </div>
      </div>

      {/* 6. 管理者専用メニュー（現場一覧・社員名簿管理） */}
      {isAdmin && (
        <div className="bg-sky-50/50 border border-sky-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center border border-sky-300">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                  全社管理・マスタ設定
                  <span className="text-[10px] bg-sky-100 text-sky-800 font-bold px-1.5 py-0.2 rounded border border-sky-300">
                    管理者専用
                  </span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  愛媛県内の現場追加や社員名簿・役職・アプリ編集権限の設定
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {onOpenSiteManagement && (
              <button
                onClick={onOpenSiteManagement}
                className="bg-white hover:bg-slate-50 text-sky-700 border border-sky-300 font-black p-3 rounded-xl text-xs flex items-center justify-center gap-2 transition active:scale-98 shadow-xs"
              >
                <Building2 className="w-4 h-4" />
                <span>現場の追加・編集・工期設定</span>
              </button>
            )}

            {onOpenStaffManagement && (
              <button
                onClick={onOpenStaffManagement}
                className="bg-white hover:bg-slate-50 text-amber-800 border border-amber-300 font-black p-3 rounded-xl text-xs flex items-center justify-center gap-2 transition active:scale-98 shadow-xs"
              >
                <Users className="w-4 h-4 text-amber-600" />
                <span>社員名簿・役職・権限の管理</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* 7. 画面切り替え大ボタン（全体ボードへ / チャットを開く） */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        <button
          onClick={onOpenMainBoard}
          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black p-4 rounded-2xl text-sm flex items-center justify-center gap-2.5 shadow-sm transition active:scale-98"
        >
          <Map className="w-5 h-5" />
          <span>現場マップ・みんなの状況を見る</span>
        </button>

        <button
          onClick={onOpenChat}
          className="bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-bold p-4 rounded-2xl text-sm flex items-center justify-center gap-2.5 shadow-xs transition active:scale-98"
        >
          <MessageSquare className="w-5 h-5 text-emerald-600" />
          <span>全社現場グループトークを開く</span>
        </button>
      </div>
    </div>
  );
};
