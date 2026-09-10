'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Staff } from '@/lib/types';
import { calculateDistanceKm, estimateDriveMinutes } from '@/lib/utils';
import { Bot, Send, X, Sparkles, User, CornerDownLeft } from 'lucide-react';

interface AiAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  staffs: Staff[];
}

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

const QUICK_PROMPTS = [
  '渋谷現場の近くにいる人は誰？',
  '今、手が空いている(移動可能)な人は？',
  '田中さんの今の状況を教えて',
  '一番遠い現場にいるのは誰？',
];

export const AiAssistant: React.FC<AiAssistantProps> = ({
  isOpen,
  onClose,
  staffs,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-1',
      sender: 'ai',
      text: 'お疲れ様です！AI現場アシスタントです。\n「〇〇現場の近くにいる人は？」「今空いてる人は？」など、現場の配置や社員の稼働状況について自然な日本語で質問してください。',
      timestamp: 'たった今',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  // AI回答生成エンジン（社員5名のリアルタイム状態から回答を動的構築）
  const generateAiAnswer = (query: string): string => {
    const q = query.toLowerCase();

    // 1. 渋谷現場に近い人
    if (q.includes('渋谷') || q.includes('shibuya')) {
      const shibuyaLat = 35.6580;
      const shibuyaLng = 139.7016;
      const sorted = [...staffs].map((s) => ({
        ...s,
        dist: calculateDistanceKm(shibuyaLat, shibuyaLng, s.lat, s.lng),
      })).sort((a, b) => a.dist - b.dist);

      const closest = sorted[0];
      const second = sorted[1];
      const driveMins = estimateDriveMinutes(closest.dist);

      return `📍 **渋谷現場（渋谷スクエア）周辺の状況**\n\n・最も近いのは **${closest.name}**（${closest.role}）です。\n　現在地からの直線距離は約 **${closest.dist}km**（車で約${driveMins}分）。現在のステータスは【${closest.status === 'working' ? '作業中' : closest.status === 'available' ? '移動可能' : '移動中'}】です。\n\n・次に近いのは **${second.name}**（約${second.dist}km）です。`;
    }

    // 2. 空いてる人 / 移動可能
    if (q.includes('空い') || q.includes('移動可能') || q.includes('手があい') || q.includes('レスキュー') || q.includes('急ぎ')) {
      const availableStaffs = staffs.filter((s) => s.status === 'available');
      if (availableStaffs.length === 0) {
        return `⚠️ 現在「移動可能（空き）」ステータスの社員はいません。\n全員が作業中または移動中です。緊急の場合は各担当現場の職人に直接電話（TEL）で進捗を確認してください。`;
      }
      const names = availableStaffs.map((s) => `・**${s.name}**（${s.role}）: ${s.current_site_name}に滞在`).join('\n');
      return `✨ **現在「移動可能（空き）」の社員（${availableStaffs.length}名）**\n\n${names}\n\n急な案件や資材搬入の呼び出しにすぐ対応できます！`;
    }

    // 3. 田中さんについて
    if (q.includes('田中')) {
      const tanaka = staffs.find((s) => s.name.includes('田中'));
      if (tanaka) {
        return `👤 **${tanaka.name}（${tanaka.role}）の最新状況**\n\n・現在ステータス: **${tanaka.status === 'working' ? '作業中 🔨' : tanaka.status}**\n・現場: **${tanaka.current_site_name}**\n・伝言メモ: 「${tanaka.status_note || '特になし'}」\n・連絡先: ${tanaka.phone}`;
      }
    }

    // 4. 佐藤社長について
    if (q.includes('佐藤') || q.includes('社長')) {
      const sato = staffs.find((s) => s.name.includes('佐藤'));
      if (sato) {
        return `👤 **${sato.name}（${sato.role}）の最新状況**\n\n・現在地: **${sato.current_site_name}**\n・ステータス: **${sato.status === 'available' ? '移動可能 (待機中)' : sato.status}**\n急ぎの指示や緊急案件の相談が可能です。`;
      }
    }

    // 5. 新宿現場に近い人
    if (q.includes('新宿')) {
      const shinjukuLat = 35.6885;
      const shinjukuLng = 139.7005;
      const sorted = [...staffs].map((s) => ({
        ...s,
        dist: calculateDistanceKm(shinjukuLat, shinjukuLng, s.lat, s.lng),
      })).sort((a, b) => a.dist - b.dist);

      const closest = sorted[0];
      return `📍 **新宿駅南口現場周辺の状況**\n\n最も近いのは **${closest.name}**（${closest.role}）で、現場直近（距離約${closest.dist}km）で「${closest.current_site_name}」に対応中です。`;
    }

    // 6. デフォルト（全体の要約）
    const workingCount = staffs.filter((s) => s.status === 'working').length;
    const movingCount = staffs.filter((s) => s.status === 'moving').length;
    const availCount = staffs.filter((s) => s.status === 'available').length;

    return `📊 **本日の稼働サマリー（社員全5名）**\n\n・作業中: **${workingCount}名**\n・現場移動中: **${movingCount}名**\n・移動可能（待機・空き）: **${availCount}名**\n\n「渋谷現場に近い人」「空いてる人」「田中さんの状況」など、具体名でお尋ねいただくと詳細をご案内できます！`;
  };

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputValue;
    if (!text.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text,
      timestamp: 'たった今',
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputValue('');
    setIsTyping(true);

    setTimeout(() => {
      const answer = generateAiAnswer(text);
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: answer,
        timestamp: 'たった今',
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 600);
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[420px] bg-slate-950 border-l border-slate-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
      {/* チャットヘッダー */}
      <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
              AI現場アシスタント
              <span className="px-1.5 py-0.2 text-[9px] font-black bg-sky-500 text-slate-950 rounded">
                DEMO
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              全社員の現在地・ステータスを即答
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* チャット本文エリア */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'ai' && (
              <div className="w-7 h-7 rounded-lg bg-sky-600/30 border border-sky-500/40 text-sky-300 flex items-center justify-center shrink-0 text-xs">
                <Bot className="w-4 h-4" />
              </div>
            )}
            <div
              className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-amber-500 text-slate-950 font-bold rounded-tr-none shadow-md'
                  : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none whitespace-pre-line'
              }`}
            >
              {msg.text}
            </div>
            {msg.sender === 'user' && (
              <div className="w-7 h-7 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center shrink-0 text-xs">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-2 text-slate-400 text-xs italic pl-9">
            <Sparkles className="w-3.5 h-3.5 animate-spin text-sky-400" />
            <span>AIが現場データを照会中...</span>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* クイック質問サジェスト */}
      <div className="p-3 bg-slate-900/60 border-t border-slate-800">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
          💡 よくある質問例:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {QUICK_PROMPTS.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSend(prompt)}
              className="text-[11px] px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition active:scale-95"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* 入力フォーム */}
      <div className="p-3 bg-slate-900 border-t border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="例: 渋谷現場に近い人は？"
            className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isTyping}
            className="p-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold disabled:opacity-40 transition active:scale-95"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
