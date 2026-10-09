'use client';

import React, { useState } from 'react';
import { Staff } from '@/lib/types';
import { auth, isFirebaseConfigured } from '@/lib/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import {
  LogIn,
  KeyRound,
  Mail,
  UserCheck,
  HardHat,
  AlertCircle,
  X,
  Sparkles,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  staffs: Staff[];
  onSelectStaff: (staffId: string) => void;
  onLoginSuccess: (email: string, matchedStaff?: Staff) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  staffs,
  onSelectStaff,
  onLoginSuccess,
}) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    if (isFirebaseConfigured && auth) {
      try {
        if (isRegister) {
          const cred = await createUserWithEmailAndPassword(auth, email, password);
          const matched = staffs.find((s) => s.email === cred.user.email);
          onLoginSuccess(cred.user.email || email, matched);
        } else {
          const cred = await signInWithEmailAndPassword(auth, email, password);
          const matched = staffs.find((s) => s.email === cred.user.email);
          onLoginSuccess(cred.user.email || email, matched);
        }
        onClose();
      } catch (err: unknown) {
        const error = err as { code?: string; message?: string };
        console.error('Auth error', error);
        if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
          setErrorMsg('メールアドレスまたはパスワードが正しくありません。');
        } else if (error.code === 'auth/email-already-in-use') {
          setErrorMsg('このメールアドレスは既に登録されています。ログインをお試しください。');
        } else if (error.code === 'auth/weak-password') {
          setErrorMsg('パスワードは6文字以上で設定してください。');
        } else if (error.code === 'auth/configuration-not-found' || error.code === 'auth/operation-not-allowed') {
          setErrorMsg('Firebase Authenticationの「Email/Password」が未有効です。下の「社員クイックログイン」をご利用ください。');
        } else {
          setErrorMsg('ログインに失敗しました。下の「社員クイックログイン」もお試しいただけます。');
        }
      } finally {
        setIsLoading(false);
      }
    } else {
      // デモ環境の場合
      const matched = staffs.find((s) => s.email === email);
      onLoginSuccess(email, matched);
      onClose();
      setIsLoading(false);
    }
  };

  // 社員クイックログイン（デモ・現場用ワンタップ切り替え）
  const handleQuickLogin = (staff: Staff) => {
    onSelectStaff(staff.id);
    onLoginSuccess(staff.email || `${staff.id}@craftsync.local`, staff);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* ヘッダー */}
        <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-600 flex items-center justify-center border border-amber-300">
              <HardHat className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-black text-sm text-slate-900">
                現場NOW 社員ログイン
              </h3>
              <p className="text-[11px] text-slate-500">
                マイページで今日の現場・ステータスを管理
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-5 overflow-y-auto space-y-5 scrollbar-thin">
          {/* メール/パスワード認証フォーム */}
          <form onSubmit={handleEmailAuth} className="space-y-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-slate-800">
                {isRegister ? 'アカウント新規登録' : 'メールアドレスでログイン'}
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsRegister(!isRegister);
                  setErrorMsg(null);
                }}
                className="text-xs text-amber-600 hover:text-amber-700 underline font-bold"
              >
                {isRegister ? 'ログインはこちら' : '新規登録はこちら'}
              </button>
            </div>

            {errorMsg && (
              <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                メールアドレス
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                パスワード
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition shadow-xs"
            >
              <LogIn className="w-4 h-4" />
              <span>{isRegister ? '新規登録して開始' : 'ログイン'}</span>
            </button>
          </form>

          {/* 区切り線 */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-3 text-[11px] text-slate-500 font-medium shrink-0">
              または
            </span>
            <div className="border-t border-slate-200 w-full" />
          </div>

          {/* ワンタップ社員クイックログイン（テスト・現場デモ用） */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-xs font-bold text-slate-800">
                社員を選んでワンタップログイン（デモ）
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mb-2">
              パスワード入力なしで各社員のマイページを直接体験できます：
            </p>
            <div className="space-y-1.5">
              {staffs.map((staff) => (
                <button
                  key={staff.id}
                  onClick={() => handleQuickLogin(staff)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 flex items-center justify-between text-left transition group active:scale-98 shadow-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-white shrink-0 shadow-xs"
                      style={{ backgroundColor: staff.avatar_color }}
                    >
                      {staff.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800 group-hover:text-amber-600 transition">
                        {staff.name}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {staff.role} • {staff.email}
                      </div>
                    </div>
                  </div>
                  <UserCheck className="w-4 h-4 text-slate-400 group-hover:text-amber-500 transition" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
