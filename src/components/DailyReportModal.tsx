'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Staff, DailyReport } from '@/lib/types';
import { db, isFirebaseConfigured } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import {
  FileText,
  Mic,
  MicOff,
  Sparkles,
  Send,
  X,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Building2,
  User,
  Clock,
} from 'lucide-react';

interface DailyReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStaff: Staff;
  onReportSaved?: (report: DailyReport) => void;
}

export const DailyReportModal: React.FC<DailyReportModalProps> = ({
  isOpen,
  onClose,
  currentStaff,
  onReportSaved,
}) => {
  const [rawText, setRawText] = useState('');
  const [formattedReport, setFormattedReport] = useState('');
  const [isFormatting, setIsFormatting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [aiSource, setAiSource] = useState<'gemini' | 'fallback' | null>(null);

  // 音声認識用 (Web Speech API)
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'ja-JP';

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setRawText((prev) => prev + (prev ? '、' : '') + currentTranscript);
      };

      recognition.onerror = () => {
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert('お使いのブラウザは音声認識ボタンに非対応です。スマートフォンのキーボードのマイクボタン（🎙️）をご利用ください！');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (e) {
        console.error('Recognition start error', e);
      }
    }
  };

  if (!isOpen) return null;

  // AI校正・整形実行
  const handleFormat = async () => {
    if (!rawText.trim()) return;
    setIsFormatting(true);
    setFormattedReport('');

    try {
      const res = await fetch('/api/report/format', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawText,
          staffName: currentStaff.name,
          siteName: currentStaff.current_site_name,
        }),
      });

      const data = await res.json();
      if (data.formattedReport) {
        setFormattedReport(data.formattedReport);
        setAiSource(data.source);
      } else {
        alert(data.error || '日報の生成に失敗しました');
      }
    } catch (e) {
      console.error('Format request failed', e);
      alert('通信エラーが発生しました');
    } finally {
      setIsFormatting(false);
    }
  };

  // 日報の保存
  const handleSaveReport = async () => {
    if (!formattedReport.trim() || isSaving) return;
    setIsSaving(true);

    const report: DailyReport = {
      id: `report-${Date.now()}`,
      staffId: currentStaff.id,
      staffName: currentStaff.name,
      staffRole: currentStaff.role,
      date: new Date().toISOString().split('T')[0],
      siteName: currentStaff.current_site_name,
      rawInput: rawText,
      formattedReport,
      createdAt: new Date().toISOString(),
    };

    // Firestore に保存
    if (isFirebaseConfigured && db) {
      try {
        await addDoc(collection(db, 'daily_reports'), report);
      } catch (e) {
        console.error('Failed to save report to Firestore', e);
      }
    }

    // ローカルストレージにもバックアップ
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('craft_daily_reports_v1') || '[]';
        const parsed = JSON.parse(saved);
        parsed.unshift(report);
        localStorage.setItem('craft_daily_reports_v1', JSON.stringify(parsed));
      } catch (e) {
        console.error(e);
      }
    }

    if (onReportSaved) onReportSaved(report);

    setIsSaving(false);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 2000);
  };

  // クリップボードにコピー
  const handleCopy = () => {
    if (!formattedReport) return;
    navigator.clipboard.writeText(formattedReport);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* ヘッダー */}
        <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
                AI作業日報アシスタント
                <span className="text-[10px] bg-amber-400/20 text-amber-300 px-1.5 py-0.2 rounded font-bold border border-amber-400/30">
                  音声 ＋ Gemini 3.8 Flash
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                適当に話すだけでプロの日報フォーマットに自動整形
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

        {/* コンテンツエリア */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 scrollbar-thin">
          {/* 現場・報告者サマリー */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 text-xs flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-bold text-slate-200">{currentStaff.name}</span>
              <span className="text-[10px] text-slate-400">({currentStaff.role})</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <Building2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-medium">{currentStaff.current_site_name}</span>
            </div>
          </div>

          {/* ステップ1: 音声入力または下書きメモ */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <span>1. 今日の作業内容を話す・メモする</span>
                <span className="text-[10px] text-slate-400 font-normal">
                  （スマホのマイク入力も大歓迎）
                </span>
              </label>

              {/* ブラウザ音声認識トグルボタン */}
              <button
                type="button"
                onClick={toggleRecording}
                className={`flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full border transition ${
                  isRecording
                    ? 'bg-rose-600 text-white border-rose-500 animate-pulse'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                {isRecording ? (
                  <>
                    <MicOff className="w-3 h-3" />
                    <span>聞き取り中...（停止）</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-3 h-3 text-amber-400" />
                    <span>マイクで話す</span>
                  </>
                )}
              </button>
            </div>

            <textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="例: 今日はボード貼りやった。午前中で下地終わって午後から貼り。全体の3割くらい。明日は雨っぽいから養生シートしっかりかけた。17時に終了。あさって石膏ボード足りなくなるから手配よろしく。"
              rows={4}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition leading-relaxed"
            />

            {/* AI整形トリガーボタン */}
            <button
              onClick={handleFormat}
              disabled={!rawText.trim() || isFormatting}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 text-slate-950 font-black py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition active:scale-98"
            >
              <Sparkles className={`w-4 h-4 ${isFormatting ? 'animate-spin' : ''}`} />
              <span>{isFormatting ? 'Gemini AIが日報フォーマットへ校正中...' : '✨ AIで日報を自動整形する'}</span>
            </button>
          </div>

          {/* ステップ2: AI整形後のプレビュー・編集 */}
          {formattedReport && (
            <div className="space-y-2 pt-2 border-t border-slate-800 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-emerald-400">
                    2. AI整形結果（必要に応じて手修正可能）
                  </span>
                  {aiSource === 'gemini' && (
                    <span className="text-[9px] bg-emerald-950 text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-800 font-bold">
                      Gemini 3.8 Flash連携
                    </span>
                  )}
                </div>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 bg-slate-800 px-2 py-0.5 rounded border border-slate-700 transition"
                >
                  {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{isCopied ? 'コピー完了' : '全文コピー'}</span>
                </button>
              </div>

              <textarea
                value={formattedReport}
                onChange={(e) => setFormattedReport(e.target.value)}
                rows={8}
                className="w-full bg-slate-950 border border-emerald-500/50 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-emerald-400 transition leading-relaxed font-mono"
              />

              {/* 提出・保存ボタン */}
              <button
                onClick={handleSaveReport}
                disabled={isSaving || isSuccess}
                className={`w-full py-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition shadow-lg ${
                  isSuccess
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white active:scale-98'
                }`}
              >
                {isSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>日報を提出・保存しました！</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>{isSaving ? '保存中...' : 'この内容で日報を提出・保存する'}</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
