import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Users, 
  Briefcase, 
  DollarSign, 
  TrendingUp, 
  Building2, 
  Star, 
  Heart, 
  UserPlus, 
  UserMinus, 
  Plus, 
  Settings, 
  PieChart, 
  ArrowUpRight,
  ArrowDownRight,
  Landmark,
  Clock,
  BarChart4,
  CircleDollarSign,
  BadgePercent,
  Award,
  Gauge,
  UserCog,
  Lightbulb
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { useBusiness, 
  type Business, 
  type BusinessType, 
  type BusinessEmployee, 
  type BusinessUpgrade, 
  businessTemplates, 
  availableRoles } from '../lib/stores/useBusiness';
import { formatCurrency, formatDate, formatPercentage } from '../lib/utils';
import { useCharacter } from '../lib/stores/useCharacter';
import { useEconomy } from '../lib/stores/useEconomy';

// Business creation dialog component
interface CreateBusinessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateBusinessDialog: React.FC<CreateBusinessDialogProps> = ({ open, onOpenChange }) => {
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState<BusinessType | ''>('');
  const [isCreating, setIsCreating] = useState(false);
  
  const { createBusiness } = useBusiness();
  const { wealth } = useCharacter();
  
  const handleCreate = async () => {
    if (!businessName.trim()) {
      toast.error('Please enter a business name.');
      return;
    }
    
    if (!businessType) {
      toast.error('Please select a business type.');
      return;
    }
    
    setIsCreating(true);
    
    try {
      const result = await createBusiness(businessName, businessType);
      if (result) {
        onOpenChange(false);
      }
    } finally {
      setIsCreating(false);
    }
  };
  
  const getRequiredCapital = (type: BusinessType | ''): number => {
    if (!type) return 0;
    return businessTemplates[type]?.initialInvestment || 0;
  };
  
  const canAffordBusiness = (type: BusinessType | ''): boolean => {
    if (!type) return false;
    return wealth >= getRequiredCapital(type);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary" />
            Start a New Business
          </DialogTitle>
          <DialogDescription>
            Create your own business to generate additional income streams.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Business Name</label>
            <Input 
              placeholder="Enter business name" 
              value={businessName} 
              onChange={(e) => setBusinessName(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Business Type</label>
            <Select value={businessType} onValueChange={(value) => setBusinessType(value as BusinessType)}>
              <SelectTrigger>
                <SelectValue placeholder="Select business type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="restaurant">Restaurant</SelectItem>
                <SelectItem value="retail">Retail Store</SelectItem>
                <SelectItem value="tech">Tech Company</SelectItem>
                <SelectItem value="consulting">Consulting Firm</SelectItem>
                <SelectItem value="manufacturing">Manufacturing</SelectItem>
                <SelectItem value="real_estate">Real Estate</SelectItem>
                <SelectItem value="creative">Creative Studio</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {businessType && (
            <div className="bg-muted/30 p-4 rounded-md border border-primary/20">
              <h4 className="font-medium mb-2">Business Information</h4>
              <p className="text-sm text-muted-foreground mb-3">
                {businessTemplates[businessType].description}
              </p>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Required Investment:</span>
                  <span className="font-semibold">{formatCurrency(getRequiredCapital(businessType))}</span>
                </div>
                <div className="flex justify-between">
                  <span>Your Current Wealth:</span>
                  <span className="font-semibold">{formatCurrency(wealth)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Starting Profit Margin:</span>
                  <span className="font-semibold">{formatPercentage(businessTemplates[businessType].profitMargin)}</span>
                </div>
              </div>
              
              {!canAffordBusiness(businessType) && (
                <div className="mt-3 text-sm text-red-500">
                  You don't have enough money to start this business.
                </div>
              )}
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            disabled={!businessName.trim() || !businessType || !canAffordBusiness(businessType) || isCreating}
            className="bg-primary hover:bg-primary/90"
            onClick={handleCreate}
          >
            {isCreating ? 'Creating...' : 'Start Business'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// BusinessEmployee component
interface EmployeeCardProps {
  employee: BusinessEmployee;
  onFire: (id: string) => void;
  businessCash: number;
}

const EmployeeCard: React.FC<EmployeeCardProps> = ({ employee, onFire, businessCash }) => {
  const { id, role, salary, productivity, morale, hireDate } = employee;
  const hireDate_formatted = formatDate(new Date(hireDate));
  
  // Check if business can afford to fire them (needs money for severance)
  const canAffordSeverance = businessCash >= salary;
  
  // Calculate employee effectiveness based on productivity and morale
  const effectiveness = (productivity * 0.7 + morale * 0.3) / 100;
  
  // Calculate cost-effectiveness (value vs. salary)
  const valuePerSalaryDollar = effectiveness / (salary / 5000); // Normalized to a typical salary
  
  return (
    <Card className="border-primary/30 bg-background/95 dark:bg-gray-900/70">
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg flex items-center">
              {role}
              {productivity >= 90 && morale >= 80 && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Star className="ml-1.5 h-3.5 w-3.5 text-yellow-500" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">Star performer: High productivity and morale</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </CardTitle>
            <CardDescription className="text-xs">Hired on {hireDate_formatted}</CardDescription>
          </div>
          <Badge className="bg-blue-500 dark:bg-blue-600">
            {formatCurrency(salary)}/mo
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-2 pb-2">
        <div className="space-y-3">
          <div>
            <div className="flex justify-between mb-1 text-xs">
              <span className="flex items-center">
                <TrendingUp className="h-3 w-3 mr-1 text-blue-500" />
                Productivity
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Lightbulb className="ml-1 h-3 w-3 text-amber-500" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">Higher productivity directly increases revenue. Affected by morale and business upgrades.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </span>
              <span className={`font-medium ${productivity >= 80 ? 'text-green-600' : productivity >= 60 ? 'text-blue-600' : 'text-amber-600'}`}>
                {productivity}%
              </span>
            </div>
            <Progress 
              value={productivity} 
              className="h-1.5" 
              indicatorClassName={
                productivity >= 80 ? 'bg-green-500' : 
                productivity >= 60 ? 'bg-blue-500' : 
                productivity >= 40 ? 'bg-amber-500' : 
                'bg-red-500'
              }
            />
          </div>
          <div>
            <div className="flex justify-between mb-1 text-xs">
              <span className="flex items-center">
                <Heart className="h-3 w-3 mr-1 text-pink-500" />
                Morale
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Lightbulb className="ml-1 h-3 w-3 text-amber-500" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">Higher morale improves productivity and customer satisfaction. Affected by business decisions.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </span>
              <span className={`font-medium ${morale >= 80 ? 'text-green-600' : morale >= 60 ? 'text-blue-600' : 'text-amber-600'}`}>
                {morale}%
              </span>
            </div>
            <Progress 
              value={morale} 
              className="h-1.5"
              indicatorClassName={
                morale >= 80 ? 'bg-green-500' : 
                morale >= 60 ? 'bg-blue-500' : 
                morale >= 40 ? 'bg-amber-500' : 
                'bg-red-500'
              }
            />
          </div>
          <div className="mt-2 pt-2 border-t border-primary/10">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Effectiveness:</span>
              <span className={`font-medium ${effectiveness >= 0.8 ? 'text-green-600' : effectiveness >= 0.6 ? 'text-blue-600' : 'text-amber-600'}`}>
                {Math.round(effectiveness * 100)}%
              </span>
            </div>
            <div className="flex justify-between text-xs mt-1">
              <span className="text-muted-foreground">Value ratio:</span>
              <span className={`font-medium ${valuePerSalaryDollar >= 1.0 ? 'text-green-600' : valuePerSalaryDollar >= 0.8 ? 'text-blue-600' : 'text-amber-600'}`}>
                {valuePerSalaryDollar.toFixed(2)}x
                {valuePerSalaryDollar >= 1.2 && <span className="ml-1 text-green-500">(Excellent)</span>}
                {valuePerSalaryDollar < 0.8 && <span className="ml-1 text-amber-500">(Underperforming)</span>}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-gray-800" 
                onClick={() => onFire(id)}
                disabled={!canAffordSeverance}
              >
                <UserMinus className="h-3.5 w-3.5 mr-1.5" />
                Let Go
              </Button>
            </TooltipTrigger>
            {!canAffordSeverance && (
              <TooltipContent>
                <p>Not enough funds for severance pay ({formatCurrency(salary)})</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </CardFooter>
    </Card>
  );
};

// Business Upgrade component
interface UpgradeCardProps {
  upgrade: BusinessUpgrade;
  onPurchase: (id: string) => void;
  businessCash: number;
}

const UpgradeCard: React.FC<UpgradeCardProps> = ({ upgrade, onPurchase, businessCash }) => {
  const { id, name, description, cost, effect, purchased, purchasedDate } = upgrade;
  
  // Check if business can afford the upgrade
  const canAfford = businessCash >= cost;
  
  // Determine ROI and priority category
  const calculateROI = () => {
    let roi = 0;
    if (effect.revenueMultiplier) {
      roi += (effect.revenueMultiplier - 1) * 100;
    }
    if (effect.expenseReduction) {
      roi += effect.expenseReduction * 70;
    }
    if (effect.employeeProductivity) {
      roi += effect.employeeProductivity * 50;
    }
    if (effect.qualityBoost) {
      roi += effect.qualityBoost * 10;
    }
    if (effect.customerSatisfaction) {
      roi += effect.customerSatisfaction * 8;
    }
    if (effect.maxCapacity) {
      roi += effect.maxCapacity * 5;
    }
    return roi / (cost / 5000); // Normalized to a typical upgrade cost
  };
  
  const roi = calculateROI();
  
  // Format effect descriptions
  const getEffectDescriptions = () => {
    const descriptions = [];
    
    if (effect.revenueMultiplier) {
      descriptions.push({
        text: `${formatPercentage(effect.revenueMultiplier - 1)} increased revenue`,
        impact: 'high'
      });
    }
    
    if (effect.expenseReduction) {
      descriptions.push({
        text: `${formatPercentage(effect.expenseReduction)} reduced expenses`,
        impact: 'high'
      });
    }
    
    if (effect.qualityBoost) {
      descriptions.push({
        text: `+${effect.qualityBoost} quality points`,
        impact: 'medium'
      });
    }
    
    if (effect.employeeProductivity) {
      descriptions.push({
        text: `+${formatPercentage(effect.employeeProductivity)} employee productivity`,
        impact: 'high'
      });
    }
    
    if (effect.customerSatisfaction) {
      descriptions.push({
        text: `+${effect.customerSatisfaction} customer satisfaction`,
        impact: 'medium'
      });
    }
    
    if (effect.maxCapacity) {
      descriptions.push({
        text: `+${effect.maxCapacity} maximum capacity`,
        impact: 'medium'
      });
    }
    
    return descriptions;
  };
  
  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': 
        return 'text-green-600';
      case 'medium': 
        return 'text-blue-600';
      default: 
        return 'text-slate-600';
    }
  };
  
  return (
    <Card className={`border-primary/30 ${purchased ? 'bg-primary/5' : ''} ${!purchased && roi > 1.5 ? 'ring-1 ring-green-500/40' : ''}`}>
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg flex items-center">
              {name}
              {!purchased && roi > 1.5 && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Star className="ml-1.5 h-3.5 w-3.5 text-yellow-500" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">High-value upgrade: Excellent return on investment</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          {purchased ? (
            <Badge variant="outline" className="bg-primary/20 border-primary">Purchased</Badge>
          ) : (
            <Badge 
              variant="outline" 
              className={canAfford ? 'border-green-500/50' : 'border-amber-500/50'}
            >
              {formatCurrency(cost)}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-2 pb-2">
        <div className="text-sm space-y-1">
          {getEffectDescriptions().map((desc, i) => (
            <div key={i} className="flex items-center text-xs">
              <ArrowUpRight className={`h-3 w-3 mr-1 ${desc.impact === 'high' ? 'text-green-500' : 'text-blue-500'}`} />
              <span className={getImpactColor(desc.impact)}>{desc.text}</span>
            </div>
          ))}
        </div>
        
        {!purchased && (
          <div className="mt-3 pt-2 border-t border-primary/10">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Value rating:</span>
              <span className={`font-medium ${roi >= 1.5 ? 'text-green-600' : roi >= 1.0 ? 'text-blue-600' : 'text-amber-600'}`}>
                {roi >= 1.5 ? 'Excellent' : roi >= 1.0 ? 'Good' : 'Fair'}
              </span>
            </div>
            <div className="flex justify-between text-xs mt-1">
              <span className="text-muted-foreground">Payback period:</span>
              <span className="font-medium">
                {roi > 0 ? `~${Math.ceil(cost / (5000 * roi / 30))} days` : 'N/A'}
              </span>
            </div>
          </div>
        )}
        
        {purchased && purchasedDate && (
          <div className="mt-2 text-xs text-muted-foreground">
            Purchased on {formatDate(new Date(purchasedDate))}
          </div>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant={purchased ? "outline" : roi >= 1.5 ? "default" : "outline"}
                size="sm"
                className={`w-full ${roi >= 1.5 && !purchased ? 'bg-green-600 hover:bg-green-700' : ''}`}
                onClick={() => onPurchase(id)}
                disabled={purchased || !canAfford}
              >
                {purchased ? 'Purchased' : canAfford ? 'Purchase' : 'Insufficient Funds'}
              </Button>
            </TooltipTrigger>
            {!canAfford && !purchased && (
              <TooltipContent>
                <p>You need {formatCurrency(cost - businessCash)} more to purchase this upgrade</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </CardFooter>
    </Card>
  );
};

interface HireEmployeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  businessId: string;
  businessType: BusinessType;
  businessCash: number;
}

const HireEmployeeDialog: React.FC<HireEmployeeDialogProps> = ({ 
  open, 
  onOpenChange, 
  businessId, 
  businessType,
  businessCash
}) => {
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [isHiring, setIsHiring] = useState(false);
  
  const { hireEmployee } = useBusiness();
  const roles = availableRoles[businessType] || [];
  
  // Estimate the salary for the selected role
  const estimateSalary = (role: string): number => {
    // This is a simplified estimate - the actual logic is in the useBusiness store
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
      'Designer': 7000,
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
    
    return baseSalaries[role] || 5000;
  };
  
  const canAffordToHire = (role: string): boolean => {
    const estimatedSalary = estimateSalary(role);
    // Need 3 months of salary as buffer
    return businessCash >= estimatedSalary * 3;
  };
  
  const handleHire = async () => {
    if (!selectedRole) {
      toast.error('Please select a role.');
      return;
    }
    
    setIsHiring(true);
    
    try {
      const success = hireEmployee(businessId, selectedRole);
      if (success) {
        onOpenChange(false);
      }
    } finally {
      setIsHiring(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            Hire New Employee
          </DialogTitle>
          <DialogDescription>
            Employees increase your business capacity and productivity.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Role</label>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map(role => (
                  <SelectItem key={role} value={role}>{role}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {selectedRole && (
            <div className="bg-muted/30 p-4 rounded-md border border-primary/20">
              <h4 className="font-medium mb-2">Employee Information</h4>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Estimated Salary:</span>
                  <span className="font-semibold">{formatCurrency(estimateSalary(selectedRole))}/month</span>
                </div>
                <div className="flex justify-between">
                  <span>Required Buffer:</span>
                  <span className="font-semibold">{formatCurrency(estimateSalary(selectedRole) * 3)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Business Cash:</span>
                  <span className="font-semibold">{formatCurrency(businessCash)}</span>
                </div>
              </div>
              
              {!canAffordToHire(selectedRole) && (
                <div className="mt-3 text-sm text-red-500">
                  Your business needs at least 3 months of salary as buffer to hire.
                </div>
              )}
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            disabled={!selectedRole || !canAffordToHire(selectedRole) || isHiring}
            className="bg-primary hover:bg-primary/90"
            onClick={handleHire}
          >
            {isHiring ? 'Hiring...' : 'Hire Employee'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Business management panel
interface BusinessManagementPanelProps {
  business: Business;
}

const BusinessManagementPanel: React.FC<BusinessManagementPanelProps> = ({ business }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [investAmount, setInvestAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isHireDialogOpen, setIsHireDialogOpen] = useState(false);
  
  // Marketing campaign states
  const [campaignType, setCampaignType] = useState('');
  const [campaignDuration, setCampaignDuration] = useState('');
  const [campaignBudget, setCampaignBudget] = useState('');
  
  // Internal investment states
  const [investmentCategory, setInvestmentCategory] = useState('');
  const [investmentAmount, setInvestmentAmount] = useState('');
  
  const { 
    withdrawFunds,
    investFunds,
    fireEmployee,
    purchaseUpgrade,
    toggleAutoManage,
    processBusinesses,
    sellBusiness,
    createMarketingCampaign,
    cancelMarketingCampaign,
    createInternalInvestment
  } = useBusiness();
  
  const { economyState } = useEconomy();
  
  // Format our business date
  const foundedDate = formatDate(new Date(business.foundedDate));
  
  // Force update on first render and set up interval for updates
  useEffect(() => {
    // Process once when component mounts
    processBusinesses(true);
    
    // Set up interval (every 10 seconds)
    const interval = setInterval(() => {
      processBusinesses();
    }, 10000);
    
    return () => clearInterval(interval);
  }, [processBusinesses]);
  
  
  // Handle investment
  const handleInvest = () => {
    const amount = parseFloat(investAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount.');
      return;
    }
    
    const success = investFunds(business.id, amount);
    if (success) {
      setInvestAmount('');
    }
  };
  
  // Handle withdrawal
  const handleWithdraw = () => {
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount.');
      return;
    }
    
    const success = withdrawFunds(business.id, amount);
    if (success) {
      setWithdrawAmount('');
    }
  };
  
  // Handle employee firing
  const handleFireEmployee = (employeeId: string) => {
    fireEmployee(business.id, employeeId);
  };
  
  // Handle upgrade purchase
  const handlePurchaseUpgrade = (upgradeId: string) => {
    purchaseUpgrade(business.id, upgradeId);
  };
  
  // Handle business selling confirmation
  const [isSellDialogOpen, setIsSellDialogOpen] = useState(false);
  
  const handleSellBusiness = () => {
    sellBusiness(business.id);
    setIsSellDialogOpen(false);
  };
  
  // Marketing functions
  
  const handleCreateMarketingCampaign = () => {
    if (!campaignType) {
      toast.error('Please select a campaign type.');
      return;
    }
    
    const duration = parseInt(campaignDuration);
    if (isNaN(duration) || duration <= 0) {
      toast.error('Please enter a valid campaign duration.');
      return;
    }
    
    const budget = parseFloat(campaignBudget);
    if (isNaN(budget) || budget <= 0) {
      toast.error('Please enter a valid campaign budget.');
      return;
    }
    
    const success = createMarketingCampaign(business.id, campaignType, duration, budget);
    if (success) {
      setCampaignType('');
      setCampaignDuration('');
      setCampaignBudget('');
      toast.success('Marketing campaign created successfully.');
    }
  };
  
  const handleCancelMarketingCampaign = (campaignId: string) => {
    const success = cancelMarketingCampaign(business.id, campaignId);
    if (success) {
      toast.success('Marketing campaign cancelled.');
    }
  };
  
  // Internal investment functions
  const handleCreateInternalInvestment = () => {
    if (!investmentCategory) {
      toast.error('Please select an investment category.');
      return;
    }
    
    const amount = parseFloat(investmentAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid investment amount.');
      return;
    }
    
    const success = createInternalInvestment(business.id, investmentCategory, amount);
    if (success) {
      setInvestmentCategory('');
      setInvestmentAmount('');
      toast.success('Internal investment created successfully.');
    }
  };
  
  // Business health calculation
  const calculateBusinessHealth = (): { score: number; status: string } => {
    // Factors to consider:
    // 1. Profitability (profit margin)
    // 2. Cash reserves
    // 3. Customer satisfaction
    // 4. Quality
    // 5. Capacity utilization
    
    const profitScore = business.profitMargin * 100; // 0-100
    const cashScore = Math.min(100, (business.cash / business.initialInvestment) * 200); // 0-100
    const satisfactionScore = business.customerSatisfaction; // 0-100
    const qualityScore = business.quality; // 0-100
    const capacityScore = Math.min(100, (business.currentCapacity / business.capacity) * 150); // 0-100
    
    // Weighted average
    const overallScore = (
      profitScore * 0.3 + 
      cashScore * 0.2 + 
      satisfactionScore * 0.2 + 
      qualityScore * 0.15 + 
      capacityScore * 0.15
    );
    
    // Determine status based on score
    let status;
    if (overallScore >= 80) status = 'Excellent';
    else if (overallScore >= 60) status = 'Good';
    else if (overallScore >= 40) status = 'Average';
    else if (overallScore >= 20) status = 'Struggling';
    else status = 'Critical';
    
    return { score: overallScore, status };
  };
  
  const businessHealth = calculateBusinessHealth();
  
  // Get health status color
  const getHealthColor = (score: number): string => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-lime-500';
    if (score >= 40) return 'text-yellow-500';
    if (score >= 20) return 'text-orange-500';
    return 'text-red-500';
  };
  
  const healthColor = getHealthColor(businessHealth.score);
  
  // Get economy status color
  const getEconomyColor = (state: string): string => {
    if (state === 'boom') return 'text-green-500';
    if (state === 'recession') return 'text-red-500';
    return 'text-blue-500';
  };
  
  const economyColor = getEconomyColor(economyState);
  
  // Get stats for business dashboard
  const calculateStats = () => {
    // Profit calculation
    const profit = business.revenue - business.expenses;
    const profitPercentChange = business.revenue > 0 ? (profit / business.revenue) * 100 : 0;
    
    // ROI calculation
    const netAssetValue = business.currentValue + business.cash;
    const roi = ((netAssetValue - business.initialInvestment) / business.initialInvestment) * 100;
    
    return { profit, profitPercentChange, netAssetValue, roi };
  };
  
  const stats = calculateStats();
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">{business.name}</h1>
          <p className="text-muted-foreground text-sm">
            {business.type.charAt(0).toUpperCase() + business.type.slice(1).replace('_', ' ')} • 
            Founded {foundedDate} • Level {business.level}
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            className={`flex items-center gap-1.5 ${business.autoManage ? 'bg-primary/10 border-primary' : ''}`}
            onClick={() => toggleAutoManage(business.id)}
          >
            <Settings className="h-3.5 w-3.5" />
            {business.autoManage ? 'Auto-Managed' : 'Manual Management'}
          </Button>
          
          <Button
            variant="destructive"
            size="sm"
            className="flex items-center gap-1.5"
            onClick={() => setIsSellDialogOpen(true)}
          >
            <DollarSign className="h-3.5 w-3.5" />
            Sell Business
          </Button>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-background/50 backdrop-blur-md border border-primary/20">
          <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Overview
          </TabsTrigger>
          <TabsTrigger value="finances" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Finances
          </TabsTrigger>
          <TabsTrigger value="employees" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Employees
          </TabsTrigger>
          <TabsTrigger value="upgrades" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Upgrades
          </TabsTrigger>
          <TabsTrigger value="marketing" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Marketing
          </TabsTrigger>
          <TabsTrigger value="investments" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Investments
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Business Health Card */}
            <Card className="border-primary/30 md:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Business Health</CardTitle>
                <CardDescription>Overall performance metrics</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-col md:flex-row gap-8 mt-4">
                  <div className="flex-1">
                    <div className="text-center mb-4">
                      <h3 className={`text-3xl font-bold ${healthColor}`}>
                        {businessHealth.status}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Business Health Score: {Math.round(Math.min(100, businessHealth.score))}%
                      </p>
                    </div>
                    
                    <Progress value={Math.min(100, businessHealth.score)} className="h-2 mb-6" />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col items-center">
                        <div className="bg-primary/10 p-2 rounded-full mb-2">
                          <CircleDollarSign className="h-5 w-5 text-primary" />
                        </div>
                        <span className="text-sm font-medium">{formatCurrency(business.cash)}</span>
                        <span className="text-xs text-muted-foreground">Cash Reserves</span>
                      </div>
                      
                      <div className="flex flex-col items-center">
                        <div className="bg-primary/10 p-2 rounded-full mb-2">
                          <BadgePercent className="h-5 w-5 text-primary" />
                        </div>
                        <span className="text-sm font-medium">{formatPercentage(Math.min(1, business.profitMargin))}</span>
                        <span className="text-xs text-muted-foreground">Profit Margin</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4 flex-1">
                    <div>
                      <div className="flex justify-between mb-1 text-sm">
                        <span className="flex items-center">
                          <Star className="h-4 w-4 mr-2 text-yellow-500" />
                          Quality
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <Lightbulb className="ml-1 h-3 w-3 text-amber-500" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-xs">Higher quality attracts customers willing to pay premium prices. Improves through upgrades and experienced employees.</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </span>
                        <span className={`font-medium ${business.quality >= 80 ? 'text-green-600' : business.quality >= 60 ? 'text-blue-600' : 'text-amber-600'}`}>
                          {Math.min(100, business.quality)}%
                        </span>
                      </div>
                      <Progress 
                        value={Math.min(100, business.quality)} 
                        className="h-2" 
                        indicatorClassName={
                          business.quality >= 80 ? 'bg-green-500' : 
                          business.quality >= 60 ? 'bg-blue-500' : 
                          business.quality >= 40 ? 'bg-amber-500' : 
                          'bg-red-500'
                        }
                      />
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1 text-sm">
                        <span className="flex items-center">
                          <Heart className="h-4 w-4 mr-2 text-pink-500" />
                          Customer Satisfaction
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <Lightbulb className="ml-1 h-3 w-3 text-amber-500" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-xs">Satisfied customers return more often and refer others. Affected by quality, employee morale, and wait times.</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </span>
                        <span className={`font-medium ${business.customerSatisfaction >= 80 ? 'text-green-600' : business.customerSatisfaction >= 60 ? 'text-blue-600' : 'text-amber-600'}`}>
                          {Math.min(100, Math.round(business.customerSatisfaction))}%
                        </span>
                      </div>
                      <Progress 
                        value={Math.min(100, business.customerSatisfaction)} 
                        className="h-2" 
                        indicatorClassName={
                          business.customerSatisfaction >= 80 ? 'bg-green-500' : 
                          business.customerSatisfaction >= 60 ? 'bg-blue-500' : 
                          business.customerSatisfaction >= 40 ? 'bg-amber-500' : 
                          'bg-red-500'
                        }
                      />
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1 text-sm">
                        <span className="flex items-center">
                          <Award className="h-4 w-4 mr-2 text-amber-500" />
                          Reputation
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <Lightbulb className="ml-1 h-3 w-3 text-amber-500" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-xs">Good reputation leads to more customers and higher prices. Builds slowly but can fall quickly with poor service.</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </span>
                        <span className={`font-medium ${business.reputation >= 80 ? 'text-green-600' : business.reputation >= 60 ? 'text-blue-600' : 'text-amber-600'}`}>
                          {Math.min(100, Math.round(business.reputation))}%
                        </span>
                      </div>
                      <Progress 
                        value={Math.min(100, business.reputation)} 
                        className="h-2" 
                        indicatorClassName={
                          business.reputation >= 80 ? 'bg-green-500' : 
                          business.reputation >= 60 ? 'bg-blue-500' : 
                          business.reputation >= 40 ? 'bg-amber-500' : 
                          'bg-red-500'
                        }
                      />
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1 text-sm">
                        <span className="flex items-center">
                          <Gauge className="h-4 w-4 mr-2 text-blue-500" />
                          Capacity Utilization
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <Lightbulb className="ml-1 h-3 w-3 text-amber-500" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-xs">Shows how much of your maximum capacity is being used. Ideal range is 70-90%. Too low means wasted resources, too high can reduce quality.</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </span>
                        <span className={`font-medium ${Math.min(100, (business.currentCapacity / business.capacity * 100)) >= 70 && Math.min(100, (business.currentCapacity / business.capacity * 100)) <= 90 ? 'text-green-600' : Math.min(100, (business.currentCapacity / business.capacity * 100)) > 90 ? 'text-amber-600' : 'text-blue-600'}`}>
                          {Math.round(Math.min(business.currentCapacity, business.capacity) * 10) / 10}/{business.capacity} ({Math.min(100, Math.round((business.currentCapacity / business.capacity) * 1000) / 10)}%)
                        </span>
                      </div>
                      <Progress 
                        value={Math.min(100, (business.currentCapacity / business.capacity) * 100)} 
                        className="h-2" 
                        indicatorClassName={
                          Math.min(100, (business.currentCapacity / business.capacity * 100)) >= 70 && Math.min(100, (business.currentCapacity / business.capacity * 100)) <= 90 ? 'bg-green-500' :
                          Math.min(100, (business.currentCapacity / business.capacity * 100)) > 90 ? 'bg-amber-500' :
                          'bg-blue-500'
                        }
                      />
                      <div className="flex justify-between text-xs mt-1">
                        <span className="text-blue-500">Underused</span>
                        <span className="text-green-500">Optimal</span>
                        <span className="text-amber-500">Overused</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 pt-6 border-t border-primary/10">
                  <div className="flex items-center mb-2">
                    <Landmark className="h-4 w-4 mr-2" />
                    <h4 className="font-medium">Economic Conditions</h4>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Badge className={`${economyColor} bg-transparent`}>
                      {economyState.charAt(0).toUpperCase() + economyState.slice(1)} Economy
                    </Badge>
                    
                    <span className="text-sm text-muted-foreground">
                      {economyState === 'boom' 
                        ? 'Higher revenues and growth potential'
                        : economyState === 'recession'
                        ? 'Reduced customer spending and slower growth'
                        : 'Balanced economic conditions'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Financial Summary Card */}
            <Card className="border-primary/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Financial Summary</CardTitle>
                <CardDescription>Key performance metrics</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-6 mt-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-muted-foreground flex items-center">
                        Daily Revenue
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Lightbulb className="ml-1 h-3.5 w-3.5 text-amber-500" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <p className="text-xs">Your revenue increases with better quality, reputation, and having the right number of employees. Check the breakdown below.</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </span>
                      <span className="font-medium text-green-600">{formatCurrency(business.revenue)}</span>
                    </div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-muted-foreground flex items-center">
                        Daily Expenses
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Lightbulb className="ml-1 h-3.5 w-3.5 text-amber-500" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <p className="text-xs">Employee salaries are usually your biggest expense. Upgrades can help reduce other costs.</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </span>
                      <span className="font-medium text-red-600">{formatCurrency(business.expenses)}</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t">
                      <span className="text-sm font-medium flex items-center">
                        Daily Profit
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Lightbulb className="ml-1 h-3.5 w-3.5 text-amber-500" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <p className="text-xs">Aim to keep profits positive. Negative profits will drain your cash reserves.</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </span>
                      <span className={`font-medium ${stats.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(stats.profit)}
                        {stats.profit > 0 && 
                          <span className="ml-1 text-xs font-normal text-green-500">
                            <ArrowUpRight className="inline h-3 w-3" /> Profitable
                          </span>
                        }
                        {stats.profit < 0 && 
                          <span className="ml-1 text-xs font-normal text-red-500">
                            <ArrowDownRight className="inline h-3 w-3" /> Loss
                          </span>
                        }
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-muted-foreground">Initial Investment</span>
                      <span className="font-medium">{formatCurrency(business.initialInvestment)}</span>
                    </div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-muted-foreground">Current Value</span>
                      <span className="font-medium">{formatCurrency(business.currentValue)}</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t">
                      <span className="text-sm font-medium">Return on Investment</span>
                      <span className={`font-medium ${stats.roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {Math.round(stats.roi * 10) / 10}%
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="finances" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-primary/30 md:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Financial Operations</CardTitle>
                <CardDescription>Cash flow and financial management</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  <div className="space-y-4">
                    <div className="p-4 bg-muted/30 rounded-md border border-primary/20">
                      <h3 className="font-medium flex items-center mb-3">
                        <BarChart4 className="mr-2 h-5 w-5 text-primary" />
                        Daily Revenue Breakdown
                      </h3>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Base Revenue</span>
                          <span>{formatCurrency(business.revenue * 0.6)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Quality Premium</span>
                          <span>{formatCurrency(business.revenue * 0.2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Reputation Bonus</span>
                          <span>{formatCurrency(business.revenue * 0.1)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Employee Contribution</span>
                          <span>{formatCurrency(business.revenue * 0.1)}</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t">
                          <span className="font-medium">Total Daily Revenue</span>
                          <span className="font-medium">{formatCurrency(business.revenue)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-muted/30 rounded-md border border-primary/20">
                      <h3 className="font-medium flex items-center mb-3">
                        <PieChart className="mr-2 h-5 w-5 text-primary" />
                        Daily Expenses Breakdown
                      </h3>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Operating Costs</span>
                          <span>{formatCurrency(business.expenses * 0.3)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Employee Salaries</span>
                          <span>{formatCurrency(business.expenses * 0.5)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Maintenance</span>
                          <span>{formatCurrency(business.expenses * 0.1)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Other Expenses</span>
                          <span>{formatCurrency(business.expenses * 0.1)}</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t">
                          <span className="font-medium">Total Daily Expenses</span>
                          <span className="font-medium">{formatCurrency(business.expenses)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="p-4 bg-muted/30 rounded-md border border-primary/20">
                      <h3 className="font-medium mb-3">Business Valuation</h3>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Base Business Value</span>
                          <span>{formatCurrency(business.currentValue)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Cash Reserves</span>
                          <span>{formatCurrency(business.cash)}</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t">
                          <span className="font-medium">Total Business Value</span>
                          <span className="font-medium">{formatCurrency(business.currentValue + business.cash)}</span>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <span className="text-xs text-muted-foreground">
                          Selling your business will return approximately {formatCurrency(business.currentValue * 0.9)} to your personal funds.
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between gap-4">
                      <Badge className={`px-3 py-2 ${stats.profit >= 0 ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}`}>
                        <span className="font-semibold block">Daily Profit</span>
                        <span>{formatCurrency(stats.profit)}</span>
                      </Badge>
                      
                      <Badge className={`px-3 py-2 ${stats.roi >= 0 ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}`}>
                        <span className="font-semibold block">ROI</span>
                        <span>{Math.round(stats.roi * 10) / 10}%</span>
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-primary/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Financial Actions</CardTitle>
                <CardDescription>Manage business finances</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6 mt-4">
                  <div>
                    <h3 className="font-medium mb-2 flex items-center">
                      Current Cash
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Lightbulb className="ml-1 h-4 w-4 text-amber-500" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p className="text-xs">Your business cash is separate from personal funds. Keep at least 3 months of expenses as a reserve for unexpected costs and opportunities.</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </h3>
                    <div className="bg-primary/10 border border-primary/20 rounded-md p-4 mb-4 text-center">
                      <span className="text-2xl font-bold">{formatCurrency(business.cash)}</span>
                      <div className="text-xs font-normal mt-1">
                        {business.cash >= business.expenses * 90 ? (
                          <span className="text-green-600">Healthy reserve (3+ months of expenses)</span>
                        ) : business.cash >= business.expenses * 30 ? (
                          <span className="text-blue-600">Adequate reserve (1-3 months of expenses)</span>
                        ) : business.cash > 0 ? (
                          <span className="text-amber-600">Low reserve (less than 1 month of expenses)</span>
                        ) : (
                          <span className="text-red-600">Critical: No cash reserves</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Withdraw Funds</label>
                      <div className="flex gap-2">
                        <Input 
                          type="number" 
                          placeholder="Amount to withdraw" 
                          value={withdrawAmount} 
                          onChange={(e) => setWithdrawAmount(e.target.value)}
                        />
                        <Button 
                          variant="outline" 
                          onClick={handleWithdraw}
                          disabled={!withdrawAmount || parseFloat(withdrawAmount) <= 0 || parseFloat(withdrawAmount) > business.cash}
                        >
                          Withdraw
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Withdraw funds from your business to your personal account.
                      </p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-1 block">Invest Funds</label>
                      <div className="flex gap-2">
                        <Input 
                          type="number" 
                          placeholder="Amount to invest" 
                          value={investAmount} 
                          onChange={(e) => setInvestAmount(e.target.value)}
                        />
                        <Button 
                          variant="outline" 
                          onClick={handleInvest}
                          disabled={!investAmount || parseFloat(investAmount) <= 0}
                        >
                          Invest
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Invest personal funds into your business to increase its value and cash reserves.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="employees" className="mt-6">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Users className="h-5 w-5" />
                Employees ({business.employees.length})
              </h2>
              
              <Button 
                onClick={() => setIsHireDialogOpen(true)} 
                className="bg-primary hover:bg-primary/90"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Hire Employee
              </Button>
            </div>
            
            {business.employees.length === 0 ? (
              <div className="bg-muted/30 border border-primary/20 rounded-md p-8 text-center">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <h3 className="font-medium text-lg mb-2">No Employees Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Hire employees to increase your business capacity and productivity.
                </p>
                <Button 
                  onClick={() => setIsHireDialogOpen(true)} 
                  className="bg-primary hover:bg-primary/90"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Hire First Employee
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {business.employees.map(employee => (
                  <EmployeeCard 
                    key={employee.id} 
                    employee={employee} 
                    onFire={handleFireEmployee}
                    businessCash={business.cash}
                  />
                ))}
              </div>
            )}
            
            {/* Employee management tips */}
            {business.employees.length > 0 && (
              <div className="bg-muted/30 border border-primary/20 rounded-md p-4 mt-6">
                <h3 className="font-medium flex items-center gap-2 mb-2">
                  <UserCog className="h-4 w-4" />
                  Employee Management Tips
                </h3>
                <ul className="text-sm space-y-1">
                  <li className="flex items-center gap-1.5">
                    <ArrowUpRight className="h-3 w-3 text-green-500 flex-shrink-0" />
                    <span>Employees with high productivity contribute more to your business revenue.</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <ArrowUpRight className="h-3 w-3 text-green-500 flex-shrink-0" />
                    <span>Higher morale leads to better productivity and customer satisfaction.</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <ArrowUpRight className="h-3 w-3 text-green-500 flex-shrink-0" />
                    <span>Each employee increases your business capacity, allowing you to serve more customers.</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <ArrowDownRight className="h-3 w-3 text-red-500 flex-shrink-0" />
                    <span>Letting employees go requires severance pay equal to one month's salary.</span>
                  </li>
                </ul>
              </div>
            )}
          </div>
          
          {/* Hire Employee Dialog */}
          <HireEmployeeDialog
            open={isHireDialogOpen}
            onOpenChange={setIsHireDialogOpen}
            businessId={business.id}
            businessType={business.type}
            businessCash={business.cash}
          />
        </TabsContent>
        
        <TabsContent value="upgrades" className="mt-6">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Business Upgrades
              </h2>
              
              <Badge variant="outline" className="px-3 py-1">
                Available Cash: {formatCurrency(business.cash)}
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {business.upgrades.map(upgrade => (
                <UpgradeCard 
                  key={upgrade.id} 
                  upgrade={upgrade} 
                  onPurchase={handlePurchaseUpgrade}
                  businessCash={business.cash}
                />
              ))}
            </div>
            
            {/* Upgrade tips */}
            <div className="bg-muted/30 border border-primary/20 rounded-md p-4 mt-6">
              <h3 className="font-medium flex items-center gap-2 mb-2">
                <Settings className="h-4 w-4" />
                Upgrade Strategy Tips
              </h3>
              <ul className="text-sm space-y-1">
                <li className="flex items-center gap-1.5">
                  <ArrowUpRight className="h-3 w-3 text-green-500 flex-shrink-0" />
                  <span>Prioritize upgrades that boost revenue when your business is growing.</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <ArrowUpRight className="h-3 w-3 text-green-500 flex-shrink-0" />
                  <span>Focus on expense reduction during economic downturns.</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <ArrowUpRight className="h-3 w-3 text-green-500 flex-shrink-0" />
                  <span>Quality improvements lead to higher customer satisfaction and better reputation.</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <ArrowUpRight className="h-3 w-3 text-green-500 flex-shrink-0" />
                  <span>Capacity increases allow your business to serve more customers and grow faster.</span>
                </li>
              </ul>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="marketing" className="mt-6">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <BarChart className="h-5 w-5" />
                Marketing Campaigns
              </h2>
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    New Campaign
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Launch Marketing Campaign</DialogTitle>
                    <DialogDescription>
                      Marketing campaigns help increase customer acquisition, revenue, and business reputation.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Campaign Type</label>
                      <Select
                        value={campaignType}
                        onValueChange={setCampaignType}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a campaign type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="social_media">Social Media Campaign</SelectItem>
                          <SelectItem value="local_advertising">Local Advertising</SelectItem>
                          <SelectItem value="premium_branding">Premium Branding</SelectItem>
                          <SelectItem value="customer_loyalty">Customer Loyalty Program</SelectItem>
                          <SelectItem value="influencer">Influencer Partnership</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Campaign Duration</label>
                      <Select
                        value={campaignDuration}
                        onValueChange={setCampaignDuration}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="7">1 Week</SelectItem>
                          <SelectItem value="14">2 Weeks</SelectItem>
                          <SelectItem value="30">1 Month</SelectItem>
                          <SelectItem value="90">3 Months</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Campaign Budget</label>
                      <div className="flex items-center">
                        <Input 
                          type="number" 
                          placeholder="Budget amount" 
                          className="flex-1" 
                          value={campaignBudget}
                          onChange={(e) => setCampaignBudget(e.target.value)}
                        />
                        <span className="ml-2 text-sm text-muted-foreground">per month</span>
                      </div>
                      {business.cash < parseFloat(campaignBudget || '0') && (
                        <p className="text-xs text-red-500 mt-1">
                          Insufficient funds. Available: {formatCurrency(business.cash)}
                        </p>
                      )}
                    </div>
                    
                    <div className="space-y-2 p-4 border rounded-md bg-muted/30">
                      <h4 className="font-medium">Expected Benefits</h4>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div className="flex justify-between">
                          <span>Revenue Boost:</span>
                          <span>+5-15%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Reputation Gain:</span>
                          <span>+2-8 points</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Customer Satisfaction:</span>
                          <span>+1-5 points</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button variant="outline" onClick={() => {
                      setCampaignType('');
                      setCampaignDuration('');
                      setCampaignBudget('');
                    }}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleCreateMarketingCampaign}
                      disabled={!campaignType || !campaignDuration || !campaignBudget || business.cash < parseFloat(campaignBudget || '0')}
                    >
                      Launch Campaign
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            

            <div>
              <h3 className="font-medium mb-4">Active Campaigns</h3>
              
              {business.marketingCampaigns && Array.isArray(business.marketingCampaigns) && business.marketingCampaigns.length > 0 ? (
                <div className="space-y-4">
                  {business.marketingCampaigns.filter(campaign => campaign.active).map(campaign => (
                    <Card key={campaign.id} className="border-primary/30">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">{campaign.name}</CardTitle>
                        <CardDescription>{campaign.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="grid grid-cols-2 gap-4 mt-2">
                          <div className="text-sm space-y-1">
                            <div className="text-muted-foreground">Start Date</div>
                            <div>{formatDate(new Date(campaign.startDate))}</div>
                          </div>
                          <div className="text-sm space-y-1">
                            <div className="text-muted-foreground">End Date</div>
                            <div>{formatDate(new Date(campaign.endDate))}</div>
                          </div>
                          <div className="text-sm space-y-1">
                            <div className="text-muted-foreground">Cost</div>
                            <div>{formatCurrency(campaign.cost)}/month</div>
                          </div>
                          <div className="text-sm space-y-1">
                            <div className="text-muted-foreground">Status</div>
                            <Badge className="bg-green-600">Active</Badge>
                          </div>
                        </div>
                        
                        <div className="mt-4 text-sm">
                          <div className="font-medium mb-2">Campaign Effects:</div>
                          <div className="space-y-1">
                            <div className="flex items-center">
                              <ArrowUpRight className="h-4 w-4 mr-2 text-green-500" />
                              Revenue Multiplier: {formatPercentage(campaign.effect.revenueMultiplier)}
                            </div>
                            <div className="flex items-center">
                              <TrendingUp className="h-4 w-4 mr-2 text-green-500" />
                              Reputation Boost: +{campaign.effect.reputationBoost} points
                            </div>
                            <div className="flex items-center">
                              <TrendingUp className="h-4 w-4 mr-2 text-green-500" />
                              Customer Satisfaction: +{campaign.effect.customerSatisfactionBoost} points
                            </div>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => handleCancelMarketingCampaign(campaign.id)}
                        >
                          Cancel Campaign
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center p-8 bg-muted/20 border border-dashed rounded-md">
                  <BarChart className="mx-auto h-8 w-8 text-primary/60" />
                  <h3 className="mt-4 text-lg font-medium">No Active Campaigns</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Launch a marketing campaign to boost your business revenue and reputation.
                  </p>
                </div>
              )}
            </div>
            
            {business.marketingCampaigns && Array.isArray(business.marketingCampaigns) && business.marketingCampaigns.some(c => !c.active) && (
              <div>
                <h3 className="font-medium mb-4">Past Campaigns</h3>
                <div className="space-y-4">
                  {business.marketingCampaigns.filter(campaign => !campaign.active).map(campaign => (
                    <Card key={campaign.id} className="border-primary/30 bg-muted/30">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between">
                          <CardTitle className="text-lg">{campaign.name}</CardTitle>
                          <Badge variant="outline">Completed</Badge>
                        </div>
                        <CardDescription>{campaign.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="grid grid-cols-2 gap-4 mt-2">
                          <div className="text-sm space-y-1">
                            <div className="text-muted-foreground">Ran From</div>
                            <div>{formatDate(new Date(campaign.startDate))}</div>
                          </div>
                          <div className="text-sm space-y-1">
                            <div className="text-muted-foreground">To</div>
                            <div>{formatDate(new Date(campaign.endDate))}</div>
                          </div>
                          <div className="text-sm space-y-1">
                            <div className="text-muted-foreground">Total Cost</div>
                            <div>{formatCurrency(campaign.cost * (campaign.duration / 30))}</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="investments" className="mt-6">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Internal Investments
              </h2>
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    New Investment
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Internal Investment</DialogTitle>
                    <DialogDescription>
                      Invest in your business to improve quality, productivity, and operations.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Investment Category</label>
                      <Select
                        value={investmentCategory}
                        onValueChange={setInvestmentCategory}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="training">Employee Training</SelectItem>
                          <SelectItem value="research">Research & Development</SelectItem>
                          <SelectItem value="equipment">Equipment Upgrade</SelectItem>
                          <SelectItem value="facilities">Facility Improvement</SelectItem>
                          <SelectItem value="operations">Operations Optimization</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Investment Amount</label>
                      <div className="flex items-center">
                        <Input 
                          type="number" 
                          placeholder="Amount" 
                          className="flex-1"
                          value={investmentAmount}
                          onChange={(e) => setInvestmentAmount(e.target.value)}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">Available cash: {formatCurrency(business.cash)}</p>
                      {business.cash < parseFloat(investmentAmount || '0') && (
                        <p className="text-xs text-red-500">
                          Insufficient funds for this investment.
                        </p>
                      )}
                    </div>
                    
                    <div className="space-y-2 p-4 border rounded-md bg-muted/30">
                      <h4 className="font-medium">Expected Benefits</h4>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div className="flex justify-between">
                          <span>Quality Improvement:</span>
                          <span>+2-5 points</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Employee Productivity:</span>
                          <span>+5-10%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Expense Reduction:</span>
                          <span>Up to 5%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setInvestmentCategory('');
                        setInvestmentAmount('');
                      }}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleCreateInternalInvestment}
                      disabled={!investmentCategory || !investmentAmount || business.cash < parseFloat(investmentAmount || '0')}
                    >
                      Implement Investment
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            
            <div>
              <h3 className="font-medium mb-4">Active Investments</h3>
              
              {business.internalInvestments && business.internalInvestments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {business.internalInvestments.filter(investment => investment.active).map(investment => (
                    <Card key={investment.id} className="border-primary/30">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">{investment.name}</CardTitle>
                        <CardDescription>{investment.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="grid grid-cols-2 gap-4 mt-2">
                          <div className="text-sm space-y-1">
                            <div className="text-muted-foreground">Category</div>
                            <div className="capitalize">{investment.category.replace('_', ' ')}</div>
                          </div>
                          <div className="text-sm space-y-1">
                            <div className="text-muted-foreground">Implementation Date</div>
                            <div>{formatDate(new Date(investment.implementationDate))}</div>
                          </div>
                          <div className="text-sm space-y-1">
                            <div className="text-muted-foreground">Cost</div>
                            <div>{formatCurrency(investment.cost)}</div>
                          </div>
                        </div>
                        
                        <div className="mt-4 text-sm">
                          <div className="font-medium mb-2">Investment Effects:</div>
                          <div className="space-y-1">
                            {investment.effect.qualityBoost && (
                              <div className="flex items-center">
                                <TrendingUp className="h-4 w-4 mr-2 text-green-500" />
                                Quality Boost: +{investment.effect.qualityBoost} points
                              </div>
                            )}
                            {investment.effect.employeeProductivity && (
                              <div className="flex items-center">
                                <TrendingUp className="h-4 w-4 mr-2 text-green-500" />
                                Employee Productivity: +{formatPercentage(investment.effect.employeeProductivity)}
                              </div>
                            )}
                            {investment.effect.customerSatisfaction && (
                              <div className="flex items-center">
                                <TrendingUp className="h-4 w-4 mr-2 text-green-500" />
                                Customer Satisfaction: +{investment.effect.customerSatisfaction} points
                              </div>
                            )}
                            {investment.effect.expenseReduction && (
                              <div className="flex items-center">
                                <ArrowDownRight className="h-4 w-4 mr-2 text-green-500" />
                                Expense Reduction: {formatPercentage(investment.effect.expenseReduction)}
                              </div>
                            )}
                            {investment.effect.reputationBoost && (
                              <div className="flex items-center">
                                <TrendingUp className="h-4 w-4 mr-2 text-green-500" />
                                Reputation Boost: +{investment.effect.reputationBoost} points
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center p-8 bg-muted/20 border border-dashed rounded-md">
                  <Building2 className="mx-auto h-8 w-8 text-primary/60" />
                  <h3 className="mt-4 text-lg font-medium">No Active Investments</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Invest in your business to improve operations and increase profitability.
                  </p>
                </div>
              )}
            </div>
            
            <div className="p-4 bg-muted/30 rounded-md border border-primary/20">
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                Investment Tips
              </h3>
              <div className="space-y-2 text-sm">
                <p>• <span className="font-medium">Training investments</span> improve employee productivity and morale.</p>
                <p>• <span className="font-medium">Equipment upgrades</span> boost quality and reduce operating expenses.</p>
                <p>• <span className="font-medium">Facility improvements</span> enhance customer satisfaction and business reputation.</p>
                <p>• <span className="font-medium">Research & Development</span> can lead to innovative products or services.</p>
                <p>• Aim to invest at least 5-10% of your profits back into the business for sustainable growth.</p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Sell Business Confirmation Dialog */}
      <Dialog open={isSellDialogOpen} onOpenChange={setIsSellDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-500">Sell Business</DialogTitle>
            <DialogDescription>
              Are you sure you want to sell {business.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="bg-muted/30 p-4 rounded-md border border-primary/20">
              <h4 className="font-medium mb-2">Sale Information</h4>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Business Value:</span>
                  <span className="font-semibold">{formatCurrency(business.currentValue)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cash Reserves:</span>
                  <span className="font-semibold">{formatCurrency(business.cash)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Sale Price (90% of value):</span>
                  <span className="font-semibold">{formatCurrency(business.currentValue * 0.9)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="font-medium">Total Return:</span>
                  <span className="font-semibold">{formatCurrency(business.currentValue * 0.9 + business.cash)}</span>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsSellDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleSellBusiness}
            >
              Sell Business
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export function BusinessManagement() {
  const { businesses, selectedBusinessId, selectBusiness } = useBusiness();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
  // If there's a selected business, show its management panel
  const selectedBusiness = selectedBusinessId 
    ? businesses.find(b => b.id === selectedBusinessId) 
    : null;
  
  return (
    <div className="space-y-6">
      {selectedBusiness ? (
        <BusinessManagementPanel business={selectedBusiness} />
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Your Businesses</h1>
            
            <Button 
              onClick={() => setIsCreateDialogOpen(true)} 
              className="bg-primary hover:bg-primary/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Start New Business
            </Button>
          </div>
          
          {businesses.length === 0 ? (
            <div className="bg-muted/30 border border-primary/20 rounded-md p-8 text-center">
              <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <h3 className="font-medium text-lg mb-2">No Businesses Yet</h3>
              <p className="text-muted-foreground mb-4">
                Start your first business venture to earn additional income and grow your wealth.
              </p>
              <Button 
                onClick={() => setIsCreateDialogOpen(true)} 
                className="bg-primary hover:bg-primary/90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Start New Business
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {businesses.map(business => (
                <Card 
                  key={business.id} 
                  className="border-primary/30 cursor-pointer hover:border-primary transition-colors"
                  onClick={() => selectBusiness(business.id)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{business.name}</CardTitle>
                      <Badge>Level {business.level}</Badge>
                    </div>
                    <CardDescription>
                      {business.type.charAt(0).toUpperCase() + business.type.slice(1).replace('_', ' ')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Value:</span>
                        <span className="font-medium">{formatCurrency(business.currentValue)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Cash:</span>
                        <span className="font-medium">{formatCurrency(business.cash)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Daily Profit:</span>
                        <span className={`font-medium ${business.revenue - business.expenses >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(business.revenue - business.expenses)}
                        </span>
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-1 text-xs">
                          <span className="flex items-center">
                            <Star className="h-3 w-3 mr-1 text-yellow-500" />
                            Quality
                          </span>
                          <span>{Math.min(100, business.quality)}%</span>
                        </div>
                        <Progress value={Math.min(100, business.quality)} className="h-1.5" />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        selectBusiness(business.id);
                      }}
                    >
                      Manage Business
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* Business Creation Dialog */}
      <CreateBusinessDialog 
        open={isCreateDialogOpen} 
        onOpenChange={setIsCreateDialogOpen} 
      />
    </div>
  );
}