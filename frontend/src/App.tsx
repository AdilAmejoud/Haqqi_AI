import React, { useState, useEffect, ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { supabase } from './utils/supabase/client';
// Supabase types available via vite-env.d.ts
import type { Session, AuthChangeEvent } from '@supabase/supabase-js';
import { fetchUserProfile } from './utils/supabase/profile';
import { Profile } from './types';

import LandingScreen from './screens/LandingScreen';
import AuthScreen from './screens/AuthScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import HomeScreen from './screens/HomeScreen';
import ChatScreen from './screens/ChatScreen';
import LibraryScreen from './screens/LibraryScreen';
import SettingsScreen from './screens/SettingsScreen';
import ProceduresScreen from './screens/ProceduresScreen';
import DocumentScreen from './screens/DocumentScreen';
import DocumentsHubScreen from './screens/DocumentsHubScreen';
import SavedDocumentsScreen from './screens/SavedDocumentsScreen';
import TemplatesScreen from './screens/TemplatesScreen';
import CommunityScreen from './screens/CommunityScreen';
import CommunityPostScreen from './screens/CommunityPostScreen';
import LawyersDirectoryScreen from './screens/LawyersDirectoryScreen';
import NewCaseScreen from './screens/NewCaseScreen';
import EditCaseScreen from './screens/EditCaseScreen';
import CasesListScreen from './screens/CasesListScreen';
import ChatsListScreen from './screens/ChatsListScreen';
import CaseWorkspaceScreen from './screens/CaseWorkspaceScreen';
import AppShell from './components/AppShell';

type ProfileState = Profile | null | 'loading';

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#F7F8FA] p-8" dir="rtl">
          <div className="bg-white border border-[#E5E7EB] rounded-3xl p-10 max-w-md w-full text-center shadow-sm">
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">⚠️</span>
            </div>
            <h2 className="text-lg font-bold text-[#1F2937] mb-2">حدث خطأ غير متوقع</h2>
            <p className="text-sm text-[#6B7280] mb-6 leading-relaxed">
              {this.state.error?.message || 'خطأ غير معروف'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-[#1B3A6B] text-white py-3 rounded-xl font-bold text-sm hover:bg-[#2D4E87] transition-colors"
            >
              إعادة تحميل الصفحة
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function Spinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F8FA]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1B3A6B]" />
    </div>
  );
}

function AuthCallbackRoute() {
  const navigate = useNavigate();
  useEffect(() => {
    const timer = setTimeout(() => navigate('/', { replace: true }), 2000);
    return () => clearTimeout(timer);
  }, [navigate]);
  return <Spinner />;
}

function Shell({ children, noPadding, session, profile, realProfile }: { children: ReactNode, noPadding?: boolean, session: Session | null, profile: ProfileState, realProfile: Profile | null }) {
  return (
    <PrivateRoute session={session} profile={profile}>
      <AppShell profile={realProfile} noPadding={noPadding}>{children}</AppShell>
    </PrivateRoute>
  );
}

function PrivateRoute({ children, session, profile }: { children: ReactNode, session: Session | null, profile: ProfileState }) {
  if (!session) return <Navigate to="/auth" replace />;
  if (profile === 'loading') return <Spinner />;
  if (!profile || !(profile as Profile).onboarding_completed) {
    return <Navigate to="/onboarding" replace />;
  }
  return <>{children}</>;
}

function RootRoute({ children, session, profile }: { children: ReactNode, session: Session | null, profile: ProfileState }) {
  if (!session) return <>{children}</>;
  if (profile === 'loading') return <Spinner />;
  if (profile && (profile as Profile).onboarding_completed)
    return <Navigate to="/dashboard" replace />;
  return <Navigate to="/onboarding" replace />;
}

function PublicRoute({ children, session, profile }: { children: ReactNode, session: Session | null, profile: ProfileState }) {
  if (!session) return <>{children}</>;
  if (profile === 'loading') return <Spinner />;
  if (profile && (profile as Profile).onboarding_completed)
    return <Navigate to="/dashboard" replace />;
  return <Navigate to="/onboarding" replace />;
}

function OnboardingRoute({ session, profile, setProfile }: { session: Session | null, profile: ProfileState, setProfile: (p: ProfileState) => void }) {
  if (!session) return <Navigate to="/auth" replace />;
  if (profile === 'loading') return <Spinner />;
  if (profile && (profile as Profile).onboarding_completed)
    return <Navigate to="/dashboard" replace />;
  return <OnboardingScreen onComplete={async () => {
    const p = await fetchUserProfile(session.user.id);
    setProfile(p);
  }} />;
}

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<ProfileState>('loading');

  useEffect(() => {
    let mounted = true;

    async function loadProfile(userId: string) {
      if (!mounted) return;
      const p = await fetchUserProfile(userId);
      if (mounted) setProfile(p);
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      setSession(session ?? null);
      if (session) {
        loadProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, newSession: Session | null) => {
        if (!mounted) return;
        if (event === 'INITIAL_SESSION') return;

        setSession(newSession ?? null);

        if (newSession) {
          setTimeout(() => loadProfile(newSession.user.id), 0);
        } else {
          setProfile(null);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  if (session === undefined || (session && profile === 'loading')) {
    return <Spinner />;
  }

  const realProfile = profile !== 'loading' ? profile as Profile | null : null;



  return (
    <ErrorBoundary>
    <Router>
      <Routes>
        <Route path="/"              element={<RootRoute session={session} profile={profile}><LandingScreen /></RootRoute>} />
        <Route path="/auth"          element={<PublicRoute session={session} profile={profile}><AuthScreen /></PublicRoute>} />
        <Route path="/auth/callback" element={<AuthCallbackRoute />} />
        <Route path="/onboarding"    element={<OnboardingRoute session={session} profile={profile} setProfile={setProfile} />} />

        <Route path="/chats"      element={<Shell session={session} profile={profile} realProfile={realProfile} noPadding><ChatsListScreen /></Shell>} />
        <Route path="/chat"       element={<Shell session={session} profile={profile} realProfile={realProfile}><ChatScreen      profile={realProfile} /></Shell>} />
        <Route path="/dashboard"  element={<Shell session={session} profile={profile} realProfile={realProfile}><HomeScreen      profile={realProfile} /></Shell>} />
        <Route path="/cases"      element={<Shell session={session} profile={profile} realProfile={realProfile} noPadding><CasesListScreen profile={realProfile} /></Shell>} />
        <Route path="/cases/:id"  element={<Shell session={session} profile={profile} realProfile={realProfile} noPadding><CaseWorkspaceScreen profile={realProfile} /></Shell>} />
        <Route path="/cases/:id/edit" element={<Shell session={session} profile={profile} realProfile={realProfile}><EditCaseScreen /></Shell>} />
        <Route path="/cases/new"  element={<Shell session={session} profile={profile} realProfile={realProfile}><NewCaseScreen /></Shell>} />
        <Route path="/library"    element={<Shell session={session} profile={profile} realProfile={realProfile}><LibraryScreen   profile={realProfile} /></Shell>} />
        <Route path="/settings"   element={<Shell session={session} profile={profile} realProfile={realProfile}><SettingsScreen  profile={realProfile} /></Shell>} />
        <Route path="/procedures" element={<Shell session={session} profile={profile} realProfile={realProfile}><ProceduresScreen profile={realProfile} /></Shell>} />
        <Route path="/documents" element={<Shell session={session} profile={profile} realProfile={realProfile}><DocumentsHubScreen profile={realProfile} /></Shell>} />
        <Route path="/documents/generate" element={<Shell session={session} profile={profile} realProfile={realProfile}><DocumentScreen profile={realProfile} /></Shell>} />
        <Route path="/documents/saved" element={<Shell session={session} profile={profile} realProfile={realProfile}><SavedDocumentsScreen profile={realProfile} /></Shell>} />
        <Route path="/documents/templates" element={<Shell session={session} profile={profile} realProfile={realProfile}><TemplatesScreen profile={realProfile} /></Shell>} />
        <Route path="/document" element={<Navigate to="/documents" replace />} />
        <Route path="/community"  element={<Shell session={session} profile={profile} realProfile={realProfile}><CommunityScreen profile={realProfile} /></Shell>} />
        <Route path="/community/lawyers" element={<Shell session={session} profile={profile} realProfile={realProfile}><LawyersDirectoryScreen profile={realProfile} /></Shell>} />
        <Route path="/community/:id" element={<Shell session={session} profile={profile} realProfile={realProfile}><CommunityPostScreen profile={realProfile} /></Shell>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
    </ErrorBoundary>
  );
}