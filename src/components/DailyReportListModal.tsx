'use client';

import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';

interface DailyReportListModalProps {
  isOpen: boolean;
  onClose: () => void;
  reports: DailyReport[];
  currentStaff: Staff;
  onDeleteReport: (id: string) => Promise<void>;
}

export const DailyReportListModal: React.FC<DailyReportListModalProps> = ({
  isOpen,
  onClose,
  reports,
  currentStaff,
  onDeleteReport,
}) => {
  const [selectedReport, setSelectedReport] = useState<DailyReport | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [filterStaffId, setFilterStaffId] = useState<string>('all');

  const isAdmin = Boolean(
    currentStaff.isAdmin ||
    currentStaff.role.includes('社長') ||
    currentStaff.role.includes('統括')
  );

  // ESCキーで閉じる
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedReport) {
          setSelectedReport(null);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedReport, onClose]);

  if (!isOpen) return null;

  // フィルタリング（管理者なら全件、一般なら切り替え可能）
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
            padding: 20mm;
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
                提出された現場日報の確認・A4公式フォーマットでのPDF印刷
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

        {/* メインコンテンツ */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 scrollbar-thin">
          {/* A. 詳細プレビュー & PDF出力画面 */}
          {selectedReport ? (
            <div className="space-y-4">
              {/* 操作バー（画面表示時のみ） */}
              <div className="flex items-center justify-between no-print bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <button
                  onClick={() => setSelectedReport(null)}
                  className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-amber-400 font-bold px-2 py-1 rounded transition"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>一覧に戻る</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-700 transition"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{isCopied ? 'コピー完了' : 'テキストコピー'}</span>
                  </button>

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

                  {/* 印鑑・承認枠 */}
                  <div className="flex border border-slate-800 text-[10px] text-center font-sans">
                    <div className="w-14 border-r border-slate-800">
                      <div className="bg-slate-100 py-0.5 border-b border-slate-800 font-bold">現場監督</div>
                      <div className="h-10 flex items-center justify-center text-slate-400">印</div>
                    </div>
                    <div className="w-14 border-r border-slate-800">
                      <div className="bg-slate-100 py-0.5 border-b border-slate-800 font-bold">安全確認</div>
                      <div className="h-10 flex items-center justify-center text-slate-400">印</div>
                    </div>
                    <div className="w-14">
                      <div className="bg-slate-100 py-0.5 border-b border-slate-800 font-bold">作成者</div>
                      <div className="h-10 flex items-center justify-center text-amber-900 font-bold text-xs">
                        {selectedReport.staffName.split(' ')[0]}
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
                  <span>出力元: 現場NOW リアルタイム現場支援システム</span>
                  <span>提出日時: {new Date(selectedReport.createdAt).toLocaleString('ja-JP')}</span>
                </div>
              </div>
            </div>
          ) : (
            /* B. 日報一覧リスト画面 */
            <div className="space-y-3">
              {/* フィルターバー */}
              <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Filter className="w-3.5 h-3.5 text-amber-400" />
                  <span>表示対象:</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setFilterStaffId('all')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                      filterStaffId === 'all'
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    全社員（{reports.length}件）
                  </button>
                  <button
                    onClick={() => setFilterStaffId('me')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                      filterStaffId === 'me'
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    自分の日報
                  </button>
                </div>
              </div>

              {/* 日報カード一覧 */}
              {filteredReports.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs space-y-2">
                  <FileText className="w-8 h-8 mx-auto text-slate-600" />
                  <p>該当する作業日報はまだありません。</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {filteredReports.map((report) => (
                    <div
                      key={report.id}
                      onClick={() => setSelectedReport(report)}
                      className="p-3.5 rounded-xl bg-slate-950/70 hover:bg-slate-900 border border-slate-800 hover:border-amber-500/40 transition cursor-pointer flex items-center justify-between gap-3 group"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {report.date}
                          </span>
                          <span className="text-xs font-bold text-slate-200">
                            {report.staffName}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            ({report.staffRole})
                          </span>
                        </div>

                        <div className="text-xs text-slate-300 font-medium flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>{report.siteName}</span>
                        </div>

                        <p className="text-[11px] text-slate-400 line-clamp-1">
                          {report.rawInput}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[11px] text-amber-400 font-bold group-hover:translate-x-0.5 transition flex items-center">
                          帳票表示・PDF <ChevronRight className="w-4 h-4" />
                        </span>
                        {isAdmin && (
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              if (confirm('この日報を削除してもよろしいですか？')) {
                                await onDeleteReport(report.id);
                              }
                            }}
                            className="p-1.5 text-slate-500 hover:text-rose-400 rounded hover:bg-slate-800 transition"
                            title="日報を削除"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
