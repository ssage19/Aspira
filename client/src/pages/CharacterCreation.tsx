import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCharacter, Job, CharacterSkills } from '../lib/stores/useCharacter';
import { useGame } from '../lib/stores/useGame';
import { useAudio } from '../lib/stores/useAudio';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { toast } from 'sonner';
import { formatCurrency } from '../lib/utils';
import { DollarSign, Briefcase, TrendingUp, Crown, GraduationCap, BookOpen, Brain, Sparkles, Users, Wrench, Target, Home, Car, Coffee, Droplet, Battery } from 'lucide-react';
import { getAvailableEntryLevelJobs, professions, getCategoryLabel } from '../lib/services/jobService';
import type { JobCategory } from '../lib/data/jobs';

type WealthOption = 'bootstrapped' | 'middle-class' | 'wealthy';

export default function CharacterCreation() {
  const navigate = useNavigate();
  const { createNewCharacter, allocateSkillPoint } = useCharacter();
  const { start } = useGame();
  const { playSuccess } = useAudio();
  
  const [name, setName] = useState('');
  const [selectedWealth, setSelectedWealth] = useState<WealthOption>('bootstrapped');
  const [selectedCategory, setSelectedCategory] = useState<JobCategory | ''>('');
  const [selectedProfessionId, setSelectedProfessionId] = useState<string>('');
  const [availableJobs, setAvailableJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  
  // Basic needs state
  const [selectedHousing, setSelectedHousing] = useState<'homeless' | 'shared' | 'rental'>('shared');
  const [selectedVehicle, setSelectedVehicle] = useState<'none' | 'bicycle' | 'economy'>('none');
  
  // Skills state
  const [skills, setSkills] = useState<CharacterSkills>({
    intelligence: 30,
    creativity: 30,
    charisma: 30,
    technical: 30,
    leadership: 30
  });
  const [skillPoints, setSkillPoints] = useState(50);
  
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
  const handleAllocateSkill = (skill: keyof CharacterSkills) => {
    if (skillPoints <= 0) {
      toast.error("You have no more skill points to allocate");
      return;
    }
    
    if (skills[skill] >= 100) {
      toast.error("This skill is already at maximum level");
      return;
    }
    
    // Update local state first for immediate UI feedback
    setSkills(prevSkills => ({
      ...prevSkills,
      [skill]: prevSkills[skill] + 1
    }));
    setSkillPoints(prevPoints => prevPoints - 1);
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
    <div className="w-full min-h-screen flex items-center justify-center bg-gray-50 p-8">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold flex items-center">
            <DollarSign className="h-8 w-8 mr-2 text-green-500" />
            Luxury Lifestyle Simulator
          </CardTitle>
          <CardDescription className="text-lg">
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
                  <Card>
                    <CardHeader className="py-3">
                      <CardTitle className="text-xl flex items-center">
                        {option.icon}
                        <div>
                          {option.title}
                          <span className="ml-2 text-sm font-normal text-gray-500">
                            (Difficulty: {option.difficulty})
                          </span>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="py-2">
                      <p>{option.description}</p>
                      <p className="mt-2 text-lg font-semibold">
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
            <Card>
              <CardContent className="pt-4">
                <div className="flex justify-between mb-3">
                  <span className="text-sm font-medium">Available Skill Points:</span>
                  <span className="font-bold text-lg">{skillPoints}</span>
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
                        <span className="mr-2 text-lg font-semibold">{skills.intelligence}</span>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-7 px-2" 
                          onClick={() => handleAllocateSkill('intelligence')}
                          disabled={skillPoints <= 0 || skills.intelligence >= 100}
                        >
                          +
                        </Button>
                      </div>
                    </div>
                    <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-indigo-500 rounded-full" 
                        style={{ width: `${skills.intelligence}%` }}
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
                        <span className="mr-2 text-lg font-semibold">{skills.creativity}</span>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-7 px-2" 
                          onClick={() => handleAllocateSkill('creativity')}
                          disabled={skillPoints <= 0 || skills.creativity >= 100}
                        >
                          +
                        </Button>
                      </div>
                    </div>
                    <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-pink-500 rounded-full" 
                        style={{ width: `${skills.creativity}%` }}
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
                        <span className="mr-2 text-lg font-semibold">{skills.charisma}</span>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-7 px-2" 
                          onClick={() => handleAllocateSkill('charisma')}
                          disabled={skillPoints <= 0 || skills.charisma >= 100}
                        >
                          +
                        </Button>
                      </div>
                    </div>
                    <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 rounded-full" 
                        style={{ width: `${skills.charisma}%` }}
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
                        <span className="mr-2 text-lg font-semibold">{skills.technical}</span>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-7 px-2" 
                          onClick={() => handleAllocateSkill('technical')}
                          disabled={skillPoints <= 0 || skills.technical >= 100}
                        >
                          +
                        </Button>
                      </div>
                    </div>
                    <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-amber-500 rounded-full" 
                        style={{ width: `${skills.technical}%` }}
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
                        <span className="mr-2 text-lg font-semibold">{skills.leadership}</span>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-7 px-2" 
                          onClick={() => handleAllocateSkill('leadership')}
                          disabled={skillPoints <= 0 || skills.leadership >= 100}
                        >
                          +
                        </Button>
                      </div>
                    </div>
                    <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500 rounded-full" 
                        style={{ width: `${skills.leadership}%` }}
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
            <Card>
              <CardContent className="pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Housing Options */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Housing
                    </label>
                    <div className="space-y-2">
                      <div 
                        className={`p-3 border rounded-md cursor-pointer flex items-center ${selectedHousing === 'homeless' ? 'border-blue-500 bg-blue-50' : ''}`}
                        onClick={() => setSelectedHousing('homeless')}
                      >
                        <div className="mr-3">
                          <Home className={`h-5 w-5 ${selectedHousing === 'homeless' ? 'text-blue-500' : 'text-gray-400'}`} />
                        </div>
                        <div>
                          <div className="font-medium">Homeless</div>
                          <div className="text-xs text-gray-500">No housing costs, but negatively impacts health and comfort</div>
                        </div>
                      </div>
                      
                      <div 
                        className={`p-3 border rounded-md cursor-pointer flex items-center ${selectedHousing === 'shared' ? 'border-blue-500 bg-blue-50' : ''}`}
                        onClick={() => setSelectedHousing('shared')}
                      >
                        <div className="mr-3">
                          <Home className={`h-5 w-5 ${selectedHousing === 'shared' ? 'text-blue-500' : 'text-gray-400'}`} />
                        </div>
                        <div>
                          <div className="font-medium">Shared Housing</div>
                          <div className="text-xs text-gray-500">Basic accommodation with roommates at reasonable cost</div>
                        </div>
                      </div>
                      
                      <div 
                        className={`p-3 border rounded-md cursor-pointer flex items-center ${selectedHousing === 'rental' ? 'border-blue-500 bg-blue-50' : ''}`}
                        onClick={() => setSelectedHousing('rental')}
                      >
                        <div className="mr-3">
                          <Home className={`h-5 w-5 ${selectedHousing === 'rental' ? 'text-blue-500' : 'text-gray-400'}`} />
                        </div>
                        <div>
                          <div className="font-medium">Rental Housing</div>
                          <div className="text-xs text-gray-500">Your own rental home with better comfort but higher cost</div>
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
                        className={`p-3 border rounded-md cursor-pointer flex items-center ${selectedVehicle === 'none' ? 'border-blue-500 bg-blue-50' : ''}`}
                        onClick={() => setSelectedVehicle('none')}
                      >
                        <div className="mr-3">
                          <Car className={`h-5 w-5 ${selectedVehicle === 'none' ? 'text-blue-500' : 'text-gray-400'}`} />
                        </div>
                        <div>
                          <div className="font-medium">No Vehicle</div>
                          <div className="text-xs text-gray-500">Use public transportation, no ownership costs</div>
                        </div>
                      </div>
                      
                      <div 
                        className={`p-3 border rounded-md cursor-pointer flex items-center ${selectedVehicle === 'bicycle' ? 'border-blue-500 bg-blue-50' : ''}`}
                        onClick={() => setSelectedVehicle('bicycle')}
                      >
                        <div className="mr-3">
                          <Car className={`h-5 w-5 ${selectedVehicle === 'bicycle' ? 'text-blue-500' : 'text-gray-400'}`} />
                        </div>
                        <div>
                          <div className="font-medium">Bicycle</div>
                          <div className="text-xs text-gray-500">Environmentally friendly option with minimal costs</div>
                        </div>
                      </div>
                      
                      <div 
                        className={`p-3 border rounded-md cursor-pointer flex items-center ${selectedVehicle === 'economy' ? 'border-blue-500 bg-blue-50' : ''}`}
                        onClick={() => setSelectedVehicle('economy')}
                      >
                        <div className="mr-3">
                          <Car className={`h-5 w-5 ${selectedVehicle === 'economy' ? 'text-blue-500' : 'text-gray-400'}`} />
                        </div>
                        <div>
                          <div className="font-medium">Economy Car</div>
                          <div className="text-xs text-gray-500">Basic car with moderate costs and decent functionality</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 text-xs text-gray-500">
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
                      <div className="mt-4 p-3 bg-gray-50 rounded-md">
                        <h4 className="font-semibold text-lg mb-2">
                          {selectedJob.title} at {selectedJob.company}
                        </h4>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="text-sm">
                            <span className="text-gray-500">Salary:</span> {formatCurrency(selectedJob.salary)}/year
                          </div>
                          <div className="text-sm">
                            <span className="text-gray-500">Hours:</span> {selectedJob.timeCommitment}/week
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
                        <p className="text-sm font-semibold mb-1">Skills You'll Develop:</p>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(selectedJob.skillGains).map(([skill, gain]) => (
                            <span key={skill} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                              {skill} +{gain}/month
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="mt-2">
                        <p className="text-sm font-semibold mb-1">Required Skills:</p>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(selectedJob.skillRequirements).map(([skill, level]) => (
                            <span key={skill} className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs">
                              {skill}: {level}
                            </span>
                          ))}
                        </div>
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
