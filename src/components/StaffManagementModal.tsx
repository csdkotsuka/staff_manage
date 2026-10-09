'use client';

import React, { useState, useEffect } from 'react';
import { Staff } from '@/lib/types';
import {
  Users,
  Plus,
  Edit2,
  Trash2,
  ShieldCheck,
  ShieldAlert,
  Phone,
  Mail,
  Save,
  X,
  MapPin,
  Lock,
} from 'lucide-react';

interface StaffManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  staffs: Staff[];
  currentStaffId: string;
  onUpdateStaff: (id: string, updated: Partial<Staff>) => Promise<void>;
  onAddStaff: (staff: Omit<Staff, 'id'>) => Promise<void>;
  onDeleteStaff: (id: string) => Promise<void>;
}

// 役職の代表プリセット
const ROLE_PRESETS = [
  '代表取締役・統括監理',
  '統括・現場代理人',
  '職長・現場リーダー',
  '主任電気工事士',
  '内装・ボード工長',
  '配管設備士',
  '施工補佐・見習い',
  '安全衛生責任者',
];

// アバターカラープリセット
const COLOR_PRESETS = [
  '#EF4444', // 赤
  '#3B82F6', // 青
  '#10B981', // 緑
  '#F59E0B', // 琥珀
  '#8B5CF6', // 紫
  '#EC4899', // ピンク
  '#06B6D4', // シアン
  '#64748B', // スレート
];

export const StaffManagementModal: React.FC<StaffManagementModalProps> = ({
  isOpen,
  onClose,
  staffs,
  currentStaffId,
  onUpdateStaff,
  onAddStaff,
  onDeleteStaff,
}) => {
  const [activeTab, setActiveTab] = useState<'list' | 'add'>('list');
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);

  // 編集用ステート
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editIsAdmin, setEditIsAdmin] = useState(false);
  const [editColor, setEditColor] = useState('#3B82F6');
  const [editSiteName, setEditSiteName] = useState('');

  // 新規追加用ステート
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState(ROLE_PRESETS[3]);
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newIsAdmin, setNewIsAdmin] = useState(false);
  const [newColor, setNewColor] = useState('#3B82F6');
  const [newSiteName, setNewSiteName] = useState('松山市内 待機中');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // 編集モード開始
  const handleStartEdit = (staff: Staff) => {
    setEditingStaffId(staff.id);
    setEditName(staff.name);
    setEditRole(staff.role);
    setEditPhone(staff.phone || '');
    setEditEmail(staff.email || '');
    setEditIsAdmin(Boolean(staff.isAdmin));
    setEditColor(staff.avatar_color || '#3B82F6');
    setEditSiteName(staff.current_site_name || '');
  };

  // 編集保存
  const handleSaveEdit = async (staffId: string) => {
    if (!editName.trim()) return;
    await onUpdateStaff(staffId, {
      name: editName,
      role: editRole,
      phone: editPhone,
      email: editEmail,
      isAdmin: editIsAdmin,
      avatar_color: editColor,
      current_site_name: editSiteName,
    });
    setEditingStaffId(null);
  };

  // 新規作成
  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onAddStaff({
        name: newName,
        role: newRole,
        phone: newPhone || '090-0000-0000',
        email: newEmail || `${newName.toLowerCase()}@craftsync-ehime.jp`,
        isAdmin: newIsAdmin,
        avatar_color: newColor,
        status: 'available',
        current_site_name: newSiteName || '松山本社 待機中',
        lat: 33.8392,
        lng: 132.7656,
        status_note: '新規登録されました',
        updated_at: new Date().toISOString(),
      });

      // フォーム初期化
      setNewName('');
      setNewPhone('');
      setNewEmail('');
      setNewIsAdmin(false);
      setActiveTab('list');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 削除
  const handleDelete = async (staff: Staff) => {
    if (staff.id === currentStaffId) {
      alert('現在ログイン中のアカウントは削除できません');
      return;
    }
    if (confirm(`社員「${staff.name}」を削除してもよろしいですか？`)) {
      await onDeleteStaff(staff.id);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-2 sm:p-4 animate-in fade-in duration-200 cursor-pointer"
      onClick={onClose}
    >
      <div
        className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-600 flex items-center justify-center border border-amber-300">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                社員名簿・役職・権限の管理
                <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-bold border border-amber-300 flex items-center gap-0.5">
                  <ShieldCheck className="w-3 h-3" />
                  管理者限定
                </span>
              </h3>
              <p className="text-[11px] text-slate-500">
                役職（社長・職長など）やアプリ編集権限、連絡先を自由に編集できます
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* タブ切り替えバー */}
        <div className="flex border-b border-slate-200 bg-white px-5 pt-2">
          <button
            onClick={() => setActiveTab('list')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'list'
                ? 'border-amber-500 text-amber-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            社員一覧 ({staffs.length}名)
          </button>
          <button
            onClick={() => setActiveTab('add')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'add'
                ? 'border-amber-500 text-amber-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            新しい社員を追加
          </button>
        </div>

        {/* メインコンテンツ */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 scrollbar-thin">
          {/* A. 社員一覧タブ */}
          {activeTab === 'list' && (
            <div className="space-y-3">
              {staffs.map((staff) => {
                const isEditing = editingStaffId === staff.id;

                if (isEditing) {
                  return (
                    <div
                      key={staff.id}
                      className="p-4 rounded-xl bg-slate-50 border border-amber-400 shadow-sm space-y-3 animate-in fade-in"
                    >
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                        <span className="text-xs font-bold text-amber-800 flex items-center gap-1">
                          <Edit2 className="w-3.5 h-3.5" />
                          社員情報を編集中
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleSaveEdit(staff.id)}
                            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-1 rounded-lg text-xs flex items-center gap-1 transition shadow-xs"
                          >
                            <Save className="w-3.5 h-3.5" />
                            保存
                          </button>
                          <button
                            onClick={() => setEditingStaffId(null)}
                            className="text-slate-500 hover:text-slate-800 text-xs px-2 py-1 rounded"
                          >
                            キャンセル
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="block text-slate-600 font-bold mb-1">氏名</label>
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-amber-500"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-600 font-bold mb-1">役職・資格</label>
                          <input
                            type="text"
                            value={editRole}
                            onChange={(e) => setEditRole(e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-amber-500"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-600 font-bold mb-1">電話番号</label>
                          <input
                            type="text"
                            value={editPhone}
                            onChange={(e) => setEditPhone(e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-amber-500"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-600 font-bold mb-1">メールアドレス</label>
                          <input
                            type="email"
                            value={editEmail}
                            onChange={(e) => setEditEmail(e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-amber-500"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-600 font-bold mb-1">担当・滞在現場名</label>
                          <input
                            type="text"
                            value={editSiteName}
                            onChange={(e) => setEditSiteName(e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-amber-500"
                          />
                        </div>

                        {/* アバター色 */}
                        <div>
                          <label className="block text-slate-600 font-bold mb-1">アバターカラー</label>
                          <div className="flex items-center gap-1.5 pt-1">
                            {COLOR_PRESETS.map((color) => (
                              <button
                                key={color}
                                type="button"
                                onClick={() => setEditColor(color)}
                                className={`w-5 h-5 rounded-full border-2 transition ${
                                  editColor === color ? 'border-slate-900 scale-110 shadow-xs' : 'border-transparent'
                                }`}
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                        </div>

                        {/* 管理者権限トグル */}
                        <div className="sm:col-span-2 pt-1">
                          <label className="flex items-center gap-2 cursor-pointer bg-white p-2.5 rounded-lg border border-slate-200 hover:border-slate-300">
                            <input
                              type="checkbox"
                              checked={editIsAdmin}
                              onChange={(e) => setEditIsAdmin(e.target.checked)}
                              className="w-4 h-4 text-amber-500 rounded border-slate-300 focus:ring-amber-400"
                            />
                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                              <ShieldCheck className="w-4 h-4 text-amber-600" />
                              管理者権限（現場追加や日報承認が可能）
                            </div>
                          </label>
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={staff.id}
                    className="p-3.5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 transition flex items-center justify-between gap-3 shadow-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-sm shadow-xs border-2 border-white ring-1 ring-slate-200"
                        style={{ backgroundColor: staff.avatar_color }}
                      >
                        {staff.name.charAt(0)}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-slate-900">{staff.name}</h4>
                          <span className="text-[11px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-full border border-slate-200">
                            {staff.role}
                          </span>
                          {staff.isAdmin && (
                            <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded border border-amber-300 flex items-center gap-0.5">
                              <ShieldCheck className="w-3 h-3" />
                              管理者
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" />
                            {staff.phone}
                          </span>
                          {staff.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3 text-slate-400" />
                              {staff.email}
                            </span>
                          )}
                          <span className="flex items-center gap-1 text-slate-600">
                            <MapPin className="w-3 h-3 text-amber-500" />
                            {staff.current_site_name || '待機中'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleStartEdit(staff)}
                        className="p-1.5 text-slate-500 hover:text-amber-600 rounded-lg hover:bg-slate-100 transition"
                        title="社員情報を編集"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      {staff.id !== currentStaffId && (
                        <button
                          onClick={() => handleDelete(staff)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition"
                          title="社員を削除"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* B. 新規社員追加タブ */}
          {activeTab === 'add' && (
            <form onSubmit={handleCreateStaff} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    氏名 <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="例: 佐々木 翔太"
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    役職・担当
                  </label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    {ROLE_PRESETS.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    電話番号
                  </label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="例: 090-1111-2222"
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    メールアドレス
                  </label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="例: sasaki@craftsync-ehime.jp"
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  初期待機・担当現場
                </label>
                <input
                  type="text"
                  value={newSiteName}
                  onChange={(e) => setNewSiteName(e.target.value)}
                  placeholder="例: 松山本社事務所 待機中"
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* アバターカラー */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  アバターカラー選択
                </label>
                <div className="flex items-center gap-2">
                  {COLOR_PRESETS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewColor(color)}
                      className={`w-7 h-7 rounded-xl border-2 transition ${
                        newColor === color ? 'border-slate-900 scale-110 shadow-xs' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* 管理者権限 */}
              <div className="pt-1">
                <label className="flex items-center gap-2 cursor-pointer bg-slate-50 p-3 rounded-xl border border-slate-200 hover:border-slate-300">
                  <input
                    type="checkbox"
                    checked={newIsAdmin}
                    onChange={(e) => setNewIsAdmin(e.target.checked)}
                    className="w-4 h-4 text-amber-500 rounded border-slate-300 focus:ring-amber-400"
                  />
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                      <ShieldCheck className="w-4 h-4 text-amber-600" />
                      管理者権限を付与する
                    </div>
                    <p className="text-[10px] text-slate-500">
                      現場追加・編集や日報の最終承認を行えるようになります
                    </p>
                  </div>
                </label>
              </div>

              <button
                type="submit"
                disabled={!newName.trim() || isSubmitting}
                className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black py-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition shadow-xs active:scale-98 mt-2"
              >
                <Plus className="w-4 h-4" />
                <span>{isSubmitting ? '登録中...' : '新しい社員を全社に登録する'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
