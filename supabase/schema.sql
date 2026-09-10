-- ==========================================
-- 建設会社向け リアルタイム現場・位置情報・ステータス共有DBスキーマ
-- ==========================================

-- 1. 拡張機能の有効化
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. 社員テーブル (staffs)
CREATE TABLE IF NOT EXISTS public.staffs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    phone TEXT NOT NULL,
    avatar_color TEXT NOT NULL DEFAULT '#3B82F6',
    status TEXT NOT NULL DEFAULT 'not_started' 
        CHECK (status IN ('not_started', 'moving', 'working', 'completed', 'available')),
    current_site_name TEXT,
    lat DOUBLE PRECISION NOT NULL DEFAULT 35.6812,
    lng DOUBLE PRECISION NOT NULL DEFAULT 139.7671,
    status_note TEXT,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. 現場テーブル (sites)
CREATE TABLE IF NOT EXISTS public.sites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    client_name TEXT,
    work_description TEXT,
    status TEXT NOT NULL DEFAULT 'in_progress',
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. 緊急呼び出し（レスキュー）テーブル (rescue_requests)
CREATE TABLE IF NOT EXISTS public.rescue_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    address TEXT NOT NULL,
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    urgency TEXT NOT NULL DEFAULT 'high', -- 'urgent', 'high', 'medium'
    status TEXT NOT NULL DEFAULT 'open',  -- 'open', 'assigned', 'resolved'
    assigned_staff_id UUID REFERENCES public.staffs(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. Row Level Security (RLS) の設定
-- 今回は社内限定プロトタイプ・実演用として全操作を許可（本番ではSupabase Authロールで制限）
ALTER TABLE public.staffs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rescue_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access for staffs" ON public.staffs FOR SELECT USING (true);
CREATE POLICY "Allow public update access for staffs" ON public.staffs FOR UPDATE USING (true);
CREATE POLICY "Allow public insert access for staffs" ON public.staffs FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access for sites" ON public.sites FOR SELECT USING (true);
CREATE POLICY "Allow public insert access for sites" ON public.sites FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access for rescue_requests" ON public.rescue_requests FOR SELECT USING (true);
CREATE POLICY "Allow public insert access for rescue_requests" ON public.rescue_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access for rescue_requests" ON public.rescue_requests FOR UPDATE USING (true);

-- 6. Supabase Realtimeの有効化
-- テーブルの変更をリアルタイム購読可能にする
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime;
COMMIT;
ALTER PUBLICATION supabase_realtime ADD TABLE public.staffs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.rescue_requests;

-- 7. 初期シードデータ投入（社員5名 & 今日の現場3箇所）
INSERT INTO public.sites (name, address, lat, lng, client_name, work_description) VALUES
('渋谷スクエア 新築内装現場', '東京都渋谷区渋谷2-24-12', 35.6580, 139.7016, '東急建設様', '内装ボード貼り・配管設備点検'),
('新宿駅南口 ビル改修現場', '東京都新宿区新宿4-1-6', 35.6885, 139.7005, '三井住友建設様', '高圧電気ケーブル敷設・分電盤交換'),
('品川オフィス棟 原状回復現場', '東京都港区港南2-16-1', 35.6284, 139.7387, '野村不動産様', '天井照明LED化工事および撤去作業')
ON CONFLICT DO NOTHING;

INSERT INTO public.staffs (name, role, phone, avatar_color, status, current_site_name, lat, lng, status_note) VALUES
('佐藤 健一 (社長)', '統括・現場監督', '090-1111-2222', '#EF4444', 'available', '待機中（事務所）', 35.6895, 139.6917, '急な案件があればすぐ動けます'),
('田中 裕介', '主任電気工事士', '090-2222-3333', '#3B82F6', 'working', '新宿駅南口 ビル改修現場', 35.6885, 139.7005, '分電盤交換中。15時頃完了予定'),
('高橋 大地', '内装・ボード工', '090-3333-4444', '#10B981', 'working', '渋谷スクエア 新築内装現場', 35.6580, 139.7016, '下地貼り施工中。順調です'),
('渡辺 慎吾', '配管設備士', '090-4444-5555', '#F59E0B', 'moving', '品川オフィス棟 原状回復現場', 35.6450, 139.7250, '品川現場へトラックで移動中（到着まで10分）'),
('伊藤 翼', '見習い・施工補佐', '090-5555-6666', '#8B5CF6', 'available', '渋谷スクエア周辺で待機', 35.6600, 139.7050, '高橋さんの資材搬入完了。次レスキュー対応可能')
ON CONFLICT DO NOTHING;
