// This file contains property data for the real estate market

export const residentialProperties = [
  {
    id: 'apartment_basic',
    name: 'City Apartment',
    type: 'residential',
    price: 250000,
    squareFeet: 800,
    bedrooms: 1,
    bathrooms: 1,
    location: 'Urban',
    income: 1800, // Monthly rent income
    expenses: 500, // Monthly expenses (HOA, etc.)
    description: 'Modern apartment in a convenient downtown location.',
    appreciationRate: 0.03 // Annual appreciation rate
  },
  {
    id: 'apartment_luxury',
    name: 'Luxury City Apartment',
    type: 'residential',
    price: 800000,
    squareFeet: 1500,
    bedrooms: 2,
    bathrooms: 2,
    location: 'Urban Premium',
    income: 4500,
    expenses: 1200,
    description: 'Upscale apartment with premium finishes and amazing city views.',
    appreciationRate: 0.04
  },
  {
    id: 'townhouse',
    name: 'Suburban Townhouse',
    type: 'residential',
    price: 450000,
    squareFeet: 1800,
    bedrooms: 3,
    bathrooms: 2.5,
    location: 'Suburban',
    income: 2800,
    expenses: 650,
    description: 'Spacious townhouse in a family-friendly neighborhood with good schools.',
    appreciationRate: 0.035
  },
  {
    id: 'single_family',
    name: 'Single Family Home',
    type: 'residential',
    price: 650000,
    squareFeet: 2500,
    bedrooms: 4,
    bathrooms: 3,
    location: 'Suburban',
    income: 3500,
    expenses: 800,
    description: 'Traditional family home with a yard in a well-established neighborhood.',
    appreciationRate: 0.03
  }
];

export const luxuryProperties = [
  {
    id: 'penthouse',
    name: 'Downtown Penthouse',
    type: 'mansion',
    price: 3500000,
    squareFeet: 4000,
    bedrooms: 3,
    bathrooms: 3.5,
    location: 'Urban Premium',
    income: 15000,
    expenses: 5000,
    description: 'Spectacular penthouse with panoramic city views, private elevator and rooftop terrace.',
    appreciationRate: 0.045,
    prestige: 50
  },
  {
    id: 'beach_house',
    name: 'Oceanfront Beach House',
    type: 'mansion',
    price: 5000000,
    squareFeet: 3800,
    bedrooms: 4,
    bathrooms: 4,
    location: 'Coastal',
    income: 20000,
    expenses: 6000,
    description: 'Stunning beachfront property with direct ocean access and breathtaking views.',
    appreciationRate: 0.05,
    prestige: 65
  },
  {
    id: 'mansion',
    name: 'Gated Estate',
    type: 'mansion',
    price: 8500000,
    squareFeet: 8000,
    bedrooms: 6,
    bathrooms: 7,
    location: 'Suburban Premium',
    income: 30000,
    expenses: 12000,
    description: 'Magnificent estate with lush gardens, pool, tennis court, and guest house.',
    appreciationRate: 0.035,
    prestige: 80
  },
  {
    id: 'villa',
    name: 'Mediterranean Villa',
    type: 'mansion',
    price: 12000000,
    squareFeet: 10000,
    bedrooms: 7,
    bathrooms: 9,
    location: 'Coastal Premium',
    income: 45000,
    expenses: 15000,
    description: 'Luxurious Mediterranean-style villa with private beach access, infinity pool, and vineyard.',
    appreciationRate: 0.04,
    prestige: 90
  }
];

export const commercialProperties = [
  {
    id: 'retail_small',
    name: 'Retail Storefront',
    type: 'commercial',
    price: 750000,
    squareFeet: 2000,
    location: 'Urban',
    income: 7500,
    expenses: 2000,
    description: 'Prime retail location with high foot traffic in shopping district.',
    appreciationRate: 0.03,
    roi: 0.088 // Return on investment (annual)
  },
  {
    id: 'office_small',
    name: 'Small Office Building',
    type: 'commercial',
    price: 1500000,
    squareFeet: 5000,
    location: 'Urban',
    income: 12500,
    expenses: 3500,
    description: 'Modern office building with multiple units suitable for professional services.',
    appreciationRate: 0.025,
    roi: 0.072
  },
  {
    id: 'mixed_use',
    name: 'Mixed-Use Development',
    type: 'commercial',
    price: 4500000,
    squareFeet: 15000,
    location: 'Urban',
    income: 35000,
    expenses: 12000,
    description: 'Combined retail and residential units in a trendy urban neighborhood.',
    appreciationRate: 0.04,
    roi: 0.082
  },
  {
    id: 'mall',
    name: 'Shopping Center',
    type: 'commercial',
    price: 15000000,
    squareFeet: 50000,
    location: 'Suburban',
    income: 120000,
    expenses: 45000,
    description: 'Established shopping center with anchor tenants and strong customer base.',
    appreciationRate: 0.02,
    roi: 0.06
  },
  {
    id: 'office_tower',
    name: 'Downtown Office Tower',
    type: 'commercial',
    price: 75000000,
    squareFeet: 200000,
    location: 'Urban Premium',
    income: 550000,
    expenses: 180000,
    description: 'Prestigious high-rise office building in central business district.',
    appreciationRate: 0.03,
    roi: 0.059
  }
];

export const industrialProperties = [
  {
    id: 'warehouse_small',
    name: 'Small Warehouse',
    type: 'industrial',
    price: 1200000,
    squareFeet: 10000,
    location: 'Industrial Zone',
    income: 9000,
    expenses: 2500,
    description: 'Distribution warehouse with loading docks and office space.',
    appreciationRate: 0.02,
    roi: 0.065
  },
  {
    id: 'manufacturing',
    name: 'Manufacturing Facility',
    type: 'industrial',
    price: 3500000,
    squareFeet: 25000,
    location: 'Industrial Zone',
    income: 25000,
    expenses: 7500,
    description: 'Versatile manufacturing space with heavy power capacity and infrastructure.',
    appreciationRate: 0.02,
    roi: 0.06
  },
  {
    id: 'logistics_center',
    name: 'Logistics Center',
    type: 'industrial',
    price: 8000000,
    squareFeet: 75000,
    location: 'Transport Hub',
    income: 55000,
    expenses: 15000,
    description: 'Strategic distribution center near major transportation routes.',
    appreciationRate: 0.025,
    roi: 0.06
  },
  {
    id: 'industrial_park',
    name: 'Industrial Park',
    type: 'industrial',
    price: 20000000,
    squareFeet: 150000,
    location: 'Industrial Zone',
    income: 140000,
    expenses: 40000,
    description: 'Multi-tenant industrial complex with various unit sizes and shared amenities.',
    appreciationRate: 0.025,
    roi: 0.06
  }
];

// Helper function to get all properties
export const getAllProperties = () => {
  return [
    ...residentialProperties,
    ...luxuryProperties,
    ...commercialProperties,
    ...industrialProperties
  ];
};

// Get properties by type
export const getPropertiesByType = (type: string) => {
  switch(type) {
    case 'residential':
      return residentialProperties;
    case 'mansion':
      return luxuryProperties;
    case 'commercial':
      return commercialProperties;
    case 'industrial':
      return industrialProperties;
    default:
      return getAllProperties();
  }
};

// Calculate monthly mortgage payment
export const calculateMortgage = (propertyPrice: number, downPaymentPercent: number, interestRate: number, termYears: number) => {
  const downPayment = propertyPrice * (downPaymentPercent / 100);
  const loanAmount = propertyPrice - downPayment;
  const monthlyRate = interestRate / 100 / 12;
  const numberOfPayments = termYears * 12;
  
  const monthlyPayment = loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments) / (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
  
  return {
    downPayment,
    loanAmount,
    monthlyPayment
  };
};
