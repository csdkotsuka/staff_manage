'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Staff, StaffStatus } from '@/lib/types';
import { INITIAL_STAFFS } from '@/lib/mockData';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

const STORAGE_KEY = 'craft_staff_status_cache_v1';
const BROADCAST_CHANNEL_NAME = 'craft_staff_sync_channel';

export function useStaffStatus() {
  const [staffs, setStaffs] = useState<Staff[]>(INITIAL_STAFFS);
  const [currentStaffId, setCurrentStaffId] = useState<string>('staff-1');
  const [isLiveConnected, setIsLiveConnected] = useState<boolean>(false);
  const [lastNotification, setLastNotification] = useState<string | null>(null);
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);

  // 1. 初期ロード & LocalStorageの読み込み
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setStaffs(parsed);
          }
        } catch (e) {
          console.error('Failed to parse cached staffs', e);
        }
      }

      // BroadcastChannel (同一ブラウザ別タブ同期用)
      if ('BroadcastChannel' in window) {
        const channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
        broadcastChannelRef.current = channel;

        channel.onmessage = (event) => {
          const { type, updatedStaff, message } = event.data;
          if (type === 'STAFF_UPDATED' && updatedStaff) {
            setStaffs((prev) => {
              const next = prev.map((s) => (s.id === updatedStaff.id ? updatedStaff : s));
              localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
              return next;
            });
            if (message) {
              setLastNotification(message);
              setTimeout(() => setLastNotification(null), 4000);
            }
          }
        };
      }
    }

    // Supabase連携
    if (isSupabaseConfigured && supabase) {
      const client = supabase;
      // 初期データ取得
      client
        .from('staffs')
        .select('*')
        .order('name')
        .then(({ data, error }) => {
          if (!error && data && data.length > 0) {
            setStaffs(data as Staff[]);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
          }
        });

      // Realtime購読
      const channel = client
        .channel('public:staffs')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'staffs' },
          (payload) => {
            if (payload.eventType === 'UPDATE') {
              const updated = payload.new as Staff;
              setStaffs((prev) =>
                prev.map((s) => (s.id === updated.id ? updated : s))
              );
              setLastNotification(`${updated.name}さんのステータスが更新されました`);
              setTimeout(() => setLastNotification(null), 4000);
            }
          }
        )
        .subscribe((status) => {
          setIsLiveConnected(status === 'SUBSCRIBED');
        });

      return () => {
        client.removeChannel(channel);
        broadcastChannelRef.current?.close();
      };
    } else {
      // モックモードでも接続状態を有効にする
      setIsLiveConnected(true);
      return () => {
        broadcastChannelRef.current?.close();
      };
    }
  }, []);

  // 2. ステータス変更処理
  const updateStatus = useCallback(
    async (
      staffId: string,
      newStatus: StaffStatus,
      siteName?: string,
      note?: string
    ) => {
      const now = new Date().toISOString();

      let targetName = '';
      setStaffs((prev) => {
        const next = prev.map((s) => {
          if (s.id === staffId) {
            targetName = s.name;
            return {
              ...s,
              status: newStatus,
              current_site_name: siteName !== undefined ? siteName : s.current_site_name,
              status_note: note !== undefined ? note : s.status_note,
              updated_at: now,
            };
          }
          return s;
        });

        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        }

        const updated = next.find((s) => s.id === staffId);
        if (updated && broadcastChannelRef.current) {
          broadcastChannelRef.current.postMessage({
            type: 'STAFF_UPDATED',
            updatedStaff: updated,
            message: `${targetName}さんがステータスを更新しました`,
          });
        }

        return next;
      });

      // Supabaseに反映
      if (isSupabaseConfigured && supabase) {
        const updatePayload: Partial<Staff> = {
          status: newStatus,
          updated_at: now,
        };
        if (siteName !== undefined) updatePayload.current_site_name = siteName;
        if (note !== undefined) updatePayload.status_note = note;

        await supabase.from('staffs').update(updatePayload).eq('id', staffId);
      }
    },
    []
  );

  // 3. 全体リセット（デモ検証用）
  const resetToDefault = useCallback(() => {
    setStaffs(INITIAL_STAFFS);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_STAFFS));
    }
    if (broadcastChannelRef.current) {
      broadcastChannelRef.current.postMessage({
        type: 'STAFF_UPDATED',
        updatedStaff: INITIAL_STAFFS[0],
        message: 'デモデータを初期化しました',
      });
    }
  }, []);

  const currentStaff = staffs.find((s) => s.id === currentStaffId) || staffs[0];

  return {
    staffs,
    currentStaff,
    currentStaffId,
    setCurrentStaffId,
    updateStatus,
    resetToDefault,
    isLiveConnected,
    isMockMode: !isSupabaseConfigured,
    lastNotification,
  };
}
