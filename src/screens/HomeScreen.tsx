import React from 'react';
import CitizenDashboard from '../components/dashboard/CitizenDashboard';
import StudentDashboard from '../components/dashboard/StudentDashboard';
import ExpertDashboard from '../components/dashboard/ExpertDashboard';
import type { Profile } from '../types';

interface HomeScreenProps {
  profile: Profile | null;
}

export default function HomeScreen({ profile }: HomeScreenProps) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'صباح الخير' : hour < 18 ? 'مساء الخير' : 'مساء النور';

  const dashboardProps = { greeting, profile };

  if (profile?.legal_level === 'student') return <StudentDashboard {...dashboardProps} />;
  if (profile?.legal_level === 'expert')  return <ExpertDashboard {...dashboardProps} />;
  return <CitizenDashboard {...dashboardProps} />;
}
