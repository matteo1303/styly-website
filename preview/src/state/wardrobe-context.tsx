import { createContext, type PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { Garment, GarmentStatus, NewGarment, PickedGarmentImage } from '@/domain/garment';
import { createGarment, deleteGarment, listGarments, updateGarment, updateGarmentStatus } from '@/services/garments';
import { useAuth } from '@/state/auth-context';

type WardrobeContextValue = {
  garments: Garment[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  addGarment: (draft: NewGarment, image: PickedGarmentImage) => Promise<Garment>;
  editGarment: (id: string, changes: Partial<NewGarment>) => Promise<void>;
  setGarmentStatus: (id: string, status: GarmentStatus) => Promise<void>;
  removeGarment: (garment: Garment) => Promise<void>;
};

const WardrobeContext = createContext<WardrobeContextValue | null>(null);

export function WardrobeProvider({ children }: PropsWithChildren) {
  const { user } = useAuth();
  const [garments, setGarments] = useState<Garment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!user) {
      setGarments([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setGarments(await listGarments(user.id));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Impossibile caricare il guardaroba.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    const timeout = setTimeout(() => void refresh(), 0);
    return () => clearTimeout(timeout);
  }, [refresh]);

  const value = useMemo<WardrobeContextValue>(() => ({
    garments,
    loading,
    error,
    refresh,
    addGarment: async (draft, image) => {
      if (!user) throw new Error('Devi accedere prima di aggiungere un capo.');
      const garment = await createGarment(user.id, draft, image);
      setGarments((current) => [garment, ...current]);
      return garment;
    },
    editGarment: async (id, changes) => {
      if (!user) throw new Error('Sessione non disponibile.');
      await updateGarment(user.id, id, changes);
      await refresh();
    },
    setGarmentStatus: async (id, status) => {
      if (!user) throw new Error('Sessione non disponibile.');
      await updateGarmentStatus(user.id, id, status);
      setGarments((current) => current.map((item) => item.id === id ? { ...item, status } : item));
    },
    removeGarment: async (garment) => {
      if (!user) throw new Error('Sessione non disponibile.');
      await deleteGarment(user.id, garment);
      setGarments((current) => current.filter((item) => item.id !== garment.id));
    },
  }), [error, garments, loading, refresh, user]);

  return <WardrobeContext.Provider value={value}>{children}</WardrobeContext.Provider>;
}

export function useWardrobe() {
  const value = useContext(WardrobeContext);
  if (!value) throw new Error('useWardrobe must be used within WardrobeProvider');
  return value;
}
