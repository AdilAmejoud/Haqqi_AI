import { supabase } from './client';
import type { UserLevel, Profile } from '../../types';

/**
 * Fetches the current authenticated user's profile from the `profiles` table.
 * Returns `null` if the user has no profile yet (new user).
 */
export async function fetchUserProfile(userId?: string): Promise<Profile | null> {
  let id = userId;
  if (!id) {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return null;
    id = user.id;
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error || !data) return null;

  return {
    ...data,
    full_name: data.full_name,
    // Check if onboarding was explicitly marked complete, OR if user has both name and level (legacy)
    onboarding_completed: !!(data.onboarding_completed || (data.full_name && data.legal_level))
  } as Profile;
}

/**
 * Saves (upserts) the user's chosen legal level in the `profiles` table.
 */
export async function saveUserLevel(level: 'citizen' | 'student' | 'expert'): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { error } = await supabase
    .from('profiles')
    .upsert({ id: user.id, legal_level: level }, { onConflict: 'id' });

  if (error) throw error;
}

export async function upsertProfile(userId: string, data: Partial<Profile>) {
  const dbData: any = { id: userId };
  if (data.full_name !== undefined) dbData.full_name = data.full_name;
  if (data.legal_level !== undefined) dbData.legal_level = data.legal_level;
  if (data.onboarding_completed !== undefined) dbData.onboarding_completed = data.onboarding_completed;

  return supabase.from('profiles').upsert(dbData, { onConflict: 'id' });
}

export async function getProfile(userId: string) {
  return supabase.from('profiles').select('*').eq('id', userId).single();
}

