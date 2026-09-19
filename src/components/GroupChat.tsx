'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Staff, ChatMessage } from '@/lib/types';
import { db, isFirebaseConfigured } from '@/lib/firebase';
import {
  collection,
  onSnapshot,
  addDoc,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import {
  MessageSquare,
  Send,
  X,
  User,
  Clock,
  Zap,
  CheckCheck,
} from 'lucide-react';

interface GroupChatProps {
  isOpen: boolean;
  onClose: () => void;
  currentStaff: Staff;
}

// 現場向けクイック定型文
const QUICK_TEMPLATES = [
  '現場に到着しました 📍',
  '施工作業を完了しました 🔨',
  '雨天のため一時待機中です ☔️',
  '手が空きました。急募対応可能です ✨',
  '材料の搬入完了しました 📦',
  '午後の応援要請をお願いします 🚨',
];

const LOCAL_STORAGE_CHAT_KEY = 'craft_group_chat_history_v1';
const CHAT_BROADCAST_CHANNEL = 'craft_chat_broadcast_sync';

// デモ用初期メッセージ
const INITIAL_DEMO_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-1',
    senderId: 'staff-1',
    senderName: '佐藤 健一 (社長)',
    senderRole: '統括・現場監督',
    senderColor: '#EF4444',
    text: '本日もお疲れ様です！午後は天候崩れる予報なので、渋谷現場は屋内のボード貼りを優先してください。',
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: 'msg-2',
    senderId: 'staff-2',
    senderName: '田中 裕介',
    senderRole: '主任電気工事士',
    senderColor: '#3B82F6',
    text: '了解しました！新宿現場の分電盤作業、予定通り15時頃に完了見込みです。',
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: 'msg-3',
    senderId: 'staff-5',
    senderName: '伊藤 翼',
    senderRole: '見習い・施工補佐',
    senderColor: '#8B5CF6',
    text: '渋谷現場の資材搬入完了しました！手が空いたので次のレスキュー急行可能です✨',
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    isQuick: true,
  },
];

export const GroupChat: React.FC<GroupChatProps> = ({
  isOpen,
  onClose,
  currentStaff,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_DEMO_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);

  // 1. メッセージ初期読み込み & リアルタイム同期
  useEffect(() => {
    // ローカルストレージキャッシュ
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem(LOCAL_STORAGE_CHAT_KEY);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setMessages(parsed);
          }
        } catch (e) {
          console.error('Failed to parse cached chat', e);
        }
      }

      // BroadcastChannel (タブ間通信)
      if ('BroadcastChannel' in window) {
        const bc = new BroadcastChannel(CHAT_BROADCAST_CHANNEL);
        broadcastChannelRef.current = bc;
        bc.onmessage = (event) => {
          if (event.data?.type === 'NEW_CHAT_MESSAGE') {
            const newMsg = event.data.message as ChatMessage;
            setMessages((prev) => {
              if (prev.some((m) => m.id === newMsg.id)) return prev;
              const next = [...prev, newMsg];
              localStorage.setItem(LOCAL_STORAGE_CHAT_KEY, JSON.stringify(next));
              return next;
            });
          }
        };
      }
    }

    // Firebase (Cloud Firestore) 連携
    if (isFirebaseConfigured && db) {
      const messagesRef = collection(db, 'messages');
      const q = query(messagesRef, orderBy('createdAt', 'asc'), limit(100));

      const unsubscribe = onSnapshot(
        q,
        async (snapshot) => {
          if (snapshot.empty) {
            // Firestore側が空の場合は初期デモメッセージを投入
            for (const msg of INITIAL_DEMO_MESSAGES) {
              await addDoc(messagesRef, msg);
            }
            return;
          }

          const remoteMessages: ChatMessage[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            remoteMessages.push({
              id: docSnap.id,
              senderId: data.senderId,
              senderName: data.senderName,
              senderRole: data.senderRole,
              senderColor: data.senderColor,
              text: data.text,
              createdAt: data.createdAt,
              isQuick: data.isQuick,
            });
          });

          setMessages(remoteMessages);
          if (typeof window !== 'undefined') {
            localStorage.setItem(LOCAL_STORAGE_CHAT_KEY, JSON.stringify(remoteMessages));
          }
        },
        (error) => {
          console.error('Firestore chat snapshot error:', error);
        }
      );

      return () => {
        unsubscribe();
        broadcastChannelRef.current?.close();
      };
    } else {
      return () => {
        broadcastChannelRef.current?.close();
      };
    }
  }, []);

  // スクロール最下部へ
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // メッセージ送信処理
  const handleSendMessage = async (textToSend?: string, isQuick: boolean = false) => {
    const text = (textToSend || inputText).trim();
    if (!text || isSending) return;

    setIsSending(true);
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      senderId: currentStaff.id,
      senderName: currentStaff.name,
      senderRole: currentStaff.role,
      senderColor: currentStaff.avatar_color,
      text,
      createdAt: new Date().toISOString(),
      isQuick,
    };

    // ローカル反映
    setMessages((prev) => {
      const next = [...prev, newMsg];
      if (typeof window !== 'undefined') {
        localStorage.setItem(LOCAL_STORAGE_CHAT_KEY, JSON.stringify(next));
      }
      return next;
    });

    if (broadcastChannelRef.current) {
      broadcastChannelRef.current.postMessage({
        type: 'NEW_CHAT_MESSAGE',
        message: newMsg,
      });
    }

    // Firestore反映
    if (isFirebaseConfigured && db) {
      try {
        await addDoc(collection(db, 'messages'), {
          senderId: newMsg.senderId,
          senderName: newMsg.senderName,
          senderRole: newMsg.senderRole,
          senderColor: newMsg.senderColor,
          text: newMsg.text,
          createdAt: newMsg.createdAt,
          isQuick: newMsg.isQuick || false,
        });
      } catch (e) {
        console.error('Failed to post message to Firestore', e);
      }
    }

    setInputText('');
    setIsSending(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg h-[88vh] flex flex-col shadow-2xl overflow-hidden">
        {/* チャットヘッダー */}
        <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
                全社現場グループトーク
                <span className="text-[10px] bg-emerald-950 text-emerald-400 px-1.5 py-0.2 rounded border border-emerald-800">
                  全員共有
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                発言者: <strong className="text-amber-300">{currentStaff.name}</strong>（{currentStaff.role}）
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

        {/* メッセージリスト */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 scrollbar-thin scrollbar-thumb-slate-700 bg-slate-950/40">
          {messages.map((msg) => {
            const isMe = msg.senderId === currentStaff.id;
            const timeStr = new Date(msg.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                {/* 相手の場合のアバター */}
                {!isMe && (
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-white shrink-0 mt-1 shadow"
                    style={{ backgroundColor: msg.senderColor || '#3B82F6' }}
                  >
                    {msg.senderName.charAt(0)}
                  </div>
                )}

                <div className={`flex flex-col max-w-[80%] ${isMe ? 'items-end' : 'items-start'}`}>
                  {/* 送信者名・役職 */}
                  {!isMe && (
                    <div className="flex items-center gap-1.5 mb-1 px-1">
                      <span className="text-xs font-bold text-slate-300">
                        {msg.senderName}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        ({msg.senderRole})
                      </span>
                    </div>
                  )}

                  {/* 吹き出し */}
                  <div
                    className={`p-3 rounded-2xl text-xs leading-relaxed break-words shadow-md ${
                      isMe
                        ? 'bg-emerald-600 text-white rounded-tr-none font-medium'
                        : 'bg-slate-800/95 text-slate-100 border border-slate-700/80 rounded-tl-none'
                    }`}
                  >
                    {msg.isQuick && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.2 mb-1 rounded bg-black/20 text-[10px] font-bold">
                        <Zap className="w-2.5 h-2.5 text-amber-300" />
                        定型速報
                      </span>
                    )}
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  </div>

                  {/* 時刻 */}
                  <div className="flex items-center gap-1 mt-0.5 px-1 text-[10px] text-slate-400">
                    <Clock className="w-2.5 h-2.5" />
                    <span>{timeStr}</span>
                    {isMe && <CheckCheck className="w-3 h-3 text-emerald-400" />}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* クイック定型文ピッカー（現場手袋対応） */}
        <div className="p-2 bg-slate-900 border-t border-slate-800">
          <div className="flex items-center gap-1.5 mb-1.5 px-1">
            <Zap className="w-3 h-3 text-amber-400" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              現場ワンタップ速報
            </span>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-800">
            {QUICK_TEMPLATES.map((tmpl, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(tmpl, true)}
                className="flex-shrink-0 text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-2.5 py-1 rounded-full transition active:scale-95"
              >
                {tmpl}
              </button>
            ))}
          </div>
        </div>

        {/* 入力フォーム */}
        <div className="p-3 bg-slate-950 border-t border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`${currentStaff.name} として発言...`}
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isSending}
              className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1 transition shrink-0 active:scale-95 shadow"
            >
              <Send className="w-3.5 h-3.5" />
              <span>送信</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
