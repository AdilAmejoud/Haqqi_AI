import React, { useState, useEffect, ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { supabase } from './utils/supabase/client';
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
import CommunityScreen from './screens/CommunityScreen';
import NewCaseScreen from './screens/NewCaseScreen';
import EditCaseScreen from './screens/EditCaseScreen';
import CasesListScreen from './screens/CasesListScreen';
import ChatsListScreen from './screens/ChatsListScreen';
import CaseWorkspaceScreen from './screens/CaseWorkspaceScreen';
import AppShell from './components/AppShell';

type ProfileState = Profile | null | 'loading';

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

function Shell({ children, noPadding, session, profile, realProfile }: { children: ReactNode, noPadding?: boolean, session: any, profile: ProfileState, realProfile: Profile | null }) {
  return (
    <PrivateRoute session={session} profile={profile}>
      <AppShell profile={realProfile} noPadding={noPadding}>{children}</AppShell>
    </PrivateRoute>
  );
}

function PrivateRoute({ children, session, profile }: { children: ReactNode, session: any, profile: ProfileState }) {
  if (!session) return <Navigate to="/auth" replace />;
  if (profile === 'loading') return <Spinner />;
  if (!profile || !(profile as Profile).onboarding_completed) {
    return <Navigate to="/onboarding" replace />;
  }
  return <>{children}</>;
}

function RootRoute({ children, session, profile }: { children: ReactNode, session: any, profile: ProfileState }) {
  if (!session) return <>{children}</>;
  if (profile === 'loading') return <Spinner />;
  if (profile && (profile as Profile).onboarding_completed)
    return <Navigate to="/dashboard" replace />;
  return <Navigate to="/onboarding" replace />;
}

function PublicRoute({ children, session, profile }: { children: ReactNode, session: any, profile: ProfileState }) {
  if (!session) return <>{children}</>;
  if (profile === 'loading') return <Spinner />;
  if (profile && (profile as Profile).onboarding_completed)
    return <Navigate to="/dashboard" replace />;
  return <Navigate to="/onboarding" replace />;
}

function OnboardingRoute({ session, profile, setProfile }: { session: any, profile: ProfileState, setProfile: (p: ProfileState) => void }) {
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
  const [session, setSession] = useState<any>(undefined);
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
      (event, newSession) => {
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

  console.log('App Rendering — Current Path:', window.location.pathname);

  return (
    <Router>
      <Routes>
        <Route path="/"              element={<RootRoute session={session} profile={profile}><LandingScreen /></RootRoute>} />
        <Route path="/auth"          element={<PublicRoute session={session} profile={profile}><AuthScreen /></PublicRoute>} />
        <Route path="/auth/callback" element={<AuthCallbackRoute />} />
        <Route path="/onboarding"    element={<OnboardingRoute session={session} profile={profile} setProfile={setProfile} />} />

        <Route path="/chats"      element={<Shell session={session} profile={profile} realProfile={realProfile}><ChatsListScreen /></Shell>} />
        <Route path="/chat"       element={<Shell session={session} profile={profile} realProfile={realProfile}><ChatScreen      profile={realProfile} /></Shell>} />
        <Route path="/dashboard"  element={<Shell session={session} profile={profile} realProfile={realProfile}><HomeScreen      profile={realProfile} /></Shell>} />
        <Route path="/cases"      element={<Shell session={session} profile={profile} realProfile={realProfile}><CasesListScreen profile={realProfile} /></Shell>} />
        <Route path="/cases/:id"  element={<Shell session={session} profile={profile} realProfile={realProfile} noPadding><CaseWorkspaceScreen profile={realProfile} /></Shell>} />
        <Route path="/cases/:id/edit" element={<Shell session={session} profile={profile} realProfile={realProfile}><EditCaseScreen /></Shell>} />
        <Route path="/cases/new"  element={<Shell session={session} profile={profile} realProfile={realProfile}><NewCaseScreen /></Shell>} />
        <Route path="/library"    element={<Shell session={session} profile={profile} realProfile={realProfile}><LibraryScreen   profile={realProfile} /></Shell>} />
        <Route path="/settings"   element={<Shell session={session} profile={profile} realProfile={realProfile}><SettingsScreen  profile={realProfile} /></Shell>} />
        <Route path="/procedures" element={<Shell session={session} profile={profile} realProfile={realProfile}><ProceduresScreen profile={realProfile} /></Shell>} />
        <Route path="/document"   element={<Shell session={session} profile={profile} realProfile={realProfile}><DocumentScreen  profile={realProfile} /></Shell>} />
        <Route path="/community"  element={<Shell session={session} profile={profile} realProfile={realProfile}><CommunityScreen profile={realProfile} /></Shell>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}