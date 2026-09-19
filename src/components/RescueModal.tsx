'use client';

import React, { useState, useMemo } from 'react';
import { Staff, StaffStatus } from '@/lib/types';
import { calculateDistanceKm, estimateDriveMinutes } from '@/lib/utils';
import { 
  Siren, 
  X, 
  MapPin, 
  Navigation, 
  Clock, 
  Phone, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface RescueModalProps {
  isOpen: boolean;
  onClose: () => void;
  staffs: Staff[];
  onDispatchStaff: (staffId: string, siteName: string, note: string) => void;
  onPreviewLocation: (coord: { lat: number; lng: number; title: string } | null) => void;
}

// サンプルの急患・トラブル現場プリセット（愛媛県内）
const RESCUE_PRESETS = [
  {
    title: '松山大街道 テナントビル漏水緊急対応',
    address: '愛媛県松山市大街道2-1-1',
    lat: 33.8415,
    lng: 132.7712,
    description: '2階飲食テナント厨房で給水管より漏水。至急バルブ遮断と応急配管補修が必要',
    urgency: 'urgent',
  },
  {
    title: '松山空港通り 店舗停電トラブル',
    address: '愛媛県松山市空港通3-8-1',
    lat: 33.8290,
    lng: 132.7230,
    description: '主ブレーカー作動で店舗内が全停電。絶縁測定と回路復旧要請',
    urgency: 'urgent',
  },
  {
    title: '伊予市 物流倉庫換気ファン脱落危険',
    address: '愛媛県伊予市米湊800',
    lat: 33.7550,
    lng: 132.7020,
    description: '天井換気排気設備の吊り金具破損。夕方までに高所作業車での緊急補強が必要',
    urgency: 'high',
  },
];

export const RescueModal: React.FC<RescueModalProps> = ({
  isOpen,
  onClose,
  staffs,
  onDispatchStaff,
  onPreviewLocation,
}) => {
  const [selectedPresetIndex, setSelectedPresetIndex] = useState<number>(0);
  const [customTitle, setCustomTitle] = useState<string>(RESCUE_PRESETS[0].title);
  const [customAddress, setCustomAddress] = useState<string>(RESCUE_PRESETS[0].address);
  const [targetLat, setTargetLat] = useState<number>(RESCUE_PRESETS[0].lat);
  const [targetLng, setTargetLng] = useState<number>(RESCUE_PRESETS[0].lng);
  const [dispatchedSuccess, setDispatchedSuccess] = useState<string | null>(null);

  // プリセット切り替え
  const handleSelectPreset = (idx: number) => {
    setSelectedPresetIndex(idx);
    const preset = RESCUE_PRESETS[idx];
    setCustomTitle(preset.title);
    setCustomAddress(preset.address);
    setTargetLat(preset.lat);
    setTargetLng(preset.lng);
    onPreviewLocation({ lat: preset.lat, lng: preset.lng, title: preset.title });
  };

  // 社員の距離と適合度計算・ソートロジック
  // ルール: 「available（移動可能）」を最優先、次に現在地からの直線距離が近い順
  const rankedStaffs = useMemo(() => {
    return staffs
      .map((staff) => {
        const distanceKm = calculateDistanceKm(targetLat, targetLng, staff.lat, staff.lng);
        const driveMinutes = estimateDriveMinutes(distanceKm);
        
        // スコア計算: 移動可能なら大幅ボーナス
        const isAvailable = staff.status === 'available';
        const isMoving = staff.status === 'moving';
        const isWorking = staff.status === 'working';

        let score = distanceKm;
        if (!isAvailable) {
          score += 50; // 作業中や移動中はペナルティ
        }
        if (isWorking) {
          score += 30;
        }

        return {
          ...staff,
          distanceKm,
          driveMinutes,
          isAvailable,
          isMoving,
          isWorking,
          score,
        };
      })
      .sort((a, b) => a.score - b.score);
  }, [staffs, targetLat, targetLng]);

  if (!isOpen) return null;

  // 出動要請ハンドラ
  const handleDispatch = (staff: typeof rankedStaffs[0]) => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });

    onDispatchStaff(
      staff.id,
      `緊急現場: ${customTitle}`,
      `社長より緊急指令: ${customTitle} (${customAddress}) へ至急向かってください`
    );

    setDispatchedSuccess(`${staff.name}さんに緊急出動を要請しました！`);
    setTimeout(() => {
      setDispatchedSuccess(null);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-red-500/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* モーダルヘッダー */}
        <div className="bg-gradient-to-r from-red-700 via-rose-700 to-red-800 text-white px-5 py-4 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 rounded-xl">
              <Siren className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div>
              <h2 className="font-black text-lg sm:text-xl flex items-center gap-2">
                急な呼び出し（レスキュー急行）
              </h2>
              <p className="text-xs text-red-100 font-medium">
                「移動可能」社員と現場距離から最速対応者を自動判定
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              onPreviewLocation(null);
              onClose();
            }}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 完了通知メッセージ */}
        {dispatchedSuccess && (
          <div className="bg-emerald-500 text-slate-950 px-4 py-3 font-black text-center flex items-center justify-center gap-2 shadow-inner">
            <CheckCircle2 className="w-5 h-5" />
            {dispatchedSuccess}
          </div>
        )}

        {/* モーダルボディ */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-slate-200">
          {/* 1. 緊急トラブル案件の選択または入力 */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              ① トラブル現場を選択（シミュレーション）
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {RESCUE_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectPreset(idx)}
                  className={`p-2.5 rounded-xl text-left border text-xs transition-all ${
                    selectedPresetIndex === idx
                      ? 'bg-red-950/50 border-red-500 text-white shadow-md ring-1 ring-red-500'
                      : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span className="font-bold block text-slate-200 truncate mb-1">
                    {preset.title.split(' ')[0]}
                  </span>
                  <span className="text-[10px] text-slate-400 block truncate">
                    {preset.address}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 案件詳細プレビュー */}
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-xs flex items-center justify-between">
            <div>
              <span className="font-bold text-amber-400 block">
                {customTitle}
              </span>
              <span className="text-slate-400 text-[11px] flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-red-400" />
                {customAddress}
              </span>
            </div>
            <span className="px-2 py-0.5 bg-red-500/20 text-red-400 border border-red-500/40 rounded text-[10px] font-bold">
              最優先派遣
            </span>
          </div>

          {/* 2. 最速駆けつけ候補（自動ソート） */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                ② 最適な社員（空きステータス ＆ 距離から算出）
              </label>
              <span className="text-[11px] text-slate-400">
                車移動速度 22km/h 基準
              </span>
            </div>

            <div className="space-y-2.5">
              {rankedStaffs.map((staff, idx) => {
                const isBestMatch = idx === 0;
                return (
                  <div
                    key={staff.id}
                    className={`p-3 rounded-xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                      isBestMatch
                        ? 'bg-gradient-to-r from-amber-950/60 via-slate-900 to-amber-950/30 border-amber-400/80 shadow-lg shadow-amber-500/10 ring-2 ring-amber-400/30'
                        : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {/* 左側：社員情報 */}
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-sm shrink-0 relative"
                        style={{ backgroundColor: staff.avatar_color }}
                      >
                        {staff.name.slice(0, 1)}
                        {isBestMatch && (
                          <span className="absolute -top-1.5 -left-1.5 bg-amber-400 text-slate-950 text-[9px] font-black px-1.5 rounded-full shadow">
                            1位
                          </span>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-100 text-sm">
                            {staff.name}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {staff.role}
                          </span>
                          {staff.isAvailable ? (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-0.5">
                              <Sparkles className="w-2.5 h-2.5" />
                              移動可能
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-400">
                              {staff.status === 'working' ? '作業中' : '移動中'}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-400">
                          <span className="flex items-center gap-1 text-slate-300">
                            <Navigation className="w-3 h-3 text-sky-400" />
                            距離: <strong className="text-white">{staff.distanceKm}km</strong>
                          </span>
                          <span className="flex items-center gap-1 text-slate-300">
                            <Clock className="w-3 h-3 text-amber-400" />
                            到着予測: <strong className="text-amber-300">約{staff.driveMinutes}分</strong>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 右側：招集ボタン */}
                    <div className="w-full sm:w-auto flex items-center justify-end gap-2 pt-1 sm:pt-0 border-t sm:border-0 border-slate-800">
                      <a
                        href={`tel:${staff.phone}`}
                        className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                        title="電話で直接連絡"
                      >
                        <Phone className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => handleDispatch(staff)}
                        className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-black transition-all active:scale-95 flex items-center justify-center gap-1.5 shadow-md ${
                          isBestMatch
                            ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-amber-500/20 ring-1 ring-white/60'
                            : 'bg-red-600 hover:bg-red-500 text-white'
                        }`}
                      >
                        <Siren className="w-3.5 h-3.5" />
                        <span>{isBestMatch ? '最速急行を要請！' : 'この人に要請'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
