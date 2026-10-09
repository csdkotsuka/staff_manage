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
  Clock,
  Zap,
  CheckCheck,
  Camera,
  Maximize2,
  Trash2,
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

// 画像圧縮ユーティリティ（長辺1000px・JPEG軽量化でFirestoreに直接保存可能）
function compressImage(file: File, maxWidth = 1000, quality = 0.7): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxWidth) {
            width = Math.round((width * maxWidth) / height);
            height = maxWidth;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Canvas context error'));
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// デモ用初期メッセージ
const INITIAL_DEMO_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-1',
    senderId: 'staff-1',
    senderName: '佐藤 健一 (社長)',
    senderRole: '代表取締役・統括監理',
    senderColor: '#EF4444',
    text: '本日もお疲れ様です！午後は天候崩れる予報なので、市駅前現場は屋内のボード貼りを優先してください。',
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: 'msg-2',
    senderId: 'staff-2',
    senderName: '田中 裕介',
    senderRole: '主任電気工事士',
    senderColor: '#3B82F6',
    text: '了解しました！市駅前現場の分電盤結線作業、予定通り15時頃に完了見込みです。',
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: 'msg-3',
    senderId: 'staff-4',
    senderName: '渡辺 慎吾',
    senderRole: '配管設備士',
    senderColor: '#F59E0B',
    text: '松山道順調です。まもなく新居浜プラント現着します！',
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
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
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);

  // キャッシュ復元 & BroadcastChannel
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(LOCAL_STORAGE_CHAT_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setMessages(parsed);
          }
        } catch (e) {
          console.error('Failed to parse cached chat', e);
        }
      }

      if ('BroadcastChannel' in window) {
        const bc = new BroadcastChannel(CHAT_BROADCAST_CHANNEL);
        broadcastChannelRef.current = bc;
        bc.onmessage = (event) => {
          if (event.data?.type === 'CHAT_MESSAGE_ADDED') {
            const nextMsg = event.data.message as ChatMessage;
            setMessages((prev) => {
              if (prev.some((m) => m.id === nextMsg.id)) return prev;
              const updated = [...prev, nextMsg];
              localStorage.setItem(LOCAL_STORAGE_CHAT_KEY, JSON.stringify(updated));
              return updated;
            });
          }
        };
      }
    }

    // Firestore リアルタイムリッスン
    if (isFirebaseConfigured && db) {
      const messagesCollection = collection(db, 'messages');
      const q = query(messagesCollection, orderBy('createdAt', 'asc'), limit(50));

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (snapshot.empty) return;
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
              imageUrl: data.imageUrl,
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

  // ESCキーで閉じる
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (previewImage) {
          setPreviewImage(null);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, previewImage, onClose]);

  // 写真ファイル選択・圧縮ハンドラ
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCompressing(true);
    try {
      const compressedDataUrl = await compressImage(file, 1000, 0.7);
      setAttachedImage(compressedDataUrl);
    } catch (err) {
      console.error('Image compression failed', err);
      alert('画像の処理に失敗しました');
    } finally {
      setIsCompressing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // メッセージ送信
  const handleSendMessage = async (customText?: string, isQuick = false) => {
    const content = customText || inputText;
    if ((!content.trim() && !attachedImage) || isSending) return;

    setIsSending(true);

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: currentStaff.id,
      senderName: currentStaff.name,
      senderRole: currentStaff.role,
      senderColor: currentStaff.avatar_color,
      text: content.trim(),
      imageUrl: attachedImage || undefined,
      createdAt: new Date().toISOString(),
      isQuick,
    };

    setMessages((prev) => {
      const updated = [...prev, newMsg];
      if (typeof window !== 'undefined') {
        localStorage.setItem(LOCAL_STORAGE_CHAT_KEY, JSON.stringify(updated));
      }
      return updated;
    });

    if (broadcastChannelRef.current) {
      broadcastChannelRef.current.postMessage({
        type: 'CHAT_MESSAGE_ADDED',
        message: newMsg,
      });
    }

    if (isFirebaseConfigured && db) {
      try {
        const payload: any = {
          senderId: newMsg.senderId,
          senderName: newMsg.senderName,
          senderRole: newMsg.senderRole,
          senderColor: newMsg.senderColor,
          text: newMsg.text,
          createdAt: newMsg.createdAt,
          isQuick: newMsg.isQuick || false,
        };
        if (newMsg.imageUrl) {
          payload.imageUrl = newMsg.imageUrl;
        }
        await addDoc(collection(db, 'messages'), payload);
      } catch (e) {
        console.error('Failed to post message to Firestore', e);
      }
    }

    setInputText('');
    setAttachedImage(null);
    setIsSending(false);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-2 sm:p-4 animate-in fade-in duration-200 cursor-pointer"
      onClick={onClose}
    >
      <div
        className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg h-[88vh] flex flex-col shadow-2xl overflow-hidden cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* チャットヘッダー */}
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                全社現場グループトーク
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-bold border border-emerald-300">
                  全員共有
                </span>
              </h3>
              <p className="text-[11px] text-slate-500">
                発言者: <strong className="text-amber-800">{currentStaff.name}</strong>（{currentStaff.role}）
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* メッセージリスト */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 scrollbar-thin bg-slate-50/70">
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
                {!isMe && (
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-white shrink-0 mt-1 shadow-xs"
                    style={{ backgroundColor: msg.senderColor || '#3B82F6' }}
                  >
                    {msg.senderName.charAt(0)}
                  </div>
                )}

                <div className={`flex flex-col max-w-[82%] ${isMe ? 'items-end' : 'items-start'}`}>
                  {!isMe && (
                    <div className="flex items-center gap-1.5 mb-1 px-1">
                      <span className="text-xs font-bold text-slate-800">
                        {msg.senderName}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        ({msg.senderRole})
                      </span>
                    </div>
                  )}

                  {/* 吹き出し */}
                  <div
                    className={`p-3 rounded-2xl text-xs leading-relaxed break-words shadow-xs space-y-2 ${
                      isMe
                        ? 'bg-emerald-600 text-white rounded-tr-none font-medium'
                        : 'bg-white text-slate-900 border border-slate-200 rounded-tl-none'
                    }`}
                  >
                    {msg.isQuick && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-black/10 text-[10px] font-bold">
                        <Zap className="w-2.5 h-2.5 text-amber-300" />
                        定型速報
                      </span>
                    )}

                    {/* 写真添付がある場合 */}
                    {msg.imageUrl && (
                      <div className="relative group cursor-pointer overflow-hidden rounded-xl border border-slate-200">
                        <img
                          src={msg.imageUrl}
                          alt="現場写真"
                          className="max-h-56 w-full object-cover rounded-xl transition group-hover:scale-105"
                          onClick={() => setPreviewImage(msg.imageUrl || null)}
                        />
                        <div
                          className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition"
                          onClick={() => setPreviewImage(msg.imageUrl || null)}
                        >
                          <Maximize2 className="w-5 h-5 text-white" />
                        </div>
                      </div>
                    )}

                    {msg.text && <p className="whitespace-pre-wrap">{msg.text}</p>}
                  </div>

                  <div className="flex items-center gap-1 mt-0.5 px-1 text-[10px] text-slate-400">
                    <Clock className="w-2.5 h-2.5" />
                    <span>{timeStr}</span>
                    {isMe && <CheckCheck className="w-3 h-3 text-emerald-600" />}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* 添付写真プレビュー枠（送信前） */}
        {attachedImage && (
          <div className="px-4 py-2 bg-slate-100 border-t border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <img
                src={attachedImage}
                alt="添付プレビュー"
                className="w-12 h-12 object-cover rounded-lg border border-amber-500"
              />
              <div>
                <span className="text-xs font-bold text-slate-800 block">
                  現場写真を添付中
                </span>
                <span className="text-[10px] text-slate-500">
                  送信ボタンを押すと全員に共有されます
                </span>
              </div>
            </div>
            <button
              onClick={() => setAttachedImage(null)}
              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-200 transition"
              title="写真を削除"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* クイック定型文ピッカー */}
        <div className="p-2 bg-slate-50 border-t border-slate-200">
          <div className="flex items-center gap-1.5 mb-1.5 px-1">
            <Zap className="w-3 h-3 text-amber-500" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              現場ワンタップ速報
            </span>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            {QUICK_TEMPLATES.map((tmpl, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(tmpl, true)}
                className="flex-shrink-0 text-[11px] bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-1 rounded-full transition active:scale-95 shadow-xs"
              >
                {tmpl}
              </button>
            ))}
          </div>
        </div>

        {/* 入力フォーム */}
        <div className="p-3 bg-white border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            {/* 写真撮影・アルバム選択ボタン */}
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isCompressing}
              className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-amber-600 border border-slate-300 rounded-xl transition active:scale-95 flex items-center justify-center shrink-0 shadow-xs"
              title="現場の写真を撮影または選択"
            >
              <Camera className={`w-4 h-4 ${isCompressing ? 'animate-spin' : ''}`} />
            </button>

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`${currentStaff.name} として発言...`}
              className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition"
            />
            <button
              type="submit"
              disabled={(!inputText.trim() && !attachedImage) || isSending}
              className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1 transition shrink-0 active:scale-95 shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>送信</span>
            </button>
          </form>
        </div>
      </div>

      {/* 写真拡大プレビューモーダル */}
      {previewImage && (
        <div
          className="fixed inset-0 z-60 bg-black/90 flex items-center justify-center p-3 animate-in fade-in"
          onClick={() => setPreviewImage(null)}
        >
          <button
            onClick={() => setPreviewImage(null)}
            className="absolute top-4 right-4 p-2 text-white bg-slate-800/80 hover:bg-slate-700 rounded-full transition"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={previewImage}
            alt="写真拡大"
            className="max-h-[90vh] max-w-[95vw] object-contain rounded-xl shadow-2xl"
          />
        </div>
      )}
    </div>
  );
};
