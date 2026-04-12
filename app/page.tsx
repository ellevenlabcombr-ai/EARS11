"use client";

import React, { useState, useEffect } from 'react';
import { MainDashboard } from '@/components/MainDashboard';
import { AthleteDashboard } from '@/components/AthleteDashboard';
import { LoginScreen } from '@/components/LoginScreen';
import { ConfirmDialog } from '@/components/ConfirmDialog';

type Role = 'admin' | 'athlete' | null;

export default function Home() {
  const [userRole, setUserRole] = useState<Role>(null);
  const [loggedInAthlete, setLoggedInAthlete] = useState<any>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [pendingAction, setPendingAction] = useState<'logout' | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const savedSession = localStorage.getItem('ears_session');
    if (savedSession) {
      try {
        const session = JSON.parse(savedSession);
        // Optional: check timestamp for expiration (e.g., 30 days)
        const thirtyDays = 30 * 24 * 60 * 60 * 1000;
        if (new Date().getTime() - session.timestamp < thirtyDays) {
          // Defer state updates to avoid cascading renders warning
          setTimeout(() => {
            setUserRole(session.role);
            if (session.athleteData) {
              setLoggedInAthlete(session.athleteData);
            }
            setIsInitializing(false);
          }, 0);
          return; // Skip the final setIsInitializing(false)
        } else {
          localStorage.removeItem('ears_session');
        }
      } catch (e) {
        console.error("Error parsing saved session:", e);
        localStorage.removeItem('ears_session');
      }
    }
    setTimeout(() => {
      setIsInitializing(false);
    }, 0);
  }, []);

  const handleLogout = () => {
    if (isDirty) {
      setPendingAction('logout');
    } else {
      localStorage.removeItem('ears_session');
      setUserRole(null);
      setLoggedInAthlete(null);
    }
  };

  const handleLogin = (role: Role, athleteData?: any) => {
    console.log("Login success:", role, athleteData);
    setUserRole(role);
    if (athleteData) {
      setLoggedInAthlete(athleteData);
    }
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-[#050B14] flex items-center justify-center">
        <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-500 font-black text-3xl shadow-[0_0_30px_rgba(6,182,212,0.2)] animate-pulse">
          E
        </div>
      </div>
    );
  }

  if (!userRole) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  if (userRole === 'athlete') {
    return (
      <div className="min-h-screen bg-[#050B14] p-4 md:p-8 overflow-y-auto">
        <AthleteDashboard 
          onBack={handleLogout} 
          onDirtyChange={setIsDirty}
          athleteId={loggedInAthlete?.id}
          athleteGender={loggedInAthlete?.gender}
        />
        <ConfirmDialog 
          isOpen={pendingAction === 'logout'}
          onConfirm={() => {
            setPendingAction(null);
            setIsDirty(false);
            localStorage.removeItem('ears_session');
            setUserRole(null);
            setLoggedInAthlete(null);
          }}
          onCancel={() => setPendingAction(null)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050B14]">
      <MainDashboard onLogout={handleLogout} />
    </div>
  );
}
