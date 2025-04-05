import { useEffect, useState } from 'react';
import { useCharacter, Job } from '../lib/stores/useCharacter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Progress } from '../components/ui/progress';
import { Briefcase, TrendingUp, Clock, Trophy, Award, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import { toast } from 'sonner';
import { getNextJobInCareerPath, getJobByLevelInProfession, getProfession } from '../lib/services/jobService';
import type { Profession, CareerPath } from '../lib/data/jobs';

export default function JobScreen() {
  const { job, skills, improveSkill, promoteJob, daysSincePromotion } = useCharacter();
  const [profession, setProfession] = useState<Profession | undefined>(undefined);
  const [nextJob, setNextJob] = useState<CareerPath | undefined>(undefined);
  const [progress, setProgress] = useState<Record<string, number>>({});
  
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
    }
  }, [job, skills]);

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
    <div className="container mx-auto p-4 py-20 space-y-6">
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
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="career">Career Path</TabsTrigger>
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
                          <div className="flex items-center gap-2">
                            {getSkillIcon(skill)}
                            <div>
                              <p className="font-medium capitalize">{skill}</p>
                              <p className="text-xs text-muted-foreground">Current: {skills[skill as keyof typeof skills]}/100</p>
                            </div>
                          </div>
                          <div className="text-green-600 dark:text-green-400 font-bold">
                            +{gain}/month
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    
                    {Object.keys(job.skillGains).length === 0 && (
                      <div className="col-span-2 p-4 border border-dashed rounded-lg flex items-center justify-center text-muted-foreground">
                        <AlertCircle className="h-4 w-4 mr-2" />
                        This job doesn't provide any automatic skill improvements
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Current skills overview */}
                <div>
                  <h3 className="font-medium mb-4">Your Skills</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(skills).map(([skill, level]) => (
                      <div key={skill} className="space-y-1">
                        <div className="flex justify-between items-center text-sm">
                          <div className="flex items-center gap-1">
                            {getSkillIcon(skill)}
                            <span className="capitalize">{skill}</span>
                          </div>
                          <div>
                            {level}/100
                          </div>
                        </div>
                        <Progress value={level} className={`h-2 ${getSkillColor(skill)}`} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}