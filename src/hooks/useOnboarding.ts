import { useState, useEffect } from 'react';
import { auth } from '@/lib/auth';

const ONBOARDING_KEY = 'onboarding_seen_v1';

/**
 * Hook to manage first-time onboarding tour state.
 * Only shows the tour for LECTURER and INTERPRETER roles on their first visit.
 * Tracks state in localStorage under key: "onboarding_seen_v1"
 */
export function useOnboarding() {
    const [showOnboarding, setShowOnboarding] = useState(false);

    useEffect(() => {
        const user = auth.getUser();
        if (!user) return;

        const isTargetRole = user.role === 'LECTURER' || user.role === 'INTERPRETER';
        if (!isTargetRole) return;

        const hasSeen = localStorage.getItem(ONBOARDING_KEY) === 'true';
        if (!hasSeen) {
            setShowOnboarding(true);
        }
    }, []);

    const markSeen = () => {
        localStorage.setItem(ONBOARDING_KEY, 'true');
        setShowOnboarding(false);
    };

    const resetOnboarding = () => {
        localStorage.removeItem(ONBOARDING_KEY);
        setShowOnboarding(true);
    };

    return { showOnboarding, markSeen, resetOnboarding };
}
