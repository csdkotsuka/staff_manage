export type StaffStatus = 'not_started' | 'moving' | 'working' | 'completed' | 'available';

export interface Staff {
  id: string;
  name: string;
  role: string;
  phone: string;
  email?: string;
  avatar_color: string;
  status: StaffStatus;
  current_site_name: string;
  lat: number;
  lng: number;
  status_note?: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  senderColor?: string;
  text: string;
  createdAt: string;
  isQuick?: boolean;
}

export interface WeatherForecastDay {
  date: string; // YYYY-MM-DD
  dayOfWeek: string; // 月, 火, etc.
  weatherCode: number;
  weatherText: string;
  weatherIcon: string;
  tempMax: number;
  tempMin: number;
  precipitationProb: number;
  isRainy: boolean;
}

export interface Site {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  client_name?: string;
  work_description?: string;
  status: 'planning' | 'in_progress' | 'completed';
}

export interface RescueRequest {
  id: string;
  title: string;
  address: string;
  lat: number;
  lng: number;
  urgency: 'urgent' | 'high' | 'medium';
  status: 'open' | 'assigned' | 'resolved';
  assigned_staff_id?: string;
  created_at: string;
}

export interface StatusConfig {
  label: string;
  shortLabel: string;
  color: string;
  textColor: string;
  bgLight: string;
  borderColor: string;
  iconName: string;
}

export const STATUS_MAP: Record<StaffStatus, StatusConfig> = {
  working: {
    label: '作業中',
    shortLabel: '作業中',
    color: '#10B981', // emerald-500
    textColor: 'text-emerald-400',
    bgLight: 'bg-emerald-950/40',
    borderColor: 'border-emerald-500/50',
    iconName: 'Hammer',
  },
  moving: {
    label: '現場移動中',
    shortLabel: '移動中',
    color: '#3B82F6', // blue-500
    textColor: 'text-blue-400',
    bgLight: 'bg-blue-950/40',
    borderColor: 'border-blue-500/50',
    iconName: 'Truck',
  },
  available: {
    label: '移動可能 (急募対応可)',
    shortLabel: '移動可能',
    color: '#F59E0B', // amber-500
    textColor: 'text-amber-400',
    bgLight: 'bg-amber-950/40',
    borderColor: 'border-amber-500/50',
    iconName: 'Sparkles',
  },
  completed: {
    label: '作業完了',
    shortLabel: '完了',
    color: '#8B5CF6', // violet-500
    textColor: 'text-violet-400',
    bgLight: 'bg-violet-950/40',
    borderColor: 'border-violet-500/50',
    iconName: 'CheckCircle2',
  },
  not_started: {
    label: '未着手 / 出勤前',
    shortLabel: '未着手',
    color: '#64748B', // slate-500
    textColor: 'text-slate-400',
    bgLight: 'bg-slate-900/60',
    borderColor: 'border-slate-700',
    iconName: 'Coffee',
  },
};
