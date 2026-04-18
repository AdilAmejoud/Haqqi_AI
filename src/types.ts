export type Screen = 'landing' | 'onboarding' | 'auth' | 'home' | 'chat' | 'document' | 'report' | 'procedures' | 'social' | 'dashboard' | 'library' | 'settings';
export type UserLevel = 'citizen' | 'student' | 'expert' | null;

export interface Profile {
  id: string;
  full_name: string | null;
  legal_level: UserLevel;
  onboarding_completed: boolean;
  created_at?: string;
}
