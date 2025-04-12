import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'sonner';
import { useCharacter } from './useCharacter';
import { useTime } from './useTime';
import { useEconomy } from './useEconomy';
import { formatCurrency } from '../utils';

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
}

export const useBusiness = create<BusinessState>()(
  persist(
    (set, get) => ({
      businesses: [],
      selectedBusinessId: null,
      
      // Create a new business
      createBusiness: async (name: string, type: BusinessType) => {
        const character = useCharacter.getState();
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
          }))
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
        const { economyState } = useEconomy.getState();
        const { currentGameDate } = useTime.getState();
        
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
          
          // Calculate daily operations
          const baseRevenue = calculateDailyRevenue(business);
          const baseExpenses = calculateDailyExpenses(business);
          
          // Apply economic modifiers
          const actualRevenue = baseRevenue * modifier.revenue;
          const actualExpenses = baseExpenses * modifier.expenses;
          
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
          
          return {
            ...business,
            cash: newCash,
            revenue: actualRevenue,
            expenses: actualExpenses,
            profitMargin: actualRevenue > 0 ? profit / actualRevenue : business.profitMargin,
            customerSatisfaction: newCustomerSatisfaction,
            currentCapacity: newCurrentCapacity,
            reputation: newReputation,
            currentValue: newValue,
            lastProcessed: now
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
        
        // Update player's wealth
        useCharacter.getState().addWealth(amount);
        
        set({ businesses: updatedBusinesses });
        toast.success(`Withdrew ${formatCurrency(amount)} from ${business.name}.`);
        return true;
      },
      
      // Invest personal funds into the business
      investFunds: (businessId: string, amount: number) => {
        const business = get().businesses.find(b => b.id === businessId);
        const character = useCharacter.getState();
        
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
        
        const newEmployee: BusinessEmployee = {
          id: generateId(),
          role,
          salary,
          productivity: 70 + Math.floor(Math.random() * 30),  // 70-100
          morale: 70 + Math.floor(Math.random() * 30),        // 70-100
          hireDate: Date.now()
        };
        
        // Update business with new employee
        const updatedBusinesses = get().businesses.map(b => 
          b.id === businessId 
            ? { 
                ...b, 
                employees: [...b.employees, newEmployee],
                // Hiring employees increases both expenses and capacity
                expenses: b.expenses + (salary / 30), // Daily expense
                capacity: b.capacity + 5 // Each employee adds some capacity
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
        
        // Update player's wealth
        useCharacter.getState().addWealth(saleValue);
        
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
  // Base revenue calculation based on business capacity utilization
  const utilizationRate = business.currentCapacity / business.capacity;
  
  // Calculate base daily revenue
  let baseRevenue = business.initialInvestment * 0.001; // 0.1% of initial investment daily
  
  // Adjust based on utilization
  baseRevenue *= utilizationRate;
  
  // Adjust based on quality and reputation
  const qualityFactor = business.quality / 100 * 1.5; // Up to 50% more for high quality
  const reputationFactor = business.reputation / 100 * 1.3; // Up to 30% more for high reputation
  
  // Combine factors
  const totalRevenue = baseRevenue * qualityFactor * reputationFactor;
  
  // Employee contribution
  const employeeProductivityBonus = business.employees.reduce((total, emp) => {
    return total + (emp.productivity / 100) * 0.05; // Each employee adds up to 5% based on their productivity
  }, 1);
  
  // Final revenue with employee bonus
  return totalRevenue * employeeProductivityBonus;
}

// Helper function to calculate daily expenses
function calculateDailyExpenses(business: Business): number {
  // Base expenses
  const baseExpense = business.initialInvestment * 0.0005; // 0.05% of initial investment daily
  
  // Employee salaries
  const dailySalaries = business.employees.reduce((total, emp) => {
    return total + (emp.salary / 30); // Monthly salary divided by 30 for daily cost
  }, 0);
  
  // Maintenance costs based on business size and type
  const maintenanceCost = business.capacity * 0.5; // $0.50 per unit of capacity daily
  
  // Total daily expenses
  return baseExpense + dailySalaries + maintenanceCost;
}

export default useBusiness;