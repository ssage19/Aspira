import { TechProduct, Fashion, Tattoo, LifestyleAttributes } from './lifestyleItems';
import { Hobby } from './hobbies';

export const techProducts: TechProduct[] = [
  {
    id: 'flagship_smartphone',
    name: 'Latest Flagship Smartphone',
    type: 'tech',
    price: 1500,
    maintenanceCost: 50,
    description: 'The latest premium smartphone with cutting-edge technology and features.',
    prestige: 5,
    happiness: 15,
    unique: false,
    durationInDays: 730, // 2 years before obsolescence
    attributes: {
      socialStatus: 5,
      healthImpact: -2, // Screen time impact
      timeCommitment: 2,
      environmentalImpact: -10,
      stressReduction: 10,
      skillDevelopment: 5,
      wealthIndicator: 1,
      exclusivity: 5,
      luxuryTier: 'entry'
    }
  },
  {
    id: 'premium_laptop',
    name: 'Ultra-Thin Premium Laptop',
    type: 'tech',
    price: 3500,
    maintenanceCost: 100,
    description: 'Ultra-portable premium laptop with exceptional build quality and performance.',
    prestige: 8,
    happiness: 12,
    unique: false,
    durationInDays: 1095, // 3 years before obsolescence
    attributes: {
      socialStatus: 8,
      healthImpact: -1,
      timeCommitment: 5,
      environmentalImpact: -15,
      stressReduction: 5,
      skillDevelopment: 20,
      wealthIndicator: 2,
      exclusivity: 15,
      luxuryTier: 'entry'
    }
  },
  {
    id: 'wireless_headphones',
    name: 'Premium Noise-Cancelling Headphones',
    type: 'tech',
    price: 800,
    maintenanceCost: 20,
    description: 'High-end wireless headphones with best-in-class noise cancellation and sound quality.',
    prestige: 3,
    happiness: 10,
    unique: false,
    durationInDays: 1095, // 3 years
    attributes: {
      socialStatus: 3,
      healthImpact: 0,
      timeCommitment: 0,
      environmentalImpact: -5,
      stressReduction: 25,
      wealthIndicator: 1,
      exclusivity: 5,
      luxuryTier: 'entry'
    }
  },
  {
    id: 'gaming_pc',
    name: 'Ultimate Gaming PC Setup',
    type: 'tech',
    price: 8000,
    maintenanceCost: 500,
    description: 'Custom high-end gaming PC with top-tier graphics, cooling, and peripherals.',
    prestige: 10,
    happiness: 30,
    unique: false,
    durationInDays: 1095, // 3 years
    attributes: {
      socialStatus: 12,
      healthImpact: -5,
      timeCommitment: 14,
      environmentalImpact: -25,
      stressReduction: 30,
      skillDevelopment: 15,
      wealthIndicator: 3,
      exclusivity: 30,
      luxuryTier: 'mid'
    }
  },
  {
    id: 'home_theater',
    name: 'Audiophile Home Theater System',
    type: 'tech',
    price: 25000,
    maintenanceCost: 1000,
    description: 'Complete home theater setup with reference-grade audio and cutting-edge video technology.',
    prestige: 20,
    happiness: 25,
    unique: false,
    durationInDays: 1825, // 5 years
    attributes: {
      socialStatus: 20,
      healthImpact: -2,
      timeCommitment: 5,
      environmentalImpact: -30,
      stressReduction: 35,
      wealthIndicator: 5,
      exclusivity: 40,
      luxuryTier: 'high'
    }
  },
  {
    id: 'smart_home',
    name: 'Full Home Automation Suite',
    type: 'tech',
    price: 50000,
    maintenanceCost: 2000,
    description: 'Comprehensive smart home system with integrated security, lighting, climate, and entertainment control.',
    prestige: 25,
    happiness: 20,
    unique: false,
    durationInDays: 1825, // 5 years before major upgrades needed
    attributes: {
      socialStatus: 25,
      healthImpact: 5,
      timeCommitment: 0,
      environmentalImpact: -20,
      stressReduction: 40,
      wealthIndicator: 6,
      exclusivity: 45,
      luxuryTier: 'high'
    }
  },
  {
    id: 'electric_vehicle',
    name: 'Premium Electric Vehicle',
    type: 'tech',
    price: 100000,
    maintenanceCost: 2500,
    description: 'Cutting-edge electric vehicle with the latest autonomous driving features and luxury appointments.',
    prestige: 35,
    happiness: 30,
    unique: false,
    durationInDays: 1825, // 5 years
    attributes: {
      socialStatus: 35,
      healthImpact: 10,
      timeCommitment: 0,
      environmentalImpact: 30, // Positive environmental impact
      stressReduction: 25,
      wealthIndicator: 7,
      exclusivity: 60,
      luxuryTier: 'high'
    }
  },
  {
    id: 'drone',
    name: 'Professional Camera Drone System',
    type: 'tech',
    price: 12000,
    maintenanceCost: 500,
    description: 'Professional aerial imaging system with 8K camera, long flight time, and advanced tracking capabilities.',
    prestige: 15,
    happiness: 25,
    unique: false,
    durationInDays: 1095, // 3 years
    attributes: {
      socialStatus: 15,
      healthImpact: 0,
      timeCommitment: 10,
      environmentalImpact: -10,
      stressReduction: 30,
      skillDevelopment: 25,
      wealthIndicator: 4,
      exclusivity: 35,
      luxuryTier: 'mid'
    }
  },
  {
    id: 'vr_system',
    name: 'Premium VR Experience Setup',
    type: 'tech',
    price: 5000,
    maintenanceCost: 300,
    description: 'Complete virtual reality system with motion tracking, haptic feedback, and the latest headset technology.',
    prestige: 10,
    happiness: 35,
    unique: false,
    durationInDays: 1095, // 3 years
    attributes: {
      socialStatus: 10,
      healthImpact: -5,
      timeCommitment: 12,
      environmentalImpact: -15,
      stressReduction: 30,
      skillDevelopment: 20,
      wealthIndicator: 3,
      exclusivity: 25,
      luxuryTier: 'mid'
    }
  },
  {
    id: 'digital_art_studio',
    name: 'Professional Digital Art Workstation',
    type: 'tech',
    price: 15000,
    maintenanceCost: 800,
    description: 'Complete digital art studio with top-of-the-line drawing tablet, color-calibrated displays, and professional software.',
    prestige: 15,
    happiness: 30,
    unique: false,
    durationInDays: 1825, // 5 years
    attributes: {
      socialStatus: 15,
      healthImpact: -2,
      timeCommitment: 15,
      environmentalImpact: -20,
      stressReduction: 35,
      skillDevelopment: 40,
      wealthIndicator: 4,
      exclusivity: 30,
      luxuryTier: 'mid'
    }
  }
];

export const fashionItems: Fashion[] = [
  {
    id: 'designer_shoes',
    name: 'Luxury Designer Shoes',
    type: 'fashion',
    price: 1200,
    maintenanceCost: 100,
    description: 'Handcrafted shoes from a prestigious designer label.',
    prestige: 8,
    happiness: 15,
    unique: false,
    durationInDays: 365, // 1 year
    attributes: {
      socialStatus: 10,
      healthImpact: 0,
      timeCommitment: 0,
      environmentalImpact: -5,
      stressReduction: 5,
      wealthIndicator: 2,
      exclusivity: 15,
      luxuryTier: 'entry'
    }
  },
  {
    id: 'designer_handbag',
    name: 'Iconic Designer Handbag',
    type: 'fashion',
    price: 5000,
    maintenanceCost: 200,
    description: 'Instantly recognizable handbag from a world-famous luxury brand.',
    prestige: 15,
    happiness: 20,
    unique: false,
    durationInDays: 730, // 2 years
    attributes: {
      socialStatus: 20,
      healthImpact: 0,
      timeCommitment: 0,
      environmentalImpact: -10,
      stressReduction: 10,
      wealthIndicator: 4,
      exclusivity: 30,
      luxuryTier: 'mid'
    }
  },
  {
    id: 'designer_outfit',
    name: 'Complete Designer Outfit',
    type: 'fashion',
    price: 8000,
    maintenanceCost: 500,
    description: 'Head-to-toe current season designer outfit with perfect coordination.',
    prestige: 20,
    happiness: 25,
    unique: false,
    durationInDays: 365, // 1 year before going out of fashion
    attributes: {
      socialStatus: 25,
      healthImpact: 0,
      timeCommitment: 1,
      environmentalImpact: -15,
      stressReduction: 15,
      wealthIndicator: 5,
      exclusivity: 35,
      luxuryTier: 'mid'
    }
  },
  {
    id: 'luxury_watch',
    name: 'Luxury Timepiece',
    type: 'fashion',
    price: 15000,
    maintenanceCost: 500,
    description: 'Exceptional watch from a prestigious manufacturer combining craftsmanship and style.',
    prestige: 25,
    happiness: 20,
    unique: false,
    durationInDays: 3650, // 10 years
    attributes: {
      socialStatus: 30,
      healthImpact: 0,
      timeCommitment: 0,
      environmentalImpact: -5,
      stressReduction: 10,
      wealthIndicator: 6,
      exclusivity: 45,
      luxuryTier: 'high'
    }
  },
  {
    id: 'designer_wardrobe',
    name: 'Seasonal Designer Wardrobe',
    type: 'fashion',
    price: 25000,
    maintenanceCost: 2000,
    description: 'Complete season\'s wardrobe from top designers, curated by a personal stylist.',
    prestige: 30,
    happiness: 30,
    unique: false,
    durationInDays: 365, // 1 year
    attributes: {
      socialStatus: 35,
      healthImpact: 5,
      timeCommitment: 3,
      environmentalImpact: -25,
      stressReduction: 20,
      wealthIndicator: 7,
      exclusivity: 50,
      luxuryTier: 'high'
    }
  },
  {
    id: 'luxury_sunglasses',
    name: 'Premium Designer Sunglasses',
    type: 'fashion',
    price: 800,
    maintenanceCost: 50,
    description: 'High-end sunglasses with superior optics and iconic design.',
    prestige: 5,
    happiness: 10,
    unique: false,
    durationInDays: 730, // 2 years
    attributes: {
      socialStatus: 8,
      healthImpact: 2,
      timeCommitment: 0,
      environmentalImpact: -3,
      stressReduction: 5,
      wealthIndicator: 1,
      exclusivity: 10,
      luxuryTier: 'entry'
    }
  },
  {
    id: 'bespoke_suit',
    name: 'Fully Bespoke Suit',
    type: 'fashion',
    price: 10000,
    maintenanceCost: 500,
    description: 'Hand-tailored suit from a renowned tailor, made with premium fabrics and perfect fit.',
    prestige: 20,
    happiness: 25,
    unique: true,
    durationInDays: 1825, // 5 years
    attributes: {
      socialStatus: 25,
      healthImpact: 2,
      timeCommitment: 2,
      environmentalImpact: -8,
      stressReduction: 15,
      wealthIndicator: 5,
      exclusivity: 40,
      luxuryTier: 'high'
    }
  },
  {
    id: 'couture_gown',
    name: 'Haute Couture Gown',
    type: 'fashion',
    price: 50000,
    maintenanceCost: 2000,
    description: 'One-of-a-kind haute couture creation from a legendary fashion house.',
    prestige: 40,
    happiness: 35,
    unique: true,
    durationInDays: 730, // 2 years
    attributes: {
      socialStatus: 45,
      healthImpact: 0,
      timeCommitment: 1,
      environmentalImpact: -20,
      stressReduction: 25,
      wealthIndicator: 8,
      exclusivity: 75,
      luxuryTier: 'ultra'
    }
  }
];

export const tattoos: Tattoo[] = [
  {
    id: 'small_tattoo',
    name: 'Small Artistic Tattoo',
    type: 'tattoos',
    price: 300,
    maintenanceCost: 0,
    description: 'Small, tasteful tattoo done by a skilled artist.',
    prestige: 2,
    happiness: 10,
    unique: true,
    attributes: {
      socialStatus: 2,
      healthImpact: -1,
      timeCommitment: 0,
      environmentalImpact: 0,
      stressReduction: 5,
      wealthIndicator: 1,
      exclusivity: 5,
      luxuryTier: 'entry'
    }
  },
  {
    id: 'medium_tattoo',
    name: 'Medium Custom Tattoo',
    type: 'tattoos',
    price: 1000,
    maintenanceCost: 0,
    description: 'Medium-sized, detailed custom tattoo artwork done by a recognized artist.',
    prestige: 5,
    happiness: 15,
    unique: true,
    attributes: {
      socialStatus: 5,
      healthImpact: -2,
      timeCommitment: 0,
      environmentalImpact: 0,
      stressReduction: 8,
      wealthIndicator: 2,
      exclusivity: 15,
      luxuryTier: 'entry'
    }
  },
  {
    id: 'sleeve_tattoo',
    name: 'Full Sleeve Tattoo',
    type: 'tattoos',
    price: 5000,
    maintenanceCost: 100,
    description: 'Complete sleeve tattoo with cohesive artwork and premium design.',
    prestige: 10,
    happiness: 25,
    unique: true,
    attributes: {
      socialStatus: 15,
      healthImpact: -3,
      timeCommitment: 1,
      environmentalImpact: 0,
      stressReduction: 15,
      wealthIndicator: 3,
      exclusivity: 30,
      luxuryTier: 'mid'
    }
  },
  {
    id: 'celebrity_artist',
    name: 'Celebrity Tattoo Artist Piece',
    type: 'tattoos',
    price: 15000,
    maintenanceCost: 200,
    description: 'Exclusive tattoo created by a world-famous tattoo artist with a years-long waiting list.',
    prestige: 25,
    happiness: 35,
    unique: true,
    attributes: {
      socialStatus: 30,
      healthImpact: -3,
      timeCommitment: 1,
      environmentalImpact: 0,
      stressReduction: 20,
      wealthIndicator: 6,
      exclusivity: 75,
      luxuryTier: 'high'
    }
  },
  {
    id: 'bodysuit_tattoo',
    name: 'Japanese Traditional Bodysuit',
    type: 'tattoos',
    price: 30000,
    maintenanceCost: 500,
    description: 'Complete traditional Japanese bodysuit tattoo done over multiple sessions by a master artist.',
    prestige: 35,
    happiness: 40,
    unique: true,
    attributes: {
      socialStatus: 40,
      healthImpact: -5,
      timeCommitment: 3,
      environmentalImpact: 0,
      stressReduction: 25,
      wealthIndicator: 7,
      exclusivity: 85,
      luxuryTier: 'ultra'
    }
  }
];

export const hobbies: Hobby[] = [
  {
    id: 'photography',
    name: 'Professional Photography Kit',
    type: 'hobbies',
    category: 'creative',
    description: 'Complete high-end camera system with premium lenses and accessories.',
    prestige: 10,
    happiness: 30,
    unique: false,
    attributes: {
      timeCommitment: 10,
      socialValue: 10,
      healthImpact: 5,
      stressReduction: 25,
      skillDevelopment: 30,
      costPerMonth: 500,
      initialInvestment: 7500
    }
  },
  {
    id: 'wine_collection',
    name: 'Fine Wine Collection',
    type: 'hobbies',
    category: 'leisure',
    description: 'Curated collection of rare and valuable wines with proper storage.',
    prestige: 25,
    happiness: 25,
    unique: false,
    attributes: {
      timeCommitment: 5,
      socialValue: 30,
      healthImpact: -5,
      stressReduction: 20,
      skillDevelopment: 15,
      costPerMonth: 2000,
      initialInvestment: 25000
    }
  },
  {
    id: 'music_studio',
    name: 'Home Music Studio',
    type: 'hobbies',
    category: 'creative',
    description: 'Professional-quality music production studio with instruments, recording equipment, and acoustic treatment.',
    prestige: 15,
    happiness: 35,
    unique: false,
    attributes: {
      timeCommitment: 15,
      socialValue: 15,
      healthImpact: 10,
      stressReduction: 40,
      skillDevelopment: 35,
      costPerMonth: 1000,
      initialInvestment: 15000
    }
  },
  {
    id: 'art_studio',
    name: 'Personal Art Studio',
    type: 'hobbies',
    category: 'creative',
    description: 'Fully equipped art studio with premium materials, equipment, and ideal lighting.',
    prestige: 20,
    happiness: 40,
    unique: false,
    attributes: {
      timeCommitment: 20,
      socialValue: 20,
      healthImpact: 8,
      stressReduction: 45,
      skillDevelopment: 40,
      costPerMonth: 1500,
      initialInvestment: 20000
    }
  },
  {
    id: 'culinary_kitchen',
    name: 'Chef-Quality Kitchen',
    type: 'hobbies',
    category: 'creative',
    description: 'Restaurant-grade kitchen with premium appliances, tools, and cooking surfaces.',
    prestige: 30,
    happiness: 45,
    unique: false,
    attributes: {
      timeCommitment: 15,
      socialValue: 35,
      healthImpact: 15,
      stressReduction: 35,
      skillDevelopment: 30,
      costPerMonth: 3000,
      initialInvestment: 100000
    }
  },
  {
    id: 'workshop',
    name: 'Ultimate Workshop',
    type: 'hobbies',
    category: 'creative',
    description: 'Complete workshop with high-end tools for woodworking, metalworking, and other crafts.',
    prestige: 20,
    happiness: 50,
    unique: false,
    attributes: {
      timeCommitment: 25,
      socialValue: 15,
      healthImpact: -5,
      stressReduction: 40,
      skillDevelopment: 45,
      costPerMonth: 2500,
      initialInvestment: 50000
    }
  },
  {
    id: 'pilot_license',
    name: 'Private Pilot License & Aircraft',
    type: 'hobbies',
    category: 'leisure',
    description: 'Complete pilot training, license, and small private aircraft ownership.',
    prestige: 50,
    happiness: 60,
    unique: false,
    attributes: {
      timeCommitment: 30,
      socialValue: 60,
      healthImpact: 0,
      stressReduction: 30,
      skillDevelopment: 40,
      costPerMonth: 15000,
      initialInvestment: 250000
    }
  }
];