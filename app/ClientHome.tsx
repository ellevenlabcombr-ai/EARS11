"use client";

import { LoginScreen } from '@/components/LoginScreen';

export default function ClientHome() {
  const handleLogin = (role: any) => {
    alert("Login funcionando: " + role);
  };

  return <LoginScreen onLogin={handleLogin} />;
}
