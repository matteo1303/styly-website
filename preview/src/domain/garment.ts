export type GarmentStatus = 'available' | 'unavailable' | 'archived';

export type Garment = {
  id: string;
  userId: string;
  category: string;
  subcategory: string | null;
  primaryColor: string;
  colors: string[];
  pattern: string | null;
  material: string | null;
  formality: number | null;
  seasons: string[];
  imagePath: string;
  imageUrl: string;
  status: GarmentStatus;
  createdAt: string;
};

export type NewGarment = {
  category: string;
  subcategory?: string;
  primaryColor: string;
  pattern?: string;
  material?: string;
  formality?: number;
};

export type PickedGarmentImage = {
  uri: string;
  base64?: string | null;
  mimeType?: string | null;
  fileName?: string | null;
};
