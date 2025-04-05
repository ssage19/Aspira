import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCharacter, Job } from '../lib/stores/useCharacter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Progress } from '../components/ui/progress';
import { Briefcase, TrendingUp, Clock, Trophy, Award, AlertCircle, ChevronLeft, Lightbulb, Brain, Timer, GraduationCap } from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import { toast } from 'sonner';
import { getNextJobInCareerPath, getJobByLevelInProfession, getProfession } from '../lib/services/jobService';
import type { Profession, CareerPath } from '../lib/data/jobs';
import GameUI from '../components/GameUI';
import { useTime } from '../lib/stores/useTime';
import { useGame } from '../lib/stores/useGame';
import { useAudio } from '../lib/stores/useAudio';

// Define challenge types for skill development
type ChallengeType = {
  id: string;
  title: string;
  description: string;
  skill: string;
  difficultyLevel: 'easy' | 'medium' | 'hard';
  xpReward: number;
  completionTime: number; // in months
  completed?: boolean;
  inProgress?: boolean;
  startDate?: Date;
  readyForCompletion?: boolean;
};

export default function JobScreen() {
  const navigate = useNavigate();
  const { job, skills, improveSkill, promoteJob, daysSincePromotion } = useCharacter();
  const { currentGameDate } = useTime();
  const { unlockAchievement } = useGame();
  const audio = useAudio();
  const [profession, setProfession] = useState<Profession | undefined>(undefined);
  const [nextJob, setNextJob] = useState<CareerPath | undefined>(undefined);
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [challenges, setChallenges] = useState<ChallengeType[]>([]);
  const [selectedChallenge, setSelectedChallenge] = useState<ChallengeType | null>(null);
  
  // Load challenges from localStorage on mount
  useEffect(() => {
    const savedChallenges = localStorage.getItem(`challenges-${job?.id}`);
    if (savedChallenges) {
      try {
        const parsedChallenges = JSON.parse(savedChallenges);
        // Convert string dates back to Date objects
        const hydratedChallenges = parsedChallenges.map((c: any) => ({
          ...c,
          startDate: c.startDate ? new Date(c.startDate) : undefined
        }));
        setChallenges(hydratedChallenges);
      } catch (e) {
        console.error("Error loading saved challenges", e);
      }
    }
  }, [job?.id]);
  
  useEffect(() => {
    if (job) {
      // Load profession data
      const currentProfession = getProfession(job.professionId);
      setProfession(currentProfession);
      
      // Find next job in career path
      const next = getNextJobInCareerPath(job.professionId, job.jobLevel);
      setNextJob(next);
      
      // Calculate progress towards skill requirements for promotion
      if (next) {
        const progressData: Record<string, number> = {};
        
        Object.entries(next.skillRequirements).forEach(([skill, requiredLevel]) => {
          const currentLevel = skills[skill as keyof typeof skills] || 0;
          const typedRequiredLevel = requiredLevel as number;
          const progressPercent = Math.min(100, (currentLevel / typedRequiredLevel) * 100);
          progressData[skill] = progressPercent;
        });
        
        setProgress(progressData);
      }
      
      // Check if we have saved challenges first
      const savedChallenges = localStorage.getItem(`challenges-${job.id}`);
      if (savedChallenges) {
        // We already loaded the challenges in the first useEffect, so don't overwrite them
        return;
      }
      
      // If no saved challenges, generate job-specific skill challenges
      const jobChallenges: ChallengeType[] = generateChallenges(job);
      setChallenges(jobChallenges);
    }
  }, [job, skills]);

  // Generate challenges based on the current job and skills needed for advancement
  const generateChallenges = (currentJob: Job): ChallengeType[] => {
    const challengeList: ChallengeType[] = [];
    
    // Create challenges for each skill the job helps develop
    Object.entries(currentJob.skillGains).forEach(([skill, gain]) => {
      if (gain > 0) {
        // Easy challenge
        challengeList.push({
          id: `${currentJob.id}-${skill}-easy`,
          title: getSkillChallengeTitle(skill, 'easy'),
          description: getSkillChallengeDescription(skill, 'easy', currentJob.title),
          skill,
          difficultyLevel: 'easy',
          xpReward: 1,
          completionTime: 2, // Months
          completed: false
        });
        
        // Medium challenge
        challengeList.push({
          id: `${currentJob.id}-${skill}-medium`,
          title: getSkillChallengeTitle(skill, 'medium'),
          description: getSkillChallengeDescription(skill, 'medium', currentJob.title),
          skill,
          difficultyLevel: 'medium',
          xpReward: 2,
          completionTime: 5,
          completed: false
        });
        
        // Hard challenge - only if current skill level is high enough
        if ((skills[skill as keyof typeof skills] || 0) >= 5) {
          challengeList.push({
            id: `${currentJob.id}-${skill}-hard`,
            title: getSkillChallengeTitle(skill, 'hard'),
            description: getSkillChallengeDescription(skill, 'hard', currentJob.title),
            skill,
            difficultyLevel: 'hard',
            xpReward: 4,
            completionTime: 10,
            completed: false
          });
        }
      }
    });
    
    // Ensure we have at least one challenge for a skill in next job (if it exists)
    if (nextJob) {
      const nextJobSkills = Object.keys(nextJob.skillRequirements);
      const randomSkill = nextJobSkills[Math.floor(Math.random() * nextJobSkills.length)];
      
      challengeList.push({
        id: `${currentJob.id}-${randomSkill}-next`,
        title: `Prepare for advancement in ${randomSkill}`,
        description: `Build your ${randomSkill} skills to prepare for your next role as ${nextJob.title}.`,
        skill: randomSkill,
        difficultyLevel: 'medium',
        xpReward: 3,
        completionTime: 7,
        completed: false
      });
    }
    
    return challengeList;
  };
  
  const getSkillChallengeTitle = (skill: string, difficulty: 'easy' | 'medium' | 'hard'): string => {
    const titles = {
      intelligence: {
        easy: 'Research Project',
        medium: 'Complex Problem Solving',
        hard: 'Innovative Analysis'
      },
      creativity: {
        easy: 'Brainstorming Session',
        medium: 'Creative Solution Development',
        hard: 'Innovative Design Challenge'
      },
      charisma: {
        easy: 'Team Presentation',
        medium: 'Client Negotiation',
        hard: 'Executive Pitch'
      },
      technical: {
        easy: 'Technical Documentation',
        medium: 'System Optimization',
        hard: 'Advanced Implementation'
      },
      leadership: {
        easy: 'Team Coordination',
        medium: 'Project Leadership',
        hard: 'Strategic Initiative'
      }
    };
    
    return titles[skill as keyof typeof titles]?.[difficulty] || `${skill} ${difficulty} challenge`;
  };
  
  const getSkillChallengeDescription = (skill: string, difficulty: 'easy' | 'medium' | 'hard', jobTitle: string): string => {
    const descriptions = {
      intelligence: {
        easy: `Complete a research project relevant to your role as ${jobTitle}.`,
        medium: `Analyze complex data and provide actionable insights for your team.`,
        hard: `Develop a comprehensive strategy based on industry analysis.`
      },
      creativity: {
        easy: `Generate new ideas to improve a process in your role.`,
        medium: `Design an innovative solution to a recurring problem.`,
        hard: `Create a completely new approach that transforms your work.`
      },
      charisma: {
        easy: `Successfully present a project to your team.`,
        medium: `Negotiate effectively with clients or stakeholders.`,
        hard: `Deliver a persuasive presentation to executives.`
      },
      technical: {
        easy: `Master a new tool or technique relevant to your position.`,
        medium: `Implement a significant technical improvement to your workflow.`,
        hard: `Develop an advanced technical solution to a complex problem.`
      },
      leadership: {
        easy: `Lead a small team to complete a specific task.`,
        medium: `Successfully manage a project from start to finish.`,
        hard: `Develop and execute a strategic initiative with measurable results.`
      }
    };
    
    return descriptions[skill as keyof typeof descriptions]?.[difficulty] || 
      `Complete a ${difficulty} challenge to improve your ${skill} skills.`;
  };

  const getSkillColor = (skill: string): string => {
    switch(skill) {
      case 'intelligence': return 'bg-indigo-500';
      case 'creativity': return 'bg-pink-500';
      case 'charisma': return 'bg-blue-500';
      case 'technical': return 'bg-amber-500';
      case 'leadership': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };
  
  const getSkillIcon = (skill: string) => {
    switch(skill) {
      case 'intelligence': return <span className="h-4 w-4 text-indigo-500">🧠</span>;
      case 'creativity': return <span className="h-4 w-4 text-pink-500">✨</span>;
      case 'charisma': return <span className="h-4 w-4 text-blue-500">👥</span>;
      case 'technical': return <span className="h-4 w-4 text-amber-500">🔧</span>;
      case 'leadership': return <span className="h-4 w-4 text-green-500">🎯</span>;
      default: return <span className="h-4 w-4">❓</span>;
    }
  };
  
  const formatJobLevel = (level: string): string => {
    switch(level) {
      case 'entry': return 'Entry Level';
      case 'junior': return 'Junior';
      case 'mid': return 'Mid-Level';
      case 'senior': return 'Senior';
      case 'executive': return 'Executive';
      default: return level;
    }
  };
  
  const calculateDailyIncome = (annualSalary: number): number => {
    return annualSalary / 365;
  };
  
  const calculateTimeToPromotion = (): string => {
    if (!nextJob) return 'N/A';
    
    // Check if skills are met
    const allSkillsMet = Object.entries(nextJob.skillRequirements).every(
      ([skill, requiredLevel]) => {
        const currentLevel = skills[skill as keyof typeof skills] || 0;
        return currentLevel >= requiredLevel;
      }
    );
    
    if (!allSkillsMet) {
      return 'Skill requirements not met';
    }
    
    // Calculate time based on experience
    if (!job) return 'N/A';
    
    const experienceNeeded = nextJob.experience;
    const currentExperience = job.monthsInPosition;
    
    if (currentExperience >= experienceNeeded) {
      return 'Ready for promotion!';
    }
    
    const monthsRemaining = experienceNeeded - currentExperience;
    return `${monthsRemaining} more month${monthsRemaining === 1 ? '' : 's'}`;
  };
  
  const handleTryPromotion = () => {
    if (!job || !nextJob) {
      toast.error("No promotion available");
      return;
    }
    
    // Check if skills are met
    const allSkillsMet = Object.entries(nextJob.skillRequirements).every(
      ([skill, requiredLevel]) => {
        const currentLevel = skills[skill as keyof typeof skills] || 0;
        return currentLevel >= requiredLevel;
      }
    );
    
    if (!allSkillsMet) {
      toast.error("You don't meet the skill requirements for this promotion yet");
      return;
    }
    
    // Check experience requirements
    if (job.monthsInPosition < nextJob.experience) {
      toast.error(`You need ${nextJob.experience - job.monthsInPosition} more months of experience for this promotion`);
      return;
    }
    
    // If we get here, promotion is possible
    // Create new job object based on the career path info
    const newJob: Job = {
      id: `${job.professionId}-${nextJob.level}`,
      title: nextJob.title,
      company: job.company, // Keep same company
      salary: nextJob.salary,
      stress: 30 + Math.min(50, Math.floor(nextJob.salary / 10000)), // Higher salary = more stress
      happinessImpact: nextJob.happinessImpact,
      prestigeImpact: nextJob.prestigeImpact,
      timeCommitment: nextJob.timeCommitment,
      skillGains: {}, // Will be populated from career path
      skillRequirements: nextJob.skillRequirements as Partial<typeof skills>,
      professionId: job.professionId,
      jobLevel: nextJob.level as Job['jobLevel'],
      monthsInPosition: 0, // Reset months in position
      experienceRequired: nextJob.experience
    };
    
    // Populate skill gains
    if (profession) {
      // Find relevant job in career path
      const jobData = getJobByLevelInProfession(job.professionId, nextJob.level);
      if (jobData) {
        // Generate skill gains based on job requirements
        Object.entries(jobData.skillRequirements).forEach(([skill, level]) => {
          // Skill gain is proportional to requirement level
          const typedLevel = level as number;
          newJob.skillGains[skill as keyof typeof skills] = Math.ceil(typedLevel / 20);
        });
      }
    }
    
    // Process promotion
    promoteJob(newJob);
    
    toast.success(`Congratulations! You've been promoted to ${newJob.title}`);
  };
  
  // Save challenges to localStorage whenever they change
  useEffect(() => {
    if (job && challenges.length > 0) {
      localStorage.setItem(`challenges-${job.id}`, JSON.stringify(challenges));
    }
  }, [challenges, job]);
  
  // Check for completed challenges based on game time
  useEffect(() => {
    if (challenges.length > 0 && currentGameDate) {
      const updatedChallenges = [...challenges];
      let hasUpdates = false;
      
      challenges.forEach((challenge, index) => {
        if (challenge.inProgress && challenge.startDate && !challenge.completed) {
          // Calculate days passed since challenge started
          const startDate = new Date(challenge.startDate);
          const daysPassed = Math.floor((currentGameDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
          
          // Convert days to months (every 30 days = 1 month in game time)
          const monthsPassed = Math.floor(daysPassed / 30);
          
          // If enough months have passed, mark challenge as ready for completion
          if (monthsPassed >= challenge.completionTime) {
            // Only notify if we're transitioning from not ready to ready
            if (!challenge.readyForCompletion) {
              setTimeout(() => {
                toast.success(
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    <div>
                      <div className="font-semibold">Challenge Ready!</div>
                      <div className="text-sm">{challenge.title} is ready to be completed</div>
                    </div>
                  </div>
                );
                // Audio removed
              }, 500);
            }
            
            updatedChallenges[index] = {
              ...challenge,
              // Don't mark as completed yet, but indicate it's ready
              readyForCompletion: true
            };
            hasUpdates = true;
          }
        }
      });
      
      if (hasUpdates) {
        setChallenges(updatedChallenges);
      }
    }
  }, [currentGameDate, challenges]);
  
  // Start working on a challenge
  const handleStartChallenge = (challenge: ChallengeType) => {
    if (!challenge || challenge.completed || challenge.inProgress) return;
    
    // Check if any other challenge is already in progress
    const hasActiveChallenge = challenges.some(c => c.inProgress === true && !c.completed);
    
    if (hasActiveChallenge) {
      toast.error("You can only work on one challenge at a time. Complete or abandon your current challenge first.");
      return;
    }
    
    // Audio removed
    
    // Update the challenge to be in progress with current date
    const updatedChallenges = challenges.map(c => 
      c.id === challenge.id 
        ? {...c, inProgress: true, startDate: new Date(currentGameDate)}
        : c
    );
    
    setChallenges(updatedChallenges);
    setSelectedChallenge(null);
    
    toast.success(`Started working on: ${challenge.title}. Check back in ${challenge.completionTime} months.`);
  };
  
  // Complete a challenge and collect the reward
  // Allow user to abandon a challenge in progress
  const handleAbandonChallenge = (challenge: ChallengeType) => {
    if (!challenge || !challenge.inProgress) return;
    
    // Audio removed
    
    // Reset the challenge back to its initial state
    const updatedChallenges = challenges.map(c => 
      c.id === challenge.id 
        ? {...c, inProgress: false, startDate: undefined, readyForCompletion: false} 
        : c
    );
    
    setChallenges(updatedChallenges);
    setSelectedChallenge(null);
    
    toast.info(`You abandoned the "${challenge.title}" challenge. You can start it again later.`);
  };
  
  const handleCompleteChallenge = (challenge: ChallengeType) => {
    if (!challenge) return;
    
    // Check if the challenge is already completed
    if (challenge.completed) {
      toast.error("This challenge has already been completed!");
      return;
    }
    
    // Check if the challenge is ready for completion
    if (challenge.inProgress && challenge.startDate) {
      const startDate = new Date(challenge.startDate);
      // Calculate days passed since challenge started
      const daysPassed = Math.floor((currentGameDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      
      // Convert days to months (every 30 days = 1 month in game time)
      const monthsPassed = Math.floor(daysPassed / 30);
      
      if (monthsPassed < challenge.completionTime) {
        // Not enough time has passed
        const monthsRemaining = challenge.completionTime - monthsPassed;
        toast.error(`This challenge will be complete in ${monthsRemaining} more month${monthsRemaining !== 1 ? 's' : ''}.`);
        return;
      }
    } else if (!challenge.readyForCompletion) {
      // Challenge not started or not ready
      toast.error("You need to start this challenge first!");
      return;
    }
    
    // Award the skill points
    const skill = challenge.skill as keyof typeof skills;
    improveSkill(skill, challenge.xpReward);
    
    // Audio removed
    
    // Mark challenge as completed and reset other flags
    setChallenges(challenges.map(c => 
      c.id === challenge.id ? {
        ...c, 
        completed: true, 
        inProgress: false,
        readyForCompletion: false,
        startDate: undefined
      } : c
    ));
    
    toast.success(`Challenge completed! ${challenge.skill} skill increased by ${challenge.xpReward}`);
    setSelectedChallenge(null);
  };
  
  if (!job) {
    return (
      <div className="container mx-auto p-4 py-20">
        <Card>
          <CardHeader>
            <CardTitle>No Current Job</CardTitle>
            <CardDescription>You don't currently have a job. Visit the Job Market to find opportunities.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }
  
  const dailyIncome = calculateDailyIncome(job.salary);
  const hourlyRate = job.salary / (52 * job.timeCommitment);

  return (
    <div className="w-full min-h-screen bg-slate-100 pt-20 pb-32">
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-b from-blue-900 to-slate-900 opacity-90 z-0" />
      
      {/* Content */}
      <div className="relative z-10 w-full">
        <GameUI />
        
        <div className="p-4 max-w-5xl mx-auto">
          <Button 
            variant="outline" 
            onClick={() => navigate('/')}
            className="mb-4 bg-white"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <div className="space-y-6">
            <Card className="bg-secondary/10 border-secondary/20 overflow-hidden">
              <div className="absolute top-0 right-0 p-4 bg-secondary/30 rounded-bl-lg">
                <div className="text-sm font-medium">Job Level</div>
                <div className="font-bold text-lg">{formatJobLevel(job.jobLevel)}</div>
              </div>
              
              <CardHeader className="pb-2">
                <div className="flex items-center mb-2">
                  <Briefcase className="h-5 w-5 text-secondary mr-2" />
                  <CardTitle>{job.title}</CardTitle>
                </div>
                <CardDescription className="text-base">
                  at {job.company}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <Card className="bg-secondary/5 border-secondary/10">
                    <CardHeader className="py-3">
                      <div className="flex items-center">
                        <TrendingUp className="h-4 w-4 text-green-500 mr-2" />
                        <CardTitle className="text-base">Salary</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {formatCurrency(job.salary)}/year
                      </div>
                      <div className="flex flex-col text-sm mt-2 space-y-1 text-muted-foreground">
                        <div className="flex justify-between">
                          <span>Monthly:</span>
                          <span className="font-medium">{formatCurrency(job.salary / 12)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Daily:</span>
                          <span className="font-medium">{formatCurrency(dailyIncome)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Hourly:</span>
                          <span className="font-medium">{formatCurrency(hourlyRate)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-secondary/5 border-secondary/10">
                    <CardHeader className="py-3">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 text-blue-500 mr-2" />
                        <CardTitle className="text-base">Experience</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {job.monthsInPosition} months
                      </div>
                      <div className="flex flex-col text-sm mt-2 space-y-1 text-muted-foreground">
                        <div className="flex justify-between">
                          <span>Time in position:</span>
                          <span className="font-medium">{Math.floor(job.monthsInPosition / 12)} years, {job.monthsInPosition % 12} months</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Days since last review:</span>
                          <span className="font-medium">{daysSincePromotion} days</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-secondary/5 border-secondary/10">
                    <CardHeader className="py-3">
                      <div className="flex items-center">
                        <Trophy className="h-4 w-4 text-amber-500 mr-2" />
                        <CardTitle className="text-base">Job Stats</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex justify-between">
                          <span>Hours:</span>
                          <span className="font-medium">{job.timeCommitment}/week</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Stress:</span>
                          <span className={`font-medium ${job.stress > 60 ? 'text-red-500' : job.stress > 40 ? 'text-amber-500' : 'text-green-500'}`}>
                            {job.stress}/100
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Happiness:</span>
                          <span className={`font-medium ${job.happinessImpact >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {job.happinessImpact >= 0 ? '+' : ''}{job.happinessImpact}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Prestige:</span>
                          <span className="font-medium text-indigo-500">
                            {job.prestigeImpact >= 0 ? '+' : ''}{job.prestigeImpact}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
            
            <Tabs defaultValue="career">
              <TabsList className="grid grid-cols-3">
                <TabsTrigger value="career">Career Path</TabsTrigger>
                <TabsTrigger value="challenges">Skill Challenges</TabsTrigger>
                <TabsTrigger value="skills">Skills & Growth</TabsTrigger>
              </TabsList>
              
              <TabsContent value="career" className="space-y-4 mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Award className="h-5 w-5 text-amber-500 mr-2" />
                      Career Progression
                    </CardTitle>
                    <CardDescription>
                      {profession?.description || 'Your career path and progression'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {profession && (
                      <div className="space-y-8">
                        {/* Career path visualization */}
                        <div className="relative">
                          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-800"></div>
                          
                          {profession.careerPath.map((careerStep, index) => {
                            const isCurrentJob = job.jobLevel === careerStep.level;
                            const isPastJob = profession.careerPath.findIndex(cp => cp.level === job.jobLevel) > index;
                            
                            return (
                              <div key={careerStep.level} className="relative flex items-start mb-8 last:mb-0">
                                <div className={`absolute left-4 -translate-x-1/2 w-3 h-3 rounded-full z-10 mt-1.5 ${
                                  isCurrentJob 
                                    ? 'bg-secondary ring-4 ring-secondary/20' 
                                    : isPastJob 
                                      ? 'bg-green-500' 
                                      : 'bg-gray-300 dark:bg-gray-700'
                                }`}></div>
                                
                                <div className={`ml-10 p-4 rounded-lg border ${
                                  isCurrentJob 
                                    ? 'bg-secondary/20 border-secondary/30' 
                                    : isPastJob 
                                      ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-900/30' 
                                      : 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800'
                                }`}>
                                  <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
                                    <div>
                                      <h4 className="text-lg font-bold">{careerStep.title}</h4>
                                      <p className="text-sm text-muted-foreground">{formatJobLevel(careerStep.level)}</p>
                                    </div>
                                    <div className="text-right">
                                      <p className="font-semibold">{formatCurrency(careerStep.salary)}/year</p>
                                      {!isPastJob && !isCurrentJob && (
                                        <p className="text-xs text-muted-foreground">
                                          Requires {careerStep.experience} months exp.
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                  
                                  <p className="mt-2 text-sm">{careerStep.description}</p>
                                  
                                  {/* Skill requirements */}
                                  {Object.keys(careerStep.skillRequirements).length > 0 && (
                                    <div className="mt-3">
                                      <h5 className="text-sm font-semibold mb-2">Required Skills:</h5>
                                      <div className="flex flex-wrap gap-2">
                                        {Object.entries(careerStep.skillRequirements).map(([skill, level]) => {
                                          const currentLevel = skills[skill as keyof typeof skills] || 0;
                                          const isMet = currentLevel >= level;
                                          
                                          return (
                                            <div key={skill} className={`px-2 py-1 rounded-full text-xs ${
                                              isMet 
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200' 
                                                : 'bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300'
                                            }`}>
                                              {skill}: {level} {isMet && '✓'}
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  )}
                                  
                                  {isCurrentJob && (
                                    <div className="mt-4 italic text-sm text-muted-foreground">
                                      Current Position
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        
                        {nextJob && (
                          <Card className="mt-6 bg-primary/5 border-primary/20">
                            <CardHeader className="pb-2">
                              <CardTitle className="text-lg">Next Promotion: {nextJob.title}</CardTitle>
                              <CardDescription>
                                {calculateTimeToPromotion()}
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-3">
                                {Object.entries(nextJob.skillRequirements).map(([skill, requiredLevel]) => {
                                  const currentLevel = skills[skill as keyof typeof skills] || 0;
                                  const isMet = currentLevel >= requiredLevel;
                                  const progressPercent = progress[skill] || 0;
                                  
                                  return (
                                    <div key={skill} className="space-y-1">
                                      <div className="flex justify-between items-center text-sm">
                                        <div className="flex items-center gap-1">
                                          {getSkillIcon(skill)}
                                          <span className="capitalize">{skill}</span>
                                        </div>
                                        <div className={isMet ? 'text-green-600 dark:text-green-400' : ''}>
                                          {currentLevel}/{requiredLevel} {isMet && '✓'}
                                        </div>
                                      </div>
                                      <Progress value={progressPercent} className="h-2" />
                                    </div>
                                  );
                                })}
                              </div>
                              
                              <div className="flex justify-center mt-6">
                                <Button 
                                  onClick={handleTryPromotion}
                                  disabled={calculateTimeToPromotion() !== 'Ready for promotion!'}
                                  className="bg-primary hover:bg-primary/90"
                                >
                                  Apply for Promotion
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        )}
                        
                        {job.jobLevel === 'executive' && !nextJob && (
                          <Card className="mt-6 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
                            <CardHeader className="pb-2">
                              <CardTitle className="text-lg flex items-center">
                                <Trophy className="h-5 w-5 text-amber-500 mr-2" />
                                Career Mastery
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p>Congratulations! You've reached the highest level in your career path. 
                              You are now at the executive level of your profession.</p>
                              
                              <div className="flex justify-center mt-4">
                                <Button variant="outline" className="border-amber-300 dark:border-amber-700">
                                  Look for New Opportunities
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="challenges" className="space-y-4 mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Brain className="h-5 w-5 text-indigo-500 mr-2" />
                      Skill Challenges
                    </CardTitle>
                    <CardDescription>
                      Complete challenges to improve your skills faster
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {selectedChallenge && !selectedChallenge.completed ? (
                      <div className="space-y-4">
                        <Card className={`${
                          selectedChallenge.readyForCompletion ? 'border-green-500 bg-green-50/30 dark:bg-green-900/10' : 
                          selectedChallenge.inProgress ? 'border-blue-500 bg-blue-50/30 dark:bg-blue-900/10' : 
                          'bg-secondary/5 border-secondary/10'
                        }`}>
                          <CardHeader>
                            <div className="flex justify-between items-center">
                              <CardTitle className="text-lg flex items-center">
                                {getSkillIcon(selectedChallenge.skill)}
                                <span className="ml-2">{selectedChallenge.title}</span>
                              </CardTitle>
                              <div className="flex space-x-2">
                                {selectedChallenge.inProgress && (
                                  <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200">
                                    In Progress
                                  </span>
                                )}
                                {selectedChallenge.readyForCompletion && (
                                  <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200">
                                    Ready
                                  </span>
                                )}
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  selectedChallenge.difficultyLevel === 'easy'
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200'
                                    : selectedChallenge.difficultyLevel === 'medium'
                                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200'
                                      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'
                                }`}>
                                  {selectedChallenge.difficultyLevel}
                                </span>
                              </div>
                            </div>
                            <CardDescription>{selectedChallenge.description}</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div className="bg-secondary/10 p-3 rounded-md">
                                  <div className="text-sm font-medium">Reward</div>
                                  <div className="text-lg font-bold">+{selectedChallenge.xpReward} {selectedChallenge.skill} skill</div>
                                </div>
                                <div className="bg-secondary/10 p-3 rounded-md">
                                  <div className="text-sm font-medium">Time Required</div>
                                  <div className="text-lg font-bold">{selectedChallenge.completionTime} months</div>
                                </div>
                              </div>
                              
                              {selectedChallenge.inProgress && !selectedChallenge.readyForCompletion && selectedChallenge.startDate && (
                                <div className="mt-4">
                                  <div className="text-sm font-medium mb-1 flex justify-between">
                                    <span>Progress</span>
                                    <span>
                                      {Math.min(
                                        Math.floor((currentGameDate.getTime() - new Date(selectedChallenge.startDate).getTime()) / (1000 * 60 * 60 * 24 * 30)), 
                                        selectedChallenge.completionTime
                                      )} / {selectedChallenge.completionTime} months
                                    </span>
                                  </div>
                                  <Progress 
                                    value={Math.min(
                                      100, 
                                      (Math.floor((currentGameDate.getTime() - new Date(selectedChallenge.startDate).getTime()) / (1000 * 60 * 60 * 24 * 30)) / selectedChallenge.completionTime) * 100
                                    )} 
                                    className="h-2"
                                  />
                                  
                                  {selectedChallenge.startDate && (
                                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                      <span>Started: {new Date(selectedChallenge.startDate).toLocaleDateString()}</span>
                                      <span>
                                        ETA: {new Date(new Date(selectedChallenge.startDate).getTime() + (selectedChallenge.completionTime * 30 * 24 * 60 * 60 * 1000)).toLocaleDateString()}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              )}
                              
                              <div className="flex justify-between mt-6">
                                <div>
                                  <Button variant="outline" onClick={() => setSelectedChallenge(null)}>
                                    Go Back
                                  </Button>
                                </div>
                                
                                <div className="space-x-2">
                                  {selectedChallenge.readyForCompletion && (
                                    <Button onClick={() => handleCompleteChallenge(selectedChallenge)}>
                                      Complete Challenge
                                    </Button>
                                  )}
                                  
                                  {!selectedChallenge.inProgress && !selectedChallenge.readyForCompletion && (
                                    <Button onClick={() => handleStartChallenge(selectedChallenge)}>
                                      Start Challenge
                                    </Button>
                                  )}
                                  
                                  {selectedChallenge.inProgress && !selectedChallenge.readyForCompletion && (
                                    <>
                                      <Button disabled>
                                        In Progress...
                                      </Button>
                                      
                                      <Button variant="destructive" onClick={() => handleAbandonChallenge(selectedChallenge)}>
                                        Abandon
                                      </Button>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Sort challenges by skill and difficulty */}
                        {challenges.length > 0 ? (
                          <div className="space-y-4">
                            {Object.entries(
                              challenges.reduce<Record<string, ChallengeType[]>>((acc, challenge) => {
                                // Only show incomplete challenges
                                if (!challenge.completed) {
                                  if (!acc[challenge.skill]) {
                                    acc[challenge.skill] = [];
                                  }
                                  acc[challenge.skill].push(challenge);
                                }
                                return acc;
                              }, {})
                            ).map(([skill, skillChallenges]) => (
                              <div key={skill} className="space-y-2">
                                <h3 className="font-semibold capitalize flex items-center">
                                  {getSkillIcon(skill)}
                                  <span className="ml-2">{skill}</span>
                                </h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  {skillChallenges
                                    .sort((a, b) => {
                                      const difficultyOrder = { easy: 0, medium: 1, hard: 2 };
                                      return difficultyOrder[a.difficultyLevel] - difficultyOrder[b.difficultyLevel];
                                    })
                                    .map(challenge => (
                                      <Card key={challenge.id} className={`hover:bg-secondary/5 transition-colors ${
                                        challenge.readyForCompletion ? 'border-green-500 bg-green-50 dark:bg-green-900/10' : 
                                        challenge.inProgress ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10' : 
                                        'cursor-pointer'
                                      }`} onClick={() => !challenge.inProgress && setSelectedChallenge(challenge)}>
                                        <CardHeader className="py-3">
                                          <div className="flex justify-between items-center">
                                            <h4 className="font-medium">{challenge.title}</h4>
                                            <div className="flex space-x-2">
                                              {challenge.inProgress && (
                                                <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200">
                                                  In Progress
                                                </span>
                                              )}
                                              {challenge.readyForCompletion && (
                                                <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200">
                                                  Ready
                                                </span>
                                              )}
                                              <span className={`px-2 py-1 text-xs rounded-full ${
                                                challenge.difficultyLevel === 'easy'
                                                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200'
                                                  : challenge.difficultyLevel === 'medium'
                                                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200'
                                                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'
                                              }`}>
                                                {challenge.difficultyLevel}
                                              </span>
                                            </div>
                                          </div>
                                        </CardHeader>
                                        <CardContent className="py-0">
                                          <p className="text-sm text-muted-foreground">{challenge.description}</p>
                                          
                                          {challenge.inProgress && !challenge.readyForCompletion && challenge.startDate && (
                                            <div className="mt-2">
                                              <div className="text-xs text-muted-foreground mb-1 flex justify-between">
                                                <span>Progress</span>
                                                <span>
                                                  {Math.min(
                                                    Math.floor((currentGameDate.getTime() - new Date(challenge.startDate).getTime()) / (1000 * 60 * 60 * 24 * 30)), 
                                                    challenge.completionTime
                                                  )} / {challenge.completionTime} months
                                                </span>
                                              </div>
                                              <Progress 
                                                value={Math.min(
                                                  100, 
                                                  (Math.floor((currentGameDate.getTime() - new Date(challenge.startDate).getTime()) / (1000 * 60 * 60 * 24 * 30)) / challenge.completionTime) * 100
                                                )} 
                                                className="h-1.5"
                                              />
                                            </div>
                                          )}
                                          
                                          <div className="flex justify-between mt-2 text-sm">
                                            <span>+{challenge.xpReward} skill</span>
                                            <span>{challenge.completionTime} months</span>
                                          </div>
                                          
                                          <div className="mt-3 pt-2 border-t flex justify-end space-x-2">
                                            {challenge.readyForCompletion && (
                                              <Button 
                                                size="sm" 
                                                onClick={(e) => { 
                                                  e.stopPropagation(); 
                                                  handleCompleteChallenge(challenge); 
                                                }}
                                              >
                                                Complete
                                              </Button>
                                            )}
                                            
                                            {!challenge.inProgress && !challenge.readyForCompletion && (
                                              <Button 
                                                size="sm" 
                                                variant="outline" 
                                                onClick={(e) => { 
                                                  e.stopPropagation(); 
                                                  handleStartChallenge(challenge); 
                                                }}
                                              >
                                                Start Challenge
                                              </Button>
                                            )}
                                            
                                            {challenge.inProgress && !challenge.readyForCompletion && (
                                              <Button 
                                                size="sm" 
                                                variant="destructive" 
                                                onClick={(e) => { 
                                                  e.stopPropagation(); 
                                                  handleAbandonChallenge(challenge); 
                                                }}
                                              >
                                                Abandon
                                              </Button>
                                            )}
                                          </div>
                                        </CardContent>
                                      </Card>
                                    ))
                                  }
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-12">
                            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold">No Challenges Available</h3>
                            <p className="text-center text-muted-foreground max-w-md mt-2">
                              There are no skill challenges available for your current position. 
                              Check back later or advance in your career to unlock new challenges.
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="skills" className="space-y-4 mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <TrendingUp className="h-5 w-5 text-blue-500 mr-2" />
                      Skill Development
                    </CardTitle>
                    <CardDescription>
                      Skills you're developing at your current job
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Skills being developed */}
                      <div className="space-y-4">
                        <h3 className="font-medium">Monthly Skill Gains</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {Object.entries(job.skillGains).map(([skill, gain]) => (
                            <Card key={skill} className="bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800">
                              <CardContent className="p-4 flex justify-between items-center">
                                <div className="flex items-center">
                                  {getSkillIcon(skill)}
                                  <span className="ml-2 capitalize">{skill}</span>
                                </div>
                                <span className="font-medium text-green-600 dark:text-green-400">+{gain}/month</span>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                      
                      {/* Current skill levels */}
                      <div className="space-y-4">
                        <h3 className="font-medium">Current Skill Levels</h3>
                        <div className="space-y-4">
                          {Object.entries(skills).map(([skill, level]) => (
                            <div key={skill} className="space-y-1">
                              <div className="flex justify-between items-center">
                                <div className="flex items-center">
                                  {getSkillIcon(skill)}
                                  <span className="ml-2 capitalize">{skill}</span>
                                </div>
                                <div className="font-medium">{level}</div>
                              </div>
                              <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-800">
                                <div className={`h-full rounded-full ${getSkillColor(skill)}`} style={{ width: `${Math.min(100, level * 10)}%` }}></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Skill tips */}
                      <Card className="bg-indigo-50 dark:bg-indigo-900/20 border-indigo-100 dark:border-indigo-900/30">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base flex items-center text-indigo-900 dark:text-indigo-300">
                            <Lightbulb className="h-4 w-4 mr-2" />
                            Skill Development Tips
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="list-disc pl-5 space-y-1 text-sm text-indigo-900 dark:text-indigo-200">
                            <li>Complete skill challenges to gain experience faster</li>
                            <li>Focus on skills required for your next promotion</li>
                            <li>Balance skill development with your job responsibilities</li>
                            <li>Some skills can also be improved through lifestyle choices</li>
                          </ul>
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}