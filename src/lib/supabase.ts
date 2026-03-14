import { createClient, SupabaseClient } from "@supabase/supabase-js";

// GAP-10: 싱글톤 — 요청마다 클라이언트 재생성 방지
let cachedClient: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (cachedClient) return cachedClient;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_KEY;
  if (!url || !key) {
    throw new Error("SUPABASE_URL 또는 SUPABASE_KEY가 설정되지 않았습니다.");
  }
  cachedClient = createClient(url, key);
  return cachedClient;
}
