
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
  difficulty?: 'easy' | 'medium' | 'hard';
  priority?: 'low' | 'medium' | 'high';
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
  day_of_week: number; // 0 = Sunday, 1 = Monday, etc.
  start_time: string;
  end_time: string;
  location?: string;
  user_id: string;
  created_at?: string;
  updated_at?: string;
}
