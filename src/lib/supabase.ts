import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  daily_limit: number;
  quit_goal_date: string | null;
  onboarding_completed: boolean;
  current_daily_puffs: number;
  cost_per_device: number;
  devices_per_week: number;
  quit_date: string | null;
  longest_streak: number;
  created_at: string;
  updated_at: string;
}

export interface Puff {
  id: string;
  user_id: string;
  puff_count: number;
  recorded_at: string;
  created_at: string;
}

export interface DailyStat {
  id: string;
  user_id: string;
  date: string;
  total_puffs: number;
  created_at: string;
  updated_at: string;
}

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  target_puffs: number;
  is_completed: boolean;
  created_at: string;
  completed_at: string | null;
}

export interface Subscription {
  id: string;
  user_id: string;
  tier: 'free' | 'premium' | 'lifetime';
  status: 'active' | 'cancelled' | 'expired';
  started_at: string;
  expires_at: string | null;
  created_at: string;
}

export interface Craving {
  id: string;
  user_id: string;
  intensity: number;
  trigger: string | null;
  notes: string | null;
  recorded_at: string;
  created_at: string;
}

export interface HealthMilestone {
  id: string;
  user_id: string;
  milestone_type: string;
  achieved_at: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'health_benefit' | 'milestone' | 'motivation' | 'achievement';
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface Achievement {
  id: string;
  user_id: string;
  achievement_type: string;
  title: string;
  description: string;
  badge_icon: string;
  unlocked_at: string;
  created_at: string;
}

export interface UserProgress {
  id: string;
  user_id: string;
  days_smoke_free: number;
  total_puffs_avoided: number;
  current_streak: number;
  last_puff_at: string | null;
  created_at: string;
  updated_at: string;
}
