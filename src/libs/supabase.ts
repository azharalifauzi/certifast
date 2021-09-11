import { createClient } from '@supabase/supabase-js';

const API_KEY = import.meta.env.VITE_PUBLIC_SUPABASE_API_KEY as string;

export const supabase = createClient('https://krzulzlbwfwhjckwtses.supabase.co', API_KEY);
