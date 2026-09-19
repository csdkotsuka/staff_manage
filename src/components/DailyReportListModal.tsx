'use client';

import React, { useState, useEffect, useRef } from 'react';
import { DailyReport, Staff } from '@/lib/types';
import {
  FileText,
  Printer,
  X,
  Calendar,
  User,
  Building2,
  Trash2,
  Check,
  Copy,
  ChevronRight,
  ArrowLeft,
  Search,
  Filter,
  PenTool,
  CheckCircle2,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react';

interface DailyReportListModalProps {
  isOpen: boolean;
  onClose: () => void;
  reports: DailyReport[];
  currentStaff: Staff;
  onDeleteReport: (id: string) => Promise<void>;
  onApproveReport?: (reportId: string, approvedBy: string, isApproved: boolean) => Promise<void>;
  onSaveSupervisorSignature?: (reportId: string, signature: string) => Promise<void>;
}

export const DailyReportListModal: React.FC<DailyReportListModalProps> = ({
  isOpen,
  onClose,
  reports,
  currentStaff,
  onDeleteReport,
  onApproveReport,
  onSaveSupervisorSignature,
}) => {
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [filterStaffId, setFilterStaffId] = useState<string>('all');

  // 手書き署名モーダル状態
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const isAdmin = Boolean(
    currentStaff.isAdmin ||
    currentStaff.role.includes('社長') ||
    currentStaff.role.includes('統括')
  );

  // 現在選択中のレポート（最新のリストから取得）
  const selectedReport = reports.find((r) => r.id === selectedReportId) || null;

  // ESCキーで閉じる
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isSignatureModalOpen) {
          setIsSignatureModalOpen(false);
        } else if (selectedReportId) {
          setSelectedReportId(null);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedReportId, isSignatureModalOpen, onClose]);

  // 手書きキャンバスの初期化
  useEffect(() => {
    if (isSignatureModalOpen && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = '#0f172a'; // 濃いスレート（黒インク）
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
      setHasDrawn(false);
    }
  }, [isSignatureModalOpen]);

  if (!isOpen) return null;

  // フィルタリング
  const filteredReports = reports.filter((rep) => {
    if (filterStaffId === 'all') return true;
    if (filterStaffId === 'me') return rep.staffId === currentStaff.id;
    return rep.staffId === filterStaffId;
  });

  // 印刷 / PDF出力実行
  const handlePrint = () => {
    window.print();
  };

  // 全文コピー
  const handleCopy = () => {
    if (!selectedReport) return;
    navigator.clipboard.writeText(selectedReport.formattedReport);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // 社長・管理者の承認トグル
  const handleToggleApproval = async () => {
    if (!selectedReport || !onApproveReport) return;
    const nextApproved = !selectedReport.isApproved;
    await onApproveReport(selectedReport.id, currentStaff.name, nextApproved);
  };

  // --- 手書きキャンバス操作ハンドラ ---
  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    // スケール比率を考慮
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { x, y } = getCanvasCoords(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { x, y } = getCanvasCoords(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = (e?: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (e) e.preventDefault();
    setIsDrawing(false);
  };

  const handleClearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const handleConfirmSignature = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !selectedReport || !onSaveSupervisorSignature) return;
    const dataUrl = canvas.toDataURL('image/png');
    await onSaveSupervisorSignature(selectedReport.id, dataUrl);
    setIsSignatureModalOpen(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-2 sm:p-4 animate-in fade-in duration-200 cursor-pointer print:p-0 print:bg-white print:static"
      onClick={onClose}
    >
      {/* 印刷専用CSS */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-report,
          #printable-report * {
            visibility: visible;
          }
          #printable-report {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 15mm;
            background: white !important;
            color: black !important;
            border: none !important;
            box-shadow: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div
        className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden cursor-default print:border-none print:shadow-none print:max-h-none print:w-full print:bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ヘッダー（印刷時は非表示） */}
        <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between no-print">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                作業日報一覧 & PDF帳票出力
                {isAdmin && (
                  <span className="text-[10px] bg-amber-400/20 text-amber-300 px-1.5 py-0.2 rounded font-bold border border-amber-400/30">
                    全社日報
                  </span>
                )}
              </h3>
              <p className="text-[11px] text-slate-400">
                スマホ手書きサイン ＆ 電子印鑑によるペーパーレス承認対応
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* コンテンツエリア */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 scrollbar-thin">
          {/* A. 詳細プレビュー & PDF出力画面 */}
          {selectedReport ? (
            <div className="space-y-4">
              {/* 操作バー（画面表示時のみ） */}
              <div className="flex flex-wrap items-center justify-between gap-2 no-print bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <button
                  onClick={() => setSelectedReportId(null)}
                  className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-amber-400 font-bold px-2 py-1 rounded transition"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>一覧に戻る</span>
                </button>

                <div className="flex flex-wrap items-center gap-2">
                  {/* 現場監督の手書きサインボタン */}
                  <button
                    onClick={() => setIsSignatureModalOpen(true)}
                    className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-sky-400 border border-sky-500/30 font-bold px-3 py-1.5 rounded-lg text-xs transition active:scale-95 shadow"
                  >
                    <PenTool className="w-3.5 h-3.5" />
                    <span>{selectedReport.supervisorSignature ? '✍️ 監督サイン再記入' : '✍️ 監督サインをもらう'}</span>
                  </button>

                  {/* 社長・管理者の承認ボタン */}
                  {isAdmin && onApproveReport && (
                    <button
                      onClick={handleToggleApproval}
                      className={`flex items-center gap-1.5 font-bold px-3 py-1.5 rounded-lg text-xs transition active:scale-95 shadow ${
                        selectedReport.isApproved
                          ? 'bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/50'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{selectedReport.isApproved ? '承認取消' : '✅ 社長承認する'}</span>
                    </button>
                  )}

                  {/* テキストコピー */}
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-700 transition"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{isCopied ? 'コピー完了' : '本文コピー'}</span>
                  </button>

                  {/* A4印刷 / PDF出力 */}
                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black px-4 py-1.5 rounded-lg text-xs transition shadow-lg active:scale-95"
                  >
                    <Printer className="w-4 h-4" />
                    <span>📄 A4 PDF出力 / 印刷</span>
                  </button>
                </div>
              </div>

              {/* A4 帳票レイアウト本体（印刷対象エリア） */}
              <div
                id="printable-report"
                className="bg-white text-slate-900 p-6 sm:p-8 rounded-xl shadow-xl border border-slate-300 font-serif leading-relaxed"
              >
                {/* 帳票ヘッダー */}
                <div className="flex justify-between items-start border-b-2 border-slate-900 pb-3 mb-4">
                  <div>
                    <span className="text-[11px] text-slate-600 block tracking-wider font-sans">
                      現場NOW クラフトシンク 工事安全管理部
                    </span>
                    <h1 className="text-xl sm:text-2xl font-black tracking-widest text-slate-900 mt-0.5">
                      工 事 作 業 日 報
                    </h1>
                  </div>

                  {/* 印鑑・承認枠（3連枠） */}
                  <div className="flex border border-slate-800 text-[10px] text-center font-sans">
                    {/* 1. 社長・統括の承認印 */}
                    <div className="w-20 sm:w-24 border-r border-slate-800">
                      <div className="bg-slate-100 py-0.5 border-b border-slate-800 font-bold">社内承認</div>
                      <div className="h-14 flex items-center justify-center p-1 relative">
                        {selectedReport.isApproved ? (
                          <div className="w-11 h-11 rounded-full border-2 border-red-600 text-red-600 flex flex-col items-center justify-center font-black leading-none select-none rotate-[-6deg] animate-in zoom-in-50 duration-150">
                            <span className="text-[7px]">承認</span>
                            <span className="text-[10px] font-bold py-0.5">
                              {(selectedReport.approvedBy || '佐藤').split(' ')[0]}
                            </span>
                            <span className="text-[6px]">
                              {selectedReport.approvedAt
                                ? new Date(selectedReport.approvedAt).toLocaleDateString('ja-JP', {
                                    month: '2-digit',
                                    day: '2-digit',
                                  })
                                : '済'}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-300 text-xs font-serif">印</span>
                        )}
                      </div>
                    </div>

                    {/* 2. 現場監督の手書きサイン */}
                    <div className="w-24 sm:w-28 border-r border-slate-800">
                      <div className="bg-slate-100 py-0.5 border-b border-slate-800 font-bold">監督確認</div>
                      <div className="h-14 flex items-center justify-center p-1 relative">
                        {selectedReport.supervisorSignature ? (
                          <img
                            src={selectedReport.supervisorSignature}
                            alt="現場監督サイン"
                            className="max-h-12 max-w-full object-contain"
                          />
                        ) : (
                          <div className="flex flex-col items-center">
                            <span className="text-slate-300 text-xs font-serif">受領印</span>
                            <button
                              onClick={() => setIsSignatureModalOpen(true)}
                              className="no-print text-[9px] text-sky-600 hover:underline mt-0.5 font-bold"
                            >
                              ✍️ サイン
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 3. 作成者の自動電子印 */}
                    <div className="w-20 sm:w-24">
                      <div className="bg-slate-100 py-0.5 border-b border-slate-800 font-bold">作成者</div>
                      <div className="h-14 flex items-center justify-center p-1">
                        <div className="w-11 h-11 rounded-full border-2 border-red-600/90 text-red-600 flex flex-col items-center justify-center font-black leading-none select-none">
                          <span className="text-[7px]">作成</span>
                          <span className="text-[10px] font-bold py-0.5">
                            {selectedReport.staffName.split(' ')[0]}
                          </span>
                          <span className="text-[6px]">
                            {new Date(selectedReport.createdAt).toLocaleDateString('ja-JP', {
                              month: '2-digit',
                              day: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 基本情報テーブル */}
                <table className="w-full border-collapse border border-slate-800 text-xs mb-4 font-sans">
                  <tbody>
                    <tr>
                      <th className="border border-slate-800 bg-slate-100 p-2 w-24 text-left font-bold">報告日</th>
                      <td className="border border-slate-800 p-2">
                        {selectedReport.date} ({new Date(selectedReport.date).toLocaleDateString('ja-JP', { weekday: 'short' })})
                      </td>
                      <th className="border border-slate-800 bg-slate-100 p-2 w-24 text-left font-bold">報告者</th>
                      <td className="border border-slate-800 p-2 font-bold">
                        {selectedReport.staffName}（{selectedReport.staffRole}）
                      </td>
                    </tr>
                    <tr>
                      <th className="border border-slate-800 bg-slate-100 p-2 text-left font-bold">工事現場名</th>
                      <td className="border border-slate-800 p-2 font-bold text-sm" colSpan={3}>
                        {selectedReport.siteName}
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* 日報本文 */}
                <div className="border border-slate-800 rounded p-4 text-xs sm:text-sm whitespace-pre-wrap leading-relaxed font-mono bg-slate-50/50">
                  {selectedReport.formattedReport}
                </div>

                {/* フッター注記 */}
                <div className="mt-4 pt-2 border-t border-slate-300 flex justify-between items-center text-[10px] text-slate-500 font-sans">
                  <span>出力元: 現場NOW リアルタイム現場支援システム（電子保存対応）</span>
                  <span>提出日時: {new Date(selectedReport.createdAt).toLocaleString('ja-JP')}</span>
                </div>
              </div>
            </div>
          ) : (
            /* B. 日報カード一覧画面 */
            <div className="space-y-3">
              {/* フィルター・切り替え */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-slate-800">
                <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
                  <button
                    onClick={() => setFilterStaffId('all')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                      filterStaffId === 'all'
                        ? 'bg-amber-500 text-slate-950 shadow'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    全社日報 ({reports.length})
                  </button>
                  <button
                    onClick={() => setFilterStaffId('me')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                      filterStaffId === 'me'
                        ? 'bg-amber-500 text-slate-950 shadow'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    自分の日報
                  </button>
                </div>

                <span className="text-xs text-slate-400">
                  {filteredReports.length} 件の日報が見つかりました
                </span>
              </div>

              {/* 日報リスト */}
              {filteredReports.length === 0 ? (
                <div className="text-center py-12 bg-slate-950/50 border border-slate-800/80 rounded-2xl space-y-2">
                  <FileText className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-sm font-bold text-slate-300">提出された日報がありません</p>
                  <p className="text-xs text-slate-500">
                    マイページの「本日の日報を作成・AI校正」から日報を保存できます
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {filteredReports.map((report) => (
                    <div
                      key={report.id}
                      className="bg-slate-950/70 border border-slate-800 hover:border-amber-500/50 rounded-xl p-4 transition shadow-md space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              {report.date}
                            </span>
                            <span className="font-bold text-sm text-slate-100">
                              {report.staffName}
                            </span>
                            <span className="text-[11px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                              {report.staffRole}
                            </span>

                            {/* 承認ステータスバッジ */}
                            {report.isApproved && (
                              <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                社長承認済
                              </span>
                            )}
                            {report.supervisorSignature && (
                              <span className="text-[10px] bg-sky-950 text-sky-300 border border-sky-800 font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                                <PenTool className="w-3 h-3 text-sky-400" />
                                監督サイン済
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-slate-300 flex items-center gap-1 font-medium">
                            <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            {report.siteName}
                          </p>
                        </div>

                        {/* 削除ボタン（本人の日報または管理者の場合） */}
                        {(isAdmin || report.staffId === currentStaff.id) && (
                          <button
                            onClick={() => {
                              if (confirm(`この日報（${report.date} ${report.staffName}）を削除しますか？`)) {
                                onDeleteReport(report.id);
                              }
                            }}
                            className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-900 rounded-lg transition"
                            title="日報を削除"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      {/* 本文プレビュー（冒頭） */}
                      <p className="text-xs text-slate-400 line-clamp-2 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80 leading-relaxed font-mono">
                        {report.formattedReport.slice(0, 140)}...
                      </p>

                      <div className="pt-1 flex items-center justify-between border-t border-slate-800/60 text-xs">
                        <span className="text-[11px] text-slate-500">
                          {new Date(report.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} 提出
                        </span>

                        <button
                          onClick={() => setSelectedReportId(report.id)}
                          className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 transition active:scale-95 shadow"
                        >
                          <span>A4プレビュー・PDF出力</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 現場監督の手書きサイン用モーダル（Canvas） */}
      {isSignatureModalOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in cursor-default"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-500/30">
                  <PenTool className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-100">現場監督の手書きサイン</h4>
                  <p className="text-[11px] text-slate-400">枠内に指またはタッチペンでお名前を署名してください</p>
                </div>
              </div>
              <button
                onClick={() => setIsSignatureModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* サイン描画エリア */}
            <div className="space-y-1.5">
              <div className="border-2 border-dashed border-sky-500/50 rounded-xl overflow-hidden bg-white shadow-inner relative touch-none">
                <canvas
                  ref={canvasRef}
                  width={380}
                  height={170}
                  className="w-full h-[170px] cursor-crosshair block"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                />
                {!hasDrawn && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-slate-400 text-xs">
                    ✍️ ここにサインを書いてください
                  </div>
                )}
              </div>
              <p className="text-[10px] text-slate-500 text-right">※サインはA4帳票の「監督確認」欄にそのまま反映されます</p>
            </div>

            {/* ボタン群 */}
            <div className="flex items-center justify-between gap-3 pt-1">
              <button
                type="button"
                onClick={handleClearSignature}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded-xl border border-slate-700 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>書き直す</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsSignatureModalOpen(false)}
                  className="text-xs text-slate-400 hover:text-slate-200 px-3 py-2"
                >
                  キャンセル
                </button>
                <button
                  type="button"
                  disabled={!hasDrawn}
                  onClick={handleConfirmSignature}
                  className="bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-slate-950 font-black text-xs px-4 py-2 rounded-xl transition shadow active:scale-95 flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>サインを決定・保存</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
