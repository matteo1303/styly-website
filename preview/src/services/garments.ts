import { decode } from 'base64-arraybuffer';
import type { Garment, GarmentStatus, NewGarment, PickedGarmentImage } from '@/domain/garment';
import { supabase } from '@/lib/supabase';

type GarmentRow = {
  id: string;
  user_id: string;
  category: string;
  subcategory: string | null;
  primary_color: string;
  colors: unknown;
  pattern: string | null;
  material: string | null;
  formality: number | null;
  seasons: unknown;
  image_path: string;
  status: Garment['status'];
  created_at: string;
};

function requireClient() {
  if (!supabase) throw new Error('Styly non è ancora collegato al backend.');
  return supabase;
}

function extensionFor(image: PickedGarmentImage) {
  const fromName = image.fileName?.split('.').pop()?.toLowerCase();
  if (fromName && ['jpg', 'jpeg', 'png', 'webp'].includes(fromName)) return fromName === 'jpeg' ? 'jpg' : fromName;
  if (image.mimeType === 'image/png') return 'png';
  if (image.mimeType === 'image/webp') return 'webp';
  return 'jpg';
}

async function imageBody(image: PickedGarmentImage): Promise<ArrayBuffer | Blob> {
  if (image.base64) return decode(image.base64);
  const response = await fetch(image.uri);
  if (!response.ok) throw new Error('Non riesco a leggere la foto selezionata.');
  return response.blob();
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

async function withSignedImage(row: GarmentRow): Promise<Garment> {
  const client = requireClient();
  const { data, error } = await client.storage.from('garments').createSignedUrl(row.image_path, 60 * 60);
  if (error) throw error;
  return {
    id: row.id,
    userId: row.user_id,
    category: row.category,
    subcategory: row.subcategory,
    primaryColor: row.primary_color,
    colors: asStringArray(row.colors),
    pattern: row.pattern,
    material: row.material,
    formality: row.formality,
    seasons: asStringArray(row.seasons),
    imagePath: row.image_path,
    imageUrl: data.signedUrl,
    status: row.status,
    createdAt: row.created_at,
  };
}

export async function listGarments(userId: string): Promise<Garment[]> {
  const client = requireClient();
  const { data, error } = await client
    .from('garments')
    .select('id,user_id,category,subcategory,primary_color,colors,pattern,material,formality,seasons,image_path,status,created_at')
    .eq('user_id', userId)
    .neq('status', 'archived')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return Promise.all((data as GarmentRow[]).map(withSignedImage));
}

export async function createGarment(userId: string, draft: NewGarment, image: PickedGarmentImage): Promise<Garment> {
  const client = requireClient();
  const ext = extensionFor(image);
  const uniquePart = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  const imagePath = `${userId}/${uniquePart}.${ext}`;
  const body = await imageBody(image);
  const contentType = image.mimeType ?? (ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg');

  const { error: uploadError } = await client.storage.from('garments').upload(imagePath, body, {
    contentType,
    cacheControl: '3600',
    upsert: false,
  });
  if (uploadError) throw uploadError;

  const { data, error } = await client.from('garments').insert({
    user_id: userId,
    category: draft.category.trim(),
    subcategory: draft.subcategory?.trim() || null,
    primary_color: draft.primaryColor.trim(),
    colors: [draft.primaryColor.trim()],
    pattern: draft.pattern?.trim() || null,
    material: draft.material?.trim() || null,
    formality: draft.formality ?? null,
    image_path: imagePath,
    ai_metadata: {},
  }).select('id,user_id,category,subcategory,primary_color,colors,pattern,material,formality,seasons,image_path,status,created_at').single();

  if (error) {
    await client.storage.from('garments').remove([imagePath]);
    throw error;
  }
  return withSignedImage(data as GarmentRow);
}

export async function updateGarment(userId: string, garmentId: string, changes: Partial<NewGarment>): Promise<void> {
  const client = requireClient();
  const payload: Record<string, unknown> = {};
  if (changes.category !== undefined) payload.category = changes.category.trim();
  if (changes.subcategory !== undefined) payload.subcategory = changes.subcategory.trim() || null;
  if (changes.primaryColor !== undefined) {
    payload.primary_color = changes.primaryColor.trim();
    payload.colors = [changes.primaryColor.trim()];
  }
  if (changes.pattern !== undefined) payload.pattern = changes.pattern.trim() || null;
  if (changes.material !== undefined) payload.material = changes.material.trim() || null;
  if (changes.formality !== undefined) payload.formality = changes.formality;
  const { data, error } = await client.from('garments').update(payload).eq('id', garmentId).eq('user_id', userId).select('id');
  if (error) throw error;
  if (data.length !== 1) throw new Error('Capo non trovato o non appartenente al tuo account.');
}

export async function updateGarmentStatus(userId: string, garmentId: string, status: GarmentStatus): Promise<void> {
  const client = requireClient();
  const { data, error } = await client
    .from('garments')
    .update({ status })
    .eq('id', garmentId)
    .eq('user_id', userId)
    .select('id');
  if (error) throw error;
  if (data.length !== 1) throw new Error('Capo non trovato o non appartenente al tuo account.');
}

export async function deleteGarment(userId: string, garment: Garment): Promise<void> {
  const client = requireClient();
  if (garment.userId !== userId || !garment.imagePath.startsWith(`${userId}/`)) {
    throw new Error('Questo capo non appartiene al tuo account.');
  }

  const { error: anchoredOutfitsError } = await client
    .from('outfits')
    .delete()
    .eq('user_id', userId)
    .eq('anchor_garment_id', garment.id);
  if (anchoredOutfitsError) throw anchoredOutfitsError;

  const { error: outfitItemsError } = await client
    .from('outfit_items')
    .delete()
    .eq('user_id', userId)
    .eq('garment_id', garment.id);
  if (outfitItemsError) throw outfitItemsError;

  const { data, error } = await client
    .from('garments')
    .delete()
    .eq('id', garment.id)
    .eq('user_id', userId)
    .select('id');
  if (error) throw error;
  if (data.length !== 1) throw new Error('Capo non trovato o già eliminato.');

  const { error: storageError } = await client.storage.from('garments').remove([garment.imagePath]);
  if (storageError) console.warn('Foto del capo non rimossa dallo spazio immagini:', storageError.message);
}
