'use client';

import React, { useState } from 'react';
import { Staff, Company, UserRole } from '@/lib/types';
import {
  LogIn,
  KeyRound,
  Mail,
  ShieldCheck,
  UserCheck,
  HardHat,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Eye,
  EyeOff,
  Building2,
  Users,
} from 'lucide-react';

interface LoginPageProps {
  staffs: Staff[];
  companies: Company[];
  adminPassword: string;
  onLoginSuccess: (
    role: UserRole,
    email: string,
    name: string,
    staff?: Staff,
    company?: Company
  ) => void;
  onBackToApp?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  staffs,
  companies,
  adminPassword,
  onLoginSuccess,
  onBackToApp,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // 通常ログイン処理
  const handleFormLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const inputEmail = email.trim().toLowerCase();
    const inputPw = password.trim();

    // 1. 自社運営者（Creative SD）の認証
    if (inputEmail === 'kotsuka@creativesd.net') {
      if (inputPw === adminPassword) {
        onLoginSuccess('super_admin', 'kotsuka@creativesd.net', '大塚 (Creative SD 管理者)');
        return;
      } else {
        setErrorMsg('自社管理者のパスワードが正しくありません。（初期値: ko1019）');
        return;
      }
    }

    // 2. 登録建設会社の社長（管理者）の認証
    const matchedCompany = companies.find(
      (c) => c.presidentEmail.toLowerCase() === inputEmail
    );
    if (matchedCompany) {
      const validPw = matchedCompany.presidentPassword || 'sato';
      if (inputPw === validPw) {
        // 社長に一致するスタッフレコードを探す
        const matchedStaff = staffs.find((s) => s.isAdmin || s.email?.toLowerCase() === inputEmail);
        onLoginSuccess(
          'company_admin',
          matchedCompany.presidentEmail,
          `${matchedCompany.presidentName} (社長)`,
          matchedStaff,
          matchedCompany
        );
        return;
      } else {
        setErrorMsg(`社長パスワードが正しくありません。（初期値: ${matchedCompany.presidentPassword || 'sato'}）`);
        return;
      }
    }

    // 3. 各現場スタッフの認証
    const matchedStaff = staffs.find(
      (s) => s.email?.toLowerCase() === inputEmail || `${s.id}@craftsync.local` === inputEmail
    );
    if (matchedStaff) {
      const validPw = matchedStaff.password || matchedStaff.id.replace('staff-', '') || 'pass';
      if (inputPw === validPw || inputPw === 'pass' || inputPw === matchedStaff.id) {
        onLoginSuccess(
          matchedStaff.isAdmin ? 'company_admin' : 'staff',
          matchedStaff.email || `${matchedStaff.id}@craftsync.local`,
          matchedStaff.name,
          matchedStaff,
          companies[0]
        );
        return;
      } else {
        setErrorMsg(`パスワードが正しくありません。（ヒント: ${matchedStaff.password || '初期パスワード'}）`);
        return;
      }
    }

    // 見つからない場合
    setErrorMsg('該当するアカウントが見つかりませんでした。下の「クイックログイン」もお試しください。');
  };

  // ワンタップ・クイックログイン
  const handleQuickLoginSuperAdmin = () => {
    onLoginSuccess('super_admin', 'kotsuka@creativesd.net', '大塚 (Creative SD 管理者)');
  };

  const handleQuickLoginStaff = (staff: Staff) => {
    const role: UserRole = staff.isAdmin ? 'company_admin' : 'staff';
    onLoginSuccess(
      role,
      staff.email || `${staff.id}@craftsync.local`,
      staff.name,
      staff,
      companies[0]
    );
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-3xl shadow-xl max-w-4xl w-full overflow-hidden grid grid-cols-1 md:grid-cols-12">
        {/* 左側：通常ログインフォーム */}
        <div className="md:col-span-6 p-6 sm:p-8 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 font-black flex items-center justify-center text-lg shadow-sm">
                建
              </div>
              <div>
                <h1 className="text-lg font-black text-slate-900 leading-tight">
                  現場NOW 統合ログイン
                </h1>
                <p className="text-xs text-slate-500">
                  自社運営・社長・全社員共通認証ポータル
                </p>
              </div>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleFormLogin} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  メールアドレス / アカウントID
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="例: kotsuka@creativesd.net または sato@..."
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  パスワード
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="パスワードを入力"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs transition shadow-sm flex items-center justify-center gap-1.5 active:scale-98"
              >
                <LogIn className="w-4 h-4" />
                <span>ログインする</span>
              </button>
            </form>
          </div>

          {/* フッター補足 */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>※右の全アカウント一覧からワンタップ選択可</span>
            {onBackToApp && (
              <button
                type="button"
                onClick={onBackToApp}
                className="text-amber-600 hover:text-amber-700 font-bold underline"
              >
                ゲスト画面に戻る
              </button>
            )}
          </div>
        </div>

        {/* 右側：全スタッフ & 自社 & 社長 クイックログイン一覧 */}
        <div className="md:col-span-6 bg-slate-50 p-6 sm:p-8 border-t md:border-t-0 md:border-l border-slate-200 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                全スタッフ・ダミーログイン選択
              </span>
              <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full border border-amber-200">
                1クリック即時ログイン
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mb-3">
              各権限・アカウントの動作確認用。クリックすると即座に対象ロールとしてログインします。
            </p>

            <div className="space-y-2.5 overflow-y-auto max-h-[460px] pr-1 scrollbar-thin">
              {/* 1. 自社アカウント */}
              <div className="bg-white border-2 border-indigo-200 hover:border-indigo-400 rounded-xl p-3 shadow-xs transition group">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                      <ShieldCheck className="w-4 h-4 text-amber-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-slate-900">
                          Creative SD (自社管理者)
                        </span>
                        <span className="text-[9px] bg-indigo-100 text-indigo-800 font-bold px-1.5 py-0.2 rounded">
                          自社管理
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 font-mono">
                        kotsuka@creativesd.net (PW: {adminPassword})
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleQuickLoginSuperAdmin}
                    className="text-[11px] bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-2.5 py-1.5 rounded-lg transition shrink-0 flex items-center gap-1 shadow-xs active:scale-95"
                  >
                    <span>自社管理へ</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* 2. 建設会社社長（管理者） */}
              {companies.map((company) => {
                const matchedStaff = staffs.find(
                  (s) => s.isAdmin || s.email === company.presidentEmail
                );
                return (
                  <div
                    key={company.id}
                    className="bg-white border border-amber-300 hover:border-amber-400 rounded-xl p-3 shadow-xs transition group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-rose-500 text-white flex items-center justify-center font-bold text-xs shrink-0">
                          <UserCheck className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs text-slate-900">
                              {company.presidentName} (社長)
                            </span>
                            <span className="text-[9px] bg-rose-100 text-rose-800 font-bold px-1.5 py-0.2 rounded">
                              社長・統括
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 font-mono">
                            {company.presidentEmail} ({company.name})
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          onLoginSuccess(
                            'company_admin',
                            company.presidentEmail,
                            `${company.presidentName} (社長)`,
                            matchedStaff,
                            company
                          );
                        }}
                        className="text-[11px] bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-2.5 py-1.5 rounded-lg transition shrink-0 flex items-center gap-1 shadow-xs active:scale-95"
                      >
                        <span>社長で入る</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* 3. 各現場スタッフ（一般社員） */}
              <div className="pt-2 border-t border-slate-200">
                <span className="text-[11px] font-bold text-slate-600 block mb-2">
                  現場スタッフ（全{staffs.filter((s) => !s.isAdmin).length}名）
                </span>
                <div className="space-y-1.5">
                  {staffs
                    .filter((s) => !s.isAdmin)
                    .map((staff) => (
                      <div
                        key={staff.id}
                        className="bg-white border border-slate-200 hover:border-slate-300 rounded-lg p-2.5 transition flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-7 h-7 rounded-full text-white flex items-center justify-center font-bold text-[11px] shrink-0"
                            style={{ backgroundColor: staff.avatar_color }}
                          >
                            {staff.name.slice(0, 1)}
                          </div>
                          <div>
                            <span className="font-bold text-xs text-slate-900 block leading-tight">
                              {staff.name}
                            </span>
                            <span className="text-[10px] text-slate-500 block">
                              {staff.role} ({staff.email})
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleQuickLoginStaff(staff)}
                          className="text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-2.5 py-1 rounded-md transition shrink-0 active:scale-95"
                        >
                          選択
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
