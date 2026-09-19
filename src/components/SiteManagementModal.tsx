'use client';

import React, { useState, useEffect } from 'react';
import { Site } from '@/lib/types';
import {
  Building2,
  Plus,
  Edit2,
  Trash2,
  MapPin,
  Check,
  X,
  ShieldCheck,
  Save,
  AlertTriangle,
} from 'lucide-react';

interface SiteManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  sites: Site[];
  onAddSite: (site: Omit<Site, 'id'>) => Promise<void>;
  onUpdateSite: (id: string, site: Partial<Site>) => Promise<void>;
  onDeleteSite: (id: string) => Promise<void>;
}

// 主要エリアの代表座標プリセット
const AREA_PRESETS = [
  { label: '渋谷エリア', lat: 35.6580, lng: 139.7016 },
  { label: '新宿エリア', lat: 35.6885, lng: 139.7005 },
  { label: '品川エリア', lat: 35.6284, lng: 139.7387 },
  { label: '六本木エリア', lat: 35.6628, lng: 139.7314 },
  { label: '池袋エリア', lat: 35.7295, lng: 139.7109 },
  { label: '東京駅・銀座', lat: 35.6812, lng: 139.7671 },
];

export const SiteManagementModal: React.FC<SiteManagementModalProps> = ({
  isOpen,
  onClose,
  sites,
  onAddSite,
  onUpdateSite,
  onDeleteSite,
}) => {
  const [activeTab, setActiveTab] = useState<'list' | 'add'>('list');
  const [editingSiteId, setEditingSiteId] = useState<string | null>(null);

  // 新規現場フォーム状態
  const [newName, setNewName] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newClient, setNewClient] = useState('');
  const [newWork, setNewWork] = useState('');
  const [newLat, setNewLat] = useState<number>(35.6580);
  const [newLng, setNewLng] = useState<number>(139.7016);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 編集フォーム状態
  const [editName, setEditName] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editClient, setEditClient] = useState('');
  const [editWork, setEditWork] = useState('');
  const [editStatus, setEditStatus] = useState<'planning' | 'in_progress' | 'completed'>('in_progress');

  // ESCキーで閉じる
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // 編集開始
  const handleStartEdit = (site: Site) => {
    setEditingSiteId(site.id);
    setEditName(site.name);
    setEditAddress(site.address);
    setEditClient(site.client_name || '');
    setEditWork(site.work_description || '');
    setEditStatus(site.status);
  };

  // 編集保存
  const handleSaveEdit = async (siteId: string) => {
    if (!editName.trim()) return;
    await onUpdateSite(siteId, {
      name: editName,
      address: editAddress,
      client_name: editClient,
      work_description: editWork,
      status: editStatus,
    });
    setEditingSiteId(null);
  };

  // 削除実行
  const handleDelete = async (site: Site) => {
    if (confirm(`現場「${site.name}」を削除してもよろしいですか？`)) {
      await onDeleteSite(site.id);
    }
  };

  // 新規追加送信
  const handleCreateSite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onAddSite({
        name: newName,
        address: newAddress || '東京都内',
        client_name: newClient || '元請建設会社様',
        work_description: newWork || '内装・設備工事',
        lat: newLat,
        lng: newLng,
        status: 'in_progress',
      });

      // フォームリセット
      setNewName('');
      setNewAddress('');
      setNewClient('');
      setNewWork('');
      setActiveTab('list');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-2 sm:p-4 animate-in fade-in duration-200 cursor-pointer"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                稼働中現場の管理・編集
                <span className="text-[10px] bg-amber-400/20 text-amber-300 px-1.5 py-0.2 rounded font-bold border border-amber-400/30 flex items-center gap-0.5">
                  <ShieldCheck className="w-3 h-3" />
                  管理者限定
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                現場の追加・工種や住所の変更、削除が全社にリアルタイム同期されます
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* タブ切り替え */}
        <div className="px-5 pt-3 bg-slate-950/60 border-b border-slate-800 flex items-center gap-2">
          <button
            onClick={() => setActiveTab('list')}
            className={`pb-2 px-3 text-xs font-bold border-b-2 transition ${
              activeTab === 'list'
                ? 'text-amber-400 border-amber-400'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            現場一覧（{sites.length}件）
          </button>
          <button
            onClick={() => setActiveTab('add')}
            className={`pb-2 px-3 text-xs font-bold border-b-2 transition flex items-center gap-1 ${
              activeTab === 'add'
                ? 'text-amber-400 border-amber-400'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>新規現場を追加</span>
          </button>
        </div>

        {/* コンテンツエリア */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 scrollbar-thin">
          {/* A. 現場一覧タブ */}
          {activeTab === 'list' && (
            <div className="space-y-3">
              {sites.map((site) => {
                const isEditing = editingSiteId === site.id;

                if (isEditing) {
                  return (
                    <div
                      key={site.id}
                      className="p-4 rounded-xl bg-slate-950 border border-amber-500/50 shadow-lg space-y-3 animate-in fade-in"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-400">
                          現場情報を編集中
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleSaveEdit(site.id)}
                            className="flex items-center gap-1 bg-amber-500 hover:bg-amber-400 text-slate-950 px-2.5 py-1 rounded-lg text-xs font-bold transition shadow"
                          >
                            <Save className="w-3.5 h-3.5" />
                            保存
                          </button>
                          <button
                            onClick={() => setEditingSiteId(null)}
                            className="p-1 text-slate-400 hover:text-slate-200"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-0.5">現場名</label>
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-0.5">所在地住所</label>
                          <input
                            type="text"
                            value={editAddress}
                            onChange={(e) => setEditAddress(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[11px] text-slate-400 mb-0.5">元請クライアント</label>
                            <input
                              type="text"
                              value={editClient}
                              onChange={(e) => setEditClient(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] text-slate-400 mb-0.5">工種・作業内容</label>
                            <input
                              type="text"
                              value={editWork}
                              onChange={(e) => setEditWork(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={site.id}
                    className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition flex items-start justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-slate-200">{site.name}</h4>
                        <span className="text-[10px] bg-emerald-950 text-emerald-400 px-1.5 py-0.2 rounded border border-emerald-800">
                          稼働中
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                        {site.address}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pt-1">
                        <span className="text-amber-400/90 font-medium">工種: {site.work_description}</span>
                        <span>元請: {site.client_name}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleStartEdit(site)}
                        className="p-1.5 text-slate-400 hover:text-amber-400 rounded-lg hover:bg-slate-800 transition"
                        title="現場情報を編集"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(site)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition"
                        title="現場を削除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* B. 新規現場追加タブ */}
          {activeTab === 'add' && (
            <form onSubmit={handleCreateSite} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  現場名 <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="例: 六本木ヒルズ レジデンス改修現場"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  所在地住所
                </label>
                <input
                  type="text"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  placeholder="例: 東京都港区六本木6-10-1"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    元請建設会社 / クライアント
                  </label>
                  <input
                    type="text"
                    value={newClient}
                    onChange={(e) => setNewClient(e.target.value)}
                    placeholder="例: 森ビル様 / 大林組様"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    工種・作業内容
                  </label>
                  <input
                    type="text"
                    value={newWork}
                    onChange={(e) => setNewWork(e.target.value)}
                    placeholder="例: 内装ボード貼り・空調配管工事"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* エリア座標の簡単選択 */}
              <div className="space-y-1.5 pt-1">
                <label className="block text-xs font-bold text-slate-300">
                  地図ピンの位置（最寄りエリア選択）
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {AREA_PRESETS.map((preset, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setNewLat(preset.lat);
                        setNewLng(preset.lng);
                      }}
                      className={`p-2 rounded-lg text-xs font-bold border transition ${
                        newLat === preset.lat && newLng === preset.lng
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={!newName.trim() || isSubmitting}
                className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black py-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition shadow-lg active:scale-98 mt-2"
              >
                <Plus className="w-4 h-4" />
                <span>{isSubmitting ? '登録中...' : '新しい現場を全社に登録・反映する'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
