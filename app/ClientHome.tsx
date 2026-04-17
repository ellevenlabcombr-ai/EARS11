"use client";

import React, { useState, useEffect } from 'react';
import { MainDashboard } from '@/components/MainDashboard';
import { AthleteDashboard } from '@/components/AthleteDashboard';
import { LoginScreen } from '@/components/LoginScreen';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { AppLayout } from '@/components/layout/AppLayout';

type Role = 'admin' | 'athlete' | null;

export default function ClientHome() {
  const [userRole, setUserRole] = useState<Role>(null);
  const [loggedInAthlete, setLoggedInAthlete] = useState<any>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [pendingAction, setPendingAction] = useState<'logout' | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    setIsInitializing(false);
  }, []);

  const handleLogout = () => {
    setUserRole(null);
    setLoggedInAthlete(null);
  };

  const handleLogin = (role: Role, athleteData?: any) => {
    setUserRole(role);
    if (athleteData) setLoggedInAthlete(athleteData);
  };

  try {
  if (isInitializing) return <div>Loading...</div>;

  if (!userRole) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  if (userRole === 'athlete') {
    return (
      <AthleteDashboard
        onBack={handleLogout}
        onDirtyChange={setIsDirty}
        athleteId={loggedInAthlete?.id}
        athleteGender={loggedInAthlete?.gender}
      />
    );
  }

  return <MainDashboard onLogout={handleLogout} />;
} catch (err: any) {
  return (
    <div style={{ padding: 40 }}>
      <h1>Erro capturado 💥</h1>
      <pre>{String(err)}</pre>
    </div>
  );
}
  return <MainDashboard onLogout={handleLogout} />;
}
