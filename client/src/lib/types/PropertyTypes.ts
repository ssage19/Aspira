// Define property types to handle different property variants
export interface BaseProperty {
  id: string;
  name: string;
  type: string;
  price: number;
  squareFeet: number;
  location: string;
  income: number;
  expenses: number;
  description: string;
  appreciationRate: number;
}

export interface ResidentialProperty extends BaseProperty {
  bedrooms: number;
  bathrooms: number;
}

export interface CommercialProperty extends BaseProperty {
  roi?: number;
}

export interface LuxuryProperty extends ResidentialProperty {
  prestige?: number;
}

// Union type to handle all property variations
export type PropertyType = ResidentialProperty | CommercialProperty | LuxuryProperty;