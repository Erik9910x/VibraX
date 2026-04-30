'use server';

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// Use the secret key on the server to bypass RLS
const supabaseKey = process.env.SUPABASE_SECRET_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

export async function savePreset(data: any): Promise<string> {
  // Generate 5 random alphanumeric characters
  const id = Math.random().toString(36).substring(2, 7).toUpperCase();
  const code = `VIBRAX-${id}`;

  const { error } = await supabase
    .from('presets')
    .insert([{ id: code, data }]);

  if (error) {
    console.error('Lỗi khi lưu preset:', error);
    throw new Error('Không thể lưu vào Supabase. Hãy kiểm tra lại table presets!');
  }
  
  return code;
}

export async function loadPreset(code: string): Promise<any> {
  const { data, error } = await supabase
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
