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

export interface LawDocument {
  id: string;
  title: string;
  description: string;
  category: string;
  pdf_url: string;
  law_number: string;
  year: number;
  tags: string[];
}

export interface SavedDocument {
  id: string;
  user_id: string;
  title: string;
  type: string | null;
  category: string | null;
  content: string | null;
  file_path: string | null;
  created_at: string;
}

export interface ForumPost {
  id: string;
  user_id: string;
  title: string;
  content: string;
  category: string | null;
  tags: string[];
  is_anonymous: boolean;
  is_resolved: boolean;
  views: number;
  created_at: string;
  updated_at: string;
}

export interface ForumAnswer {
  id: string;
  post_id: string;
  user_id: string | null;
  content: string;
  is_ai: boolean;
  is_best_answer: boolean;
  votes: number;
  created_at: string;
}

export interface LawyerProfile {
  id: string;
  user_id: string;
  full_name: string;
  bio: string | null;
  specialties: string[];
  city: string | null;
  phone: string | null;
  email: string | null;
  bar_number: string | null;
  years_experience: number | null;
  is_verified: boolean;
  is_available: boolean;
  rating: number;
  response_count: number;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'new_answer' | 'vote' | 'best_answer' | 'general';
  title: string;
  body: string | null;
  link: string | null;
  is_read: boolean;
  created_at: string;
}
