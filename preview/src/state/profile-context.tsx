import { createContext, type PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { PickedGarmentImage } from '@/domain/garment';
import { loadProfile, saveProfile, type ProfilePreferences, type UserProfile } from '@/services/profile';
import { useAuth } from '@/state/auth-context';

type ProfileContextValue = {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  updateProfile: (displayName: string, preferences: ProfilePreferences, image?: PickedGarmentImage | null) => Promise<void>;
};

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: PropsWithChildren) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fallbackName = typeof user?.user_metadata.display_name === 'string' ? user.user_metadata.display_name : '';

  const refresh = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setError(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setProfile(await loadProfile(user.id, fallbackName));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Impossibile caricare il profilo.');
    } finally {
      setLoading(false);
    }
  }, [fallbackName, user]);

  useEffect(() => {
    const timeout = setTimeout(() => void refresh(), 0);
    return () => clearTimeout(timeout);
  }, [refresh]);

  const value = useMemo<ProfileContextValue>(() => ({
    profile,
    loading,
    error,
    refresh,
    updateProfile: async (displayName, preferences, image) => {
      if (!user) throw new Error('Sessione non disponibile.');
      await saveProfile(user.id, displayName, preferences, image);
      await refresh();
    },
  }), [error, loading, profile, refresh, user]);

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile() {
  const value = useContext(ProfileContext);
  if (!value) throw new Error('useProfile must be used within ProfileProvider');
  return value;
}
