'use client';

import React from 'react';
import { Staff, StaffStatus, STATUS_MAP } from '@/lib/types';
import { formatRelativeTime } from '@/lib/utils';
import { 
  Phone, 
  MapPin, 
  Clock, 
  Truck, 
  Hammer, 
  CheckCircle2, 
  Sparkles, 
  Navigation,
  Check
} from 'lucide-react';

interface StaffCardProps {
  staff: Staff;
  isCurrentUser: boolean;
  onUpdateStatus: (staffId: string, status: StaffStatus, siteName?: string, note?: string) => void;
  onFocusOnMap?: (lat: number, lng: number) => void;
}

export const StaffCard: React.FC<StaffCardProps> = ({
  staff,
  isCurrentUser,
  onUpdateStatus,
  onFocusOnMap,
}) => {
  const currentStatusConfig = STATUS_MAP[staff.status] || STATUS_MAP.not_started;

  const quickActions: { status: StaffStatus; label: string; icon: React.ReactNode; color: string }[] = [
    {
      status: 'moving',
      label: '移動中',
      icon: <Truck className="w-3.5 h-3.5" />,
      color: 'bg-blue-600 hover:bg-blue-500 text-white',
    },
    {
      status: 'working',
      label: '作業中',
      icon: <Hammer className="w-3.5 h-3.5" />,
      color: 'bg-emerald-600 hover:bg-emerald-500 text-white',
    },
    {
      status: 'completed',
      label: '完了',
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
      color: 'bg-violet-600 hover:bg-violet-500 text-white',
    },
    {
      status: 'available',
      label: '移動可能',
      icon: <Sparkles className="w-3.5 h-3.5" />,
      color: 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold',
    },
  ];

  const getStatusBadgeStyle = (status: StaffStatus) => {
    switch (status) {
      case 'working':
        return 'bg-emerald-50 text-emerald-800 border-emerald-300';
      case 'moving':
        return 'bg-blue-50 text-blue-800 border-blue-300';
      case 'available':
        return 'bg-amber-50 text-amber-800 border-amber-300';
      case 'completed':
        return 'bg-violet-50 text-violet-800 border-violet-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  return (
    <div
      className={`relative rounded-2xl transition-all duration-200 border p-4 ${
        isCurrentUser
          ? 'bg-white border-amber-400 ring-2 ring-amber-300 shadow-md'
          : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
      }`}
    >
      {/* 自分が操作対象の場合のバッジ */}
      {isCurrentUser && (
        <span className="absolute -top-2.5 right-4 bg-amber-500 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full shadow-xs">
          あなた（操作中）
        </span>
      )}

      {/* カードヘッダー：アバター・名前・ステータスバッジ */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center font-bold text-white text-base shadow-sm shrink-0 relative border-2 border-white ring-1 ring-slate-200"
            style={{ backgroundColor: staff.avatar_color }}
          >
            {staff.name.slice(0, 1)}
            {/* ステータスドット */}
            <span
              className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center shadow-xs"
              style={{ backgroundColor: currentStatusConfig.color }}
            >
              {staff.status === 'working' && <Hammer className="w-2 h-2 text-white" />}
              {staff.status === 'moving' && <Truck className="w-2 h-2 text-white" />}
              {staff.status === 'available' && <Sparkles className="w-2 h-2 text-slate-950" />}
              {staff.status === 'completed' && <Check className="w-2 h-2 text-white" />}
            </span>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 text-base truncate">
                {staff.name}
              </h3>
              <a
                href={`tel:${staff.phone}`}
                className="p-1 rounded-md text-slate-400 hover:text-emerald-600 hover:bg-slate-100 transition shrink-0"
                title={`${staff.name}に電話をかける`}
              >
                <Phone className="w-3.5 h-3.5" />
              </a>
            </div>
            <p className="text-xs text-slate-500 truncate">{staff.role}</p>
          </div>
        </div>

        {/* 現在のステータスバッジ */}
        <div
          className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusBadgeStyle(
            staff.status
          )}`}
        >
          <span
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ backgroundColor: currentStatusConfig.color }}
          />
          {currentStatusConfig.shortLabel}
        </div>
      </div>

      {/* 現場情報 & 現在地 */}
      <div className="mt-3.5 space-y-2 text-xs">
        <div className="flex items-start gap-2 text-slate-700">
          <MapPin className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <div className="min-w-0 flex-1">
            <span className="text-slate-400 text-[11px] block">担当・滞在場所:</span>
            <span className="font-bold text-slate-800 block truncate">
              {staff.current_site_name || '未登録'}
            </span>
          </div>
          {onFocusOnMap && (
            <button
              onClick={() => onFocusOnMap(staff.lat, staff.lng)}
              className="shrink-0 flex items-center gap-1 text-[11px] text-sky-600 hover:text-sky-700 font-bold hover:underline pt-1"
              title="地図で位置を確認"
            >
              <Navigation className="w-3 h-3" />
              地図
            </button>
          )}
        </div>

        {staff.status_note && (
          <div className="bg-slate-50 rounded-lg p-2 text-slate-700 text-[11px] border border-slate-200">
            <span className="text-amber-700 font-bold">伝言: </span>
            {staff.status_note}
          </div>
        )}

        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>更新: {formatRelativeTime(staff.updated_at)}</span>
          </div>
          <span>TEL: {staff.phone}</span>
        </div>
      </div>

      {/* ワンタップステータス切り替えボタン（自分のカードの場合のみ操作可能） */}
      {isCurrentUser && (
        <div className="mt-3.5 pt-3 border-t border-slate-150">
          <p className="text-[11px] font-bold text-amber-700 mb-2 flex items-center gap-1">
            <span>⚡ ワンタップ・ステータス更新</span>
          </p>
          <div className="grid grid-cols-4 gap-1.5">
            {quickActions.map((action) => {
              const isActive = staff.status === action.status;
              return (
                <button
                  key={action.status}
                  onClick={() => onUpdateStatus(staff.id, action.status)}
                  className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-xs font-semibold transition-all active:scale-95 ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 font-black shadow-xs ring-2 ring-amber-300'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <span className="mb-1">{action.icon}</span>
                  <span className="text-[10px] tracking-tight">{action.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
