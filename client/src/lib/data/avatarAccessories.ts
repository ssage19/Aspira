import { LifestyleItem } from '../stores/useCharacter';

// Define types for our avatar system
export type AvatarAccessoryType = 
  | 'hair' 
  | 'eyewear' 
  | 'facialHair'
  | 'outfit'
  | 'accessory'
  | 'hat'
  | 'skin'
  | 'body';

// Base avatar properties
export interface BaseAvatarConfig {
  skinTone: string; // hex color
  bodyType: 'slim' | 'average' | 'athletic';
  height: number; // 0-1 scale
  eyeColor: string; // hex color
}

// Mapping between lifestyle items and avatar accessories
export interface AvatarAccessoryMapping {
  id: string;
  name: string;
  type: AvatarAccessoryType;
  modelPath: string; // Path to the 3D model or texture
  lifestyleItemId?: string; // Optional ID of the lifestyle item it's associated with
  thumbnail?: string; // Optional thumbnail image
  defaultSelected?: boolean; // If this should be selected by default
  exclusive?: boolean; // If this is exclusive with other items of the same type
}

// Create a base configuration
export const defaultAvatarConfig: BaseAvatarConfig = {
  skinTone: '#F5D0A9', // Default skin tone
  bodyType: 'average',
  height: 0.5,
  eyeColor: '#6B8E23', // Default eye color
};

// Array of available avatar accessories
export const avatarAccessories: AvatarAccessoryMapping[] = [
  // Basic body types - always available
  {
    id: 'body-default',
    name: 'Default Body',
    type: 'body',
    modelPath: '/models/avatars/body_default.glb',
    defaultSelected: true,
  },
  
  // Basic hairstyles - always available
  {
    id: 'hair-short',
    name: 'Short Hair',
    type: 'hair',
    modelPath: '/models/avatars/hair_short.glb',
    defaultSelected: true,
  },
  {
    id: 'hair-long',
    name: 'Long Hair',
    type: 'hair',
    modelPath: '/models/avatars/hair_long.glb'
  },
  {
    id: 'hair-bald',
    name: 'Bald',
    type: 'hair',
    modelPath: '/models/avatars/hair_bald.glb'
  },
  
  // Outfits - linked to lifestyle items
  {
    id: 'outfit-casual',
    name: 'Casual Outfit',
    type: 'outfit',
    modelPath: '/models/avatars/outfit_casual.glb',
    defaultSelected: true,
  },
  {
    id: 'outfit-business',
    name: 'Business Suit',
    type: 'outfit',
    modelPath: '/models/avatars/outfit_business.glb',
    lifestyleItemId: 'business-suit',
  },
  {
    id: 'outfit-sports',
    name: 'Sports Outfit',
    type: 'outfit',
    modelPath: '/models/avatars/outfit_sports.glb',
    lifestyleItemId: 'premium-gym-membership',
  },
  {
    id: 'outfit-yoga',
    name: 'Yoga Outfit',
    type: 'outfit',
    modelPath: '/models/avatars/outfit_yoga.glb',
    lifestyleItemId: 'yoga-classes',
  },
  
  // Accessories - linked to lifestyle items
  {
    id: 'accessory-watch',
    name: 'Luxury Watch',
    type: 'accessory',
    modelPath: '/models/avatars/accessory_watch.glb',
    lifestyleItemId: 'luxury-watch',
  },
  {
    id: 'accessory-necklace',
    name: 'Designer Necklace',
    type: 'accessory',
    modelPath: '/models/avatars/accessory_necklace.glb',
    lifestyleItemId: 'designer-jewelry',
  },
  
  // Eyewear - linked to lifestyle items
  {
    id: 'eyewear-glasses',
    name: 'Designer Glasses',
    type: 'eyewear',
    modelPath: '/models/avatars/eyewear_glasses.glb',
    lifestyleItemId: 'designer-eyewear',
  },
  {
    id: 'eyewear-sunglasses',
    name: 'Luxury Sunglasses',
    type: 'eyewear',
    modelPath: '/models/avatars/eyewear_sunglasses.glb',
    lifestyleItemId: 'luxury-sunglasses',
  },
];

// Function to get avatar accessories available based on owned lifestyle items
export function getAvailableAccessories(ownedLifestyleItems: LifestyleItem[]): AvatarAccessoryMapping[] {
  // Get all default accessories (those without a lifestyleItemId or with defaultSelected)
  const defaultAccessories = avatarAccessories.filter(
    accessory => !accessory.lifestyleItemId || accessory.defaultSelected
  );
  
  // Get all accessories linked to owned lifestyle items
  const ownedItemIds = ownedLifestyleItems.map(item => item.id);
  const unlockedAccessories = avatarAccessories.filter(
    accessory => accessory.lifestyleItemId && ownedItemIds.includes(accessory.lifestyleItemId)
  );
  
  // Combine and return all available accessories
  return [...defaultAccessories, ...unlockedAccessories];
}

// Function to get a specific accessory by ID
export function getAccessoryById(id: string): AvatarAccessoryMapping | undefined {
  return avatarAccessories.find(accessory => accessory.id === id);
}

// Function to get all accessories of a specific type
export function getAccessoriesByType(type: AvatarAccessoryType): AvatarAccessoryMapping[] {
  return avatarAccessories.filter(accessory => accessory.type === type);
}