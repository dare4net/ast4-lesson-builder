"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { SplashScreen } from '@/components/splash-screen';
import { AnimatePresence } from 'framer-motion';
import { IdentitySelection } from '@/components/identity-selection';

export default function Home() {
  const router = useRouter();
  const { user, isAuthenticated, loading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);

  // Trigger route redirect as soon as splash finishes if authenticated
  useEffect(() => {
    if (!showSplash && isAuthenticated) {
      const targetPath = user?.role === 'tutor' ? '/dashboard/tutor' : '/dashboard/student';
      router.replace(targetPath);
    }
  }, [showSplash, isAuthenticated, user, router]);

  const handleSplashFinished = () => {
    setShowSplash(false);
    if (isAuthenticated) {
      const targetPath = user?.role === 'tutor' ? '/dashboard/tutor' : '/dashboard/student';
      router.replace(targetPath);
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
