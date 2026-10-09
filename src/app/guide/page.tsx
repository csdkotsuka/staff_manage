'use client';

import React from 'react';
import Link from 'next/link';
import {
  MapPin,
  FileText,
  Users,
  MessageSquare,
  Siren,
  CloudSun,
  Printer,
  PenTool,
  CheckCircle2,
  Sparkles,
  ArrowLeft,
  BookOpen,
  Code2,
  Smartphone,
  Building2,
  Calendar,
} from 'lucide-react';

export default function GuidePage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-amber-400 selection:text-slate-950 pb-16">
      {/* 1. ナビゲーションバー */}
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
              <span className="text-xs text-amber-600 font-bold ml-2">取扱説明書</span>
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
              href="/docs"
              className="flex items-center gap-1.5 bg-sky-50 text-sky-800 hover:bg-sky-100 border border-sky-300 px-3 py-1.5 rounded-lg transition"
            >
              <Code2 className="w-3.5 h-3.5 text-sky-600" />
              <span className="hidden sm:inline">技術仕様書</span>
            </Link>
          </div>
        </div>
      </header>

      {/* 2. ヒーローセクション */}
      <section className="bg-white border-b border-slate-200 py-12 px-4 text-center space-y-4">
        <div className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-300 text-amber-800 text-xs font-bold px-3 py-1 rounded-full shadow-xs">
          <Smartphone className="w-3.5 h-3.5" />
          現場スマホ・PC両対応 PWA Webシステム
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 max-w-2xl mx-auto leading-snug">
          現場の「いま、誰がどこで何をしているか」を<br />
          <span className="text-amber-600">
            リアルタイムに全社共有する現場支援システム
          </span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed">
          電話やLINEでの「いまどこ？何時終わる？」をゼロに。Googleカレンダー連携の月間工程管理、AI音声日報、現場監督手書きサイン、電子承認、急患レスキューまで、建設会社の業務効率化をワンストップで実現します。
        </p>
      </section>

      {/* 3. 目次クイックジャンプ */}
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
            📚 マニュアル目次
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
            <a href="#feature-mypage" className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 hover:text-amber-600 transition flex items-center gap-2 border border-slate-200">
              <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold">1</span>
              職人マイページ & 状態更新
            </a>
            <a href="#feature-calendar" className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 hover:text-amber-600 transition flex items-center gap-2 border border-slate-200">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">2</span>
              現場工期・月間カレンダー
            </a>
            <a href="#feature-report" className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 hover:text-amber-600 transition flex items-center gap-2 border border-slate-200">
              <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold">3</span>
              AI音声日報・サイン・PDF出力
            </a>
            <a href="#feature-map" className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 hover:text-amber-600 transition flex items-center gap-2 border border-slate-200">
              <span className="w-5 h-5 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-bold">4</span>
              現場マップ & 現場天気予報
            </a>
            <a href="#feature-rescue" className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 hover:text-amber-600 transition flex items-center gap-2 border border-slate-200">
              <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center font-bold">5</span>
              急募レスキュー（最短出動）
            </a>
            <a href="#feature-chat" className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 hover:text-amber-600 transition flex items-center gap-2 border border-slate-200">
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">6</span>
              全社グループトーク & 写真共有
            </a>
          </div>
        </div>
      </div>

      {/* 4. 各機能の解説 */}
      <main className="max-w-4xl mx-auto p-4 sm:p-6 space-y-10">
        {/* 機能1: マイページ */}
        <section id="feature-mypage" className="space-y-4 pt-4">
          <div className="flex items-center gap-2.5 border-b border-slate-200 pb-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-black">
              1
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">社員マイページ & リアルタイム状態更新</h2>
              <p className="text-xs text-slate-500">現場職人が毎日の始業・移動・完了をワンタップで報告</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2 shadow-xs">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ワンタップのステータス変更
              </h3>
              <p className="text-slate-600 leading-relaxed">
                マイページの上部にある4つのボタン（作業中・現場移動・移動可能/急募OK・本日完了）を押すだけで、全社のステータスボードと地図に即時同期されます。
              </p>
              <ul className="list-disc list-inside text-slate-600 space-y-1 pl-1">
                <li><strong className="text-emerald-700">作業中:</strong> 担当現場で施工実施中</li>
                <li><strong className="text-amber-700">現場移動:</strong> 車両で現場へ向けて移動中</li>
                <li><strong className="text-purple-700">移動可能:</strong> 作業一段落、他現場の急な応援に対応可能</li>
                <li><strong className="text-blue-700">本日完了:</strong> 本日の作業終了・撤収完了</li>
              </ul>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2 shadow-xs">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-amber-600" />
                伝言メモ & 今日の現場情報
              </h3>
              <p className="text-slate-600 leading-relaxed">
                「分電盤結線中。15時完了見込み、市内応援可能です」といった一口メモを入力して保存すると、全員のボードにリアルタイムで表示されます。
              </p>
              <p className="text-slate-600 leading-relaxed">
                また、自分が今日担当している現場の住所や工事内容、工期、注意事項（地下搬入口から入場など）をマイページでいつでも確認できます。
              </p>
            </div>
          </div>
        </section>

        {/* 機能2: 現場工期・月間カレンダー */}
        <section id="feature-calendar" className="space-y-4 pt-4">
          <div className="flex items-center gap-2.5 border-b border-slate-200 pb-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-black">
              2
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">現場工期・月間カレンダー（Googleカレンダー連携）</h2>
              <p className="text-xs text-slate-500">過去・現在・未来の現場工程を開始日〜終了日で規定し月間カレンダーに一覧表示</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 text-xs shadow-xs">
            <p className="text-slate-600 leading-relaxed">
              現場の開始日・終了日（工期）を設定することで、月間カレンダー上に現場日程がカラーバッジとして自動マッピングされます。
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                <span className="font-bold text-slate-800 flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400" /> 完了現場（過去）
                </span>
                <p className="text-slate-500 leading-relaxed">
                  工期終了済みの現場。過去の施工実績としてアーカイブされ、一覧や日報と紐づけて履歴を確認できます。
                </p>
              </div>

              <div className="p-3 bg-emerald-50/50 border border-emerald-200 rounded-xl space-y-1.5">
                <span className="font-bold text-emerald-800 flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> 施工中現場（現在）
                </span>
                <p className="text-slate-600 leading-relaxed">
                  現在施工が進行している現場。カレンダー上で今日の日付をまたぐ期間バーとして目立つカラーで表示されます。
                </p>
              </div>

              <div className="p-3 bg-sky-50/50 border border-sky-200 rounded-xl space-y-1.5">
                <span className="font-bold text-sky-800 flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-500" /> 着工予定現場（未来）
                </span>
                <p className="text-slate-600 leading-relaxed">
                  次月以降に着工予定の現場。これからの人員配置計画や資材手配のスケジュール確認に役立ちます。
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 機能3: AI日報・サイン・PDF */}
        <section id="feature-report" className="space-y-4 pt-4">
          <div className="flex items-center gap-2.5 border-b border-slate-200 pb-2">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-black">
              3
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">AI音声日報 ＋ 現場監督手書きサイン ＋ A4公式PDF帳票</h2>
              <p className="text-xs text-slate-500">話すだけで日報完成。夕方の監督サインもスマホで完結し完全ペーパーレス化</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 text-xs shadow-xs">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                <span className="font-bold text-amber-700 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" /> ① 音声で話すだけ (Gemini 3.8 Flash)
                </span>
                <p className="text-slate-600 leading-relaxed">
                  スマホの音声入力で「分電盤結線完了。絶縁測定クリア。明日は今治に応援」と話すだけで、AIが「施工実績」「安全・養生対策」「明日の予定」にプロの文章で自動校正します。
                </p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                <span className="font-bold text-sky-700 flex items-center gap-1">
                  <PenTool className="w-3.5 h-3.5 text-sky-600" /> ② 現場監督の手書きサイン
                </span>
                <p className="text-slate-600 leading-relaxed">
                  夕方の引き揚げ時、元請の現場監督にスマホを差し出し「✍️ 監督サインをもらう」をタップ。指やタッチペンで画面上に直接お名前を手書き署名してもらえます。
                </p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                <span className="font-bold text-rose-700 flex items-center gap-1">
                  <Printer className="w-3.5 h-3.5 text-rose-600" /> ③ ワンタップ電子印鑑 & PDF出力
                </span>
                <p className="text-slate-600 leading-relaxed">
                  社長が「✅ 承認する」を押すと赤い丸型の公式電子印影が押印。そのまま印刷ダイアログから公式A4フォーマットのPDFとして保存・提出できます。紙の保管は不要です。
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 機能4: 現場マップ & 天気 */}
        <section id="feature-map" className="space-y-4 pt-4">
          <div className="flex items-center gap-2.5 border-b border-slate-200 pb-2">
            <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center font-black">
              4
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">愛媛県内 リアルタイム現場マップ & 気象庁直結天気予報</h2>
              <p className="text-xs text-slate-500">松山・今治・新居浜など県内全域の現場ピンと社員位置をパノラマ表示</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 text-xs space-y-3 shadow-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <h4 className="font-bold text-slate-900 mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-500" />
                  現場マップの機能
                </h4>
                <p className="text-slate-600 leading-relaxed">
                  愛媛県内の各現場に専用ピンが立ち、作業中の社員、移動中の社員がリアルタイムにピン留めされます。社員カードから「地図で見る」を押すとピンに滑らかにズームします。
                </p>
              </div>
              <div>
                <h4 className="font-bold text-slate-900 mb-1 flex items-center gap-1">
                  <CloudSun className="w-3.5 h-3.5 text-sky-600" />
                  現場週間天気予報（Open-Meteo連携）
                </h4>
                <p className="text-slate-600 leading-relaxed">
                  気象庁(JMA)の数値予報モデル直結APIより、向こう7日間の天気・降水確率・最高/最低気温を自動表示。「松山本社」「今治現場」「新居浜現場」を切り替えられるほか、「GPSボタン」で現在地の天気をワンタップ取得できます。
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 機能5: レスキュー */}
        <section id="feature-rescue" className="space-y-4 pt-4">
          <div className="flex items-center gap-2.5 border-b border-slate-200 pb-2">
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-black">
              5
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">突発トラブル対応「急募レスキュー」</h2>
              <p className="text-xs text-slate-500">水漏れ・停電など緊急事態に、一番近い空き社員を自動計算して急行要請</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 text-xs space-y-2 shadow-xs">
            <p className="text-slate-600 leading-relaxed">
              「松山大街道で漏水発生！誰か行けないか？」といった突発トラブル時、ヘッダーの「急募レスキュー」を押すと、緊急現場から各社員までの距離（km）と所要移動時間（分）を自動計算。
            </p>
            <p className="text-slate-600 leading-relaxed">
              一番近くにいる「移動可能」社員を選んで「急行を要請」するだけで、その社員のステータスが自動的に「現場移動中」へと切り替わり、全社に即時通知されます。
            </p>
          </div>
        </section>

        {/* 機能6: 全社チャット */}
        <section id="feature-chat" className="space-y-4 pt-4">
          <div className="flex items-center gap-2.5 border-b border-slate-200 pb-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-black">
              6
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">全社現場グループトーク & 写真即時共有</h2>
              <p className="text-xs text-slate-500">LINE感覚で使える社内チャット。施工前後の写真もカメラ撮影から一発送信</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 text-xs space-y-2 shadow-xs">
            <p className="text-slate-600 leading-relaxed">
              右上の「全社トーク」ボタンからいつでも開閉可能。定型クイック返信（「了解しました」「現場到着しました」「お疲れ様です」）や、現場写真をスマホのカメラで撮影してそのまま送れます。写真はブラウザ側で自動的に最適なサイズへ軽量圧縮されるため、現場の通信容量を圧迫しません。
            </p>
          </div>
        </section>
      </main>

      {/* 5. フッター */}
      <footer className="mt-12 border-t border-slate-200 pt-6 text-center text-xs text-slate-500 space-y-2">
        <p>建設会社向け リアルタイム現場支援システム CraftSync 取扱説明書</p>
        <div className="flex items-center justify-center gap-4 text-slate-600">
          <Link href="/" className="hover:text-amber-600 underline">
            アプリへ戻る
          </Link>
          <span>•</span>
          <Link href="/docs" className="hover:text-sky-600 underline">
            技術仕様書を見る
          </Link>
        </div>
      </footer>
    </div>
  );
}
