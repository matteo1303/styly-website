import { createContext, type PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { listSavedOutfits, type SavedOutfit } from '@/services/outfits';
import { useAuth } from '@/state/auth-context';

type OutfitsContextValue = {
  outfits: SavedOutfit[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

const OutfitsContext = createContext<OutfitsContextValue | null>(null);

export function OutfitsProvider({ children }: PropsWithChildren) {
  const { user } = useAuth();
  const [outfits, setOutfits] = useState<SavedOutfit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!user) {
      setOutfits([]);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setOutfits(await listSavedOutfits(user.id));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Impossibile caricare gli outfit salvati.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    const timeout = setTimeout(() => void refresh(), 0);
    return () => clearTimeout(timeout);
  }, [refresh]);

  const value = useMemo(() => ({ outfits, loading, error, refresh }), [error, loading, outfits, refresh]);
  return <OutfitsContext.Provider value={value}>{children}</OutfitsContext.Provider>;
}

export function useOutfits() {
  const value = useContext(OutfitsContext);
  if (!value) throw new Error('useOutfits must be used within OutfitsProvider');
  return value;
}
