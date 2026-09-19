'use client';

import React from 'react';
import Link from 'next/link';
import {
  HardHat,
  MapPin,
  FileText,
  Users,
  MessageSquare,
  Siren,
  CloudSun,
  ShieldCheck,
  Printer,
  PenTool,
  CheckCircle2,
  Sparkles,
  ArrowLeft,
  BookOpen,
  Code2,
  Smartphone,
  ExternalLink,
  Building2,
} from 'lucide-react';

export default function GuidePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-amber-400 selection:text-slate-950 pb-16">
      {/* 1. ナビゲーションバー */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 px-4 py-3 sm:px-8">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center font-black text-slate-950 shadow-md">
              建
            </div>
            <div>
              <span className="font-black text-base sm:text-lg text-slate-100">
                現場NOW (CraftSync)
              </span>
              <span className="text-xs text-amber-400 font-bold ml-2">取扱説明書</span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs font-bold">
            <Link
              href="/"
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>アプリ画面へ戻る</span>
            </Link>
            <Link
              href="/docs"
              className="flex items-center gap-1.5 bg-sky-950 text-sky-300 hover:bg-sky-900 border border-sky-800 px-3 py-1.5 rounded-lg transition"
            >
              <Code2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">技術仕様書</span>
            </Link>
          </div>
        </div>
      </header>

      {/* 2. ヒーローセクション */}
      <section className="bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border-b border-slate-800/80 py-12 px-4 text-center space-y-4">
        <div className="inline-flex items-center gap-1.5 bg-amber-400/10 border border-amber-400/20 text-amber-300 text-xs font-bold px-3 py-1 rounded-full">
          <Smartphone className="w-3.5 h-3.5" />
          現場スマホ・PC両対応 PWA Webシステム
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-100 max-w-2xl mx-auto leading-snug">
          現場の「いま、誰がどこで何をしているか」を<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-200">
            リアルタイムに全社共有する現場支援システム
          </span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto leading-relaxed">
          電話やLINEでの「いまどこ？何時終わる？」をゼロに。AI音声日報、現場監督手書きサイン、電子承認、急患レスキューまで、建設会社の業務効率化をワンストップで実現します。
        </p>
      </section>

      {/* 3. 目次クイックジャンプ */}
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            📚 マニュアル目次
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
            <a href="#feature-mypage" className="p-2.5 rounded-lg bg-slate-950/60 hover:bg-slate-800 text-slate-200 hover:text-amber-400 transition flex items-center gap-2">
              <span className="w-5 h-5 rounded bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">1</span>
              職人マイページ & 状態更新
            </a>
            <a href="#feature-report" className="p-2.5 rounded-lg bg-slate-950/60 hover:bg-slate-800 text-slate-200 hover:text-amber-400 transition flex items-center gap-2">
              <span className="w-5 h-5 rounded bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">2</span>
              AI音声日報・サイン・PDF出力
            </a>
            <a href="#feature-map" className="p-2.5 rounded-lg bg-slate-950/60 hover:bg-slate-800 text-slate-200 hover:text-amber-400 transition flex items-center gap-2">
              <span className="w-5 h-5 rounded bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">3</span>
              現場マップ & 現場天気予報
            </a>
            <a href="#feature-rescue" className="p-2.5 rounded-lg bg-slate-950/60 hover:bg-slate-800 text-slate-200 hover:text-amber-400 transition flex items-center gap-2">
              <span className="w-5 h-5 rounded bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">4</span>
              急募レスキュー（最短出動）
            </a>
            <a href="#feature-chat" className="p-2.5 rounded-lg bg-slate-950/60 hover:bg-slate-800 text-slate-200 hover:text-amber-400 transition flex items-center gap-2">
              <span className="w-5 h-5 rounded bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">5</span>
              全社グループトーク & 写真共有
            </a>
            <a href="#feature-admin" className="p-2.5 rounded-lg bg-slate-950/60 hover:bg-slate-800 text-slate-200 hover:text-amber-400 transition flex items-center gap-2">
              <span className="w-5 h-5 rounded bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">6</span>
              管理者設定（現場・社員名簿）
            </a>
          </div>
        </div>
      </div>

      {/* 4. 各機能の解説 */}
      <main className="max-w-4xl mx-auto p-4 sm:p-6 space-y-10">
        {/* 機能1: マイページ */}
        <section id="feature-mypage" className="space-y-4 pt-4">
          <div className="flex items-center gap-2.5 border-b border-slate-800 pb-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black">
              1
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">社員マイページ & リアルタイム状態更新</h2>
              <p className="text-xs text-slate-400">現場職人が毎日の始業・移動・完了をワンタップで報告</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-2">
              <h3 className="font-bold text-slate-200 text-sm flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ワンタップのステータス変更
              </h3>
              <p className="text-slate-400 leading-relaxed">
                マイページの上部にある4つのボタン（作業中・現場移動・移動可能/急募OK・本日完了）を押すだけで、全社のステータスボードと地図に即時同期されます。
              </p>
              <ul className="list-disc list-inside text-slate-400 space-y-1 pl-1">
                <li><strong className="text-emerald-400">作業中:</strong> 担当現場で施工実施中</li>
                <li><strong className="text-amber-400">現場移動:</strong> 車両で現場へ向けて移動中</li>
                <li><strong className="text-purple-400">移動可能:</strong> 作業一段落、他現場の急な応援に対応可能</li>
                <li><strong className="text-blue-400">本日完了:</strong> 本日の作業終了・撤収完了</li>
              </ul>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-2">
              <h3 className="font-bold text-slate-200 text-sm flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-amber-400" />
                伝言メモ & 今日の現場情報
              </h3>
              <p className="text-slate-400 leading-relaxed">
                「分電盤結線中。15時完了見込み、市内応援可能です」といった一口メモを入力して保存すると、全員のボードにリアルタイムで表示されます。
              </p>
              <p className="text-slate-400 leading-relaxed">
                また、自分が今日担当している現場の住所や工事内容、工期、注意事項（地下搬入口から入場など）をマイページでいつでも確認できます。
              </p>
            </div>
          </div>
        </section>

        {/* 機能2: AI日報・サイン・PDF */}
        <section id="feature-report" className="space-y-4 pt-4">
          <div className="flex items-center gap-2.5 border-b border-slate-800 pb-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-black">
              2
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">AI音声日報 ＋ 現場監督手書きサイン ＋ A4公式PDF帳票</h2>
              <p className="text-xs text-slate-400">話すだけで日報完成。夕方の監督サインもスマホで完結し完全ペーパーレス化</p>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1.5">
                <span className="font-bold text-amber-400 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> ① 音声で話すだけ (Gemini 3.8 Flash)
                </span>
                <p className="text-slate-400 leading-relaxed">
                  スマホの音声入力で「分電盤結線完了。絶縁測定クリア。明日は今治に応援」と話すだけで、AIが「施工実績」「安全・養生対策」「明日の予定」にプロの文章で自動校正します。
                </p>
              </div>

              <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1.5">
                <span className="font-bold text-sky-400 flex items-center gap-1">
                  <PenTool className="w-3.5 h-3.5" /> ② 現場監督の手書きサイン
                </span>
                <p className="text-slate-400 leading-relaxed">
                  夕方の引き揚げ時、元請の現場監督にスマホを差し出し「✍️ 監督サインをもらう」をタップ。指やタッチペンで画面上に直接お名前を手書き署名してもらえます。
                </p>
              </div>

              <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1.5">
                <span className="font-bold text-rose-400 flex items-center gap-1">
                  <Printer className="w-3.5 h-3.5" /> ③ ワンタップ電子印鑑 & PDF出力
                </span>
                <p className="text-slate-400 leading-relaxed">
                  社長が「✅ 承認する」を押すと赤い丸型の公式電子印影が押印。そのまま印刷ダイアログから公式A4フォーマットのPDFとして保存・提出できます。紙の保管は不要です。
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 機能3: 現場マップ & 天気 */}
        <section id="feature-map" className="space-y-4 pt-4">
          <div className="flex items-center gap-2.5 border-b border-slate-800 pb-2">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center font-black">
              3
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">愛媛県内 リアルタイム現場マップ & 気象庁直結天気予報</h2>
              <p className="text-xs text-slate-400">松山・今治・新居浜など県内全域の現場ピンと社員位置をパノラマ表示</p>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-xs space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <h4 className="font-bold text-slate-200 mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  現場マップの機能
                </h4>
                <p className="text-slate-400 leading-relaxed">
                  愛媛県内の各現場（松山市駅前、今治新都市、新居浜プラントなど）に専用ピンが立ち、作業中の社員、移動中の社員がリアルタイムにピン留めされます。社員カードから「地図で見る」を押すとピンに滑らかにズームします。
                </p>
              </div>
              <div>
                <h4 className="font-bold text-slate-200 mb-1 flex items-center gap-1">
                  <CloudSun className="w-3.5 h-3.5 text-sky-400" />
                  現場週間天気予報（Open-Meteo連携）
                </h4>
                <p className="text-slate-400 leading-relaxed">
                  気象庁(JMA)の数値予報モデル直結APIより、向こう7日間の天気・降水確率・最高/最低気温を自動表示。「松山本社」「今治現場」「新居浜現場」を切り替えられるほか、「GPSボタン」で現在地の天気をワンタップ取得できます。
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 機能4: レスキュー */}
        <section id="feature-rescue" className="space-y-4 pt-4">
          <div className="flex items-center gap-2.5 border-b border-slate-800 pb-2">
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center font-black">
              4
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">突発トラブル対応「急募レスキュー」</h2>
              <p className="text-xs text-slate-400">水漏れ・停電など緊急事態に、一番近い空き社員を自動計算して急行要請</p>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-xs space-y-2">
            <p className="text-slate-400 leading-relaxed">
              「松山大街道で漏水発生！誰か行けないか？」といった突発トラブル時、ヘッダーの「急募レスキュー」を押すと、緊急現場から各社員までの距離（km）と所要移動時間（分）を自動計算。
            </p>
            <p className="text-slate-400 leading-relaxed">
              一番近くにいる「移動可能」社員を選んで「急行を要請」するだけで、その社員のステータスが自動的に「現場移動中」へと切り替わり、全社に即時通知されます。
            </p>
          </div>
        </section>

        {/* 機能5: 全社チャット */}
        <section id="feature-chat" className="space-y-4 pt-4">
          <div className="flex items-center gap-2.5 border-b border-slate-800 pb-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black">
              5
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">全社現場グループトーク & 写真即時共有</h2>
              <p className="text-xs text-slate-400">LINE感覚で使える社内チャット。施工前後の写真もカメラ撮影から一発送信</p>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-xs space-y-2">
            <p className="text-slate-400 leading-relaxed">
              右上の「全社トーク」ボタンからいつでも開閉可能。定型クイック返信（「了解しました」「現場到着しました」「お疲れ様です」）や、現場写真をスマホのカメラで撮影してそのまま送れます。写真はブラウザ側で自動的に最適なサイズへ軽量圧縮されるため、現場の通信容量を圧迫しません。
            </p>
          </div>
        </section>

        {/* 機能6: 管理者マスタ設定 */}
        <section id="feature-admin" className="space-y-4 pt-4">
          <div className="flex items-center gap-2.5 border-b border-slate-800 pb-2">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-black">
              6
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">管理者専用マスタ設定（現場・社員名簿管理）</h2>
              <p className="text-xs text-slate-400">現場の工期・特記事項の設定や、役職・アプリ編集権限（isAdmin）の管理</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-2">
              <h4 className="font-bold text-slate-200 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-sky-400" />
                稼働中現場の管理
              </h4>
              <p className="text-slate-400 leading-relaxed">
                現場名、住所、元請クライアント名、工種に加え、「工期開始日〜終了日」や「現場特記事項・備考（車両進入ルート、ヘルメット顎紐徹底など）」を自由に追加・編集・削除できます。
              </p>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-2">
              <h4 className="font-bold text-slate-200 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-amber-400" />
                社員名簿・役職・権限管理
              </h4>
              <p className="text-slate-400 leading-relaxed">
                社員の氏名、役職（社長、現場代理人、職長、主任電気工事士、配管設備士など）、電話番号、メールアドレスを編集可能。また「アプリ編集権限（管理者モード）」のON/OFFを個別に切り替えられます。
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* 5. フッター */}
      <footer className="mt-12 border-t border-slate-800/80 pt-6 text-center text-xs text-slate-500 space-y-2">
        <p>建設会社向け リアルタイム現場支援システム CraftSync 取扱説明書</p>
        <div className="flex items-center justify-center gap-4 text-slate-400">
          <Link href="/" className="hover:text-amber-400 underline">
            アプリへ戻る
          </Link>
          <span>•</span>
          <Link href="/docs" className="hover:text-sky-400 underline">
            技術仕様書を見る
          </Link>
        </div>
      </footer>
    </div>
  );
}
