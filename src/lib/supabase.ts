'use server';

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SECRET_KEY || '';

// Lazy initialization to avoid crashing the server if env vars are missing
let supabaseInstance: ReturnType<typeof createClient> | null = null;
function getSupabase() {
  if (!supabaseInstance) {
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials missing from environment variables');
    }
    supabaseInstance = createClient(supabaseUrl, supabaseKey);
  }
  return supabaseInstance;
}

export async function savePreset(data: unknown): Promise<string> {
  // Generate 5 random alphanumeric characters
  const id = Math.random().toString(36).substring(2, 7).toUpperCase();
  const code = `VIBRAX-${id}`;

  const { error } = await (getSupabase() as any)
    .from('presets')
    .insert([{ id: code, data }]);

  if (error) {
    console.error('Lỗi khi lưu preset:', error);
    throw new Error('Không thể lưu vào Supabase. Hãy kiểm tra lại table presets!');
  }
  
  return code;
}

export async function loadPreset(code: string): Promise<unknown> {
  const { data, error } = await (getSupabase() as any)
    .from('presets')
    .select('data')
    .eq('id', code.toUpperCase())
    .single();

  if (error || !data) {
    console.error('Lỗi khi tải preset:', error);
    throw new Error('Mã Preset không tồn tại hoặc lỗi mạng!');
  }
  
  return data.data;
}
