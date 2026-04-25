import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from './info';

// Singleton Supabase client to avoid multiple instances
export const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);
