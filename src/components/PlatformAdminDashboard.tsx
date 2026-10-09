'use client';

import React, { useState } from 'react';
import { Company, Staff } from '@/lib/types';
import {
  Building2,
  UserCheck,
  Plus,
  KeyRound,
  ShieldCheck,
  Phone,
  Mail,
  MapPin,
  Trash2,
  CheckCircle2,
  ExternalLink,
  Users,
  HardHat,
  Eye,
  EyeOff,
  LogOut,
  ChevronRight,
  Layers,
} from 'lucide-react';

interface PlatformAdminDashboardProps {
  companies: Company[];
  adminPassword: string;
  onAddCompany: (company: Omit<Company, 'id' | 'createdAt'>) => Company;
  onDeleteCompany: (id: string) => void;
  onUpdateAdminPassword: (newPw: string) => void;
  onSelectCompanyAsAdmin: (company: Company) => void;
  staffs: Staff[];
  onLogout: () => void;
  onOpenMainApp: () => void;
}

export const PlatformAdminDashboard: React.FC<PlatformAdminDashboardProps> = ({
  companies,
  adminPassword,
  onAddCompany,
  onDeleteCompany,
  onUpdateAdminPassword,
  onSelectCompanyAsAdmin,
  staffs,
  onLogout,
  onOpenMainApp,
}) => {
  // 建設会社新規登録フォーム
  const [isAddingCompany, setIsAddingCompany] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [presidentName, setPresidentName] = useState('');
  const [presidentEmail, setPresidentEmail] = useState('');
  const [presidentPassword, setPresidentPassword] = useState('pass1234');
  const [addSuccessMsg, setAddSuccessMsg] = useState<string | null>(null);

  // パスワード変更モーダル / 状態
  const [isChangingPw, setIsChangingPw] = useState(false);
  const [currentPwInput, setCurrentPwInput] = useState('');
  const [newPwInput, setNewPwInput] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSuccess, setPwSuccess] = useState<string | null>(null);

  // 建設会社登録ハンドラ
  const handleCreateCompany = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName || !presidentName || !presidentEmail) {
      alert('会社名、社長氏名、メールアドレスは必須です');
      return;
    }

    onAddCompany({
      name: companyName,
      address: address || '未設定',
      phone: phone || '未設定',
      presidentName,
      presidentEmail,
      presidentPassword: presidentPassword || 'pass1234',
    });

    setAddSuccessMsg(`建設会社「${companyName}」と社長アカウント（${presidentEmail}）を作成しました！`);
    setCompanyName('');
    setAddress('');
    setPhone('');
    setPresidentName('');
    setPresidentEmail('');
    setPresidentPassword('pass1234');
    setIsAddingCompany(false);

    setTimeout(() => {
      setAddSuccessMsg(null);
    }, 4000);
  };

  // 自社パスワード変更ハンドラ
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPwError(null);
    setPwSuccess(null);

    if (currentPwInput !== adminPassword) {
      setPwError('現在のパスワードが正しくありません');
      return;
    }
    if (!newPwInput || newPwInput.length < 4) {
      setPwError('新しいパスワードは4文字以上で入力してください');
      return;
    }

    onUpdateAdminPassword(newPwInput);
    setPwSuccess('自社管理者パスワードを更新しました！次回から新しいパスワードでログインできます。');
    setCurrentPwInput('');
    setNewPwInput('');
    setTimeout(() => {
      setIsChangingPw(false);
      setPwSuccess(null);
    }, 2500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. 自社管理者ウェルカムバナー */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-2xl p-5 sm:p-7 shadow-md relative overflow-hidden border border-slate-700">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-amber-500/10 -skew-x-12 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-amber-400 text-slate-950 flex items-center gap-1 shadow-xs">
                <ShieldCheck className="w-3.5 h-3.5" />
                自社運営・スーパー管理者
              </span>
              <span className="text-xs text-slate-300 font-mono">
                kotsuka@creativesd.net
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Creative SD プラットフォーム自社管理コンソール
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              契約建設会社のアカウント作成、各社の社長（管理者）登録、およびシステム全体の利用状況を統括管理できます。
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsChangingPw(true)}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-600 transition flex items-center gap-1.5 shadow-xs"
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-400" />
              <span>パスワード変更</span>
            </button>
            <button
              onClick={onOpenMainApp}
              className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black rounded-xl transition flex items-center gap-1.5 shadow-xs"
            >
              <HardHat className="w-3.5 h-3.5" />
              <span>現場システムを表示</span>
            </button>
            <button
              onClick={onLogout}
              className="p-2 bg-slate-800/80 hover:bg-rose-900/60 text-slate-300 hover:text-white rounded-xl border border-slate-600 transition"
              title="ログアウト"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 通知トースト */}
      {addSuccessMsg && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs animate-in slide-in-from-top">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{addSuccessMsg}</span>
        </div>
      )}

      {/* 2. KPI統計カード */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">登録建設会社数</span>
            <Building2 className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">
            {companies.length} <span className="text-xs font-normal text-slate-500">社</span>
          </p>
          <span className="text-[11px] text-slate-400">現在契約・稼働中の企業テナント</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">登録社長（管理者）数</span>
            <UserCheck className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">
            {companies.length} <span className="text-xs font-normal text-slate-500">名</span>
          </p>
          <span className="text-[11px] text-slate-400">各社社長アカウントが権限を保持</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">プラットフォーム総社員数</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">
            {staffs.length} <span className="text-xs font-normal text-slate-500">名</span>
          </p>
          <span className="text-[11px] text-slate-400">社長が各社で管理・登録</span>
        </div>
      </div>

      {/* 3. 建設会社アカウント新規登録エリア */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-600" />
              <span>契約建設会社 & 社長アカウント管理</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              新しい建設会社を登録すると、その会社の社長（管理者）アカウントが自動作成されます
            </p>
          </div>

          <button
            onClick={() => setIsAddingCompany(!isAddingCompany)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition shadow-xs flex items-center gap-1.5 active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>{isAddingCompany ? '入力フォームを閉じる' : '新規建設会社を登録する'}</span>
          </button>
        </div>

        {/* 登録フォーム */}
        {isAddingCompany && (
          <form
            onSubmit={handleCreateCompany}
            className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4 sm:p-5 space-y-4 animate-in slide-in-from-top-2 duration-150"
          >
            <div className="font-bold text-xs text-indigo-900 flex items-center gap-1.5 border-b border-indigo-200/60 pb-2">
              <Building2 className="w-4 h-4 text-indigo-600" />
              <span>新規建設会社の基本情報 ＆ 社長（管理者）登録</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  建設会社名 <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="例: 有限会社 四国設備工業"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">本社所在地</label>
                <input
                  type="text"
                  placeholder="例: 愛媛県松山市中央1-2-3"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">代表電話番号</label>
                <input
                  type="text"
                  placeholder="例: 089-999-8888"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  社長（管理者）氏名 <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="例: 山田 太郎"
                  value={presidentName}
                  onChange={(e) => setPresidentName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  社長ログイン用メールアドレス <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="例: yamada@shikoku-setsubi.jp"
                  value={presidentEmail}
                  onChange={(e) => setPresidentEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  社長初期ログインパスワード <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="初期パスワード（例: pass1234）"
                  value={presidentPassword}
                  onChange={(e) => setPresidentPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono font-medium"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  ※登録後、社長自身が後からパスワード変更することも可能です
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddingCompany(false)}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs transition"
              >
                キャンセル
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs transition shadow-sm flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>この建設会社と社長アカウントを作成</span>
              </button>
            </div>
          </form>
        )}

        {/* 建設会社カード一覧 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {companies.map((company) => {
            const isInitialCraftSync = company.id === 'company-craftsync';

            return (
              <div
                key={company.id}
                className="border border-slate-200 hover:border-indigo-300 rounded-xl p-4 transition shadow-xs hover:shadow-sm bg-white flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center justify-center font-black text-sm">
                        {company.name.slice(0, 1)}
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-slate-900 leading-snug">
                          {company.name}
                        </h3>
                        <span className="text-[10px] text-slate-400">
                          登録日: {company.createdAt}
                        </span>
                      </div>
                    </div>

                    {!isInitialCraftSync && (
                      <button
                        onClick={() => {
                          if (confirm(`建設会社「${company.name}」を削除しますか？`)) {
                            onDeleteCompany(company.id);
                          }
                        }}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded-lg transition"
                        title="会社を削除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="mt-3 bg-slate-50 p-3 rounded-lg border border-slate-200/80 space-y-1.5 text-xs">
                    <div className="flex items-center gap-2 text-slate-700 font-bold">
                      <UserCheck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>社長（管理者）: {company.presidentName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{company.presidentEmail}</span>
                    </div>
                    {company.presidentPassword && (
                      <div className="flex items-center gap-2 text-slate-600 font-mono text-[11px]">
                        <KeyRound className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>初期PW: {company.presidentPassword}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-slate-600">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{company.address}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{company.phone}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    契約有効中
                  </span>

                  <button
                    onClick={() => onSelectCompanyAsAdmin(company)}
                    className="text-xs bg-slate-900 hover:bg-slate-800 text-white font-bold px-3 py-1.5 rounded-lg transition shadow-xs flex items-center gap-1 active:scale-95"
                  >
                    <span>この会社の現場管理を開く</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. 自社管理者パスワード変更モーダル */}
      {isChangingPw && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-3 animate-in fade-in duration-150"
          onClick={() => setIsChangingPw(false)}
        >
          <div
            className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-5 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-700 flex items-center justify-center font-bold">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-slate-900">
                    自社管理者パスワード変更
                  </h3>
                  <span className="text-[11px] text-slate-500 font-mono">
                    kotsuka@creativesd.net
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsChangingPw(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {pwError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 p-2.5 rounded-lg text-xs font-bold">
                {pwError}
              </div>
            )}
            {pwSuccess && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-2.5 rounded-lg text-xs font-bold">
                {pwSuccess}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  現在のパスワード（初期値: ko1019）
                </label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    required
                    value={currentPwInput}
                    onChange={(e) => setCurrentPwInput(e.target.value)}
                    placeholder="現在のパスワードを入力"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  新しいパスワード
                </label>
                <input
                  type={showPw ? 'text' : 'password'}
                  required
                  value={newPwInput}
                  onChange={(e) => setNewPwInput(e.target.value)}
                  placeholder="新しいパスワードを入力（4文字以上）"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsChangingPw(false)}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs transition"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs transition shadow-sm"
                >
                  パスワードを変更する
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
