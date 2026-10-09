'use client';

import React from 'react';
import Link from 'next/link';
import {
  HardHat,
  MapPin,
  Users,
  MessageSquare,
  Siren,
  ShieldCheck,
  Sparkles,
  ArrowLeft,
  BookOpen,
  Code2,
  ExternalLink,
  Zap,
  Calendar,
} from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-amber-400 selection:text-slate-950 pb-16">
      {/* ナビゲーションバー */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 sm:px-8 shadow-xs">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center font-black text-slate-950 shadow-xs">
              建
            </div>
            <div>
              <span className="font-black text-base sm:text-lg text-slate-900">
                現場NOW (CraftSync)
              </span>
              <span className="text-xs text-amber-600 font-bold ml-2">アプリ概要 (About)</span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 text-xs font-bold">
            <Link
              href="/"
              className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-300 transition shadow-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>アプリへ戻る</span>
            </Link>
            <Link
              href="/guide"
              className="flex items-center gap-1.5 bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-300 px-3 py-1.5 rounded-lg transition"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden sm:inline">取扱説明書</span>
            </Link>
            <Link
              href="/docs"
              className="flex items-center gap-1.5 bg-sky-50 text-sky-800 hover:bg-sky-100 border border-sky-300 px-3 py-1.5 rounded-lg transition"
            >
              <Code2 className="w-3.5 h-3.5 text-sky-600" />
              <span className="hidden sm:inline">技術仕様書</span>
            </Link>
          </div>
        </div>
      </header>

      {/* ヒーローセクション */}
      <section className="bg-white border-b border-slate-200 py-14 px-4 text-center space-y-4">
        <div className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-300 text-amber-800 text-xs font-bold px-3 py-1 rounded-full shadow-xs">
          <HardHat className="w-3.5 h-3.5" />
          現場特化型 リアルタイム施工管理DXプラットフォーム
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 max-w-2xl mx-auto leading-snug">
          現場の「いま」がひと目でわかる。<br />
          <span className="text-amber-600">
            現場NOW (CraftSync) について
          </span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed">
          電話やLINEでの「いまどこ？何時終わる？」をゼロに。職人の状態共有、Googleカレンダー連動の工期管理、AI音声日報、現場監督の手書きサイン、突発トラブル急行支援（レスキュー）までをワンストップで解決するWeb/PWAシステムです。
        </p>

        <div className="pt-2 flex flex-wrap justify-center gap-3 text-xs font-bold">
          <Link
            href="/guide"
            className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-2 rounded-xl shadow-xs transition"
          >
            <BookOpen className="w-4 h-4" />
            <span>詳しい取扱説明書・使い方を見る</span>
          </Link>
          <Link
            href="/docs"
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 px-4 py-2 rounded-xl border border-slate-300 transition shadow-xs"
          >
            <Code2 className="w-4 h-4" />
            <span>技術仕様・アーキテクチャを見る</span>
          </Link>
        </div>
      </section>

      {/* システム概要・開発の背景 */}
      <main className="max-w-4xl mx-auto p-4 sm:p-6 space-y-10 mt-4">
        <section className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs">
          <div className="flex items-center gap-2 text-amber-600 font-bold text-sm">
            <Zap className="w-4 h-4" />
            <span>開発コンセプト & 解決する現場の課題</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900">
            「職人の電話対応ストレス」と「管理者の現場把握の遅れ」を解消
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-700 leading-relaxed">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <h3 className="font-bold text-rose-600 text-sm">⚠️ 従来の課題</h3>
              <ul className="list-disc list-inside space-y-1.5 text-slate-600">
                <li>「今どこ？」「あと何分で終わる？」と現場作業中に電話がかかってくる</li>
                <li>現場日程や工期がホワイトボード管理で最新日程が職人に伝わらない</li>
                <li>夕方の事務所戻り後に日報を入力するのが負担で残業が発生</li>
                <li>元請監督の確認サインをもらうためだけに待機・書類往復が発生</li>
                <li>急な漏水や停電などのトラブル時、誰が一番近くにいるか分からず手配が遅れる</li>
              </ul>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <h3 className="font-bold text-emerald-700 text-sm">✨ 現場NOWでの解決</h3>
              <ul className="list-disc list-inside space-y-1.5 text-slate-700">
                <li>ワンタップで「作業中・移動中・移動可能」が全社マップと同期</li>
                <li>Googleカレンダー連携の月間工程カレンダーで過去・現在・未来の現場日程を一元把握</li>
                <li>Gemini AIで話すだけで日報が自動生成。スマホ上で監督サインも完結</li>
                <li>電子印鑑と公式A4フォーマットPDF帳票の自動生成で完全ペーパーレス</li>
                <li>GPS自動計算による「最短出動レスキュー」で緊急時も最寄り社員が急行</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 主な主要機能一覧 */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <div>
              <h2 className="text-lg font-bold text-slate-900">主要機能ハイライト</h2>
              <p className="text-xs text-slate-500">現場作業員と管理者双方の業務を効率化する各種機能</p>
            </div>
            <Link
              href="/guide"
              className="text-xs text-amber-600 hover:text-amber-700 font-bold flex items-center gap-1"
            >
              <span>詳しい使い方へ</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
            {/* 機能1 */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2 shadow-xs">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <Users className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">職人マイページ & 状態更新</h3>
              <p className="text-slate-600 leading-relaxed">
                作業中・現場移動・移動可能（急募OK）・本日完了をワンタップで切り替え。伝言メモもリアルタイム共有。
              </p>
            </div>

            {/* 機能2: 現場日程月間カレンダー */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2 shadow-xs">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Calendar className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">現場工期・月間カレンダー</h3>
              <p className="text-slate-600 leading-relaxed">
                Googleカレンダー連携で過去・現在・未来の現場工程を月間表示。開始日・終了日の把握と同期を支援。
              </p>
            </div>

            {/* 機能3 */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2 shadow-xs">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">AI音声日報 & 手書きサイン</h3>
              <p className="text-slate-600 leading-relaxed">
                話すだけでGeminiが日報を自動整形。現場監督の手書きサイン受領＆電子印鑑付A4 PDF発行に対応。
              </p>
            </div>

            {/* 機能4 */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2 shadow-xs">
              <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
                <MapPin className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">リアルタイム現場マップ</h3>
              <p className="text-slate-600 leading-relaxed">
                全現場のピン留めと担当社員の居場所を可視化。Open-Meteo直結の週間天気予報も現場ごとに表示。
              </p>
            </div>

            {/* 機能5 */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2 shadow-xs">
              <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                <Siren className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">急募レスキュー（最短出動）</h3>
              <p className="text-slate-600 leading-relaxed">
                緊急案件の発生時、距離を自動計算して最も近い「移動可能」社員を抽出し、ワンタップで出動要請。
              </p>
            </div>

            {/* 機能6 */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2 shadow-xs">
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                <MessageSquare className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">全社現場トーク</h3>
              <p className="text-slate-600 leading-relaxed">
                現場写真や進捗メッセージを全社員で即座に共有。緊急通知バッジ付きで連絡漏れを防止。
              </p>
            </div>
          </div>
        </section>

        {/* ドキュメントナビゲーション */}
        <section className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-3 shadow-xs">
          <h2 className="text-base font-bold text-slate-900">各種ドキュメントへのリンク</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <Link
              href="/guide"
              className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl flex items-start gap-3 transition group"
            >
              <div className="p-2 rounded-lg bg-amber-100 text-amber-700 shrink-0">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-slate-900 group-hover:text-amber-600">
                  取扱説明書 (Guide)
                </div>
                <div className="text-slate-500 text-[11px] mt-0.5">
                  現場での実際の操作手順や画面の見方をステップバイステップで解説しています。
                </div>
              </div>
            </Link>

            <Link
              href="/docs"
              className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl flex items-start gap-3 transition group"
            >
              <div className="p-2 rounded-lg bg-sky-100 text-sky-700 shrink-0">
                <Code2 className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-slate-900 group-hover:text-sky-600">
                  技術仕様書 (Docs)
                </div>
                <div className="text-slate-500 text-[11px] mt-0.5">
                  システム構成、Firebase連携、Firestoreセキュリティルール、API仕様を掲載。
                </div>
              </div>
            </Link>
          </div>
        </section>
      </main>

      {/* フッター */}
      <footer className="max-w-4xl mx-auto px-4 pt-10 text-center text-xs text-slate-500">
        <p>© 現場NOW (CraftSync) - 建設・施工管理リアルタイム支援システム</p>
      </footer>
    </div>
  );
}
