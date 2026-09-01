"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { SplashScreen } from '@/components/splash-screen';
import { AnimatePresence } from 'framer-motion';
import { IdentitySelection } from '@/components/identity-selection';
import { needsOnboarding } from '@/lib/onboarding';
import { homePathForRole } from '@/lib/home-path';

function authenticatedHomePath(user: { role?: string } | null | undefined) {
  const role = user?.role?.toLowerCase();
  if (role === 'organization' || role === 'org' || role === 'tutor' || role === 'teacher' || role === 'admin') {
    return homePathForRole(role);
  }
  return needsOnboarding(user) ? '/onboarding' : '/dashboard/student';
}

export default function Home() {
  const router = useRouter();
  const { user, isAuthenticated, loading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);

  // Trigger route redirect as soon as splash finishes if authenticated
  useEffect(() => {
    if (!showSplash && isAuthenticated) {
      router.replace(authenticatedHomePath(user));
    }
  }, [showSplash, isAuthenticated, user, router]);

  const handleSplashFinished = () => {
    setShowSplash(false);
    if (isAuthenticated) {
      router.replace(authenticatedHomePath(user));
    }
  };

  if (showSplash) {
    return (
      <AnimatePresence mode="wait">
        <SplashScreen key="splash" onFinished={handleSplashFinished} isLoading={loading} />
      </AnimatePresence>
    );
  }

  // Always render IdentitySelection as the solid page background/view so the screen is NEVER blank white
  return <IdentitySelection />;
}
