"use client";

import { useState, useEffect } from "react";
import { WelcomeModal } from "./welcome-modal";

/**
 * Client-side onboarding provider
 * Checks if user has completed onboarding and shows welcome modal if needed
 */
export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [showWelcome, setShowWelcome] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Check if user has completed onboarding
    const hasCompleted = localStorage.getItem("hasCompletedOnboarding");

    if (!hasCompleted) {
      // Small delay to ensure page is loaded before showing modal
      setTimeout(() => {
        setShowWelcome(true);
        setIsChecking(false);
      }, 500);
    } else {
      setIsChecking(false);
    }
  }, []);

  const handleCloseWelcome = () => {
    setShowWelcome(false);
  };

  // Don't render children until we've checked onboarding status
  // This prevents flash of content before modal
  if (isChecking) {
    return null;
  }

  return (
    <>
      {children}
      <WelcomeModal isOpen={showWelcome} onClose={handleCloseWelcome} />
    </>
  );
}
