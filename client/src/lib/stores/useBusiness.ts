import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'sonner';
import { formatCurrency } from '../utils';
import { registerStore, getStore } from '../utils/storeRegistry';
// Instead of direct imports, we'll get these stores from the registry
// in the methods where they're needed

// Types for business-related data
export type BusinessType = 
  'restaurant' | 
  'retail' | 
  'tech' | 
  'consulting' | 
  'manufacturing' | 
  'real_estate' | 
  'creative';

export interface BusinessEmployee {
  id: string;
  role: string;
  salary: number;
  productivity: number;
  morale: number;
  hireDate: number; // timestamp
}

export interface BusinessUpgrade {
  id: string;
  name: string;
  description: string;
  cost: number;
  effect: {
    revenueMultiplier?: number;
    expenseReduction?: number;
    qualityBoost?: number;
    employeeProductivity?: number;
    customerSatisfaction?: number;
    maxCapacity?: number;
  };
  purchased: boolean;
  purchasedDate?: number; // timestamp
}

// Marketing campaign interface
export interface MarketingCampaign {
  id: string;
  name: string;
  description: string;
  cost: number; // cost per month
  duration: number; // in days
  startDate: number; // timestamp
  endDate: number; // timestamp
  active: boolean;
  effect: {
    customerAcquisition: number; // new customers per day
    reputationBoost: number; // reputation points
    customerSatisfactionBoost: number; // satisfaction points
    revenueMultiplier: number; // revenue multiplier
  };
}

// Internal investment interface
export interface InternalInvestment {
  id: string;
  name: string;
  description: string;
  category: 'training' | 'research' | 'equipment' | 'facilities' | 'operations';
  cost: number;
  implementationDate: number; // timestamp
  active: boolean;
  effect: {
    qualityBoost?: number;
    employeeProductivity?: number;
    customerSatisfaction?: number;
    expenseReduction?: number;
    reputationBoost?: number;
  };
}

// Revenue breakdown interface
export interface RevenueBreakdown {
  baseRevenue: number; // basic revenue from business operation
  marketingRevenue: number; // additional revenue from marketing
  qualityPremium: number; // premium from high quality
  reputationRevenue: number; // revenue from reputation
  loyaltyRevenue: number; // revenue from customer loyalty/satisfaction
  seasonalRevenue: number; // seasonal effects on revenue
  specialEventsRevenue: number; // revenue from special events or promotions
}

export interface Business {
  id: string;
  name: string;
  type: BusinessType;
  description: string;
  foundedDate: number; // timestamp
  location: string;
  initialInvestment: number;
  currentValue: number;
  cash: number;
  revenue: number;
  expenses: number;
  profitMargin: number;
  customerSatisfaction: number;
  quality: number;
  capacity: number;
  currentCapacity: number;
  employees: BusinessEmployee[];
  upgrades: BusinessUpgrade[];
  level: number;
  reputation: number;
  autoManage: boolean;
  lastProcessed: number; // timestamp
  
  // New fields for enhanced business features
  marketingBudget: number; // Monthly marketing budget
  marketingCampaigns: MarketingCampaign[]; // Active marketing campaigns
  internalInvestments: InternalInvestment[]; // Internal business investments
  isOpen: boolean; // Whether the business is open and operating
  revenueBreakdown: RevenueBreakdown; // Detailed revenue sources
}

// Starting business templates
export const businessTemplates: Record<BusinessType, Omit<Business, 'id' | 'name' | 'foundedDate' | 'employees' | 'upgrades' | 'lastProcessed'>> = {
  restaurant: {
    type: 'restaurant',
    description: 'A food service establishment that serves meals to customers',
    location: 'Local',
    initialInvestment: 75000,
    currentValue: 75000,
    cash: 5000,
    revenue: 0,
    expenses: 0,
    profitMargin: 0.2,
    customerSatisfaction: 75,
    quality: 70,
    capacity: 50,
    currentCapacity: 0,
    level: 1,
    reputation: 50,
    autoManage: false,
    // New fields
    marketingBudget: 0,
    marketingCampaigns: [],
    internalInvestments: [],
    isOpen: false, // Start closed until minimum employees are hired
    revenueBreakdown: {
      baseRevenue: 0,
      marketingRevenue: 0,
      qualityPremium: 0,
      reputationRevenue: 0,
      loyaltyRevenue: 0,
      seasonalRevenue: 0,
      specialEventsRevenue: 0
    }
  },
  retail: {
    type: 'retail',
    description: 'A shop that sells goods directly to consumers',
    location: 'Local',
    initialInvestment: 50000,
    currentValue: 50000,
    cash: 7500,
    revenue: 0,
    expenses: 0,
    profitMargin: 0.25,
    customerSatisfaction: 70,
    quality: 75,
    capacity: 100,
    currentCapacity: 0,
    level: 1,
    reputation: 50,
    autoManage: false,
    // New fields
    marketingBudget: 0,
    marketingCampaigns: [],
    internalInvestments: [],
    isOpen: false, // Start closed until minimum employees are hired
    revenueBreakdown: {
      baseRevenue: 0,
      marketingRevenue: 0,
      qualityPremium: 0,
      reputationRevenue: 0,
      loyaltyRevenue: 0,
      seasonalRevenue: 0,
      specialEventsRevenue: 0
    }
  },
  tech: {
    type: 'tech',
    description: 'A technology-focused company that develops software or hardware',
    location: 'Local',
    initialInvestment: 100000,
    currentValue: 100000,
    cash: 15000,
    revenue: 0,
    expenses: 0,
    profitMargin: 0.4,
    customerSatisfaction: 65,
    quality: 80,
    capacity: 25,
    currentCapacity: 0,
    level: 1,
    reputation: 45,
    autoManage: false,
    // New fields
    marketingBudget: 0,
    marketingCampaigns: [],
    internalInvestments: [],
    isOpen: false, // Start closed until minimum employees are hired
    revenueBreakdown: {
      baseRevenue: 0,
      marketingRevenue: 0,
      qualityPremium: 0,
      reputationRevenue: 0,
      loyaltyRevenue: 0,
      seasonalRevenue: 0,
      specialEventsRevenue: 0
    }
  },
  consulting: {
    type: 'consulting',
    description: 'A professional services firm that provides expert advice',
    location: 'Local',
    initialInvestment: 35000,
    currentValue: 35000,
    cash: 10000,
    revenue: 0,
    expenses: 0,
    profitMargin: 0.45,
    customerSatisfaction: 80,
    quality: 85,
    capacity: 20,
    currentCapacity: 0,
    level: 1,
    reputation: 60,
    autoManage: false,
    // New fields
    marketingBudget: 0,
    marketingCampaigns: [],
    internalInvestments: [],
    isOpen: false, // Start closed until minimum employees are hired
    revenueBreakdown: {
      baseRevenue: 0,
      marketingRevenue: 0,
      qualityPremium: 0,
      reputationRevenue: 0,
      loyaltyRevenue: 0,
      seasonalRevenue: 0,
      specialEventsRevenue: 0
    }
  },
  manufacturing: {
    type: 'manufacturing',
    description: 'A facility that produces physical goods from raw materials',
    location: 'Local',
    initialInvestment: 200000,
    currentValue: 200000,
    cash: 20000,
    revenue: 0,
    expenses: 0,
    profitMargin: 0.3,
    customerSatisfaction: 60,
    quality: 75,
    capacity: 75,
    currentCapacity: 0,
    level: 1,
    reputation: 55,
    autoManage: false,
    // New fields
    marketingBudget: 0,
    marketingCampaigns: [],
    internalInvestments: [],
    isOpen: false, // Start closed until minimum employees are hired
    revenueBreakdown: {
      baseRevenue: 0,
      marketingRevenue: 0,
      qualityPremium: 0,
      reputationRevenue: 0,
      loyaltyRevenue: 0,
      seasonalRevenue: 0,
      specialEventsRevenue: 0
    }
  },
  real_estate: {
    type: 'real_estate',
    description: 'A business that buys, sells, and manages properties',
    location: 'Local',
    initialInvestment: 250000,
    currentValue: 250000,
    cash: 25000,
    revenue: 0,
    expenses: 0,
    profitMargin: 0.35,
    customerSatisfaction: 70,
    quality: 80,
    capacity: 15,
    currentCapacity: 0,
    level: 1,
    reputation: 65,
    autoManage: false,
    // New fields
    marketingBudget: 0,
    marketingCampaigns: [],
    internalInvestments: [],
    isOpen: false, // Start closed until minimum employees are hired
    revenueBreakdown: {
      baseRevenue: 0,
      marketingRevenue: 0,
      qualityPremium: 0,
      reputationRevenue: 0,
      loyaltyRevenue: 0,
      seasonalRevenue: 0,
      specialEventsRevenue: 0
    }
  },
  creative: {
    type: 'creative',
    description: 'A creative services business like a design studio or production company',
    location: 'Local',
    initialInvestment: 40000,
    currentValue: 40000,
    cash: 8000,
    revenue: 0,
    expenses: 0,
    profitMargin: 0.35,
    customerSatisfaction: 85,
    quality: 90,
    capacity: 30,
    currentCapacity: 0,
    level: 1,
    reputation: 70,
    autoManage: false,
    // New fields
    marketingBudget: 0,
    marketingCampaigns: [],
    internalInvestments: [],
    isOpen: false, // Start closed until minimum employees are hired
    revenueBreakdown: {
      baseRevenue: 0,
      marketingRevenue: 0,
      qualityPremium: 0,
      reputationRevenue: 0,
      loyaltyRevenue: 0,
      seasonalRevenue: 0,
      specialEventsRevenue: 0
    }
  }
};

// Available roles for employees
export const availableRoles: Record<BusinessType, string[]> = {
  restaurant: ['Chef', 'Server', 'Host', 'Manager', 'Dishwasher', 'Bartender'],
  retail: ['Sales Associate', 'Cashier', 'Store Manager', 'Visual Merchandiser', 'Inventory Specialist'],
  tech: ['Developer', 'Designer', 'Product Manager', 'QA Tester', 'CTO', 'Support Specialist'],
  consulting: ['Consultant', 'Analyst', 'Partner', 'Associate', 'Researcher', 'Admin Assistant'],
  manufacturing: ['Line Worker', 'Quality Control', 'Supervisor', 'Engineer', 'Maintenance', 'Logistics Manager'],
  real_estate: ['Agent', 'Property Manager', 'Broker', 'Appraiser', 'Admin', 'Marketing Specialist'],
  creative: ['Designer', 'Creative Director', 'Copywriter', 'Artist', 'Producer', 'Account Manager']
};

// Available upgrades for businesses
export const availableUpgrades: Record<BusinessType, Omit<BusinessUpgrade, 'purchased' | 'purchasedDate'>[]> = {
  restaurant: [
    {
      id: 'restaurant_kitchen',
      name: 'Kitchen Upgrade',
      description: 'State-of-the-art kitchen equipment improving food quality and preparation speed',
      cost: 25000,
      effect: {
        revenueMultiplier: 1.1,
        qualityBoost: 10,
        employeeProductivity: 0.15
      }
    },
    {
      id: 'restaurant_decor',
      name: 'Interior Renovation',
      description: 'Stylish new décor that enhances the dining experience',
      cost: 15000,
      effect: {
        customerSatisfaction: 15,
        maxCapacity: 10
      }
    },
    {
      id: 'restaurant_pos',
      name: 'Modern POS System',
      description: 'Digital ordering and payment system that streamlines operations',
      cost: 8000,
      effect: {
        expenseReduction: 0.08,
        employeeProductivity: 0.1
      }
    }
  ],
  retail: [
    {
      id: 'retail_inventory',
      name: 'Inventory Management System',
      description: 'Digital system for tracking and optimizing inventory',
      cost: 12000,
      effect: {
        expenseReduction: 0.12,
        employeeProductivity: 0.08
      }
    },
    {
      id: 'retail_displays',
      name: 'Modern Display Cases',
      description: 'Attractive displays that showcase products better',
      cost: 7500,
      effect: {
        revenueMultiplier: 1.08,
        customerSatisfaction: 10
      }
    },
    {
      id: 'retail_ecommerce',
      name: 'E-commerce Platform',
      description: 'Online store to complement your physical location',
      cost: 20000,
      effect: {
        maxCapacity: 50,
        revenueMultiplier: 1.15
      }
    }
  ],
  tech: [
    {
      id: 'tech_servers',
      name: 'Server Infrastructure',
      description: 'High-performance servers for your digital products',
      cost: 30000,
      effect: {
        qualityBoost: 15,
        maxCapacity: 30
      }
    },
    {
      id: 'tech_software',
      name: 'Development Tools',
      description: 'Premium software and tools for your development team',
      cost: 15000,
      effect: {
        employeeProductivity: 0.2,
        qualityBoost: 8
      }
    },
    {
      id: 'tech_ai',
      name: 'AI Integration',
      description: 'Cutting-edge AI capabilities for your products',
      cost: 45000,
      effect: {
        revenueMultiplier: 1.25,
        customerSatisfaction: 12
      }
    }
  ],
  consulting: [
    {
      id: 'consulting_crm',
      name: 'CRM System',
      description: 'Advanced client relationship management software',
      cost: 10000,
      effect: {
        customerSatisfaction: 15,
        employeeProductivity: 0.1
      }
    },
    {
      id: 'consulting_office',
      name: 'Premium Office Space',
      description: 'Impressive office to wow clients and improve productivity',
      cost: 25000,
      effect: {
        revenueMultiplier: 1.1,
        customerSatisfaction: 15
      }
    },
    {
      id: 'consulting_training',
      name: 'Professional Certification Program',
      description: 'Advanced training and certifications for your team',
      cost: 15000,
      effect: {
        qualityBoost: 20,
        employeeProductivity: 0.15
      }
    }
  ],
  manufacturing: [
    {
      id: 'manufacturing_automation',
      name: 'Automation Systems',
      description: 'Robotics and automation to improve production',
      cost: 75000,
      effect: {
        employeeProductivity: 0.3,
        expenseReduction: 0.2
      }
    },
    {
      id: 'manufacturing_qc',
      name: 'Quality Control Lab',
      description: 'Advanced testing equipment for higher quality products',
      cost: 40000,
      effect: {
        qualityBoost: 25,
        customerSatisfaction: 15
      }
    },
    {
      id: 'manufacturing_logistics',
      name: 'Logistics Optimization',
      description: 'Improved supply chain and distribution systems',
      cost: 30000,
      effect: {
        expenseReduction: 0.15,
        maxCapacity: 25
      }
    }
  ],
  real_estate: [
    {
      id: 'realestate_software',
      name: 'Property Management Software',
      description: 'Digital tools for managing properties efficiently',
      cost: 12000,
      effect: {
        employeeProductivity: 0.12,
        expenseReduction: 0.08
      }
    },
    {
      id: 'realestate_marketing',
      name: 'Marketing Package',
      description: 'Professional photography, virtual tours, and premium listings',
      cost: 8000,
      effect: {
        revenueMultiplier: 1.1,
        maxCapacity: 5
      }
    },
    {
      id: 'realestate_renovation',
      name: 'Property Renovation Fund',
      description: 'Capital for improving properties before sale or rent',
      cost: 50000,
      effect: {
        qualityBoost: 20,
        revenueMultiplier: 1.2
      }
    }
  ],
  creative: [
    {
      id: 'creative_equipment',
      name: 'Professional Equipment',
      description: 'High-end cameras, editing suites, or design workstations',
      cost: 20000,
      effect: {
        qualityBoost: 20,
        employeeProductivity: 0.15
      }
    },
    {
      id: 'creative_studio',
      name: 'Studio Space',
      description: 'Dedicated creative space with proper lighting and equipment',
      cost: 15000,
      effect: {
        maxCapacity: 10,
        qualityBoost: 15
      }
    },
    {
      id: 'creative_software',
      name: 'Premium Creative Software',
      description: 'Industry-standard software licenses for your whole team',
      cost: 8000,
      effect: {
        employeeProductivity: 0.2,
        qualityBoost: 10
      }
    }
  ]
};

// Helper functions
const generateId = () => Math.random().toString(36).substring(2, 10);

const calculateEmployeeSalary = (role: string, businessType: BusinessType): number => {
  const baseSalaries: Record<string, number> = {
    // Restaurant
    'Chef': 4500,
    'Server': 2400,
    'Host': 2200,
    'Manager': 5000,
    'Dishwasher': 2000,
    'Bartender': 2800,
    
    // Retail
    'Sales Associate': 2500,
    'Cashier': 2300,
    'Store Manager': 4800,
    'Visual Merchandiser': 3200,
    'Inventory Specialist': 3000,
    
    // Tech
    'Developer': 8500,
    'Tech Designer': 7000,
    'Product Manager': 9500,
    'QA Tester': 5500,
    'CTO': 12000,
    'Support Specialist': 4000,
    
    // Consulting
    'Consultant': 8000,
    'Analyst': 6500,
    'Partner': 15000,
    'Associate': 5000,
    'Researcher': 5500,
    'Admin Assistant': 3000,
    
    // Manufacturing
    'Line Worker': 3200,
    'Quality Control': 3800,
    'Supervisor': 5500,
    'Engineer': 7500,
    'Maintenance': 4000,
    'Logistics Manager': 6000,
    
    // Real Estate
    'Agent': 4500,
    'Property Manager': 5000,
    'Broker': 8000,
    'Appraiser': 6000,
    'Admin': 3000,
    'Marketing Specialist': 4500,
    
    // Creative
    'Creative Designer': 5500,
    'Creative Director': 9000,
    'Copywriter': 4500,
    'Artist': 4000,
    'Producer': 6500,
    'Account Manager': 5500
  };

  // If we have a specific salary for this role, use it
  if (baseSalaries[role]) {
    return baseSalaries[role];
  }
  
  // Otherwise, use a default based on business type
  const defaultSalaries: Record<BusinessType, number> = {
    restaurant: 3000,
    retail: 2800,
    tech: 7500,
    consulting: 7000,
    manufacturing: 4500,
    real_estate: 5000,
    creative: 5000
  };
  
  return defaultSalaries[businessType];
};

// Business management store
interface BusinessState {
  businesses: Business[];
  selectedBusinessId: string | null;
  
  // Actions
  createBusiness: (name: string, type: BusinessType) => Promise<string | null>;
  selectBusiness: (id: string | null) => void;
  processBusinesses: (forceUpdate?: boolean) => void;
  withdrawFunds: (businessId: string, amount: number) => boolean;
  investFunds: (businessId: string, amount: number) => boolean;
  hireEmployee: (businessId: string, role: string) => boolean;
  fireEmployee: (businessId: string, employeeId: string) => boolean;
  purchaseUpgrade: (businessId: string, upgradeId: string) => boolean;
  toggleAutoManage: (businessId: string) => void;
  renameBusiness: (businessId: string, newName: string) => boolean;
  sellBusiness: (businessId: string) => number;
  resetBusinesses: () => void;
  
  // New marketing and investments actions
  updateMarketingBudget: (businessId: string, amount: number) => boolean;
  createMarketingCampaign: (businessId: string, campaignType: string, duration: number, budget: number) => boolean;
  cancelMarketingCampaign: (businessId: string, campaignId: string) => boolean;
  createInternalInvestment: (businessId: string, category: string, amount: number) => boolean;
}

export const useBusiness = create<BusinessState>()(
  persist(
    (set, get) => ({
      businesses: [],
      selectedBusinessId: null,
      
      // Create a new business
      createBusiness: async (name: string, type: BusinessType) => {
        // Get character store from registry
        const characterStore = getStore('character');
        if (!characterStore) {
          console.error('Character store not found in registry');
          toast.error('Failed to create business: Cannot access character data');
          return null;
        }
        
        const character = characterStore.getState();
        const template = businessTemplates[type];
        
        // Check if the player has enough money
        if (character.wealth < template.initialInvestment) {
          toast.error(`You need ${formatCurrency(template.initialInvestment)} to start this business.`);
          return null;
        }
        
        // Create the business
        const businessId = generateId();
        const now = Date.now();
        
        const newBusiness: Business = {
          ...template,
          id: businessId,
          name,
          foundedDate: now,
          lastProcessed: now,
          employees: [],
          upgrades: availableUpgrades[type].map(upgrade => ({
            ...upgrade,
            purchased: false
          })),
          // Make sure these fields are properly initialized
          marketingBudget: 0,
          marketingCampaigns: [],
          internalInvestments: [],
          isOpen: false, // Start closed until minimum employees are hired
          revenueBreakdown: {
            baseRevenue: 0,
            marketingRevenue: 0,
            qualityPremium: 0,
            reputationRevenue: 0,
            loyaltyRevenue: 0,
            seasonalRevenue: 0,
            specialEventsRevenue: 0
          }
        };
        
        // Deduct the cost from player's wealth
        character.addWealth(-template.initialInvestment);
        
        // Add the business to the store
        set(state => ({
          businesses: [...state.businesses, newBusiness],
          selectedBusinessId: businessId
        }));
        
        toast.success(`You've founded ${name}!`);
        return businessId;
      },
      
      // Select a business to view details
      selectBusiness: (id: string | null) => {
        set({ selectedBusinessId: id });
      },
      
      // Process business operations (revenue, expenses, growth)
      processBusinesses: (forceUpdate = false) => {
        const { businesses } = get();
        
        // Get economy store from registry
        const economyStore = getStore('economy');
        if (!economyStore) {
          console.error('Economy store not found in registry');
          return; // Cannot process without economy state
        }
        const { economyState } = economyStore.getState();
        
        // Get time store from registry
        const timeStore = getStore('time');
        if (!timeStore) {
          console.error('Time store not found in registry');
          return; // Cannot process without time state
        }
        const { currentGameDate } = timeStore.getState();
        
        // Convert date to timestamp for comparison
        const now = currentGameDate ? new Date(currentGameDate).getTime() : Date.now();
        
        // Define economic modifiers based on the economy state
        const economyModifiers = {
          boom: { revenue: 1.2, expenses: 1.1, growth: 1.3 },
          stable: { revenue: 1.0, expenses: 1.0, growth: 1.0 },
          recession: { revenue: 0.8, expenses: 0.9, growth: 0.7 }
        };
        
        const modifier = economyModifiers[economyState];
        
        const updatedBusinesses = businesses.map(business => {
          // Only process if it's been at least a day (or if forced)
          const dayInMs = 24 * 60 * 60 * 1000;
          const shouldProcess = forceUpdate || (now - business.lastProcessed) > dayInMs;
          
          if (!shouldProcess) {
            return business;
          }
          
          // First check if the business is open - needs minimum employees
          const minimumEmployeesRequired = business.type === 'restaurant' ? 2 : 
                                         business.type === 'manufacturing' ? 3 : 1;
          const isOpen = business.employees.length >= minimumEmployeesRequired;
          
          // Process marketing campaigns
          const activeMarketingCampaigns = business.marketingCampaigns.filter(campaign => {
            // Check if campaign is still active
            return campaign.active && Date.now() < campaign.endDate;
          });
          
          // Process internal investments
          const activeInvestments = business.internalInvestments.filter(investment => {
            // Internal investments are permanent once implemented
            return investment.active;
          });
          
          // Calculate marketing and investment effects
          const marketingEffect = {
            revenueMultiplier: 1.0,
            reputationBoost: 0,
            customerSatisfactionBoost: 0
          };
          
          activeMarketingCampaigns.forEach(campaign => {
            marketingEffect.revenueMultiplier *= campaign.effect.revenueMultiplier;
            marketingEffect.reputationBoost += campaign.effect.reputationBoost;
            marketingEffect.customerSatisfactionBoost += campaign.effect.customerSatisfactionBoost;
          });
          
          const investmentEffect = {
            qualityBoost: 0,
            employeeProductivity: 0,
            customerSatisfaction: 0,
            expenseReduction: 0,
            reputationBoost: 0
          };
          
          activeInvestments.forEach(investment => {
            if (investment.effect.qualityBoost) investmentEffect.qualityBoost += investment.effect.qualityBoost;
            if (investment.effect.employeeProductivity) investmentEffect.employeeProductivity += investment.effect.employeeProductivity;
            if (investment.effect.customerSatisfaction) investmentEffect.customerSatisfaction += investment.effect.customerSatisfaction;
            if (investment.effect.expenseReduction) investmentEffect.expenseReduction += investment.effect.expenseReduction;
            if (investment.effect.reputationBoost) investmentEffect.reputationBoost += investment.effect.reputationBoost;
          });
          
          // Calculate daily operations - only if business is open
          const baseRevenue = isOpen ? calculateDailyRevenue(business) : 0;
          const baseExpenses = calculateDailyExpenses(business);
          
          // Break down revenue sources
          const revenueBreakdown = {
            baseRevenue: baseRevenue,
            marketingRevenue: baseRevenue * (marketingEffect.revenueMultiplier - 1),
            qualityPremium: baseRevenue * (business.quality / 100) * 0.2,
            reputationRevenue: baseRevenue * (business.reputation / 100) * 0.15,
            loyaltyRevenue: baseRevenue * (business.customerSatisfaction / 100) * 0.1,
            seasonalRevenue: 0, // TODO: Implement seasonal effects
            specialEventsRevenue: 0 // TODO: Implement special events
          };
          
          // Total revenue after all effects
          const totalRevenueBeforeEconomy = 
            revenueBreakdown.baseRevenue + 
            revenueBreakdown.marketingRevenue + 
            revenueBreakdown.qualityPremium + 
            revenueBreakdown.reputationRevenue + 
            revenueBreakdown.loyaltyRevenue +
            revenueBreakdown.seasonalRevenue +
            revenueBreakdown.specialEventsRevenue;
          
          // Apply investment effect to expenses
          const expensesAfterInvestments = investmentEffect.expenseReduction > 0 
            ? baseExpenses * (1 - investmentEffect.expenseReduction) 
            : baseExpenses;
            
          // Apply economic modifiers
          const actualRevenue = totalRevenueBeforeEconomy * modifier.revenue;
          const actualExpenses = expensesAfterInvestments * modifier.expenses;
          
          // Calculate profit
          const profit = actualRevenue - actualExpenses;
          
          // Update business stats
          let newReputation = business.reputation;
          let newCustomerSatisfaction = business.customerSatisfaction;
          let newCurrentCapacity = business.currentCapacity;
          
          // Adjust reputation based on quality and customer satisfaction
          const reputationChange = (business.quality / 100 * 0.5) + (business.customerSatisfaction / 100 * 0.5) - 0.5;
          newReputation = Math.max(0, Math.min(100, newReputation + reputationChange * 2));
          
          // Adjust customer satisfaction based on quality and capacity
          const utilizationRate = business.currentCapacity / business.capacity;
          const satisfactionChange = (business.quality / 100 * 0.6) - (utilizationRate * 0.4);
          newCustomerSatisfaction = Math.max(0, Math.min(100, newCustomerSatisfaction + satisfactionChange * 2));
          
          // Adjust capacity based on reputation and satisfaction
          const capacityGrowth = (business.reputation / 100 * 0.5) + (business.customerSatisfaction / 100 * 0.5);
          newCurrentCapacity = Math.max(0, Math.min(business.capacity, 
            newCurrentCapacity + (capacityGrowth * modifier.growth * 2)));
          
          // Update the current value based on multiple factors
          const valueGrowthRate = (profit > 0 ? 0.001 : -0.001) * 
                                 (1 + (business.reputation / 100) * 0.5) * 
                                 (1 + (business.quality / 100) * 0.3) * 
                                 modifier.growth;
                                 
          const newValue = business.currentValue * (1 + valueGrowthRate);
          
          // Update business cash
          const newCash = business.cash + profit;
          
          // Check if any marketing campaigns have expired and should be deactivated
          const updatedMarketingCampaigns = business.marketingCampaigns.map(campaign => {
            if (campaign.active && now > campaign.endDate) {
              return { ...campaign, active: false };
            }
            return campaign;
          });
          
          return {
            ...business,
            cash: newCash,
            revenue: actualRevenue,
            expenses: actualExpenses,
            profitMargin: actualRevenue > 0 ? profit / actualRevenue : business.profitMargin,
            customerSatisfaction: newCustomerSatisfaction + marketingEffect.customerSatisfactionBoost + investmentEffect.customerSatisfaction,
            currentCapacity: newCurrentCapacity,
            reputation: newReputation + marketingEffect.reputationBoost + investmentEffect.reputationBoost,
            currentValue: newValue,
            lastProcessed: now,
            isOpen: isOpen,
            marketingCampaigns: updatedMarketingCampaigns,
            revenueBreakdown: revenueBreakdown,
            quality: Math.min(100, business.quality + investmentEffect.qualityBoost)
          };
        });
        
        set({ businesses: updatedBusinesses });
      },
      
      // Withdraw funds from business to personal account
      withdrawFunds: (businessId: string, amount: number) => {
        const business = get().businesses.find(b => b.id === businessId);
        
        if (!business || business.cash < amount || amount <= 0) {
          toast.error("Insufficient funds to withdraw.");
          return false;
        }
        
        // Update business cash
        const updatedBusinesses = get().businesses.map(b => 
          b.id === businessId 
            ? { ...b, cash: b.cash - amount } 
            : b
        );
        
        // Update player's wealth through character store from registry
        const characterStore = getStore('character');
        if (!characterStore) {
          console.error('Character store not found in registry');
          toast.error('Failed to withdraw funds: Cannot access character data');
          return false;
        }
        
        characterStore.getState().addWealth(amount);
        
        set({ businesses: updatedBusinesses });
        toast.success(`Withdrew ${formatCurrency(amount)} from ${business.name}.`);
        return true;
      },
      
      // Invest personal funds into the business
      investFunds: (businessId: string, amount: number) => {
        const business = get().businesses.find(b => b.id === businessId);
        
        // Get character store from registry
        const characterStore = getStore('character');
        if (!characterStore) {
          console.error('Character store not found in registry');
          toast.error('Failed to invest funds: Cannot access character data');
          return false;
        }
        
        const character = characterStore.getState();
        
        if (!business || character.wealth < amount || amount <= 0) {
          toast.error("Insufficient personal funds to invest.");
          return false;
        }
        
        // Update business cash and value
        const updatedBusinesses = get().businesses.map(b => 
          b.id === businessId 
            ? { 
                ...b, 
                cash: b.cash + amount,
                currentValue: b.currentValue + amount * 0.9 // Not all invested capital translates to value
              } 
            : b
        );
        
        // Update player's wealth
        character.addWealth(-amount);
        
        set({ businesses: updatedBusinesses });
        toast.success(`Invested ${formatCurrency(amount)} in ${business.name}.`);
        return true;
      },
      
      // Hire a new employee
      hireEmployee: (businessId: string, role: string) => {
        const business = get().businesses.find(b => b.id === businessId);
        
        if (!business) {
          toast.error("Business not found.");
          return false;
        }
        
        const salary = calculateEmployeeSalary(role, business.type);
        
        // Check if business can afford it
        if (business.cash < salary * 3) {  // Require 3 months of salary as buffer
          toast.error(`Your business needs at least ${formatCurrency(salary * 3)} to hire this employee.`);
          return false;
        }
        
        // Define role-specific capacity and productivity bonuses
        const roleCapacityImpact = {
          // Restaurant
          'Chef': 8,
          'Server': 12,
          'Host': 10,
          'Manager': 6,
          'Dishwasher': 5,
          'Bartender': 8,
          
          // Retail
          'Sales Associate': 12,
          'Cashier': 15,
          'Store Manager': 8,
          'Visual Merchandiser': 5,
          'Inventory Specialist': 6,
          
          // Tech
          'Developer': 10,
          'Tech Designer': 8,
          'Product Manager': 6,
          'QA Tester': 5,
          'CTO': 4,
          'Support Specialist': 15,
          
          // Consulting
          'Consultant': 12,
          'Analyst': 8,
          'Partner': 10,
          'Associate': 10,
          'Researcher': 6,
          'Admin Assistant': 5,
          
          // Manufacturing
          'Line Worker': 12,
          'Quality Control': 8,
          'Supervisor': 7,
          'Engineer': 9,
          'Maintenance': 5,
          'Logistics Manager': 6,
          
          // Real Estate
          'Agent': 12,
          'Property Manager': 10,
          'Broker': 10,
          'Appraiser': 8,
          'Admin': 5,
          'Marketing Specialist': 8,
          
          // Creative
          'Creative Designer': 10,
          'Creative Director': 8,
          'Copywriter': 9,
          'Artist': 8,
          'Producer': 7,
          'Account Manager': 12
        };
        
        // Create employee with role-specific attributes
        const newEmployee: BusinessEmployee = {
          id: generateId(),
          role,
          salary,
          productivity: 75 + Math.floor(Math.random() * 26),  // 75-100 (improved baseline)
          morale: 80 + Math.floor(Math.random() * 21),        // 80-100 (improved baseline)
          hireDate: Date.now()
        };
        
        // Get role-specific capacity impact or use default
        const capacityImpact = roleCapacityImpact[role] || 6;
        
        // Calculate how hiring this employee changes the business status
        const isFirstEmployee = business.employees.length === 0;
        
        // Check minimum employees needed for this business type
        const minimumEmployeesNeeded = {
          restaurant: 3, // Need at least chef, server, host
          retail: 2,     // Need at least sales associate and cashier
          tech: 2,       // Need at least developer and manager
          consulting: 2, // Need at least consultant and analyst
          manufacturing: 3, // Need at least worker, quality control, supervisor
          real_estate: 2, // Need at least agent and admin
          creative: 2    // Need at least designer and account manager
        };
        
        const minEmployees = minimumEmployeesNeeded[business.type] || 2;
        
        // Check if this hire means we've met the minimum requirements to open
        const willMeetMinimumRequirements = (business.employees.length + 1) >= minEmployees;
        
        // If this is the first employee or we're meeting min requirements, set the business to open
        const updatedIsOpen = isFirstEmployee || willMeetMinimumRequirements ? true : business.isOpen;
        
        // If first employee, also add a small capacity baseline
        const baselineCapacity = isFirstEmployee ? 10 : 0;
        
        // Calculate boost to current capacity (more customers)
        // New hires increase current customers by attracting new ones
        const currentCapacityBoost = Math.min(10, capacityImpact * 0.8);
        
        // Update business quality slightly when hiring skilled employees
        // Certain roles improve business quality
        const qualityBoostRoles = ['Chef', 'Manager', 'Store Manager', 'Developer', 'Tech Designer', 
                                'CTO', 'Partner', 'Engineer', 'Broker', 'Creative Director', 'Creative Designer'];
        
        const qualityBoost = qualityBoostRoles.includes(role) ? 2 : 0;
        
        // Update business with new employee
        const updatedBusinesses = get().businesses.map(b => 
          b.id === businessId 
            ? { 
                ...b, 
                employees: [...b.employees, newEmployee],
                // Hiring employees increases both expenses and capacity
                expenses: b.expenses + (salary / 30), // Daily expense
                capacity: b.capacity + capacityImpact + baselineCapacity, // Role-specific capacity boost
                currentCapacity: Math.min(
                  b.capacity + capacityImpact + baselineCapacity, // Can't exceed new capacity
                  b.currentCapacity + currentCapacityBoost // Add new customers
                ),
                isOpen: updatedIsOpen,
                quality: Math.min(100, b.quality + qualityBoost), // Improve quality with skilled hires
                cash: b.cash - (salary / 2) // Pay half a month's salary upfront (signing bonus/training)
              } 
            : b
        );
        
        set({ businesses: updatedBusinesses });
        toast.success(`Hired ${role} for ${formatCurrency(salary)}/month.`);
        return true;
      },
      
      // Fire an employee
      fireEmployee: (businessId: string, employeeId: string) => {
        const business = get().businesses.find(b => b.id === businessId);
        
        if (!business) {
          toast.error("Business not found.");
          return false;
        }
        
        const employee = business.employees.find(e => e.id === employeeId);
        
        if (!employee) {
          toast.error("Employee not found.");
          return false;
        }
        
        // Calculate severance (1 month salary)
        const severance = employee.salary;
        
        // Check if business can afford severance
        if (business.cash < severance) {
          toast.error(`Your business needs ${formatCurrency(severance)} for severance pay.`);
          return false;
        }
        
        // Update business
        const updatedBusinesses = get().businesses.map(b => 
          b.id === businessId 
            ? { 
                ...b, 
                employees: b.employees.filter(e => e.id !== employeeId),
                cash: b.cash - severance,
                expenses: b.expenses - (employee.salary / 30), // Reduce daily expense
                capacity: Math.max(b.capacity - 5, b.currentCapacity) // Reduce capacity but not below current usage
              } 
            : b
        );
        
        set({ businesses: updatedBusinesses });
        toast.success(`Let go of ${employee.role} with ${formatCurrency(severance)} severance.`);
        return true;
      },
      
      // Purchase a business upgrade
      purchaseUpgrade: (businessId: string, upgradeId: string) => {
        const business = get().businesses.find(b => b.id === businessId);
        
        if (!business) {
          toast.error("Business not found.");
          return false;
        }
        
        const upgrade = business.upgrades.find(u => u.id === upgradeId);
        
        if (!upgrade) {
          toast.error("Upgrade not found.");
          return false;
        }
        
        if (upgrade.purchased) {
          toast.error("Upgrade already purchased.");
          return false;
        }
        
        // Check if business can afford upgrade
        if (business.cash < upgrade.cost) {
          toast.error(`Your business needs ${formatCurrency(upgrade.cost)} for this upgrade.`);
          return false;
        }
        
        // Apply upgrade effects
        let updatedBusiness = {
          ...business,
          cash: business.cash - upgrade.cost,
          upgrades: business.upgrades.map(u => 
            u.id === upgradeId 
              ? { ...u, purchased: true, purchasedDate: Date.now() } 
              : u
          )
        };
        
        // Apply specific effects
        const effect = upgrade.effect;
        
        if (effect.revenueMultiplier) {
          updatedBusiness.revenue = business.revenue * effect.revenueMultiplier;
        }
        
        if (effect.expenseReduction) {
          updatedBusiness.expenses = business.expenses * (1 - effect.expenseReduction);
        }
        
        if (effect.qualityBoost) {
          updatedBusiness.quality = Math.min(100, business.quality + effect.qualityBoost);
        }
        
        if (effect.customerSatisfaction) {
          updatedBusiness.customerSatisfaction = Math.min(100, business.customerSatisfaction + effect.customerSatisfaction);
        }
        
        if (effect.maxCapacity) {
          updatedBusiness.capacity = business.capacity + effect.maxCapacity;
        }
        
        // Employee productivity boost is applied during business processing
        
        // Update business in state
        const updatedBusinesses = get().businesses.map(b => 
          b.id === businessId ? updatedBusiness : b
        );
        
        set({ businesses: updatedBusinesses });
        toast.success(`Purchased ${upgrade.name} for ${formatCurrency(upgrade.cost)}.`);
        return true;
      },
      
      // Toggle auto-management for a business
      toggleAutoManage: (businessId: string) => {
        const updatedBusinesses = get().businesses.map(b => 
          b.id === businessId 
            ? { ...b, autoManage: !b.autoManage } 
            : b
        );
        
        const business = updatedBusinesses.find(b => b.id === businessId);
        if (business) {
          toast.success(`${business.autoManage ? 'Enabled' : 'Disabled'} auto-management for ${business.name}.`);
        }
        
        set({ businesses: updatedBusinesses });
      },
      
      // Rename a business
      renameBusiness: (businessId: string, newName: string) => {
        if (!newName.trim()) {
          toast.error("Business name cannot be empty.");
          return false;
        }
        
        const updatedBusinesses = get().businesses.map(b => 
          b.id === businessId 
            ? { ...b, name: newName } 
            : b
        );
        
        set({ businesses: updatedBusinesses });
        toast.success(`Renamed business to ${newName}.`);
        return true;
      },
      
      // Sell a business
      sellBusiness: (businessId: string) => {
        const business = get().businesses.find(b => b.id === businessId);
        
        if (!business) {
          toast.error("Business not found.");
          return 0;
        }
        
        // Calculate sale value (90% of current value)
        const saleValue = business.currentValue * 0.9;
        
        // Update player's wealth through character store from registry
        const characterStore = getStore('character');
        if (!characterStore) {
          console.error('Character store not found in registry');
          toast.error('Failed to sell business: Cannot access character data');
          return 0;
        }
        
        characterStore.getState().addWealth(saleValue);
        
        // Remove the business
        set(state => ({
          businesses: state.businesses.filter(b => b.id !== businessId),
          selectedBusinessId: state.selectedBusinessId === businessId ? null : state.selectedBusinessId
        }));
        
        toast.success(`Sold ${business.name} for ${formatCurrency(saleValue)}.`);
        return saleValue;
      },
      
      // Reset all businesses (for game reset)
      resetBusinesses: () => {
        set({ businesses: [], selectedBusinessId: null });
      },
      
      // Update marketing budget for a business
      updateMarketingBudget: (businessId: string, amount: number) => {
        const business = get().businesses.find(b => b.id === businessId);
        
        if (!business) {
          toast.error("Business not found.");
          return false;
        }
        
        if (amount < 0) {
          toast.error("Marketing budget cannot be negative.");
          return false;
        }
        
        // Calculate monthly cost to ensure business can afford it
        const monthlyCost = amount;
        const dailyCost = monthlyCost / 30;
        const monthlyRevenue = business.revenue * 30;
        
        if (monthlyCost > monthlyRevenue * 0.5) {
          toast.error("Marketing budget cannot exceed 50% of monthly revenue.");
          return false;
        }
        
        // Update business with new marketing budget
        const updatedBusinesses = get().businesses.map(b => 
          b.id === businessId 
            ? { ...b, marketingBudget: amount } 
            : b
        );
        
        set({ businesses: updatedBusinesses });
        toast.success(`Updated marketing budget to ${formatCurrency(amount)}/month.`);
        return true;
      },
      
      // Create a new marketing campaign
      createMarketingCampaign: (businessId: string, campaignType: string, duration: number, budget: number) => {
        const business = get().businesses.find(b => b.id === businessId);
        
        if (!business) {
          toast.error("Business not found.");
          return false;
        }
        
        // Campaign cost is the monthly budget multiplied by duration in months
        const durationInMonths = duration / 30;
        const totalCost = budget * durationInMonths;
        
        // Check if business can afford this campaign
        if (business.cash < totalCost) {
          toast.error(`Your business needs ${formatCurrency(totalCost)} for this campaign.`);
          return false;
        }
        
        // Configure campaign effects based on type
        const campaignEffects = {
          social_media: {
            name: "Social Media Campaign",
            description: "Targeted ads and content on popular social platforms.",
            revenueMultiplier: 1.05,
            reputationBoost: 2,
            customerSatisfactionBoost: 1,
            customerAcquisition: 5
          },
          local_advertising: {
            name: "Local Advertising",
            description: "Traditional advertising in local media and venues.",
            revenueMultiplier: 1.08,
            reputationBoost: 3,
            customerSatisfactionBoost: 0,
            customerAcquisition: 8
          },
          premium_branding: {
            name: "Premium Branding Campaign",
            description: "High-quality branding to establish premium status.",
            revenueMultiplier: 1.12,
            reputationBoost: 5,
            customerSatisfactionBoost: 2,
            customerAcquisition: 3
          },
          customer_loyalty: {
            name: "Customer Loyalty Program",
            description: "Programs to reward and retain existing customers.",
            revenueMultiplier: 1.04,
            reputationBoost: 1,
            customerSatisfactionBoost: 5,
            customerAcquisition: 2
          },
          influencer: {
            name: "Influencer Partnership",
            description: "Partner with popular influencers to promote your business.",
            revenueMultiplier: 1.10,
            reputationBoost: 4,
            customerSatisfactionBoost: 2,
            customerAcquisition: 10
          }
        };
        
        const campaign = campaignEffects[campaignType as keyof typeof campaignEffects];
        if (!campaign) {
          toast.error("Invalid campaign type.");
          return false;
        }
        
        // Create the marketing campaign
        const now = Date.now();
        const newCampaign: MarketingCampaign = {
          id: generateId(),
          name: campaign.name,
          description: campaign.description,
          cost: budget,
          duration: duration,
          startDate: now,
          endDate: now + (duration * 24 * 60 * 60 * 1000), // Convert days to milliseconds
          active: true,
          effect: {
            customerAcquisition: campaign.customerAcquisition * (budget / 1000), // Scale with budget
            reputationBoost: campaign.reputationBoost * (budget / 2000), // Scale with budget
            customerSatisfactionBoost: campaign.customerSatisfactionBoost * (budget / 3000), // Scale with budget
            revenueMultiplier: 1 + ((campaign.revenueMultiplier - 1) * (budget / 2000)) // Scale with budget
          }
        };
        
        // Update business with new campaign and deduct the cost
        const updatedBusinesses = get().businesses.map(b => 
          b.id === businessId 
            ? { 
                ...b, 
                marketingCampaigns: [...b.marketingCampaigns, newCampaign],
                cash: b.cash - totalCost
              } 
            : b
        );
        
        set({ businesses: updatedBusinesses });
        toast.success(`Launched ${campaign.name} for ${formatCurrency(totalCost)}.`);
        return true;
      },
      
      // Cancel an active marketing campaign
      cancelMarketingCampaign: (businessId: string, campaignId: string) => {
        const business = get().businesses.find(b => b.id === businessId);
        
        if (!business) {
          toast.error("Business not found.");
          return false;
        }
        
        const campaign = business.marketingCampaigns.find(c => c.id === campaignId);
        
        if (!campaign) {
          toast.error("Campaign not found.");
          return false;
        }
        
        if (!campaign.active) {
          toast.error("Campaign is already inactive.");
          return false;
        }
        
        // Update the business with the campaign marked as inactive
        const updatedBusinesses = get().businesses.map(b => 
          b.id === businessId 
            ? { 
                ...b, 
                marketingCampaigns: b.marketingCampaigns.map(c => 
                  c.id === campaignId ? { ...c, active: false } : c
                )
              } 
            : b
        );
        
        set({ businesses: updatedBusinesses });
        toast.success(`Cancelled ${campaign.name}.`);
        return true;
      },
      
      // Create a new internal investment
      createInternalInvestment: (businessId: string, category: string, amount: number) => {
        const business = get().businesses.find(b => b.id === businessId);
        
        if (!business) {
          toast.error("Business not found.");
          return false;
        }
        
        // Check if business can afford this investment
        if (business.cash < amount) {
          toast.error(`Your business needs ${formatCurrency(amount)} for this investment.`);
          return false;
        }
        
        // Configure investment effects based on category
        const investmentEffects = {
          training: {
            name: "Employee Training Program",
            description: "Comprehensive training to improve employee skills and productivity.",
            employeeProductivity: 0.08,
            customerSatisfaction: 2,
            qualityBoost: 2
          },
          research: {
            name: "Research & Development",
            description: "Investment in R&D to improve products or services.",
            qualityBoost: 5,
            reputationBoost: 3
          },
          equipment: {
            name: "Equipment Upgrade",
            description: "New or upgraded equipment to improve operations.",
            qualityBoost: 3,
            expenseReduction: 0.05,
            employeeProductivity: 0.05
          },
          facilities: {
            name: "Facility Improvements",
            description: "Upgrades to business premises and customer-facing areas.",
            customerSatisfaction: 4,
            reputationBoost: 2,
            qualityBoost: 1
          },
          operations: {
            name: "Operations Optimization",
            description: "Streamlining operations to reduce costs and improve efficiency.",
            expenseReduction: 0.08,
            employeeProductivity: 0.04
          }
        };
        
        const investment = investmentEffects[category as keyof typeof investmentEffects];
        if (!investment) {
          toast.error("Invalid investment category.");
          return false;
        }
        
        // Scale effects based on the amount invested
        const effectMultiplier = amount / 5000; // Base scaling factor
        
        // Create the internal investment
        const newInvestment: InternalInvestment = {
          id: generateId(),
          name: investment.name,
          description: investment.description,
          category: category as 'training' | 'research' | 'equipment' | 'facilities' | 'operations',
          cost: amount,
          implementationDate: Date.now(),
          active: true,
          effect: {
            qualityBoost: investment.qualityBoost ? investment.qualityBoost * effectMultiplier : undefined,
            employeeProductivity: investment.employeeProductivity ? investment.employeeProductivity * effectMultiplier : undefined,
            customerSatisfaction: investment.customerSatisfaction ? investment.customerSatisfaction * effectMultiplier : undefined,
            expenseReduction: investment.expenseReduction ? investment.expenseReduction * effectMultiplier : undefined,
            reputationBoost: investment.reputationBoost ? investment.reputationBoost * effectMultiplier : undefined
          }
        };
        
        // Update business with new investment and deduct the cost
        const updatedBusinesses = get().businesses.map(b => 
          b.id === businessId 
            ? { 
                ...b, 
                internalInvestments: [...b.internalInvestments, newInvestment],
                cash: b.cash - amount
              } 
            : b
        );
        
        set({ businesses: updatedBusinesses });
        toast.success(`Implemented ${investment.name} for ${formatCurrency(amount)}.`);
        return true;
      }
    }),
    {
      name: 'business-empire-businesses',
      partialize: (state) => ({
        businesses: state.businesses,
        selectedBusinessId: state.selectedBusinessId
      }),
    }
  )
);

// Helper function to calculate daily revenue based on business attributes
function calculateDailyRevenue(business: Business): number {
  // Base revenue calculation based on business type and investment
  // Higher initial investment should yield higher revenue potential
  let baseRevenue = business.initialInvestment * 0.003; // 0.3% of initial investment daily (9% monthly return)
  
  // Minimum employees needed before a business can properly function (generate significant revenue)
  const minimumEmployeesNeeded = {
    restaurant: 3, // Need at least chef, server, host
    retail: 2,     // Need at least sales associate and cashier
    tech: 2,       // Need at least developer and manager
    consulting: 2, // Need at least consultant and analyst
    manufacturing: 3, // Need at least worker, quality control, supervisor
    real_estate: 2, // Need at least agent and admin
    creative: 2    // Need at least designer and account manager
  };
  
  // Minimum employee requirement
  const minEmployees = minimumEmployeesNeeded[business.type] || 2;
  
  // If not enough employees, severely reduce revenue
  if (business.employees.length < minEmployees) {
    // Each missing employee reduces revenue potential by 50%
    const missingEmployeePenalty = Math.pow(0.5, minEmployees - business.employees.length);
    baseRevenue *= missingEmployeePenalty;
  }
  
  // Calculate capacity utilization - minimum 10% even with no business to represent walk-ins
  const utilizationRate = Math.max(0.1, business.currentCapacity / business.capacity);
  
  // Adjust based on utilization
  baseRevenue *= utilizationRate;
  
  // Adjust based on quality and reputation
  const qualityFactor = 1 + (business.quality / 100); // Up to 100% more for high quality
  const reputationFactor = 1 + (business.reputation / 100 * 0.8); // Up to 80% more for high reputation
  
  // Combine factors
  const totalRevenue = baseRevenue * qualityFactor * reputationFactor;
  
  // Employee contribution - stronger employee impact
  // Calculate the average employee productivity
  const averageProductivity = business.employees.length > 0
    ? business.employees.reduce((sum, emp) => sum + emp.productivity, 0) / business.employees.length
    : 0;
    
  // Each employee after the minimum adds a significant revenue boost
  const employeeBonus = business.employees.length >= minEmployees
    ? 1 + ((business.employees.length - minEmployees) * 0.2) // Each employee beyond minimum adds 20% revenue
    : 1;
  
  // Productivity bonus - team average productivity affects overall output
  const productivityBonus = 1 + (averageProductivity / 100 * 0.5); // Up to 50% bonus for 100% productivity
  
  // Final revenue with all bonuses
  return totalRevenue * employeeBonus * productivityBonus;
}

// Helper function to calculate daily expenses
function calculateDailyExpenses(business: Business): number {
  // Business type specific base expense rates (percentage of initial investment)
  const baseExpenseRates = {
    restaurant: 0.0004, // 0.04% - Higher food costs but lower tech costs
    retail: 0.0003,     // 0.03% - Inventory focused
    tech: 0.0002,       // 0.02% - Digital products have lower physical costs
    consulting: 0.0002, // 0.02% - Knowledge-based work with lower overhead
    manufacturing: 0.0006, // 0.06% - High equipment and material costs
    real_estate: 0.0003,  // 0.03% - Property management costs
    creative: 0.0003     // 0.03% - Mixed overhead
  };
  
  // Base expense based on business type
  const baseExpenseRate = baseExpenseRates[business.type] || 0.0004;
  const baseExpense = business.initialInvestment * baseExpenseRate;
  
  // Employee salaries - the main expense for most businesses
  const dailySalaries = business.employees.reduce((total, emp) => {
    return total + (emp.salary / 30); // Monthly salary divided by 30 for daily cost
  }, 0);
  
  // Maintenance costs based on business size, type, and capacity
  // Lower maintenance cost for startups with few employees
  const maintenanceScale = Math.min(1, business.employees.length / 5); // Scale up to full maintenance at 5 employees
  const typicalMaintenanceCost = business.capacity * 0.3; // Reduced from 0.5
  const scaledMaintenanceCost = typicalMaintenanceCost * maintenanceScale;
  
  // Additional expenses based on business type
  const additionalExpenses = {
    restaurant: dailySalaries * 0.3, // Food costs scale with staff/customers
    retail: dailySalaries * 0.4,     // Inventory costs
    tech: dailySalaries * 0.2,       // Software/servers
    consulting: dailySalaries * 0.1, // Low additional costs
    manufacturing: dailySalaries * 0.5, // Materials and parts
    real_estate: dailySalaries * 0.2,  // Property upkeep
    creative: dailySalaries * 0.2     // Creative supplies
  };
  
  const typeSpecificExpense = additionalExpenses[business.type] || 0;
  
  // Total daily expenses
  return baseExpense + dailySalaries + scaledMaintenanceCost + typeSpecificExpense;
}

// Register store in the global registry
registerStore('business', useBusiness);

export default useBusiness;