'use client';

import React from 'react';
import Link from 'next/link';
import {
  Code2,
  Database,
  Cpu,
  Cloud,
  Shield,
  Layers,
  ArrowLeft,
  BookOpen,
  FileCode,
  Calendar,
} from 'lucide-react';

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-sky-400 selection:text-slate-950 pb-16">
      {/* 1. ナビゲーションバー */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 sm:px-8 shadow-xs">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center font-black text-white shadow-xs">
              技
            </div>
            <div>
              <span className="font-black text-base sm:text-lg text-slate-900">
                CraftSync (現場NOW)
              </span>
              <span className="text-xs text-sky-600 font-bold ml-2">技術仕様書・アーキテクチャ</span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 text-xs font-bold">
            <Link
              href="/"
              className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-300 transition shadow-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>アプリ画面へ戻る</span>
            </Link>
            <Link
              href="/about"
              className="flex items-center gap-1.5 bg-white text-slate-700 hover:bg-slate-100 border border-slate-300 px-3 py-1.5 rounded-lg transition shadow-xs"
            >
              <span className="hidden sm:inline">概要 (About)</span>
            </Link>
            <Link
              href="/guide"
              className="flex items-center gap-1.5 bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-300 px-3 py-1.5 rounded-lg transition"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden sm:inline">取扱説明書</span>
            </Link>
          </div>
        </div>
      </header>

      {/* 2. ヒーローセクション */}
      <section className="bg-white border-b border-slate-200 py-10 px-4 text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 bg-sky-50 border border-sky-300 text-sky-800 text-xs font-bold px-3 py-1 rounded-full font-mono shadow-xs">
          <Code2 className="w-3.5 h-3.5" />
          Technical Specification & Architecture Documentation
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 max-w-2xl mx-auto leading-snug">
          システム技術仕様書
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto">
          CraftSyncのシステム構成、データモデル、Googleカレンダー連携、外部API、およびセキュリティ設計に関する技術ドキュメントです。
        </p>
      </section>

      {/* 3. 本文 */}
      <main className="max-w-4xl mx-auto p-4 sm:p-6 space-y-10 text-xs sm:text-sm">
        {/* セクション1: 技術スタック */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
            <Layers className="w-5 h-5 text-sky-600" />
            <h2 className="text-base sm:text-lg font-bold text-slate-900">1. 技術スタック概要 (Technology Stack)</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2 shadow-xs">
              <span className="font-bold text-slate-900 flex items-center gap-1.5 text-xs uppercase tracking-wider text-sky-600">
                <FileCode className="w-4 h-4" /> フロントエンド / アプリケーション層
              </span>
              <ul className="space-y-1.5 text-slate-700">
                <li><strong>フレームワーク:</strong> Next.js 16.3 (App Router / Turbopack)</li>
                <li><strong>UIライブラリ:</strong> React 19, Tailwind CSS 4, Lucide React</li>
                <li><strong>言語:</strong> TypeScript 5 (Strict Mode)</li>
                <li><strong>地図エンジン:</strong> Leaflet.js (CartoDB Voyager Tiles)</li>
                <li><strong>カレンダー連携:</strong> Google Calendar Embed + インタラクティブ工程バー</li>
                <li><strong>PWA対応:</strong> スマホホーム画面追加・フルスクリーン動作</li>
              </ul>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2 shadow-xs">
              <span className="font-bold text-slate-900 flex items-center gap-1.5 text-xs uppercase tracking-wider text-amber-600">
                <Database className="w-4 h-4" /> バックエンド / クラウドデータ同期
              </span>
              <ul className="space-y-1.5 text-slate-700">
                <li><strong>データベース:</strong> Google Cloud / Firebase (Cloud Firestore)</li>
                <li><strong>リアルタイム同期:</strong> Firestore <code>onSnapshot</code> WebSocketリスナー</li>
                <li><strong>ブラウザ間同期:</strong> Web BroadcastChannel API + LocalStorage キャッシュ</li>
                <li><strong>ホスティング:</strong> Vercel Edge Global Network</li>
              </ul>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2 shadow-xs">
              <span className="font-bold text-slate-900 flex items-center gap-1.5 text-xs uppercase tracking-wider text-purple-600">
                <Cpu className="w-4 h-4" /> 生成AI校正エンジン
              </span>
              <ul className="space-y-1.5 text-slate-700">
                <li><strong>モデル:</strong> Google Gemini 3.8 Flash (最新世代・超低遅延)</li>
                <li><strong>エンドポイント:</strong> Google Generative Language API v1beta</li>
                <li><strong>プロンプト工学:</strong> 建設施工・電気配管・安全養生基準の専門チューニング</li>
              </ul>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2 shadow-xs">
              <span className="font-bold text-slate-900 flex items-center gap-1.5 text-xs uppercase tracking-wider text-emerald-600">
                <Cloud className="w-4 h-4" /> 気象API & ハードウェア連携
              </span>
              <ul className="space-y-1.5 text-slate-700">
                <li><strong>気象データ:</strong> Open-Meteo API（気象庁JMA高解像度数値予報直結）</li>
                <li><strong>位置情報:</strong> W3C Geolocation API（端末GPS連動）</li>
                <li><strong>デジタル署名:</strong> HTML5 Canvas 2D Context（Pointer/Touchイベント）</li>
                <li><strong>帳票出力:</strong> CSS Paged Media <code>@media print</code>（ゼロ依存A4 PDF）</li>
              </ul>
            </div>
          </div>
        </section>

        {/* セクション2: データモデル & スキーマ */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
            <Database className="w-5 h-5 text-amber-600" />
            <h2 className="text-base sm:text-lg font-bold text-slate-900">2. データモデル定義 (Data Schema)</h2>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <span className="text-amber-700 font-bold block mb-2 font-sans text-xs">
                ■ 社員データモデル (Staff)
              </span>
              <pre className="text-slate-800 overflow-x-auto whitespace-pre leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
{`interface Staff {
  id: string;               // 一意な社員ID (例: staff-1)
  name: string;             // 氏名 (例: 佐藤 健一 (社長))
  role: string;             // 役職・工種 (例: 代表取締役・統括監理)
  phone: string;            // 連絡先電話番号
  email?: string;           // メールアドレス
  isAdmin?: boolean;        // アプリ全社管理者権限 (true/false)
  avatar_color: string;     // アバター表示カラーHEX
  status: StaffStatus;      // 'working' | 'moving' | 'available' | 'completed'
  current_site_name: string;// 現在滞在中の現場・拠点名
  lat: number;              // 現在位置緯度 (例: 33.8416)
  lng: number;              // 現在位置経度 (例: 132.7661)
  status_note?: string;     // 全社伝言メモ
  updated_at: string;       // 最終更新日時 (ISO 8601)
}`}
              </pre>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <span className="text-sky-700 font-bold block mb-2 font-sans text-xs">
                ■ 現場マスタモデル (Site)
              </span>
              <pre className="text-slate-800 overflow-x-auto whitespace-pre leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
{`interface Site {
  id: string;               // 現場ID (例: site-1)
  name: string;             // 現場名称 (例: 松山市駅前 再開発ビル内装現場)
  address: string;          // 所在地住所
  lat: number;              // 現場位置緯度
  lng: number;              // 現場位置経度
  client_name?: string;     // 発注元・元請建設会社名
  work_description?: string;// 工種・作業概要
  status: 'planning' | 'in_progress' | 'completed';
  startDate?: string;       // 工期開始日 (YYYY-MM-DD)
  endDate?: string;         // 工期終了日 (YYYY-MM-DD)
  notes?: string;           // 現場特記事項・進入経路・安全注意事項
}`}
              </pre>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <span className="text-emerald-700 font-bold block mb-2 font-sans text-xs">
                ■ 作業日報 & 電子承認モデル (DailyReport)
              </span>
              <pre className="text-slate-800 overflow-x-auto whitespace-pre leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
{`interface DailyReport {
  id: string;               // 日報ID
  staffId: string;          // 作成者ID
  staffName: string;        // 作成者氏名
  staffRole: string;        // 作成者役職
  date: string;             // 報告対象日 (YYYY-MM-DD)
  siteName: string;         // 工事現場名
  rawInput: string;         // 音声入力等の原文
  formattedReport: string;  // Gemini 3.8 Flash により整形された日報本文
  createdAt: string;        // 提出日時 (ISO 8601)

  // 電子承認・ペーパーレスワークフロー
  supervisorSignature?: string; // 現場監督のスマホ手書き署名 (Base64 PNG)
  supervisorSignedAt?: string;  // 署名受領日時
  isApproved?: boolean;         // 社長・統括の承認フラグ
  approvedBy?: string;          // 承認者名
  approvedAt?: string;          // 承認日時
}`}
              </pre>
            </div>
          </div>
        </section>

        {/* セクション3: セキュリティ & 法令適合 */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
            <Shield className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base sm:text-lg font-bold text-slate-900">3. セキュリティ & 電子帳簿保存法対応</h2>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 text-xs space-y-2 text-slate-700 leading-relaxed shadow-xs">
            <p>
              <strong>電子帳簿保存法（電磁的記録保存）への適合性:</strong><br />
              従来の紙帳票における「押印・紙ファイル保管」に代わり、作成者の認証情報・作成タイムスタンプ、現場監督の手書き署名バイナリ、社内承認印影および承認日時が改ざん不可能な形でデータとして保持されます。
            </p>
            <p>
              <strong>権限分離モデル (RBAC):</strong><br />
              一般職人・社員は自身のステータス更新・日報作成・チャット送信・現場閲覧が可能。管理者（<code>isAdmin: true</code>）のみが現場情報の追加/編集、社員名簿/権限の変更、全社日報の承認・削除を行える安全な権限分離を実装しています。
            </p>
          </div>
        </section>
      </main>

      {/* フッター */}
      <footer className="mt-12 border-t border-slate-200 pt-6 text-center text-xs text-slate-500 space-y-2">
        <p>CraftSync (現場NOW) 技術仕様書・システム設計ドキュメント v1.2</p>
        <div className="flex items-center justify-center gap-4 text-slate-600">
          <Link href="/" className="hover:text-amber-600 underline">
            アプリへ戻る
          </Link>
          <span>•</span>
          <Link href="/guide" className="hover:text-sky-600 underline">
            取扱説明書を見る
          </Link>
        </div>
      </footer>
    </div>
  );
}
