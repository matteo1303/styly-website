import { supabase } from '@/lib/supabase';

export type SavedOutfit = {
  id: string;
  userId: string;
  title: string;
  occasion: string | null;
  explanation: string;
  anchorGarmentId: string;
  createdAt: string;
  garmentIds: string[];
};

type OutfitRow = {
  id: string;
  user_id: string;
  title: string;
  occasion: string | null;
  explanation: string;
  anchor_garment_id: string;
  created_at: string;
};

type OutfitItemRow = { outfit_id: string; garment_id: string; position: number };

function requireClient() {
  if (!supabase) throw new Error('Styly non è ancora collegato al backend.');
  return supabase;
}

export async function listSavedOutfits(userId: string): Promise<SavedOutfit[]> {
  const client = requireClient();
  const { data: outfits, error } = await client
    .from('outfits')
    .select('id,user_id,title,occasion,explanation,anchor_garment_id,created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  if (!outfits.length) return [];

  const outfitIds = (outfits as OutfitRow[]).map((item) => item.id);
  const { data: items, error: itemsError } = await client
    .from('outfit_items')
    .select('outfit_id,garment_id,position')
    .eq('user_id', userId)
    .in('outfit_id', outfitIds)
    .order('position', { ascending: true });
  if (itemsError) throw itemsError;

  const itemRows = items as OutfitItemRow[];
  return (outfits as OutfitRow[]).map((outfit) => ({
    id: outfit.id,
    userId: outfit.user_id,
    title: outfit.title,
    occasion: outfit.occasion,
    explanation: outfit.explanation,
    anchorGarmentId: outfit.anchor_garment_id,
    createdAt: outfit.created_at,
    garmentIds: itemRows.filter((item) => item.outfit_id === outfit.id).map((item) => item.garment_id),
  }));
}
