'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Site } from '@/lib/types';
import { INITIAL_SITES } from '@/lib/mockData';
import { db, isFirebaseConfigured } from '@/lib/firebase';
import {
  collection,
  onSnapshot,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
} from 'firebase/firestore';

const STORAGE_SITES_KEY = 'craft_sites_cache_v1';
const BROADCAST_SITES_CHANNEL = 'craft_sites_sync_channel';

export function useSites() {
  const [sites, setSites] = useState<Site[]>(INITIAL_SITES);
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    // ローカルストレージ復元
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_SITES_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setSites(parsed);
          }
        } catch (e) {
          console.error('Failed to parse cached sites', e);
        }
      }

      // BroadcastChannel (タブ間通信)
      if ('BroadcastChannel' in window) {
        const bc = new BroadcastChannel(BROADCAST_SITES_CHANNEL);
        broadcastChannelRef.current = bc;
        bc.onmessage = (event) => {
          if (event.data?.type === 'SITES_UPDATED') {
            const nextSites = event.data.sites as Site[];
            setSites(nextSites);
            localStorage.setItem(STORAGE_SITES_KEY, JSON.stringify(nextSites));
          }
        };
      }
    }

    // Firebase (Cloud Firestore) 連携
    if (isFirebaseConfigured && db) {
      const sitesCollection = collection(db, 'sites');

      const unsubscribe = onSnapshot(
        sitesCollection,
        async (snapshot) => {
          if (snapshot.empty) {
            // 初回自動シード
            for (const s of INITIAL_SITES) {
              await setDoc(doc(db!, 'sites', s.id), s);
            }
            return;
          }

          const remoteSites: Site[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            remoteSites.push({
              id: docSnap.id,
              name: data.name,
              address: data.address,
              lat: data.lat,
              lng: data.lng,
              client_name: data.client_name,
              work_description: data.work_description,
              status: data.status || 'in_progress',
            });
          });

          setSites(remoteSites);
          if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_SITES_KEY, JSON.stringify(remoteSites));
          }
        },
        (error) => {
          console.error('Firestore sites snapshot error:', error);
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

  const broadcastChange = (nextSites: Site[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_SITES_KEY, JSON.stringify(nextSites));
    }
    if (broadcastChannelRef.current) {
      broadcastChannelRef.current.postMessage({
        type: 'SITES_UPDATED',
        sites: nextSites,
      });
    }
  };

  // 1. 現場の追加
  const addSite = useCallback(
    async (newSiteData: Omit<Site, 'id'>) => {
      const newId = `site-${Date.now()}`;
      const newSite: Site = {
        ...newSiteData,
        id: newId,
      };

      setSites((prev) => {
        const next = [...prev, newSite];
        broadcastChange(next);
        return next;
      });

      if (isFirebaseConfigured && db) {
        try {
          await setDoc(doc(db, 'sites', newId), newSite);
        } catch (e) {
          console.error('Failed to add site to Firestore', e);
        }
      }
    },
    []
  );

  // 2. 現場の更新
  const updateSite = useCallback(
    async (siteId: string, updatedFields: Partial<Site>) => {
      setSites((prev) => {
        const next = prev.map((s) => (s.id === siteId ? { ...s, ...updatedFields } : s));
        broadcastChange(next);
        return next;
      });

      if (isFirebaseConfigured && db) {
        try {
          await updateDoc(doc(db, 'sites', siteId), updatedFields);
        } catch (e) {
          console.error('Failed to update site in Firestore', e);
        }
      }
    },
    []
  );

  // 3. 現場の削除
  const deleteSite = useCallback(
    async (siteId: string) => {
      setSites((prev) => {
        const next = prev.filter((s) => s.id !== siteId);
        broadcastChange(next);
        return next;
      });

      if (isFirebaseConfigured && db) {
        try {
          await deleteDoc(doc(db, 'sites', siteId));
        } catch (e) {
          console.error('Failed to delete site from Firestore', e);
        }
      }
    },
    []
  );

  return {
    sites,
    addSite,
    updateSite,
    deleteSite,
  };
}
