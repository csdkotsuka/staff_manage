'use client';

import dynamic from 'next/dynamic';
import React from 'react';
import { Staff, Site } from '@/lib/types';
import { Loader2 } from 'lucide-react';

const DynamicMap = dynamic(() => import('./MapView'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[280px] sm:h-[340px] rounded-2xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center text-slate-500 gap-2">
      <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      <span className="text-xs font-semibold">現場マップを読み込み中...</span>
    </div>
  ),
});

interface MapWrapperProps {
  staffs: Staff[];
  sites: Site[];
  currentStaffId: string;
  focusCoord?: { lat: number; lng: number } | null;
  targetRescueCoord?: { lat: number; lng: number; title: string } | null;
}

export const MapWrapper: React.FC<MapWrapperProps> = (props) => {
  return <DynamicMap {...props} />;
};
