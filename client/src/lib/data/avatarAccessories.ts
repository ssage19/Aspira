/**
 * Accessory mapping types for connecting lifestyle items to visual accessories
 */

export type AccessoryCategory = 'outfit' | 'headwear' | 'eyewear' | 'footwear' | 'accessory' | 'jewelry';

export interface AccessoryMapping {
  id: string;
  name: string;
  category: AccessoryCategory;
  modelPath: string;
  lifestyleIds: string[]; // IDs of lifestyle items that grant this accessory
  lifestyleType?: string | string[]; // Type(s) of lifestyle items that grant this accessory
  scale?: [number, number, number];
  position?: [number, number, number];
  rotation?: [number, number, number];
  attachmentPoint?: string; // Which part of the base model to attach to
}

// Define the accessory mappings
export const ACCESSORY_MAPPINGS: AccessoryMapping[] = [
  // Outfits - Only include models that we've actually generated
  {
    id: 'business_suit',
    name: 'Business Suit',
    category: 'outfit',
    modelPath: '/models/accessories/business_suit.glb',
    lifestyleIds: ['luxury_tailored_suit', 'luxury_designer_clothing'],
    lifestyleType: 'luxury',
    scale: [1, 1, 1],
    position: [0, 0, 0],
    rotation: [0, 0, 0]
  },
  {
    id: 'sports_outfit',
    name: 'Sports Outfit',
    category: 'outfit',
    modelPath: '/models/accessories/sports_outfit.glb',
    lifestyleIds: ['wellness_gym_membership', 'wellness_personal_trainer'],
    lifestyleType: 'wellness',
    scale: [1, 1, 1],
    position: [0, 0, 0],
    rotation: [0, 0, 0]
  }
];

/**
 * Get the accessory mappings for a specific lifestyle item
 * @param lifestyleItemId - The ID of the lifestyle item
 */
export function getAccessoriesForLifestyleItem(lifestyleItemId: string): AccessoryMapping[] {
  return ACCESSORY_MAPPINGS.filter(accessory => accessory.lifestyleIds.includes(lifestyleItemId));
}

/**
 * Get the accessory mappings for a specific lifestyle type
 * @param lifestyleType - The type of lifestyle
 */
export function getAccessoriesForLifestyleType(lifestyleType: string): AccessoryMapping[] {
  return ACCESSORY_MAPPINGS.filter(accessory => {
    if (typeof accessory.lifestyleType === 'string') {
      return accessory.lifestyleType === lifestyleType;
    } else if (Array.isArray(accessory.lifestyleType)) {
      return accessory.lifestyleType.includes(lifestyleType);
    }
    return false;
  });
}