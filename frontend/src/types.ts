export type Screen = 'landing' | 'onboarding' | 'auth' | 'home' | 'chat' | 'document' | 'report' | 'procedures' | 'social' | 'dashboard' | 'library' | 'settings';
export type UserLevel = 'citizen' | 'student' | 'expert' | null;

export interface Profile {
  id: string;
  full_name: string | null;
  legal_level: UserLevel;
  onboarding_completed: boolean;
  created_at?: string;
}

export interface Case {
  id: string;
  lawyer_id: string;
  title: string;
  client_name: string | null;
  status: 'new' | 'active' | 'completed' | 'archived';
  category: string | null;
  next_hearing: string | null;   // ISO date string
  reference_number: string | null;
  notes: string | null;
  created_at: string;
}

export interface Conversation {
  id: string;
  user_id: string;
  title: string | null;
  topic: string | null;
  is_archived: boolean;
  created_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;
  sources: any | null;
  created_at: string;
}

export interface Document {
  id: string;
  user_id: string;
  title: string;
  type: 'contract' | 'memo' | 'complaint' | 'template' | null;
  content: string | null;
  file_path: string | null;
  created_at: string;
}
