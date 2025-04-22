import * as THREE from 'three';

// Define the types for accessory mapping
export interface AccessoryMapping {
  // ID of the accessory for reference
  id: string;
  // Display name for the accessory
  name: string;
  // Path to the 3D model
  modelPath: string;
  // Type of lifestyle item this corresponds to
  lifestyleType: string | string[];
  // Specific lifestyle item IDs that trigger this accessory
  lifestyleIds: string[];
  // Minimum wealth required to unlock this accessory
  minWealth?: number;
  // Position offset for the accessory
  position?: [number, number, number];
  // Rotation for the accessory
  rotation?: [number, number, number];
  // Scale for the accessory (default 1)
  scale?: number;
  // Category for grouping accessories
  category: 'clothing' | 'accessories' | 'physical' | 'status';
  // Whether this accessory replaces others in the same category
  exclusive?: boolean;
  // Additional attributes affected by this accessory
  attributes?: {
    prestige?: number;
    happiness?: number;
    confidence?: number;
  };
}

// Define mappings between lifestyle items and 3D accessories
export const ACCESSORY_MAPPINGS: AccessoryMapping[] = [
  {
    id: 'business-suit',
    name: 'Business Suit',
    modelPath: '/models/accessories/business_suit.glb',
    lifestyleType: 'luxury',
    lifestyleIds: ['designer-clothes', 'designer-wardrobe', 'luxury-clothing'],
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: 1,
    category: 'clothing',
    exclusive: true,
    attributes: {
      prestige: 15,
      confidence: 10
    }
  },
  {
    id: 'sports-outfit',
    name: 'Sports Outfit',
    modelPath: '/models/accessories/sports_outfit.glb',
    lifestyleType: ['wellness', 'fitness'],
    lifestyleIds: ['gym-membership', 'personal-trainer', 'fitness-equipment'],
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: 1,
    category: 'clothing',
    exclusive: true,
    attributes: {
      happiness: 10,
      confidence: 5
    }
  }
];

// Helper function to find accessories for a given lifestyle item
export function findAccessoriesForLifestyleItem(itemId: string, itemType: string): AccessoryMapping[] {
  return ACCESSORY_MAPPINGS.filter(accessory => {
    // Check if the item ID directly matches
    if (accessory.lifestyleIds.includes(itemId)) {
      return true;
    }
    
    // Check if the item type matches
    if (typeof accessory.lifestyleType === 'string') {
      return accessory.lifestyleType === itemType;
    } else if (Array.isArray(accessory.lifestyleType)) {
      return accessory.lifestyleType.includes(itemType);
    }
    
    return false;
  });
}

// Helper function to get exclusive accessories per category
export function getExclusiveAccessories(accessories: AccessoryMapping[]): AccessoryMapping[] {
  const categoryMap: { [key: string]: AccessoryMapping } = {};
  
  // For each category, keep only the last exclusive accessory
  accessories.forEach(accessory => {
    if (accessory.exclusive) {
      categoryMap[accessory.category] = accessory;
    }
  });
  
  // Add all non-exclusive accessories
  const nonExclusives = accessories.filter(acc => !acc.exclusive);
  
  // Combine the exclusive categories with non-exclusive accessories
  return [...Object.values(categoryMap), ...nonExclusives];
}