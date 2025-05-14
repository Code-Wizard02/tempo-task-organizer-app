
// Custom app types that work with our Supabase schema
import type { Database } from '@/integrations/supabase/types';

// Define Profile type based on the Supabase database schema
export type Profile = Database['public']['Tables']['profiles']['Row'];

// Re-export existing types from our contexts for app-wide use
export type { Subject } from '@/contexts/subject-context';
export type { Professor } from '@/contexts/professor-context';
export type { Task, TaskDifficulty } from '@/contexts/task-context';
