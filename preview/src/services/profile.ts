import { decode } from 'base64-arraybuffer';
import type { PickedGarmentImage } from '@/domain/garment';
import { supabase } from '@/lib/supabase';

export const styleChoices = ['Casual', 'Minimal', 'Smart casual', 'Streetwear', 'Classico', 'Sportivo'] as const;
export const priorityChoices = ['Comodità', 'Versatilità', 'Colori', 'Eleganza', 'Sostenibilità'] as const;
export const languageChoices = ['Italiano', 'English', 'Español', 'Français'] as const;

export type ProfilePreferences = {
  styles: string[];
  priorities: string[];
  fit: 'aderente' | 'regolare' | 'oversize' | 'misto';
  languages: string[];
  onboardingCompleted: boolean;
  avatarPath: string | null;
};

export type UserProfile = {
  displayName: string;
  preferences: ProfilePreferences;
  avatarUrl: string | null;
};

const defaults: ProfilePreferences = {
  styles: [],
  priorities: [],
  fit: 'misto',
  languages: ['Italiano'],
  onboardingCompleted: false,
  avatarPath: null,
};

function requireClient() {
  if (!supabase) throw new Error('Styly non è ancora collegato al backend.');
  return supabase;
}

function strings(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string').slice(0, 12) : [];
}

function parsePreferences(value: unknown): ProfilePreferences {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return defaults;
  const record = value as Record<string, unknown>;
  const legacyStyle = typeof record.primary_style === 'string' ? [record.primary_style] : [];
  const fit = ['aderente', 'regolare', 'oversize', 'misto'].includes(String(record.fit)) ? record.fit as ProfilePreferences['fit'] : 'misto';
  return {
    styles: strings(record.styles).length ? strings(record.styles) : legacyStyle,
    priorities: strings(record.priorities),
    fit,
    languages: strings(record.languages).length ? strings(record.languages) : ['Italiano'],
    onboardingCompleted: record.onboarding_completed === true,
    avatarPath: typeof record.avatar_path === 'string' && record.avatar_path ? record.avatar_path : null,
  };
}

async function signedAvatar(path: string | null) {
  if (!path) return null;
  const { data, error } = await requireClient().storage.from('avatars').createSignedUrl(path, 60 * 60);
  if (error) return null;
  return data.signedUrl;
}

export async function loadProfile(userId: string, fallbackName = ''): Promise<UserProfile> {
  const { data, error } = await requireClient()
    .from('profiles')
    .select('display_name,style_preferences')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw error;
  const preferences = parsePreferences(data?.style_preferences);
  return {
    displayName: typeof data?.display_name === 'string' ? data.display_name : fallbackName,
    preferences,
    avatarUrl: await signedAvatar(preferences.avatarPath),
  };
}

function extensionFor(image: PickedGarmentImage) {
  const ext = image.fileName?.split('.').pop()?.toLowerCase();
  if (ext && ['jpg', 'jpeg', 'png', 'webp'].includes(ext)) return ext === 'jpeg' ? 'jpg' : ext;
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

export async function saveProfile(userId: string, displayName: string, preferences: ProfilePreferences, image?: PickedGarmentImage | null): Promise<void> {
  const client = requireClient();
  let avatarPath = preferences.avatarPath;
  let uploadedPath: string | null = null;

  if (image) {
    const ext = extensionFor(image);
    uploadedPath = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${ext}`;
    const { error: uploadError } = await client.storage.from('avatars').upload(uploadedPath, await imageBody(image), {
      contentType: image.mimeType ?? (ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg'),
      cacheControl: '3600',
      upsert: false,
    });
    if (uploadError) throw uploadError;
    avatarPath = uploadedPath;
  }

  const payload = {
    styles: preferences.styles,
    priorities: preferences.priorities,
    fit: preferences.fit,
    languages: preferences.languages,
    onboarding_completed: preferences.onboardingCompleted,
    avatar_path: avatarPath,
  };
  const { error } = await client.from('profiles').upsert({
    id: userId,
    display_name: displayName.trim(),
    style_preferences: payload,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'id' });
  if (error) {
    if (uploadedPath) await client.storage.from('avatars').remove([uploadedPath]);
    throw error;
  }

  if (uploadedPath && preferences.avatarPath && preferences.avatarPath.startsWith(`${userId}/`)) {
    await client.storage.from('avatars').remove([preferences.avatarPath]);
  }
}
