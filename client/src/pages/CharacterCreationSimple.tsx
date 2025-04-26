import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { toast } from "sonner";
import { formatCurrency } from "../lib/utils";
import { Target, Brain, Users, Zap, Briefcase, PenTool, Dumbbell, Crown, TrendingUp, Home, Car, Minus } from "lucide-react";
import TimeResetHack from "../TimeResetHack";
import { AppBackground } from "../components/AppBackground";
import useAudio from "../lib/stores/useAudio";
import { useCharacter, CharacterSkills, Job } from "../lib/stores/useCharacter";
import { useGame } from "../lib/stores/useGame";
import { professions, getAvailableEntryLevelJobs } from "../lib/services/jobService";

type WealthOption = 'bootstrapped' | 'middle-class' | 'wealthy';
type HousingType = 'shared' | 'rental' | 'owned' | 'homeless' | 'luxury';
type VehicleType = 'economy' | 'standard' | 'luxury' | 'premium' | 'bicycle' | 'none';
type JobCategory = 
  | 'tech' 
  | 'business' 
  | 'healthcare' 
  | 'creative' 
  | 'education' 
  | 'trades' 
  | 'service'
  | 'legal'
  | 'finance';

export default function CharacterCreationSimple() {
  const navigate = useNavigate();
  const { playSuccess } = useAudio();
  const { createNewCharacter } = useCharacter();
  const { start } = useGame();
  
  // Form state
  const [name, setName] = useState("");
  const [selectedWealth, setSelectedWealth] = useState<WealthOption>("middle-class");
  const [selectedHousing, setSelectedHousing] = useState<HousingType>("rental");
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleType>("standard");
  
  // Career and job selection
  const [availableJobs, setAvailableJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  
  // Skill allocation
  const [skillPoints, setSkillPoints] = useState(120);
  const [skills, setSkills] = useState<CharacterSkills>({
    intelligence: 30,
    creativity: 30,
    charisma: 30,
    technical: 30,
    leadership: 30,
    physical: 30
  });
  
  useEffect(() => {
    // Get available jobs from the job service
    const jobs = getAvailableEntryLevelJobs();
    setAvailableJobs(jobs);
    
    // Pre-select the first job
    if (jobs.length > 0) {
      setSelectedJob(jobs[0]);
    }
  }, []);
  
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
    
    // Batch state updates to prevent multiple renders
    const updatedSkills = {
      ...skills,
      [skill]: skills[skill] + amount
    };
    
    // Update state once with all changes
    setSkills(updatedSkills);
    setSkillPoints(skillPoints - amount);
  };
  
  // Handle decreasing skills
  const handleDecreaseSkill = (skill: keyof CharacterSkills) => {
    // Prevent decreasing below base value (30)
    if (skills[skill] <= 30) {
      toast.error("This skill cannot be decreased below the base level");
      return;
    }
    
    // Batch state updates to prevent multiple renders
    const updatedSkills = {
      ...skills,
      [skill]: skills[skill] - 1
    };
    
    // Update state once with all changes
    setSkills(updatedSkills);
    setSkillPoints(skillPoints + 1);
  };
  
  const handleStartGame = () => {
    if (!name.trim()) {
      toast.error("Please enter a name for your character");
      return;
    }
    
    if (!selectedJob) {
      toast.error("Please select a job");
      return;
    }
    
    // Find the selected wealth option
    const wealthOptions = [
      { id: 'bootstrapped', startingAmount: 10000 },
      { id: 'middle-class', startingAmount: 100000 },
      { id: 'wealthy', startingAmount: 1000000 }
    ];
    
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
  
  const selectNextJob = () => {
    if (!availableJobs.length) return;
    
    const currentIndex = selectedJob ? availableJobs.findIndex(job => job.id === selectedJob.id) : -1;
    const nextIndex = (currentIndex + 1) % availableJobs.length;
    setSelectedJob(availableJobs[nextIndex]);
  };
  
  const selectPreviousJob = () => {
    if (!availableJobs.length) return;
    
    const currentIndex = selectedJob ? availableJobs.findIndex(job => job.id === selectedJob.id) : -1;
    const prevIndex = currentIndex <= 0 ? availableJobs.length - 1 : currentIndex - 1;
    setSelectedJob(availableJobs[prevIndex]);
  };
  
  return (
    <div className="w-full min-h-screen flex items-center justify-center p-8">
      <TimeResetHack />
      
      <div className="absolute inset-0 z-0">
        <AppBackground />
      </div>
      
      <Card className="w-full max-w-2xl shadow-xl backdrop-blur-md border-primary/20 bg-background/30 relative z-10">
        <CardHeader className="pb-3">
          <CardTitle className="text-center">
            <div className="flex flex-col items-center justify-center mb-2 relative">
              <div className="absolute -top-10 -left-20 w-40 h-40 bg-primary/20 rounded-full blur-xl"></div>
              <div className="absolute -bottom-10 -right-20 w-40 h-40 bg-secondary/20 rounded-full blur-xl"></div>
              
              <div className="relative flex items-center justify-center mb-4">
                <div className="absolute inset-0 bg-primary/5 rounded-full blur-xl"></div>
                
                <div className="flex items-center gap-1">
                  <div className="relative z-10">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-20 bg-primary/10 rounded-full blur-md"></div>
                    <div className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-accent animate-gradient-x relative z-10 mr-1">
                      Aspira
                    </div>
                  </div>
                  
                  <div className="relative">
                    <img src="/images/aspira-new-logo-blue.png" alt="Aspira Logo" className="h-40 w-40 relative z-10 animate-pulse-slow" />
                  </div>
                </div>
              </div>
              
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
            <div className="grid grid-cols-3 gap-3">
              <div
                className={`p-4 cursor-pointer rounded-md border ${
                  selectedWealth === 'bootstrapped' 
                    ? 'border-primary bg-primary/10' 
                    : 'border-border bg-card/50'
                }`}
                onClick={() => setSelectedWealth('bootstrapped')}
              >
                <Briefcase className="h-10 w-10 mb-2 text-blue-500" />
                <h4 className="font-semibold">Self-Made</h4>
                <p className="text-xs text-muted-foreground">Start with $10,000 and build from scratch.</p>
                <p className="mt-1 text-xs font-semibold">Difficulty: Hard</p>
              </div>
              
              <div
                className={`p-4 cursor-pointer rounded-md border ${
                  selectedWealth === 'middle-class' 
                    ? 'border-primary bg-primary/10' 
                    : 'border-border bg-card/50'
                }`}
                onClick={() => setSelectedWealth('middle-class')}
              >
                <TrendingUp className="h-10 w-10 mb-2 text-green-500" />
                <h4 className="font-semibold">Middle Class</h4>
                <p className="text-xs text-muted-foreground">Begin with $100,000 - a solid foundation.</p>
                <p className="mt-1 text-xs font-semibold">Difficulty: Medium</p>
              </div>
              
              <div
                className={`p-4 cursor-pointer rounded-md border ${
                  selectedWealth === 'wealthy' 
                    ? 'border-primary bg-primary/10' 
                    : 'border-border bg-card/50'
                }`}
                onClick={() => setSelectedWealth('wealthy')}
              >
                <Crown className="h-10 w-10 mb-2 text-amber-500" />
                <h4 className="font-semibold">Wealthy</h4>
                <p className="text-xs text-muted-foreground">Start with $1,000,000 - already rich.</p>
                <p className="mt-1 text-xs font-semibold">Difficulty: Easy</p>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium mb-3 flex items-center">
              <Briefcase className="h-4 w-4 mr-1" />
              Choose Your Career
            </h3>
            
            <div className="p-4 border border-primary/20 rounded-md bg-background/60">
              <div className="flex justify-between items-center mb-3">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={selectPreviousJob}
                >
                  Previous Job
                </Button>
                
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={selectNextJob}
                >
                  Next Job
                </Button>
              </div>
              
              {selectedJob && (
                <div className="bg-card/50 border border-primary/20 p-4 rounded-md">
                  <h4 className="font-semibold text-lg mb-2">
                    {selectedJob.title} at {selectedJob.company}
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="text-sm">
                      <span className="text-muted-foreground">Salary:</span> {formatCurrency(selectedJob.salary)}/year
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">Hours:</span> {selectedJob.timeCommitment}/week
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">Stress:</span> 
                      {selectedJob.stress < 30 ? ' Low' : selectedJob.stress < 60 ? ' Medium' : ' High'}
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">Field:</span> {selectedJob.professionId.split('-')[0]}
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-semibold mb-1">Monthly Skill Development:</p>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(selectedJob.skillGains || {}).map(([skill, gain]) => (
                        <span key={skill} className="px-2 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full text-xs">
                          {skill} +{gain}/month
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
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
                        style={{ width: `${Math.min(100, (skills.intelligence / 150) * 100)}%` }} 
                      />
                    </div>
                  </div>
                  
                  {/* Creativity */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center">
                        <PenTool className="h-4 w-4 mr-1 text-purple-500" />
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
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-7 px-1 flex items-center justify-center" 
                            onClick={() => handleAllocateSkill('creativity', 1)}
                            disabled={skillPoints < 1 || skills.creativity >= 1000}
                          >
                            +1
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-7 px-1 flex items-center justify-center" 
                            onClick={() => handleAllocateSkill('creativity', 5)}
                            disabled={skillPoints < 5 || skills.creativity + 5 > 1000}
                          >
                            +5
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-7 px-1 flex items-center justify-center" 
                            onClick={() => handleAllocateSkill('creativity', 10)}
                            disabled={skillPoints < 10 || skills.creativity + 10 > 1000}
                          >
                            +10
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-purple-500 rounded-full" 
                        style={{ width: `${Math.min(100, (skills.creativity / 150) * 100)}%` }} 
                      />
                    </div>
                  </div>
                  
                  {/* Charisma */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1 text-pink-500" />
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
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-7 px-1 flex items-center justify-center" 
                            onClick={() => handleAllocateSkill('charisma', 1)}
                            disabled={skillPoints < 1 || skills.charisma >= 1000}
                          >
                            +1
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-7 px-1 flex items-center justify-center" 
                            onClick={() => handleAllocateSkill('charisma', 5)}
                            disabled={skillPoints < 5 || skills.charisma + 5 > 1000}
                          >
                            +5
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-7 px-1 flex items-center justify-center" 
                            onClick={() => handleAllocateSkill('charisma', 10)}
                            disabled={skillPoints < 10 || skills.charisma + 10 > 1000}
                          >
                            +10
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-pink-500 rounded-full" 
                        style={{ width: `${Math.min(100, (skills.charisma / 150) * 100)}%` }} 
                      />
                    </div>
                  </div>
                  
                  {/* Technical */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center">
                        <Zap className="h-4 w-4 mr-1 text-blue-500" />
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
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-7 px-1 flex items-center justify-center" 
                            onClick={() => handleAllocateSkill('technical', 1)}
                            disabled={skillPoints < 1 || skills.technical >= 1000}
                          >
                            +1
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-7 px-1 flex items-center justify-center" 
                            onClick={() => handleAllocateSkill('technical', 5)}
                            disabled={skillPoints < 5 || skills.technical + 5 > 1000}
                          >
                            +5
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-7 px-1 flex items-center justify-center" 
                            onClick={() => handleAllocateSkill('technical', 10)}
                            disabled={skillPoints < 10 || skills.technical + 10 > 1000}
                          >
                            +10
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 rounded-full" 
                        style={{ width: `${Math.min(100, (skills.technical / 150) * 100)}%` }} 
                      />
                    </div>
                  </div>
                  
                  {/* Leadership */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center">
                        <Briefcase className="h-4 w-4 mr-1 text-amber-500" />
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
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-7 px-1 flex items-center justify-center" 
                            onClick={() => handleAllocateSkill('leadership', 1)}
                            disabled={skillPoints < 1 || skills.leadership >= 1000}
                          >
                            +1
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-7 px-1 flex items-center justify-center" 
                            onClick={() => handleAllocateSkill('leadership', 5)}
                            disabled={skillPoints < 5 || skills.leadership + 5 > 1000}
                          >
                            +5
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-7 px-1 flex items-center justify-center" 
                            onClick={() => handleAllocateSkill('leadership', 10)}
                            disabled={skillPoints < 10 || skills.leadership + 10 > 1000}
                          >
                            +10
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-amber-500 rounded-full" 
                        style={{ width: `${Math.min(100, (skills.leadership / 150) * 100)}%` }} 
                      />
                    </div>
                  </div>
                  
                  {/* Physical */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center">
                        <Dumbbell className="h-4 w-4 mr-1 text-green-500" />
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
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-7 px-1 flex items-center justify-center" 
                            onClick={() => handleAllocateSkill('physical', 1)}
                            disabled={skillPoints < 1 || skills.physical >= 1000}
                          >
                            +1
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-7 px-1 flex items-center justify-center" 
                            onClick={() => handleAllocateSkill('physical', 5)}
                            disabled={skillPoints < 5 || skills.physical + 5 > 1000}
                          >
                            +5
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-7 px-1 flex items-center justify-center" 
                            onClick={() => handleAllocateSkill('physical', 10)}
                            disabled={skillPoints < 10 || skills.physical + 10 > 1000}
                          >
                            +10
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500 rounded-full" 
                        style={{ width: `${Math.min(100, (skills.physical / 150) * 100)}%` }} 
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <h3 className="text-sm font-medium mb-3">Select Housing</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div 
                className={`p-3 border border-primary/20 rounded-md cursor-pointer ${
                  selectedHousing === 'shared' ? 'border-primary bg-primary/10' : 'bg-card/50'
                }`}
                onClick={() => setSelectedHousing('shared')}
              >
                <div className="flex items-center">
                  <Home className={`h-5 w-5 mr-2 ${
                    selectedHousing === 'shared' ? 'text-primary' : 'text-muted-foreground'
                  }`} />
                  <div>
                    <div className="font-medium">Shared Housing</div>
                    <div className="text-sm text-muted-foreground">$800/mo</div>
                  </div>
                </div>
              </div>
              
              <div 
                className={`p-3 border border-primary/20 rounded-md cursor-pointer ${
                  selectedHousing === 'rental' ? 'border-primary bg-primary/10' : 'bg-card/50'
                }`}
                onClick={() => setSelectedHousing('rental')}
              >
                <div className="flex items-center">
                  <Home className={`h-5 w-5 mr-2 ${
                    selectedHousing === 'rental' ? 'text-primary' : 'text-muted-foreground'
                  }`} />
                  <div>
                    <div className="font-medium">Rental Housing</div>
                    <div className="text-sm text-muted-foreground">$2,000/mo</div>
                  </div>
                </div>
              </div>
              
              <div 
                className={`p-3 border border-primary/20 rounded-md cursor-pointer ${
                  selectedHousing === 'owned' ? 'border-primary bg-primary/10' : 'bg-card/50'
                }`}
                onClick={() => setSelectedHousing('owned')}
              >
                <div className="flex items-center">
                  <Home className={`h-5 w-5 mr-2 ${
                    selectedHousing === 'owned' ? 'text-primary' : 'text-muted-foreground'
                  }`} />
                  <div>
                    <div className="font-medium">Owned Home</div>
                    <div className="text-sm text-muted-foreground">$3,500/mo</div>
                  </div>
                </div>
              </div>
              
              <div 
                className={`p-3 border border-primary/20 rounded-md cursor-pointer ${
                  selectedHousing === 'luxury' ? 'border-primary bg-primary/10' : 'bg-card/50'
                }`}
                onClick={() => setSelectedHousing('luxury')}
              >
                <div className="flex items-center">
                  <Home className={`h-5 w-5 mr-2 ${
                    selectedHousing === 'luxury' ? 'text-primary' : 'text-muted-foreground'
                  }`} />
                  <div>
                    <div className="font-medium">Luxury Housing</div>
                    <div className="text-sm text-muted-foreground">$8,000/mo</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium mb-3">Select Transportation</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div 
                className={`p-3 border border-primary/20 rounded-md cursor-pointer ${
                  selectedVehicle === 'none' ? 'border-primary bg-primary/10' : 'bg-card/50'
                }`}
                onClick={() => setSelectedVehicle('none')}
              >
                <div className="flex items-center">
                  <Car className={`h-5 w-5 mr-2 ${
                    selectedVehicle === 'none' ? 'text-primary' : 'text-muted-foreground'
                  }`} />
                  <div>
                    <div className="font-medium">Public Transit</div>
                    <div className="text-sm text-muted-foreground">$150/mo</div>
                  </div>
                </div>
              </div>
              
              <div 
                className={`p-3 border border-primary/20 rounded-md cursor-pointer ${
                  selectedVehicle === 'economy' ? 'border-primary bg-primary/10' : 'bg-card/50'
                }`}
                onClick={() => setSelectedVehicle('economy')}
              >
                <div className="flex items-center">
                  <Car className={`h-5 w-5 mr-2 ${
                    selectedVehicle === 'economy' ? 'text-primary' : 'text-muted-foreground'
                  }`} />
                  <div>
                    <div className="font-medium">Economy Car</div>
                    <div className="text-sm text-muted-foreground">$350/mo</div>
                  </div>
                </div>
              </div>
              
              <div 
                className={`p-3 border border-primary/20 rounded-md cursor-pointer ${
                  selectedVehicle === 'standard' ? 'border-primary bg-primary/10' : 'bg-card/50'
                }`}
                onClick={() => setSelectedVehicle('standard')}
              >
                <div className="flex items-center">
                  <Car className={`h-5 w-5 mr-2 ${
                    selectedVehicle === 'standard' ? 'text-primary' : 'text-muted-foreground'
                  }`} />
                  <div>
                    <div className="font-medium">Standard Car</div>
                    <div className="text-sm text-muted-foreground">$500/mo</div>
                  </div>
                </div>
              </div>
              
              <div 
                className={`p-3 border border-primary/20 rounded-md cursor-pointer ${
                  selectedVehicle === 'luxury' ? 'border-primary bg-primary/10' : 'bg-card/50'
                }`}
                onClick={() => setSelectedVehicle('luxury')}
              >
                <div className="flex items-center">
                  <Car className={`h-5 w-5 mr-2 ${
                    selectedVehicle === 'luxury' ? 'text-primary' : 'text-muted-foreground'
                  }`} />
                  <div>
                    <div className="font-medium">Luxury Car</div>
                    <div className="text-sm text-muted-foreground">$1,200/mo</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        
        <CardFooter>
          <Button 
            onClick={handleStartGame} 
            className="w-full"
            disabled={!selectedJob || !name.trim()}
          >
            Start Your Journey to Wealth
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}