
import type { User } from '@supabase/supabase-js';

export interface Profile {
  id: string;
  full_name: string;
  avatar_url?: string;
  email?: string;
  bio?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  dueDate: string;
  difficulty: 'easy' | 'medium' | 'hard';
  priority?: number | null;
  user_id: string;
  subject_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Subject {
  id: string;
  name: string;
  description?: string;
  color?: string;
  user_id: string;
  professor_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Professor {
  id: string;
  full_name: string;
  email?: string;
  phone?: string;
  office_hours?: string;
  user_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface ScheduleEntry {
  id: string;
  subject_id: string;
  start_time: string;
  end_time: string;
  days_of_week: string[];
  location?: string;
  notes?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface PushSubscriptionData {
  user_id: string;
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  subscription: any;
}
