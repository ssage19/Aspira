import { LifestyleItem } from '../stores/useCharacter';

// Define accessory types
export type AvatarAccessoryType = 
  | 'hair'
  | 'outfit'
  | 'eyewear'
  | 'accessory'
  | 'body';

// Interface for avatar accessories
export interface AvatarAccessoryMapping {
  id: string;
  name: string;
  type: AvatarAccessoryType;
  modelPath: string;
  lifestyleItemId?: string; // Optional ID of the lifestyle item that unlocks this accessory
  lifestyleItemType?: string; // Optional type of lifestyle item that unlocks this
  defaultUnlocked?: boolean; // Is this accessory available by default?
  prestigeRequired?: number; // Optional prestige requirement
}

// List of all avatar accessories
export const avatarAccessories: AvatarAccessoryMapping[] = [
  // Body types (always available)
  {
    id: 'body_default',
    name: 'Default Body',
    type: 'body',
    modelPath: '/models/accessories/default_body.glb',
    defaultUnlocked: true
  },
  
  // Hair styles
  {
    id: 'hair_default',
    name: 'Default Hair',
    type: 'hair',
    modelPath: '/models/accessories/default_hair.glb',
    defaultUnlocked: true
  },
  {
    id: 'hair_fancy',
    name: 'Fancy Hair',
    type: 'hair',
    modelPath: '/models/accessories/fancy_hair.glb',
    lifestyleItemType: 'luxury',
    prestigeRequired: 20
  },
  {
    id: 'hair_professional',
    name: 'Professional Hair',
    type: 'hair',
    modelPath: '/models/accessories/professional_hair.glb',
    lifestyleItemId: 'lifestyle_salon_membership'
  },
  
  // Outfits
  {
    id: 'outfit_default',
    name: 'Casual Outfit',
    type: 'outfit',
    modelPath: '/models/accessories/casual_outfit.glb',
    defaultUnlocked: true
  },
  {
    id: 'outfit_business',
    name: 'Business Suit',
    type: 'outfit',
    modelPath: '/models/accessories/business_suit.glb',
    lifestyleItemType: 'luxury'
  },
  {
    id: 'outfit_sports',
    name: 'Sports Outfit',
    type: 'outfit',
    modelPath: '/models/accessories/sports_outfit.glb',
    lifestyleItemType: 'wellness'
  },
  {
    id: 'outfit_luxury',
    name: 'Designer Clothes',
    type: 'outfit',
    modelPath: '/models/accessories/designer_clothes.glb',
    lifestyleItemType: 'luxury',
    prestigeRequired: 50
  },
  
  // Eyewear
  {
    id: 'eyewear_glasses',
    name: 'Reading Glasses',
    type: 'eyewear',
    modelPath: '/models/accessories/reading_glasses.glb',
    lifestyleItemType: 'education'
  },
  {
    id: 'eyewear_sunglasses',
    name: 'Luxury Sunglasses',
    type: 'eyewear',
    modelPath: '/models/accessories/luxury_sunglasses.glb',
    lifestyleItemType: 'luxury',
    prestigeRequired: 30
  },
  
  // Other accessories
  {
    id: 'accessory_watch',
    name: 'Luxury Watch',
    type: 'accessory',
    modelPath: '/models/accessories/luxury_watch.glb',
    lifestyleItemType: 'luxury',
    prestigeRequired: 40
  },
  {
    id: 'accessory_headphones',
    name: 'Premium Headphones',
    type: 'accessory',
    modelPath: '/models/accessories/premium_headphones.glb',
    lifestyleItemId: 'lifestyle_music_streaming'
  }
];

/**
 * Get all accessories of a specific type
 */
export function getAccessoriesByType(type: AvatarAccessoryType): AvatarAccessoryMapping[] {
  return avatarAccessories.filter(accessory => accessory.type === type);
}

/**
 * Get an accessory by its ID
 */
export function getAccessoryById(id: string): AvatarAccessoryMapping | undefined {
  return avatarAccessories.find(accessory => accessory.id === id);
}

/**
 * Get all accessories that are available based on the player's owned lifestyle items
 */
export function getAvailableAccessories(lifestyleItems: LifestyleItem[]): AvatarAccessoryMapping[] {
  // Default unlocked accessories are always available
  const defaultAccessories = avatarAccessories.filter(accessory => accessory.defaultUnlocked);
  
  // Accessories unlocked by lifestyle items
  const unlockedByLifestyle: AvatarAccessoryMapping[] = [];
  
  // Check each accessory against the player's lifestyle items
  lifestyleItems.forEach(item => {
    // Find accessories unlocked by this specific item ID
    const byItemId = avatarAccessories.filter(
      accessory => accessory.lifestyleItemId === item.id
    );
    
    // Find accessories unlocked by this item type
    const byItemType = avatarAccessories.filter(
      accessory => accessory.lifestyleItemType === item.type
    );
    
    // Add all matches to our collection
    unlockedByLifestyle.push(...byItemId, ...byItemType);
  });
  
  // Combine default and unlocked accessories, removing duplicates
  const allAccessories = [...defaultAccessories, ...unlockedByLifestyle];
  const uniqueAccessories = Array.from(
    new Map(allAccessories.map(item => [item.id, item])).values()
  );
  
  return uniqueAccessories;
}