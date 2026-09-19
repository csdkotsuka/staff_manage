'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { DailyReport } from '@/lib/types';
import { db, isFirebaseConfigured } from '@/lib/firebase';
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  limit,
  deleteDoc,
  doc,
  addDoc,
} from 'firebase/firestore';

const STORAGE_REPORTS_KEY = 'craft_daily_reports_v1';
const BROADCAST_REPORTS_CHANNEL = 'craft_reports_sync_channel';

// デモ初期日報サンプル
const INITIAL_DEMO_REPORTS: DailyReport[] = [
  {
    id: 'report-demo-1',
    staffId: 'staff-2',
    staffName: '田中 裕介',
    staffRole: '主任電気工事士',
    date: new Date().toISOString().split('T')[0],
    siteName: '新宿駅南口 ビル改修現場',
    rawInput: '分電盤結線作業完了した。予定通り15時過ぎに終わって絶縁測定もクリア。明日は渋谷の配管応援に行く予定。',
    formattedReport: `【作業日報】
■ 担当現場: 新宿駅南口 ビル改修現場
■ 報告者: 田中 裕介（主任電気工事士）
■ 施工実績・作業進捗:
・高圧受変電設備更新に伴う幹線結線作業を実施。
・主要分電盤3箇所の二次側結線および端子増し締め完了。
・回路ごとの絶縁抵抗測定を実施し、全系統で基準値（0.2MΩ以上）をクリア。
・進捗率: 本日分工程 100% 達成。

■ 安全・養生・環境配慮:
・検電器による無電圧確認および短絡接地器具の設置徹底。
・盤周辺の養生シート設置および粉塵飛散防止措置を実施。
・作業終了後の工具員数点検および整理整頓完了。

■ 明日の予定・資材手配・連絡事項:
・明日は渋谷スクエア現場の設備配線応援へ入線予定（8:30現着）。
・端子台カバー用予備ビスの補充手配をお願いします。`,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: 'report-demo-2',
    staffId: 'staff-3',
    staffName: '高橋 大地',
    staffRole: '内装・ボード工',
    date: new Date().toISOString().split('T')[0],
    siteName: '渋谷スクエア 新築内装現場',
    rawInput: '午前中軽量鉄骨の下地組んで午後から石膏ボード貼り。全体の4割くらい終わった。雨降りそうだったから外部養生ブルーシート二重にした。明後日ボード足りないから頼みます。',
    formattedReport: `【作業日報】
■ 担当現場: 渋谷スクエア 新築内装現場
■ 報告者: 高橋 大地（内装・ボード工）
■ 施工実績・作業進捗:
・3階フロアA工区の軽量鉄骨天井・壁下地組作業完了。
・耐火石膏ボード（t=12.5mm）貼り施工（約80㎡施工完了、エリア進捗40%）。
・開口部補強およびビスピッチ点検（@150mmピッチ厳守）。

■ 安全・養生・環境配慮:
・降雨予報に伴い、外部開口部への防雨ブルーシート二重養生を実施。
・脚立作業時の安全帯使用および作業床の段差解消。
・石膏粉塵の清掃および集塵機稼働。

■ 明日の予定・資材手配・連絡事項:
・明日は引き続きA工区壁ボード貼りを継続。
・【至急手配】明後日分の耐火石膏ボード12.5mm（計120枚）の追加搬入をお願いします。`,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
  },
];

export function useDailyReports() {
  const [reports, setReports] = useState<DailyReport[]>(INITIAL_DEMO_REPORTS);
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    // ローカルストレージ復元
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_REPORTS_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setReports(parsed);
          }
        } catch (e) {
          console.error('Failed to parse cached reports', e);
        }
      }

      // BroadcastChannel
      if ('BroadcastChannel' in window) {
        const bc = new BroadcastChannel(BROADCAST_REPORTS_CHANNEL);
        broadcastChannelRef.current = bc;
        bc.onmessage = (event) => {
          if (event.data?.type === 'REPORTS_UPDATED') {
            const nextReports = event.data.reports as DailyReport[];
            setReports(nextReports);
            localStorage.setItem(STORAGE_REPORTS_KEY, JSON.stringify(nextReports));
          }
        };
      }
    }

    // Firebase (Cloud Firestore) 連携
    if (isFirebaseConfigured && db) {
      const reportsRef = collection(db, 'daily_reports');
      const q = query(reportsRef, orderBy('createdAt', 'desc'), limit(100));

      const unsubscribe = onSnapshot(
        q,
        async (snapshot) => {
          if (snapshot.empty) {
            // 初回デモデータを投入
            for (const rep of INITIAL_DEMO_REPORTS) {
              await addDoc(reportsRef, rep);
            }
            return;
          }

          const remoteReports: DailyReport[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            remoteReports.push({
              id: docSnap.id,
              staffId: data.staffId,
              staffName: data.staffName,
              staffRole: data.staffRole,
              date: data.date,
              siteName: data.siteName,
              rawInput: data.rawInput,
              formattedReport: data.formattedReport,
              createdAt: data.createdAt,
            });
          });

          setReports(remoteReports);
          if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_REPORTS_KEY, JSON.stringify(remoteReports));
          }
        },
        (error) => {
          console.error('Firestore reports snapshot error:', error);
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

  // 日報削除
  const deleteReport = useCallback(async (reportId: string) => {
    setReports((prev) => {
      const next = prev.filter((r) => r.id !== reportId);
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_REPORTS_KEY, JSON.stringify(next));
      }
      if (broadcastChannelRef.current) {
        broadcastChannelRef.current.postMessage({
          type: 'REPORTS_UPDATED',
          reports: next,
        });
      }
      return next;
    });

    if (isFirebaseConfigured && db) {
      try {
        await deleteDoc(doc(db, 'daily_reports', reportId));
      } catch (e) {
        console.error('Failed to delete report from Firestore', e);
      }
    }
  }, []);

  return {
    reports,
    deleteReport,
  };
}
