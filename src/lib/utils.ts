/**
 * 2点間の緯度経度から距離 (km) を計算する (Haversine Formula)
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // 地球の半径 (km)
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.round(distance * 10) / 10; // 小数第1位まで
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * 距離から車での概算所要時間（分）を算出
 * 都内の移動速度目安: 約20〜25km/h + 出発準備5分
 */
export function estimateDriveMinutes(distanceKm: number): number {
  if (distanceKm <= 0.3) return 3; // 徒歩圏内
  const avgSpeedKmPerHour = 22;
  const driveMinutes = (distanceKm / avgSpeedKmPerHour) * 60;
  return Math.max(5, Math.round(driveMinutes + 4));
}

/**
 * 経過時間のフォーマット表示 (例: 5分前, たった今)
 */
export function formatRelativeTime(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffSec < 45) return 'たった今';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}分前`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}時間前`;
  return `${Math.floor(diffSec / 86400)}日前`;
}
