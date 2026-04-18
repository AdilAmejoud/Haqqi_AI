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

export default function App() {
  const [session, setSession] = useState<any>(undefined);
  const [profile, setProfile] = useState<ProfileState>('loading');

  useEffect(() => {
    let mounted = true;

    // ── THE FIX: fetch profile OUTSIDE onAuthStateChange to avoid deadlock ──
    async function loadProfile(userId: string) {
      if (!mounted) return;
      const p = await fetchUserProfile(userId);
      if (mounted) setProfile(p);
    }

    // Step 1: getSession handles the refresh case
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      setSession(session ?? null);
      if (session) {
        loadProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    // Step 2: onAuthStateChange is SYNCHRONOUS — no async, no await inside
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        if (!mounted) return;
        if (event === 'INITIAL_SESSION') return;

        setSession(newSession ?? null);

        if (newSession) {
          // ← dispatch OUTSIDE the callback using setTimeout
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

  function RootRoute({ children }: { children: ReactNode }) {
    if (!session) return <>{children}</>;
    if (profile === 'loading') return <Spinner />;
    if (profile && (profile as Profile).onboarding_completed)
      return <Navigate to="/dashboard" replace />;
    return <Navigate to="/onboarding" replace />;
  }

  function PublicRoute({ children }: { children: ReactNode }) {
    if (!session) return <>{children}</>;
    if (profile === 'loading') return <Spinner />;
    if (profile && (profile as Profile).onboarding_completed)
      return <Navigate to="/dashboard" replace />;
    return <Navigate to="/onboarding" replace />;
  }

  function PrivateRoute({ children }: { children: ReactNode }) {
    if (!session) return <Navigate to="/auth" replace />;
    if (profile === 'loading') return <Spinner />;
    if (!profile || !(profile as Profile).onboarding_completed)
      return <Navigate to="/onboarding" replace />;
    return <>{children}</>;
  }

  function OnboardingRoute() {
    if (!session) return <Navigate to="/auth" replace />;
    if (profile === 'loading') return <Spinner />;
    if (profile && (profile as Profile).onboarding_completed)
      return <Navigate to="/dashboard" replace />;
    return <OnboardingScreen onComplete={async () => {
      const p = await fetchUserProfile(session.user.id);
      setProfile(p);
    }} />;
  }

  const realProfile = profile !== 'loading' ? profile as Profile | null : null;

  function Shell({ children }: { children: ReactNode }) {
    return (
      <PrivateRoute>
        <AppShell profile={realProfile}>{children}</AppShell>
      </PrivateRoute>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/"              element={<RootRoute><LandingScreen /></RootRoute>} />
        <Route path="/auth"          element={<PublicRoute><AuthScreen /></PublicRoute>} />
        <Route path="/auth/callback" element={<AuthCallbackRoute />} />
        <Route path="/onboarding"    element={<OnboardingRoute />} />

        <Route path="/dashboard"  element={<Shell><HomeScreen      profile={realProfile} /></Shell>} />
        <Route path="/chat"       element={<Shell><ChatScreen      profile={realProfile} /></Shell>} />
        <Route path="/library"    element={<Shell><LibraryScreen   profile={realProfile} /></Shell>} />
        <Route path="/settings"   element={<Shell><SettingsScreen  profile={realProfile} /></Shell>} />
        <Route path="/procedures" element={<Shell><ProceduresScreen profile={realProfile} /></Shell>} />
        <Route path="/document"   element={<Shell><DocumentScreen  profile={realProfile} /></Shell>} />
        <Route path="/community"  element={<Shell><CommunityScreen profile={realProfile} /></Shell>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}