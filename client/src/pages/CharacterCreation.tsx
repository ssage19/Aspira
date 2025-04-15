import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCharacter, Job, CharacterSkills } from '../lib/stores/useCharacter';
import { useGame } from '../lib/stores/useGame';
import { AppBackground } from '../components/AppBackground';
import { useAudio } from '../lib/stores/useAudio';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { toast } from 'sonner';
import { formatCurrency } from '../lib/utils';
import { DollarSign, Briefcase, TrendingUp, Crown, GraduationCap, BookOpen, Brain, Sparkles, Users, Wrench, Target, Home, Car, Coffee, Droplet, Battery, Plus, Minus, Activity } from 'lucide-react';
import { getAvailableEntryLevelJobs, professions, getCategoryLabel } from '../lib/services/jobService';
import type { JobCategory } from '../lib/data/jobs';
import TimeResetHack from '../TimeResetHack';

type WealthOption = 'bootstrapped' | 'middle-class' | 'wealthy';

export default function CharacterCreation() {
  const navigate = useNavigate();
  const { createNewCharacter, allocateSkillPoint, decreaseSkillPoint } = useCharacter();
  const { phase, reset, start } = useGame();
  const { playSuccess } = useAudio();
  
  // Force reset the game state if we're on the character creation page
  useEffect(() => {
    // Force the game phase to "ready" when on character creation page
    if (phase !== "ready") {
      reset();
    }
  }, [phase, reset]);
  
  const [name, setName] = useState('');
  const [selectedWealth, setSelectedWealth] = useState<WealthOption>('bootstrapped');
  const [selectedCategory, setSelectedCategory] = useState<JobCategory | ''>('');
  const [selectedProfessionId, setSelectedProfessionId] = useState<string>('');
  const [availableJobs, setAvailableJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  
  // Basic needs state
  const [selectedHousing, setSelectedHousing] = useState<'homeless' | 'shared' | 'rental' | 'owned' | 'luxury'>('shared');
  const [selectedVehicle, setSelectedVehicle] = useState<'none' | 'bicycle' | 'economy' | 'standard' | 'luxury' | 'premium'>('none');
  
  // Skills state
  const [skills, setSkills] = useState<CharacterSkills>({
    intelligence: 30,
    creativity: 30,
    charisma: 30,
    technical: 30,
    leadership: 30,
    physical: 30
  });
  const [skillPoints, setSkillPoints] = useState(100);
  
  // Load available entry-level jobs on mount
  useEffect(() => {
    const jobs = getAvailableEntryLevelJobs();
    setAvailableJobs(jobs);
    
    // Set default category if available
    if (jobs.length > 0) {
      const firstJob = jobs[0];
      const profession = professions.find(p => p.id === firstJob.professionId);
      if (profession) {
        setSelectedCategory(profession.category);
      }
    }
  }, []);
  
  // When category changes, reset profession selection
  useEffect(() => {
    if (selectedCategory) {
      const professionsInCategory = professions.filter(p => p.category === selectedCategory);
      if (professionsInCategory.length > 0) {
        setSelectedProfessionId(professionsInCategory[0].id);
      }
    } else {
      setSelectedProfessionId('');
    }
  }, [selectedCategory]);
  
  // When profession changes, update selected job
  useEffect(() => {
    if (selectedProfessionId) {
      const job = availableJobs.find(job => job.professionId === selectedProfessionId);
      setSelectedJob(job || null);
    } else {
      setSelectedJob(null);
    }
  }, [selectedProfessionId, availableJobs]);
  
  // Handle skill point allocation
  const handleAllocateSkill = (skill: keyof CharacterSkills, amount: number = 1) => {
    if (skillPoints < amount) {
      toast.error(`You need ${amount} skill points to allocate`);
      return;
    }
    
    if (skills[skill] + amount > 1000) {
      toast.error("This would exceed the maximum skill level of 1000");
      return;
    }
    
    // Update local state first for immediate UI feedback
    setSkills(prevSkills => ({
      ...prevSkills,
      [skill]: prevSkills[skill] + amount
    }));
    setSkillPoints(prevPoints => prevPoints - amount);
  };
  
  // Handle decreasing skills
  const handleDecreaseSkill = (skill: keyof CharacterSkills) => {
    // Prevent decreasing below base value (30)
    if (skills[skill] <= 30) {
      toast.error("This skill cannot be decreased below the base level");
      return;
    }
    
    // Update local state for immediate UI feedback
    setSkills(prevSkills => ({
      ...prevSkills,
      [skill]: prevSkills[skill] - 1
    }));
    setSkillPoints(prevPoints => prevPoints + 1);
  };
  
  const handleStartGame = () => {
    if (!name.trim()) {
      toast.error("Please enter a name for your character");
      return;
    }
    
    // Find the selected wealth option
    const selectedOption = wealthOptions.find(option => option.id === selectedWealth);
    if (!selectedOption) {
      toast.error("Please select a valid starting wealth option");
      return;
    }
    
    // Create new character with the numerical amount, selected job, and customized skills
    createNewCharacter(name, selectedOption.startingAmount, selectedJob, skills);
    
    // Get the latest state after creation
    const { 
      setHousing, 
      setVehicle,
      updateHunger,
      updateThirst,
      updateEnergy,
      updateComfort
    } = useCharacter.getState();
    
    // Apply the selected housing type
    setHousing(selectedHousing);
    
    // Apply vehicle if selected
    if (selectedVehicle !== 'none') {
      setVehicle(selectedVehicle);
    }
    
    // Set initial basic needs values
    // They start high since the character just started
    updateHunger(80);
    updateThirst(80);
    updateEnergy(90);
    updateComfort(70);
    
    playSuccess();
    
    // Change game phase to playing
    start();
    
    // Navigate to main dashboard
    navigate('/');
  };
  
  const wealthOptions = [
    {
      id: 'bootstrapped',
      title: 'Self-Made',
      icon: <Briefcase className="h-10 w-10 mb-2 text-blue-500" />,
      description: 'Start with $10,000 and build your fortune from scratch.',
      startingAmount: 10000,
      difficulty: 'Hard'
    },
    {
      id: 'middle-class',
      title: 'Middle Class',
      icon: <TrendingUp className="h-10 w-10 mb-2 text-green-500" />,
      description: 'Begin with $100,000 - a solid foundation to grow your wealth.',
      startingAmount: 100000,
      difficulty: 'Medium'
    },
    {
      id: 'wealthy',
      title: 'Wealthy',
      icon: <Crown className="h-10 w-10 mb-2 text-amber-500" />,
      description: 'Start with $1,000,000 - already rich and ready to get richer.',
      startingAmount: 1000000,
      difficulty: 'Easy'
    }
  ];
  
  return (
    <div className="w-full min-h-screen flex items-center justify-center p-8">
      {/* Direct hack to fix time issues */}
      <TimeResetHack />
      
      <div className="absolute inset-0 z-0">
        <AppBackground />
      </div>
      <Card className="w-full max-w-2xl shadow-xl backdrop-blur-md border-primary/20 bg-background/30 relative z-10">
        <CardHeader className="pb-3">
          <CardTitle className="text-center">
            {/* Main container with flex-col to align elements vertically */}
            <div className="flex flex-col items-center justify-center mb-2 relative">
              {/* Shared decorative elements for the entire header */}
              <div className="absolute -top-10 -left-20 w-40 h-40 bg-primary/20 rounded-full blur-xl"></div>
              <div className="absolute -bottom-10 -right-20 w-40 h-40 bg-secondary/20 rounded-full blur-xl"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-40 bg-accent/10 rounded-full blur-lg"></div>
              
              {/* Title and logo container - completely redesigned for tighter integration */}
              <div className="relative flex items-center justify-center mb-4">
                {/* Combined background effects for both title and logo */}
                <div className="absolute inset-0 bg-primary/5 rounded-full blur-xl"></div>
                
                {/* Aspira title and logo in a tighter arrangement */}
                <div className="flex items-center gap-1">
                  <div className="relative z-10">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-20 bg-primary/10 rounded-full blur-md"></div>
                    <div className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-accent animate-gradient-x relative z-10 mr-1">
                      Aspira
                    </div>
                  </div>
                  
                  <div className="relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-44 h-44 bg-secondary/15 rounded-full blur-md"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-primary/10 rounded-full blur-lg"></div>
                    <img src="/images/aspira-new-logo.png" alt="Aspira Logo" className="h-40 w-40 relative z-10 animate-pulse-slow" />
                  </div>
                </div>
              </div>
              
              {/* Tagline - centered below logo+title */}
              <div className="text-xl font-medium flex items-center justify-center space-x-2">
                <span className="text-primary">Dream.</span>
                <span className="text-secondary">Build.</span>
                <span className="text-accent">Live.</span>
              </div>
            </div>
          </CardTitle>
          <CardDescription className="text-lg text-center">
            Create your character and begin your journey to extreme wealth
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              Character Name
            </label>
            <Input
              id="name"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full"
            />
          </div>
          
          <div>
            <h3 className="text-sm font-medium mb-3">Choose Your Starting Wealth</h3>
            <Tabs 
              defaultValue="bootstrapped" 
              onValueChange={(value) => setSelectedWealth(value as WealthOption)}
              className="w-full"
            >
              <TabsList className="grid grid-cols-3 mb-2">
                {wealthOptions.map(option => (
                  <TabsTrigger key={option.id} value={option.id}>{option.title}</TabsTrigger>
                ))}
              </TabsList>
              
              {wealthOptions.map(option => (
                <TabsContent key={option.id} value={option.id} className="mt-0">
                  <Card className="border border-primary/20 bg-background/60 backdrop-blur-sm">
                    <CardHeader className="py-3">
                      <CardTitle className="text-xl flex items-center">
                        {option.icon}
                        <div>
                          {option.title}
                          <span className="ml-2 text-sm font-normal text-muted-foreground">
                            (Difficulty: {option.difficulty})
                          </span>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="py-2">
                      <p>{option.description}</p>
                      <p className="mt-2 text-lg font-semibold text-primary">
                        Starting Wealth: {formatCurrency(option.startingAmount)}
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>
              ))}
            </Tabs>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-3 flex items-center">
              <Target className="h-4 w-4 mr-1" />
              Allocate Skill Points
            </h3>
            <Card className="border border-primary/20 bg-background/60 backdrop-blur-sm">
              <CardContent className="pt-4">
                <div className="flex justify-between mb-3">
                  <span className="text-sm font-medium">Available Skill Points:</span>
                  <span className="font-bold text-lg text-primary">{skillPoints}</span>
                </div>
                
                <div className="space-y-4">
                  {/* Intelligence */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center">
                        <Brain className="h-4 w-4 mr-1 text-indigo-500" />
                        <span className="font-medium">Intelligence</span>
                      </div>
                      <div className="flex items-center">
                        <span className="mx-2 text-lg font-semibold">{skills.intelligence}</span>
                        <div className="flex space-x-1">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-7 w-7 p-0 flex items-center justify-center" 
                            onClick={() => handleDecreaseSkill('intelligence')}
                            disabled={skills.intelligence <= 30}
                            title="Decrease Intelligence"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-7 px-1 flex items-center justify-center" 
                            onClick={() => handleAllocateSkill('intelligence', 1)}
                            disabled={skillPoints < 1 || skills.intelligence >= 1000}
                            title="Add 1 Intelligence"
                          >
                            +1
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-7 px-1 flex items-center justify-center" 
                            onClick={() => handleAllocateSkill('intelligence', 5)}
                            disabled={skillPoints < 5 || skills.intelligence + 5 > 1000}
                            title="Add 5 Intelligence"
                          >
                            +5
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-7 px-1 flex items-center justify-center" 
                            onClick={() => handleAllocateSkill('intelligence', 10)}
                            disabled={skillPoints < 10 || skills.intelligence + 10 > 1000}
                            title="Add 10 Intelligence"
                          >
                            +10
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-indigo-500 rounded-full" 
                        style={{ width: `${skills.intelligence / 10}%` }}
                      />
                    </div>
                  </div>
                  
                  {/* Creativity */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center">
                        <Sparkles className="h-4 w-4 mr-1 text-pink-500" />
                        <span className="font-medium">Creativity</span>
                      </div>
                      <div className="flex items-center">
                        <span className="mx-2 text-lg font-semibold">{skills.creativity}</span>
                        <div className="flex space-x-1">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-7 w-7 p-0 flex items-center justify-center" 
                            onClick={() => handleDecreaseSkill('creativity')}
                            disabled={skills.creativity <= 30}
                            title="Decrease Creativity"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-7 px-1 flex items-center justify-center" 
                            onClick={() => handleAllocateSkill('creativity', 1)}
                            disabled={skillPoints < 1 || skills.creativity >= 1000}
                            title="Add 1 Creativity"
                          >
                            +1
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-7 px-1 flex items-center justify-center" 
                            onClick={() => handleAllocateSkill('creativity', 5)}
                            disabled={skillPoints < 5 || skills.creativity + 5 > 1000}
                            title="Add 5 Creativity"
                          >
                            +5
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-7 px-1 flex items-center justify-center" 
                            onClick={() => handleAllocateSkill('creativity', 10)}
                            disabled={skillPoints < 10 || skills.creativity + 10 > 1000}
                            title="Add 10 Creativity"
                          >
                            +10
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-pink-500 rounded-full" 
                        style={{ width: `${skills.creativity / 10}%` }}
                      />
                    </div>
                  </div>
                  
                  {/* Charisma */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1 text-blue-500" />
                        <span className="font-medium">Charisma</span>
                      </div>
                      <div className="flex items-center">
                        <span className="mx-2 text-lg font-semibold">{skills.charisma}</span>
                        <div className="flex space-x-1">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-7 w-7 p-0 flex items-center justify-center" 
                            onClick={() => handleDecreaseSkill('charisma')}
                            disabled={skills.charisma <= 30}
                            title="Decrease Charisma"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-7 px-1 flex items-center justify-center" 
                            onClick={() => handleAllocateSkill('charisma', 1)}
                            disabled={skillPoints < 1 || skills.charisma >= 1000}
                            title="Add 1 Charisma"
                          >
                            +1
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-7 px-1 flex items-center justify-center" 
                            onClick={() => handleAllocateSkill('charisma', 5)}
                            disabled={skillPoints < 5 || skills.charisma + 5 > 1000}
                            title="Add 5 Charisma"
                          >
                            +5
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-7 px-1 flex items-center justify-center" 
                            onClick={() => handleAllocateSkill('charisma', 10)}
                            disabled={skillPoints < 10 || skills.charisma + 10 > 1000}
                            title="Add 10 Charisma"
                          >
                            +10
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 rounded-full" 
                        style={{ width: `${skills.charisma / 10}%` }}
                      />
                    </div>
                  </div>
                  
                  {/* Technical */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center">
                        <Wrench className="h-4 w-4 mr-1 text-amber-500" />
                        <span className="font-medium">Technical</span>
                      </div>
                      <div className="flex items-center">
                        <span className="mx-2 text-lg font-semibold">{skills.technical}</span>
                        <div className="flex space-x-1">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-7 w-7 p-0 flex items-center justify-center" 
                            onClick={() => handleDecreaseSkill('technical')}
                            disabled={skills.technical <= 30}
                            title="Decrease Technical"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-7 px-1 flex items-center justify-center" 
                            onClick={() => handleAllocateSkill('technical', 1)}
                            disabled={skillPoints < 1 || skills.technical >= 1000}
                            title="Add 1 Technical"
                          >
                            +1
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-7 px-1 flex items-center justify-center" 
                            onClick={() => handleAllocateSkill('technical', 5)}
                            disabled={skillPoints < 5 || skills.technical + 5 > 1000}
                            title="Add 5 Technical"
                          >
                            +5
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-7 px-1 flex items-center justify-center" 
                            onClick={() => handleAllocateSkill('technical', 10)}
                            disabled={skillPoints < 10 || skills.technical + 10 > 1000}
                            title="Add 10 Technical"
                          >
                            +10
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-amber-500 rounded-full" 
                        style={{ width: `${skills.technical / 10}%` }}
                      />
                    </div>
                  </div>
                  
                  {/* Leadership */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center">
                        <Target className="h-4 w-4 mr-1 text-green-500" />
                        <span className="font-medium">Leadership</span>
                      </div>
                      <div className="flex items-center">
                        <span className="mx-2 text-lg font-semibold">{skills.leadership}</span>
                        <div className="flex space-x-1">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-7 w-7 p-0 flex items-center justify-center" 
                            onClick={() => handleDecreaseSkill('leadership')}
                            disabled={skills.leadership <= 30}
                            title="Decrease Leadership"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-7 px-1 flex items-center justify-center" 
                            onClick={() => handleAllocateSkill('leadership', 1)}
                            disabled={skillPoints < 1 || skills.leadership >= 1000}
                            title="Add 1 Leadership"
                          >
                            +1
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-7 px-1 flex items-center justify-center" 
                            onClick={() => handleAllocateSkill('leadership', 5)}
                            disabled={skillPoints < 5 || skills.leadership + 5 > 1000}
                            title="Add 5 Leadership"
                          >
                            +5
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-7 px-1 flex items-center justify-center" 
                            onClick={() => handleAllocateSkill('leadership', 10)}
                            disabled={skillPoints < 10 || skills.leadership + 10 > 1000}
                            title="Add 10 Leadership"
                          >
                            +10
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500 rounded-full" 
                        style={{ width: `${skills.leadership / 10}%` }}
                      />
                    </div>
                  </div>
                  
                  {/* Physical */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center">
                        <Activity className="h-4 w-4 mr-1 text-red-500" />
                        <span className="font-medium">Physical</span>
                      </div>
                      <div className="flex items-center">
                        <span className="mx-2 text-lg font-semibold">{skills.physical}</span>
                        <div className="flex space-x-1">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-7 w-7 p-0 flex items-center justify-center" 
                            onClick={() => handleDecreaseSkill('physical')}
                            disabled={skills.physical <= 30}
                            title="Decrease Physical"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-7 px-1 flex items-center justify-center" 
                            onClick={() => handleAllocateSkill('physical', 1)}
                            disabled={skillPoints < 1 || skills.physical >= 1000}
                            title="Add 1 Physical"
                          >
                            +1
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-7 px-1 flex items-center justify-center" 
                            onClick={() => handleAllocateSkill('physical', 5)}
                            disabled={skillPoints < 5 || skills.physical + 5 > 1000}
                            title="Add 5 Physical"
                          >
                            +5
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-7 px-1 flex items-center justify-center" 
                            onClick={() => handleAllocateSkill('physical', 10)}
                            disabled={skillPoints < 10 || skills.physical + 10 > 1000}
                            title="Add 10 Physical"
                          >
                            +10
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-red-500 rounded-full" 
                        style={{ width: `${skills.physical / 10}%` }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <h3 className="text-sm font-medium mb-3 flex items-center">
              <Home className="h-4 w-4 mr-1 text-blue-500" />
              Basic Needs
            </h3>
            <Card className="border border-primary/20 bg-background/60 backdrop-blur-sm">
              <CardContent className="pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Housing Options */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Housing
                    </label>
                    <div className="space-y-2">
                      <div 
                        className={`p-3 border border-primary/20 rounded-md cursor-pointer flex items-center ${selectedHousing === 'homeless' ? 'border-primary bg-primary/10' : 'bg-card/50'}`}
                        onClick={() => setSelectedHousing('homeless')}
                      >
                        <div className="mr-3">
                          <Home className={`h-5 w-5 ${selectedHousing === 'homeless' ? 'text-primary' : 'text-muted-foreground'}`} />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium flex justify-between">
                            <span>Homeless</span>
                            <span className="text-green-500 font-semibold">$0/mo</span>
                          </div>
                          <div className="text-xs text-muted-foreground">No housing costs, but negatively impacts health and comfort</div>
                        </div>
                      </div>
                      
                      <div 
                        className={`p-3 border border-primary/20 rounded-md cursor-pointer flex items-center ${selectedHousing === 'shared' ? 'border-primary bg-primary/10' : 'bg-card/50'}`}
                        onClick={() => setSelectedHousing('shared')}
                      >
                        <div className="mr-3">
                          <Home className={`h-5 w-5 ${selectedHousing === 'shared' ? 'text-primary' : 'text-muted-foreground'}`} />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium flex justify-between">
                            <span>Shared Housing</span>
                            <span className="text-amber-600 font-semibold">$800/mo</span>
                          </div>
                          <div className="text-xs text-muted-foreground">Basic accommodation with roommates at reasonable cost</div>
                        </div>
                      </div>
                      
                      <div 
                        className={`p-3 border border-primary/20 rounded-md cursor-pointer flex items-center ${selectedHousing === 'rental' ? 'border-primary bg-primary/10' : 'bg-card/50'}`}
                        onClick={() => setSelectedHousing('rental')}
                      >
                        <div className="mr-3">
                          <Home className={`h-5 w-5 ${selectedHousing === 'rental' ? 'text-primary' : 'text-muted-foreground'}`} />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium flex justify-between">
                            <span>Rental Housing</span>
                            <span className="text-amber-600 font-semibold">$2,000/mo</span>
                          </div>
                          <div className="text-xs text-muted-foreground">Your own rental apartment with better comfort but higher cost</div>
                        </div>
                      </div>
                      
                      <div 
                        className={`p-3 border border-primary/20 rounded-md cursor-pointer flex items-center ${selectedHousing === 'owned' ? 'border-primary bg-primary/10' : 'bg-card/50'}`}
                        onClick={() => setSelectedHousing('owned')}
                      >
                        <div className="mr-3">
                          <Home className={`h-5 w-5 ${selectedHousing === 'owned' ? 'text-primary' : 'text-muted-foreground'}`} />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium flex justify-between">
                            <span>Owned Home</span>
                            <span className="text-amber-600 font-semibold">$3,500/mo</span>
                          </div>
                          <div className="text-xs text-muted-foreground">Your own house with mortgage payments, but builds equity</div>
                        </div>
                      </div>
                      
                      <div 
                        className={`p-3 border border-primary/20 rounded-md cursor-pointer flex items-center ${selectedHousing === 'luxury' ? 'border-primary bg-primary/10' : 'bg-card/50'}`}
                        onClick={() => setSelectedHousing('luxury')}
                      >
                        <div className="mr-3">
                          <Home className={`h-5 w-5 ${selectedHousing === 'luxury' ? 'text-primary' : 'text-muted-foreground'}`} />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium flex justify-between">
                            <span>Luxury Housing</span>
                            <span className="text-amber-600 font-semibold">$8,000/mo</span>
                          </div>
                          <div className="text-xs text-muted-foreground">High-end living with premium amenities and significant prestige</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Vehicle Options */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Transportation
                    </label>
                    <div className="space-y-2">
                      <div 
                        className={`p-3 border border-primary/20 rounded-md cursor-pointer flex items-center ${selectedVehicle === 'none' ? 'border-primary bg-primary/10' : 'bg-card/50'}`}
                        onClick={() => setSelectedVehicle('none')}
                      >
                        <div className="mr-3">
                          <Car className={`h-5 w-5 ${selectedVehicle === 'none' ? 'text-primary' : 'text-muted-foreground'}`} />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium flex justify-between">
                            <span>No Vehicle</span>
                            <span className="text-green-600 font-semibold">$150/mo</span>
                          </div>
                          <div className="text-xs text-muted-foreground">Use public transportation, lower monthly costs but limited mobility</div>
                        </div>
                      </div>
                      
                      <div 
                        className={`p-3 border border-primary/20 rounded-md cursor-pointer flex items-center ${selectedVehicle === 'bicycle' ? 'border-primary bg-primary/10' : 'bg-card/50'}`}
                        onClick={() => setSelectedVehicle('bicycle')}
                      >
                        <div className="mr-3">
                          <Car className={`h-5 w-5 ${selectedVehicle === 'bicycle' ? 'text-primary' : 'text-muted-foreground'}`} />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium flex justify-between">
                            <span>Bicycle</span>
                            <span className="text-green-600 font-semibold">$30/mo</span>
                          </div>
                          <div className="text-xs text-muted-foreground">Environmentally friendly with very low maintenance costs</div>
                        </div>
                      </div>
                      
                      <div 
                        className={`p-3 border border-primary/20 rounded-md cursor-pointer flex items-center ${selectedVehicle === 'economy' ? 'border-primary bg-primary/10' : 'bg-card/50'}`}
                        onClick={() => setSelectedVehicle('economy')}
                      >
                        <div className="mr-3">
                          <Car className={`h-5 w-5 ${selectedVehicle === 'economy' ? 'text-primary' : 'text-muted-foreground'}`} />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium flex justify-between">
                            <span>Economy Car</span>
                            <span className="text-amber-600 font-semibold">$350/mo</span>
                          </div>
                          <div className="text-xs text-muted-foreground">Basic car with moderate costs, including gas and insurance</div>
                        </div>
                      </div>
                      
                      <div 
                        className={`p-3 border border-primary/20 rounded-md cursor-pointer flex items-center ${selectedVehicle === 'standard' ? 'border-primary bg-primary/10' : 'bg-card/50'}`}
                        onClick={() => setSelectedVehicle('standard')}
                      >
                        <div className="mr-3">
                          <Car className={`h-5 w-5 ${selectedVehicle === 'standard' ? 'text-primary' : 'text-muted-foreground'}`} />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium flex justify-between">
                            <span>Standard Car</span>
                            <span className="text-amber-600 font-semibold">$500/mo</span>
                          </div>
                          <div className="text-xs text-muted-foreground">Mid-range vehicle with good comfort and reliability</div>
                        </div>
                      </div>
                      
                      <div 
                        className={`p-3 border border-primary/20 rounded-md cursor-pointer flex items-center ${selectedVehicle === 'luxury' ? 'border-primary bg-primary/10' : 'bg-card/50'}`}
                        onClick={() => setSelectedVehicle('luxury')}
                      >
                        <div className="mr-3">
                          <Car className={`h-5 w-5 ${selectedVehicle === 'luxury' ? 'text-primary' : 'text-muted-foreground'}`} />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium flex justify-between">
                            <span>Luxury Car</span>
                            <span className="text-amber-600 font-semibold">$1,200/mo</span>
                          </div>
                          <div className="text-xs text-muted-foreground">High-end vehicle with premium features and prestige</div>
                        </div>
                      </div>
                      
                      <div 
                        className={`p-3 border border-primary/20 rounded-md cursor-pointer flex items-center ${selectedVehicle === 'premium' ? 'border-primary bg-primary/10' : 'bg-card/50'}`}
                        onClick={() => setSelectedVehicle('premium')}
                      >
                        <div className="mr-3">
                          <Car className={`h-5 w-5 ${selectedVehicle === 'premium' ? 'text-primary' : 'text-muted-foreground'}`} />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium flex justify-between">
                            <span>Premium Car</span>
                            <span className="text-amber-600 font-semibold">$2,500/mo</span>
                          </div>
                          <div className="text-xs text-muted-foreground">Exotic or ultra-premium vehicle with maximum prestige</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 text-xs text-muted-foreground">
                  <p>Your basic needs affect your health, happiness, and overall wellbeing. Maintaining them requires ongoing expenses.</p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <h3 className="text-sm font-medium mb-3 flex items-center">
              <Briefcase className="h-4 w-4 mr-1" />
              Choose Your Career
            </h3>
            <Tabs defaultValue="category" className="w-full">
              <TabsList className="grid grid-cols-2 mb-2">
                <TabsTrigger value="category">Select Profession</TabsTrigger>
                <TabsTrigger value="details" disabled={!selectedJob}>Your Position</TabsTrigger>
              </TabsList>
              
              <TabsContent value="category">
                <Card>
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="job-category" className="block text-sm font-medium mb-1">
                          Career Field
                        </label>
                        <Select 
                          value={selectedCategory} 
                          onValueChange={(value) => setSelectedCategory(value as JobCategory)}
                        >
                          <SelectTrigger id="job-category">
                            <SelectValue placeholder="Select a career field" />
                          </SelectTrigger>
                          <SelectContent>
                            {professions
                              .map(p => p.category)
                              .filter((value, index, self) => self.indexOf(value) === index) // Get unique categories
                              .map(category => (
                                <SelectItem key={category} value={category}>
                                  {getCategoryLabel(category)}
                                </SelectItem>
                              ))
                            }
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <label htmlFor="profession" className="block text-sm font-medium mb-1">
                          Profession
                        </label>
                        <Select 
                          value={selectedProfessionId} 
                          onValueChange={setSelectedProfessionId}
                          disabled={!selectedCategory}
                        >
                          <SelectTrigger id="profession">
                            <SelectValue placeholder="Select a profession" />
                          </SelectTrigger>
                          <SelectContent>
                            {selectedCategory && professions
                              .filter(p => p.category === selectedCategory)
                              .map(profession => (
                                <SelectItem key={profession.id} value={profession.id}>
                                  {profession.name}
                                </SelectItem>
                              ))
                            }
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    {selectedJob && (
                      <div className="mt-4 p-3 bg-card/50 border border-primary/20 rounded-md">
                        <h4 className="font-semibold text-lg mb-2">
                          {selectedJob.title} at {selectedJob.company}
                        </h4>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="text-sm">
                            <span className="text-muted-foreground">Salary:</span> {formatCurrency(selectedJob.salary)}/year
                          </div>
                          <div className="text-sm">
                            <span className="text-muted-foreground">Hours:</span> {selectedJob.timeCommitment}/week
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="details">
                {selectedJob && (
                  <Card>
                    <CardHeader className="py-3">
                      <CardTitle className="text-xl">
                        {selectedJob.title} at {selectedJob.company}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="py-2 grid gap-3">
                      <div className="flex justify-between">
                        <span>Salary:</span>
                        <span className="font-semibold">{formatCurrency(selectedJob.salary)}/year</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Work Hours:</span>
                        <span className="font-semibold">{selectedJob.timeCommitment} hours/week</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Stress Level:</span>
                        <span className="font-semibold">
                          {selectedJob.stress < 30 ? 'Low' : selectedJob.stress < 60 ? 'Medium' : 'High'}
                        </span>
                      </div>
                      <div className="mt-2">
                        <p className="text-sm font-semibold mb-1">Monthly Skill Development:</p>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(selectedJob.skillGains || {}).map(([skill, gain]) => (
                            <span key={skill} className="px-2 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full text-xs">
                              {skill} +{gain}/month
                            </span>
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          These skills will be automatically added to your character each month
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
        
        <CardFooter>
          <Button 
            onClick={handleStartGame} 
            className="w-full"
            disabled={!selectedJob}
          >
            Start Your Journey to Wealth
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
