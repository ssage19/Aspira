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
  // Outfits
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
  },
  {
    id: 'casual_outfit',
    name: 'Casual Outfit',
    category: 'outfit',
    modelPath: '/models/accessories/casual_outfit.glb',
    lifestyleIds: [],
    lifestyleType: ['habit', 'lifestyle'],
    scale: [1, 1, 1],
    position: [0, 0, 0],
    rotation: [0, 0, 0]
  },
  
  // Headwear
  {
    id: 'luxury_hat',
    name: 'Luxury Hat',
    category: 'headwear',
    modelPath: '/models/accessories/luxury_hat.glb',
    lifestyleIds: ['luxury_designer_clothing', 'luxury_exclusive_club'],
    lifestyleType: 'luxury',
    scale: [1, 1, 1],
    position: [0, 1.6, 0],
    rotation: [0, 0, 0],
    attachmentPoint: 'head'
  },
  {
    id: 'sports_headband',
    name: 'Sports Headband',
    category: 'headwear',
    modelPath: '/models/accessories/sports_headband.glb',
    lifestyleIds: ['wellness_gym_membership', 'wellness_sports_equipment'],
    lifestyleType: 'wellness',
    scale: [1, 1, 1],
    position: [0, 1.6, 0],
    rotation: [0, 0, 0],
    attachmentPoint: 'head'
  },
  
  // Eyewear
  {
    id: 'designer_glasses',
    name: 'Designer Glasses',
    category: 'eyewear',
    modelPath: '/models/accessories/designer_glasses.glb',
    lifestyleIds: ['luxury_designer_accessories'],
    lifestyleType: 'luxury',
    scale: [1, 1, 1],
    position: [0, 1.5, 0.1],
    rotation: [0, 0, 0],
    attachmentPoint: 'head'
  },
  {
    id: 'sports_sunglasses',
    name: 'Sports Sunglasses',
    category: 'eyewear',
    modelPath: '/models/accessories/sports_sunglasses.glb',
    lifestyleIds: ['wellness_sports_equipment', 'luxury_vacation_home'],
    lifestyleType: ['wellness', 'vacation'],
    scale: [1, 1, 1],
    position: [0, 1.5, 0.1],
    rotation: [0, 0, 0],
    attachmentPoint: 'head'
  },
  
  // Footwear
  {
    id: 'luxury_shoes',
    name: 'Luxury Shoes',
    category: 'footwear',
    modelPath: '/models/accessories/luxury_shoes.glb',
    lifestyleIds: ['luxury_designer_footwear', 'luxury_designer_clothing'],
    lifestyleType: 'luxury',
    scale: [1, 1, 1],
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    attachmentPoint: 'feet'
  },
  {
    id: 'running_shoes',
    name: 'Running Shoes',
    category: 'footwear',
    modelPath: '/models/accessories/running_shoes.glb',
    lifestyleIds: ['wellness_gym_membership', 'wellness_sports_equipment'],
    lifestyleType: 'wellness',
    scale: [1, 1, 1],
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    attachmentPoint: 'feet'
  },
  
  // Accessories
  {
    id: 'smartwatch',
    name: 'Smartwatch',
    category: 'accessory',
    modelPath: '/models/accessories/smartwatch.glb',
    lifestyleIds: ['wellness_fitness_tracker', 'tech_wearable_device'],
    lifestyleType: ['wellness', 'tech'],
    scale: [1, 1, 1],
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    attachmentPoint: 'wrist_left'
  },
  {
    id: 'luxury_watch',
    name: 'Luxury Watch',
    category: 'accessory',
    modelPath: '/models/accessories/luxury_watch.glb',
    lifestyleIds: ['luxury_designer_accessories', 'luxury_fine_watch'],
    lifestyleType: 'luxury',
    scale: [1, 1, 1],
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    attachmentPoint: 'wrist_left'
  },
  
  // Jewelry
  {
    id: 'necklace',
    name: 'Necklace',
    category: 'jewelry',
    modelPath: '/models/accessories/necklace.glb',
    lifestyleIds: ['luxury_fine_jewelry'],
    lifestyleType: 'luxury',
    scale: [1, 1, 1],
    position: [0, 1.2, 0],
    rotation: [0, 0, 0],
    attachmentPoint: 'neck'
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