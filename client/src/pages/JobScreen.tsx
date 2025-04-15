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
  lastProgressUpdate?: Date; // Track when progress was last updated
};

export default function JobScreen() {
  const navigate = useNavigate();
  const { job, skills, improveSkill, promoteJob, daysSincePromotion, skillPoints, earnedSkillPoints, allocateSkillPoint, spendEarnedSkillPoint } = useCharacter();
  const { currentGameDate } = useTime();
  const { unlockAchievement } = useGame();
  const audio = useAudio();
  const [profession, setProfession] = useState<Profession | undefined>(undefined);
  const [nextJob, setNextJob] = useState<CareerPath | undefined>(undefined);
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [challenges, setChallenges] = useState<ChallengeType[]>([]);
  const [selectedChallenge, setSelectedChallenge] = useState<ChallengeType | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  
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
          xpReward: 15,
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
          xpReward: 30,
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
            xpReward: 60,
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
        description: `Build your ${randomSkill} skills to prepare for your next role as ${nextJob.title}. Reward: 40 skill points.`,
        skill: randomSkill,
        difficultyLevel: 'medium',
        xpReward: 40,
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
    // Define reward values based on difficulty
    const rewards = {
      easy: 15,
      medium: 30,
      hard: 60
    };
    
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
    
    // Get base description
    const baseDescription = descriptions[skill as keyof typeof descriptions]?.[difficulty] || 
      `Complete a ${difficulty} challenge to improve your ${skill} skills.`;
    
    // Add reward info to the description
    return `${baseDescription} Reward: ${rewards[difficulty]} skill points.`;
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
  
  // Handler for allocating multiple skill points at once
  const handleAllocateMultipleSkillPoints = (skill: string, amount: 1 | 5 | 10) => {
    if (!skill) return;
    
    // Verify we have enough points
    if (earnedSkillPoints < amount) {
      toast.error(`You only have ${earnedSkillPoints} skill points available.`);
      return;
    }
    
    // Verify skill won't exceed max (1000)
    const currentSkillValue = skills[skill as keyof typeof skills] || 0;
    if (currentSkillValue + amount > 1000) {
      toast.error(`Cannot exceed 1000 points in a skill. You can add at most ${1000 - currentSkillValue} more points.`);
      return;
    }
    
    // Apply points one by one using the existing store method
    let success = true;
    for (let i = 0; i < amount; i++) {
      const result = spendEarnedSkillPoint(skill as keyof typeof skills);
      if (!result) {
        success = false;
        break;
      }
    }
    
    if (success) {
      toast.success(`Added ${amount} points to ${skill}!`);
    } else {
      toast.error("Something went wrong when allocating skill points.");
    }
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
  
  // Check for completed challenges based on game time and update progress
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
              // Mark it as ready and update the last progress check
              readyForCompletion: true,
              lastProgressUpdate: currentGameDate
            };
            hasUpdates = true;
          } 
          // Always update the challenge to ensure the UI shows correct progress
          else if (!challenge.lastProgressUpdate || 
            // Only update if a day has passed since last update to avoid excessive updates
            Math.floor((currentGameDate.getTime() - (challenge.lastProgressUpdate instanceof Date ? 
              challenge.lastProgressUpdate.getTime() : 
              new Date(challenge.lastProgressUpdate).getTime())) / (1000 * 60 * 60 * 24)) >= 1) {
            
            updatedChallenges[index] = {
              ...challenge,
              lastProgressUpdate: currentGameDate
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
        ? {
            ...c, 
            inProgress: true, 
            startDate: new Date(currentGameDate),
            lastProgressUpdate: new Date(currentGameDate) // Initialize progress tracking
          }
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
  
  // Calculate derived values
  const dailyIncome = job ? calculateDailyIncome(job.salary) : 0;
  const hourlyRate = job ? job.salary / (52 * job.timeCommitment) : 0;
  
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

  return (
    <div className="w-full min-h-screen pt-2 pb-24">
      {/* Content */}
      <GameUI />
      
      <div className="relative z-10 w-full max-w-5xl mx-auto p-4 pt-20">
        <Button 
          variant="outline" 
          size="default"
          onClick={() => navigate('/')}
          className="mb-6 bg-primary/10 hover:bg-primary/20 border-primary/20 text-primary shadow-sm w-full sm:w-auto"
        >
          <ChevronLeft className="h-5 w-5 mr-2" />
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
                    <div className="flex justify-between items-end">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        Total years: {Math.floor(job.monthsInPosition / 12)}
                      </div>
                    </div>
                    <div className="flex flex-col text-sm mt-2 space-y-2 text-muted-foreground">
                      <div className="flex justify-between">
                        <span>Time with Company:</span>
                        <span className="font-medium">
                          {Math.floor(job.monthsInPosition / 12) > 0 
                            ? `${Math.floor(job.monthsInPosition / 12)} ${Math.floor(job.monthsInPosition / 12) === 1 ? 'year' : 'years'}, ` 
                            : ''}
                          {job.monthsInPosition % 12} {job.monthsInPosition % 12 === 1 ? 'month' : 'months'}, {daysSincePromotion} {daysSincePromotion === 1 ? 'day' : 'days'}
                        </span>
                      </div>
                      
                      {/* Show when the next skill points will be awarded */}
                      <div className="mt-1">
                        <div className="flex justify-between items-center">
                          <span>Next skill points:</span>
                          <span className="font-medium">
                            {30 - (daysSincePromotion % 30)} {(30 - (daysSincePromotion % 30)) === 1 ? 'day' : 'days'}
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full mt-1 overflow-hidden">
                          <div 
                            className="h-full bg-green-500 rounded-full transition-all duration-300"
                            style={{ 
                              width: `${((daysSincePromotion % 30) / 30) * 100}%`,
                            }}
                          ></div>
                        </div>
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
            <TabsList className="grid grid-cols-4 gap-x-1 overflow-hidden text-[9px] md:text-sm">
              <TabsTrigger value="career" className="px-0.5 py-1 md:px-2">Career</TabsTrigger>
              <TabsTrigger value="challenges" className="px-0.5 py-1 md:px-2">Challenges</TabsTrigger>
              <TabsTrigger value="skills" className="px-0.5 py-1 md:px-2">Skills</TabsTrigger>
              <TabsTrigger value="skillpoints" className="px-0.5 py-1 md:px-2">Points</TabsTrigger>
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
                                Change Career Path
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
              {/* Selected challenge details */}
              {selectedChallenge && (
                <Card className="mb-6 bg-secondary/5 border-secondary/20">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex items-start gap-2">
                        <div className={`h-6 w-6 rounded-full flex items-center justify-center mt-1 ${getSkillColor(selectedChallenge.skill)}`}>
                          {getSkillIcon(selectedChallenge.skill)}
                        </div>
                        <div>
                          <CardTitle>{selectedChallenge.title}</CardTitle>
                          <CardDescription className="text-base mt-1">{selectedChallenge.description}</CardDescription>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => setSelectedChallenge(null)}>
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Back
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center gap-2">
                          <Lightbulb className="h-4 w-4 text-amber-500" />
                          <div>
                            <div className="text-sm text-muted-foreground">Skill</div>
                            <div className="font-medium capitalize">{selectedChallenge.skill}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Brain className="h-4 w-4 text-indigo-500" />
                          <div>
                            <div className="text-sm text-muted-foreground">Difficulty</div>
                            <div className="font-medium capitalize">{selectedChallenge.difficultyLevel}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Timer className="h-4 w-4 text-green-500" />
                          <div>
                            <div className="text-sm text-muted-foreground">Time to Complete</div>
                            <div className="font-medium">{selectedChallenge.completionTime} months</div>
                          </div>
                        </div>
                      </div>
                      
                      {selectedChallenge.inProgress && selectedChallenge.startDate && (
                        <div className="mt-6">
                          <div className="flex justify-between items-center mb-2">
                            <div className="text-sm font-medium">Progress</div>
                            <div className="text-sm text-muted-foreground">
                              {(() => {
                                if (!currentGameDate || !selectedChallenge.startDate) return '0%';
                                
                                const startDate = new Date(selectedChallenge.startDate);
                                const daysPassed = Math.floor((currentGameDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
                                const monthsPassed = Math.floor(daysPassed / 30);
                                const progressPercent = Math.min(100, Math.round((monthsPassed / selectedChallenge.completionTime) * 100));
                                
                                return `${progressPercent}%`;
                              })()}
                            </div>
                          </div>
                          <Progress 
                            value={(() => {
                              if (!currentGameDate || !selectedChallenge.startDate) return 0;
                              
                              const startDate = new Date(selectedChallenge.startDate);
                              const daysPassed = Math.floor((currentGameDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
                              const monthsPassed = Math.floor(daysPassed / 30);
                              return Math.min(100, (monthsPassed / selectedChallenge.completionTime) * 100);
                            })()} 
                            className="h-2"
                            key={`detail-${selectedChallenge.id}-progress-${currentGameDate ? currentGameDate.getTime() : 0}`} 
                          />
                          
                          <div className="flex justify-between mt-6 gap-4">
                            {selectedChallenge.readyForCompletion ? (
                              <Button 
                                className="w-full bg-green-600 hover:bg-green-700"
                                onClick={() => handleCompleteChallenge(selectedChallenge)}
                              >
                                Complete Challenge
                              </Button>
                            ) : (
                              <Button 
                                className="w-full"
                                variant="outline"
                                onClick={() => handleAbandonChallenge(selectedChallenge)}
                              >
                                Abandon Challenge
                              </Button>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {!selectedChallenge.inProgress && !selectedChallenge.completed && (
                        <div className="flex justify-center mt-6">
                          <Button 
                            onClick={() => handleStartChallenge(selectedChallenge)}
                            className="bg-primary hover:bg-primary/90"
                          >
                            Start Challenge
                          </Button>
                        </div>
                      )}
                      
                      {selectedChallenge.completed && (
                        <div className="mt-6 bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-900/30">
                          <div className="flex items-center gap-2">
                            <Trophy className="h-5 w-5 text-green-600" />
                            <div className="font-semibold text-green-800 dark:text-green-200">Challenge Completed</div>
                          </div>
                          <p className="text-sm mt-1 text-green-700 dark:text-green-300">
                            You've successfully completed this challenge and gained skill experience.
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {!selectedChallenge && (
                <div className="grid grid-cols-1 gap-4">
                  {/* Group challenges by skill */}
                  {Object.entries(
                    challenges.reduce((acc: Record<string, ChallengeType[]>, challenge) => {
                      if (!acc[challenge.skill]) {
                        acc[challenge.skill] = [];
                      }
                      acc[challenge.skill].push(challenge);
                      return acc;
                    }, {})
                  ).map(([skill, skillChallenges]) => (
                    <Card key={skill} className="overflow-hidden">
                      <CardHeader className="bg-secondary/5 py-3">
                        <div className="flex items-center">
                          <div className={`h-6 w-6 rounded-full flex items-center justify-center ${getSkillColor(skill)}`}>
                            {getSkillIcon(skill)}
                          </div>
                          <CardTitle className="ml-2 capitalize">{skill} Challenges</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent className="p-0">
                        <div className="divide-y divide-border/50">
                          {/* Sort challenges by difficulty */}
                          {[...skillChallenges].sort((a, b) => {
                            const difficultyOrder = { 'easy': 0, 'medium': 1, 'hard': 2 };
                            return difficultyOrder[a.difficultyLevel] - difficultyOrder[b.difficultyLevel];
                          }).map((challenge) => (
                            <div 
                              key={challenge.id} 
                              className={`p-4 hover:bg-secondary/5 transition-colors cursor-pointer flex justify-between items-center ${
                                challenge.completed 
                                  ? 'bg-green-50/50 dark:bg-green-900/10' 
                                  : challenge.inProgress
                                    ? 'bg-blue-50/50 dark:bg-blue-900/10'
                                    : ''
                              }`}
                              onClick={() => setSelectedChallenge(challenge)}
                            >
                              <div className="flex-1">
                                <div className="flex items-center">
                                  <h4 className="font-medium">{challenge.title}</h4>
                                  {challenge.completed && (
                                    <span className="ml-2 bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 text-xs px-2 py-0.5 rounded-full">
                                      Completed
                                    </span>
                                  )}
                                  {challenge.inProgress && !challenge.completed && (
                                    <span className="ml-2 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 text-xs px-2 py-0.5 rounded-full">
                                      In Progress
                                    </span>
                                  )}
                                  {challenge.readyForCompletion && !challenge.completed && (
                                    <span className="ml-2 bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200 text-xs px-2 py-0.5 rounded-full">
                                      Ready to Complete
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                                  {challenge.description}
                                </p>
                                
                                {/* Show progress bar for in-progress challenges */}
                                {challenge.inProgress && challenge.startDate && !challenge.completed && (
                                  <div className="mt-2 w-full">
                                    <div className="flex justify-between items-center mb-1">
                                      <div className="text-xs text-muted-foreground">Progress</div>
                                      <div className="text-xs text-muted-foreground">
                                        {(() => {
                                          if (!currentGameDate || !challenge.startDate) return '0%';
                                          
                                          const startDate = new Date(challenge.startDate);
                                          const daysPassed = Math.floor((currentGameDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
                                          const monthsPassed = Math.floor(daysPassed / 30);
                                          const progressPercent = Math.min(100, Math.round((monthsPassed / challenge.completionTime) * 100));
                                          
                                          return `${progressPercent}%`;
                                        })()}
                                      </div>
                                    </div>
                                    <Progress 
                                      value={(() => {
                                        if (!currentGameDate || !challenge.startDate) return 0;
                                        
                                        const startDate = new Date(challenge.startDate);
                                        const daysPassed = Math.floor((currentGameDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
                                        const monthsPassed = Math.floor(daysPassed / 30);
                                        return Math.min(100, (monthsPassed / challenge.completionTime) * 100);
                                      })()} 
                                      className="h-1"
                                      key={`${challenge.id}-progress-${currentGameDate ? currentGameDate.getTime() : 0}`} 
                                    />
                                  </div>
                                )}
                              </div>
                              <div className="ml-4 flex items-center gap-3">
                                <div className="text-xs px-2 py-0.5 bg-secondary/10 rounded flex items-center">
                                  <span>{challenge.difficultyLevel}</span>
                                  <span className="ml-1 text-xs">+{challenge.xpReward}</span>
                                </div>
                                <AlertCircle className="h-4 w-4 text-muted-foreground" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="skills" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <GraduationCap className="h-5 w-5 text-indigo-500 mr-2" />
                    Job Skills & Growth
                  </CardTitle>
                  <CardDescription>
                    Skills you're developing in your current role
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-4">
                      {Object.entries(job.skillGains).filter(([_, gain]) => gain > 0).map(([skill, gain]) => (
                        <div key={skill} className="p-4 rounded-lg border border-secondary/20 bg-secondary/5">
                          <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center gap-2">
                              <div className={`h-6 w-6 rounded-full flex items-center justify-center ${getSkillColor(skill)}`}>
                                {getSkillIcon(skill)}
                              </div>
                              <h3 className="font-semibold capitalize">{skill}</h3>
                            </div>
                            <div className="text-sm font-medium text-secondary">
                              Current: {skills[skill as keyof typeof skills] || 0}
                            </div>
                          </div>
                          
                          <div className="text-sm text-muted-foreground mb-4">
                            <p>Daily skill gain: +{(gain * 0.033).toFixed(2)}</p>
                            <p>Monthly skill gain: +{gain.toFixed(1)}</p>
                          </div>
                          
                          {/* Show active challenges for this skill */}
                          {challenges.filter(c => c.skill === skill && c.inProgress).length > 0 && (
                            <div className="mt-2">
                              <div className="text-sm font-medium mb-2">Active Challenges:</div>
                              <div className="space-y-2">
                                {challenges
                                  .filter(c => c.skill === skill && c.inProgress)
                                  .map(challenge => (
                                    <div key={challenge.id} 
                                      className="flex justify-between items-center p-2 rounded bg-secondary/10 cursor-pointer hover:bg-secondary/20"
                                      onClick={() => setSelectedChallenge(challenge)}
                                    >
                                      <div>
                                        <div className="font-medium text-sm">{challenge.title}</div>
                                        <div className="text-xs text-muted-foreground">Reward: +{challenge.xpReward} skill points</div>
                                      </div>
                                      {challenge.readyForCompletion && (
                                        <Button size="sm" variant="outline" className="h-8 text-xs">
                                          Complete
                                        </Button>
                                      )}
                                    </div>
                                  ))
                                }
                              </div>
                            </div>
                          )}
                          
                          {/* Show available challenges for this skill */}
                          {challenges.filter(c => c.skill === skill && !c.inProgress && !c.completed).length > 0 && (
                            <div className="mt-4">
                              <div className="text-sm font-medium mb-2">Available Challenges:</div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {challenges
                                  .filter(c => c.skill === skill && !c.inProgress && !c.completed)
                                  .sort((a, b) => {
                                    const difficultyOrder = { 'easy': 0, 'medium': 1, 'hard': 2 };
                                    return difficultyOrder[a.difficultyLevel] - difficultyOrder[b.difficultyLevel];
                                  })
                                  .map(challenge => (
                                    <div key={challenge.id} 
                                      className="flex items-center gap-2 p-2 rounded bg-secondary/10 cursor-pointer hover:bg-secondary/20"
                                      onClick={() => setSelectedChallenge(challenge)}
                                    >
                                      <div className="flex-1">
                                        <div className="font-medium text-sm">{challenge.title}</div>
                                        <div className="text-xs flex items-center gap-1">
                                          <span className="capitalize">{challenge.difficultyLevel}</span>
                                          <span className="text-muted-foreground">•</span>
                                          <span className="text-muted-foreground">{challenge.completionTime} months</span>
                                        </div>
                                      </div>
                                      <Button size="sm" variant="ghost" className="h-8 text-xs">
                                        View
                                      </Button>
                                    </div>
                                  ))
                                }
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="skillpoints" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <GraduationCap className="h-5 w-5 text-primary mr-2" />
                    Character Skill Points
                  </CardTitle>
                  <CardDescription>
                    Allocate skill points to enhance your character's abilities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1">
                        <div className="text-sm font-medium text-muted-foreground">Available Skill Points</div>
                        <div className="text-2xl font-bold text-primary">{earnedSkillPoints}</div>
                        <div className="text-xs text-muted-foreground">Points earned through challenges and career achievements</div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <div className="text-sm font-medium text-muted-foreground">Monthly Career Points</div>
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                          {Object.values(job.skillGains).reduce((sum, gain) => sum + gain, 0).toFixed(1)}
                        </div>
                        <div className="text-xs text-muted-foreground">Points automatically added to your skills each month from your job</div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-4">Select Skill to Improve</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {Object.keys(skills).map((skill) => (
                        <div
                          key={skill}
                          className={`
                            cursor-pointer p-3 rounded-lg border 
                            ${selectedSkill === skill 
                              ? 'bg-primary/10 border-primary' 
                              : 'bg-card border-muted hover:border-primary/30'}
                          `}
                          onClick={() => setSelectedSkill(skill)}
                        >
                          <div className="flex items-center gap-2">
                            <div className={`h-7 w-7 rounded-full flex items-center justify-center ${getSkillColor(skill)}`}>
                              {getSkillIcon(skill)}
                            </div>
                            <div className="flex flex-col">
                              <div className="font-medium capitalize">{skill}</div>
                              <div className="text-sm text-muted-foreground">
                                Level: {skills[skill as keyof typeof skills]}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {selectedSkill && (
                    <div className="p-4 rounded-lg border border-primary/20 bg-primary/5">
                      <div className="flex flex-col gap-4">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center ${getSkillColor(selectedSkill)}`}>
                              {getSkillIcon(selectedSkill)}
                            </div>
                            <div>
                              <h3 className="font-bold capitalize">{selectedSkill}</h3>
                              <div className="text-sm text-muted-foreground">Current: {skills[selectedSkill as keyof typeof skills]}</div>
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Max: 1,000
                          </div>
                        </div>
                        
                        <Progress 
                          value={(skills[selectedSkill as keyof typeof skills] / 10)} 
                          className="h-2 mt-1" 
                        />
                        
                        <div className="flex flex-col gap-2">
                          <h4 className="font-semibold text-sm">Allocate Points</h4>
                          <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="border-primary/30"
                              disabled={earnedSkillPoints < 1 || skills[selectedSkill as keyof typeof skills] >= 1000}
                              onClick={() => handleAllocateMultipleSkillPoints(selectedSkill, 1)}
                            >
                              +1 Point
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="border-primary/30"
                              disabled={earnedSkillPoints < 5 || skills[selectedSkill as keyof typeof skills] > 995}
                              onClick={() => handleAllocateMultipleSkillPoints(selectedSkill, 5)}
                            >
                              +5 Points
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="border-primary/30"
                              disabled={earnedSkillPoints < 10 || skills[selectedSkill as keyof typeof skills] > 990}
                              onClick={() => handleAllocateMultipleSkillPoints(selectedSkill, 10)}
                            >
                              +10 Points
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {!selectedSkill && earnedSkillPoints > 0 && (
                    <div className="text-center p-4 text-muted-foreground">
                      Select a skill above to allocate your points
                    </div>
                  )}
                  
                  {earnedSkillPoints === 0 && (
                    <div className="text-center p-4 text-muted-foreground bg-muted/10 rounded-lg border border-muted">
                      <p>You don't have any skill points to allocate right now.</p>
                      <p className="mt-2">Complete skill challenges to earn more skill points.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
