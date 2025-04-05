import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCharacter, Job } from '../lib/stores/useCharacter';
import { useGame } from '../lib/stores/useGame';
import { useAudio } from '../lib/stores/useAudio';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { toast } from 'sonner';
import { formatCurrency } from '../lib/utils';
import { DollarSign, Briefcase, TrendingUp, Crown, GraduationCap, BookOpen } from 'lucide-react';
import { getAvailableEntryLevelJobs, professions, getCategoryLabel } from '../lib/services/jobService';
import type { JobCategory } from '../lib/data/jobs';

type WealthOption = 'bootstrapped' | 'middle-class' | 'wealthy';

export default function CharacterCreation() {
  const navigate = useNavigate();
  const { createNewCharacter } = useCharacter();
  const { start } = useGame();
  const { playSuccess } = useAudio();
  
  const [name, setName] = useState('');
  const [selectedWealth, setSelectedWealth] = useState<WealthOption>('bootstrapped');
  const [selectedCategory, setSelectedCategory] = useState<JobCategory | ''>('');
  const [selectedProfessionId, setSelectedProfessionId] = useState<string>('');
  const [availableJobs, setAvailableJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  
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
    
    // Create new character with the numerical amount and selected job
    createNewCharacter(name, selectedOption.startingAmount, selectedJob);
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
