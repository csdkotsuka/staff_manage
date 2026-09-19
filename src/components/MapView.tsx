'use client';

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Staff, Site, STATUS_MAP } from '@/lib/types';

interface MapViewProps {
  staffs: Staff[];
  sites: Site[];
  currentStaffId: string;
  focusCoord?: { lat: number; lng: number } | null;
  targetRescueCoord?: { lat: number; lng: number; title: string } | null;
}

export const MapView: React.FC<MapViewProps> = ({
  staffs,
  sites,
  currentStaffId,
  focusCoord,
  targetRescueCoord,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});
  const rescueMarkerRef = useRef<L.Marker | null>(null);

  // 地図の初期化
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // 愛媛県中心（松山〜今治〜新居浜エリア）で初期化
    const map = L.map(mapContainerRef.current, {
      center: [33.88, 132.90],
      zoom: 10,
      zoomControl: false,
    });

    // ズームコントロールを右下に配置（現場での片手操作対策）
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // 見やすいダーク系タイル (CartoDB Dark Matter または OpenStreetMap)
    L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19,
      }
    ).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 現場マーカーの描画
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // 既存のサイトマーカーを更新または追加
    sites.forEach((site) => {
      const markerKey = `site-${site.id}`;
      if (!markersRef.current[markerKey]) {
        const siteIcon = L.divIcon({
          className: 'custom-site-icon',
          html: `
            <div class="flex items-center justify-center -translate-x-1/2 -translate-y-1/2 cursor-pointer group">
              <div class="relative flex items-center justify-center w-8 h-8 rounded-lg bg-amber-500 border-2 border-slate-900 text-slate-950 shadow-lg font-black text-xs">
                🏢
              </div>
              <div class="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-950/90 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded shadow border border-amber-500/40 pointer-events-none">
                ${site.name.split(' ')[0]}
              </div>
            </div>
          `,
          iconSize: [32, 32],
        });

        const marker = L.marker([site.lat, site.lng], { icon: siteIcon }).addTo(map);
        marker.bindPopup(`
          <div class="p-1 max-w-[220px] text-slate-900 font-sans">
            <span class="inline-block px-1.5 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-800 rounded mb-1">担当現場</span>
            <h4 class="font-bold text-sm leading-tight text-slate-900">${site.name}</h4>
            <p class="text-xs text-slate-600 mt-1">${site.address}</p>
            <p class="text-xs text-slate-700 font-semibold mt-1">工事: ${site.work_description || '確認中'}</p>
          </div>
        `);
        markersRef.current[markerKey] = marker;
      }
    });
  }, [sites]);

  // 社員マーカーの描画 & 位置・ステータス更新
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    staffs.forEach((staff) => {
      const markerKey = `staff-${staff.id}`;
      const statusConfig = STATUS_MAP[staff.status] || STATUS_MAP.not_started;
      const isCurrent = staff.id === currentStaffId;

      const staffIcon = L.divIcon({
        className: 'custom-staff-icon',
        html: `
          <div class="flex flex-col items-center -translate-x-1/2 -translate-y-1/2 cursor-pointer group">
            <div class="relative flex items-center justify-center w-9 h-9 rounded-full text-white font-black text-xs shadow-xl border-2 ${
              isCurrent ? 'ring-4 ring-amber-400 border-white' : 'border-slate-900'
            }" style="background-color: ${staff.avatar_color};">
              ${staff.name.slice(0, 1)}
              
              <!-- ステータスパルス -->
              <span class="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-slate-950" style="background-color: ${statusConfig.color};"></span>
              ${
                staff.status === 'available'
                  ? '<span class="absolute -top-1 -right-1 flex h-3 w-3"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span><span class="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span></span>'
                  : ''
              }
            </div>
            <div class="mt-1 whitespace-nowrap bg-slate-950/90 text-white text-[11px] font-bold px-2 py-0.5 rounded shadow-md border border-slate-700 flex items-center gap-1">
              <span class="w-2 h-2 rounded-full" style="background-color: ${statusConfig.color}"></span>
              <span>${staff.name.split(' ')[0]}</span>
              <span class="text-[9px] text-slate-400">(${statusConfig.shortLabel})</span>
            </div>
          </div>
        `,
        iconSize: [36, 36],
      });

      if (markersRef.current[markerKey]) {
        // 既存マーカー更新
        const marker = markersRef.current[markerKey];
        marker.setLatLng([staff.lat, staff.lng]);
        marker.setIcon(staffIcon);
      } else {
        // 新規作成
        const marker = L.marker([staff.lat, staff.lng], { icon: staffIcon }).addTo(map);
        marker.bindPopup(`
          <div class="p-1 max-w-[200px] text-slate-900 font-sans">
            <h4 class="font-bold text-sm text-slate-900">${staff.name}</h4>
            <p class="text-xs text-slate-600">${staff.role}</p>
            <div class="mt-2 text-xs">
              <span class="font-bold">状態: </span>
              <span class="font-semibold" style="color: ${statusConfig.color};">${statusConfig.label}</span>
            </div>
            <p class="text-xs text-slate-700 mt-1">現場: ${staff.current_site_name || '未登録'}</p>
            <p class="text-xs text-slate-500 mt-1">TEL: ${staff.phone}</p>
          </div>
        `);
        markersRef.current[markerKey] = marker;
      }
    });
  }, [staffs, currentStaffId]);

  // レスキューターゲット現場のピン表示
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (targetRescueCoord) {
      if (rescueMarkerRef.current) {
        rescueMarkerRef.current.remove();
      }

      const rescueIcon = L.divIcon({
        className: 'custom-rescue-icon',
        html: `
          <div class="flex flex-col items-center -translate-x-1/2 -translate-y-1/2 animate-bounce">
            <div class="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center shadow-xl border-2 border-white ring-4 ring-red-500/50 font-black text-sm">
              🚨
            </div>
            <div class="mt-1 bg-red-600 text-white font-black text-[10px] px-2 py-0.5 rounded shadow whitespace-nowrap">
              緊急出動要請先
            </div>
          </div>
        `,
        iconSize: [40, 40],
      });

      const marker = L.marker([targetRescueCoord.lat, targetRescueCoord.lng], {
        icon: rescueIcon,
      }).addTo(map);

      rescueMarkerRef.current = marker;

      // ピンの位置へ地図をスクロール
      map.flyTo([targetRescueCoord.lat, targetRescueCoord.lng], 13, { duration: 1.2 });
    } else if (rescueMarkerRef.current) {
      rescueMarkerRef.current.remove();
      rescueMarkerRef.current = null;
    }
  }, [targetRescueCoord]);

  // 特定のピンへフォーカス
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !focusCoord) return;

    map.flyTo([focusCoord.lat, focusCoord.lng], 14, { duration: 1 });
  }, [focusCoord]);

  return (
    <div className="relative w-full h-[280px] sm:h-[340px] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-900">
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* 地図上の凡例（現場職人向けクイックインフォ） */}
      <div className="absolute top-3 left-3 z-[400] bg-slate-950/85 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-slate-800 text-[11px] text-slate-300 shadow-md pointer-events-none flex items-center gap-2.5">
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          作業中
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
          移動中
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          移動可能(空き)
        </span>
        <span className="flex items-center gap-1">
          <span className="text-xs">🏢</span>
          現場
        </span>
      </div>
    </div>
  );
};

export default MapView;
