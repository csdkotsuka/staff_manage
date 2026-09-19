'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Staff, StaffStatus } from '@/lib/types';
import { INITIAL_STAFFS } from '@/lib/mockData';
import { db, isFirebaseConfigured } from '@/lib/firebase';
import { collection, onSnapshot, doc, updateDoc, setDoc, deleteDoc } from 'firebase/firestore';

const STORAGE_KEY = 'craft_staff_status_cache_v1';
const BROADCAST_CHANNEL_NAME = 'craft_staff_sync_channel';

export function useStaffStatus() {
  const [staffs, setStaffs] = useState<Staff[]>(INITIAL_STAFFS);
  const [currentStaffId, setCurrentStaffId] = useState<string>('staff-1');
  const [isLiveConnected, setIsLiveConnected] = useState<boolean>(false);
  const [lastNotification, setLastNotification] = useState<string | null>(null);
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);
  const isInitialSnapshotRef = useRef<boolean>(true);

  // 1. 初期ロード & LocalStorageの読み込み & リアルタイム同期
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

    // Firebase (Cloud Firestore) 連携
    if (isFirebaseConfigured && db) {
      const staffsCollection = collection(db, 'staffs');

      const unsubscribe = onSnapshot(
        staffsCollection,
        async (snapshot) => {
          setIsLiveConnected(true);

          // コレクションが空の場合、初期データを自動投入（Auto-seed）
          if (snapshot.empty) {
            for (const staff of INITIAL_STAFFS) {
              await setDoc(doc(db!, 'staffs', staff.id), staff);
            }
            return;
          }

          const firestoreStaffs: Staff[] = [];
          snapshot.forEach((docSnap) => {
            firestoreStaffs.push(docSnap.data() as Staff);
          });

          // ID順で並び替え
          firestoreStaffs.sort((a, b) => a.id.localeCompare(b.id));

          setStaffs(firestoreStaffs);
          if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(firestoreStaffs));
          }

          // 初回以降の更新通知
          if (!isInitialSnapshotRef.current) {
            snapshot.docChanges().forEach((change) => {
              if (change.type === 'modified') {
                const updated = change.doc.data() as Staff;
                setLastNotification(`${updated.name}さんのステータスが更新されました`);
                setTimeout(() => setLastNotification(null), 4000);
              }
            });
          }
          isInitialSnapshotRef.current = false;
        },
        (error) => {
          console.error('Firestore snapshot error:', error);
          setIsLiveConnected(false);
        }
      );

      return () => {
        unsubscribe();
        broadcastChannelRef.current?.close();
      };
    } else {
      // モックモード（ローカルデモ）でも接続状態を有効にする
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

      // Firebase (Cloud Firestore) に反映
      if (isFirebaseConfigured && db) {
        const updatePayload: Record<string, unknown> = {
          status: newStatus,
          updated_at: now,
        };
        if (siteName !== undefined) updatePayload.current_site_name = siteName;
        if (note !== undefined) updatePayload.status_note = note;

        try {
          await updateDoc(doc(db, 'staffs', staffId), updatePayload);
        } catch (error) {
          console.error('Failed to update Firestore document:', error);
        }
      }
    },
    []
  );

  // 3. 社員プロフィール・役職・権限情報の編集
  const updateStaffInfo = useCallback(
    async (staffId: string, updatedFields: Partial<Staff>) => {
      const now = new Date().toISOString();
      const payload = { ...updatedFields, updated_at: now };

      setStaffs((prev) => {
        const next = prev.map((s) => (s.id === staffId ? { ...s, ...payload } : s));
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        }
        const updated = next.find((s) => s.id === staffId);
        if (updated && broadcastChannelRef.current) {
          broadcastChannelRef.current.postMessage({
            type: 'STAFF_UPDATED',
            updatedStaff: updated,
            message: `${updated.name}さんの社員情報が更新されました`,
          });
        }
        return next;
      });

      if (isFirebaseConfigured && db) {
        try {
          await updateDoc(doc(db, 'staffs', staffId), payload as Record<string, unknown>);
        } catch (e) {
          console.error('Failed to update staff info in Firestore', e);
        }
      }
    },
    []
  );

  // 4. 新規社員の追加
  const addStaff = useCallback(async (newStaff: Omit<Staff, 'id'>) => {
    const id = `staff-${Date.now()}`;
    const staffWithId: Staff = {
      ...newStaff,
      id,
      updated_at: new Date().toISOString(),
    };

    setStaffs((prev) => {
      const next = [...prev, staffWithId];
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      }
      return next;
    });

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'staffs', id), staffWithId);
      } catch (e) {
        console.error('Failed to add staff in Firestore', e);
      }
    }
  }, []);

  // 5. 社員の削除
  const deleteStaff = useCallback(async (staffId: string) => {
    setStaffs((prev) => {
      const next = prev.filter((s) => s.id !== staffId);
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      }
      return next;
    });

    if (isFirebaseConfigured && db) {
      try {
        await deleteDoc(doc(db, 'staffs', staffId));
      } catch (e) {
        console.error('Failed to delete staff in Firestore', e);
      }
    }
  }, []);

  // 6. 全体リセット（デモ検証・Firestore初期化用）
  const resetToDefault = useCallback(async () => {
    setStaffs(INITIAL_STAFFS);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_STAFFS));
    }
    if (broadcastChannelRef.current) {
      broadcastChannelRef.current.postMessage({
        type: 'STAFF_UPDATED',
        updatedStaff: INITIAL_STAFFS[0],
        message: 'デモデータを愛媛県仕様に初期化しました',
      });
    }

    if (isFirebaseConfigured && db) {
      for (const staff of INITIAL_STAFFS) {
        await setDoc(doc(db, 'staffs', staff.id), staff);
      }
    }
  }, []);

  const currentStaff = staffs.find((s) => s.id === currentStaffId) || staffs[0];

  return {
    staffs,
    currentStaff,
    currentStaffId,
    setCurrentStaffId,
    updateStatus,
    updateStaffInfo,
    addStaff,
    deleteStaff,
    resetToDefault,
    isLiveConnected,
    isMockMode: !isFirebaseConfigured,
    lastNotification,
  };
}
