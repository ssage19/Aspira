import React from 'react';
import { useState, useEffect } from 'react';
import { 
  useChallenges, 
  Challenge, 
  ChallengeCategory, 
  DifficultyLevel 
} from '../lib/stores/useChallenges';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { 
  Award, 
  Clock, 
  Flame, 
  Gift, 
  Star, 
  TrendingUp, 
  Coins, 
  BadgeCheck, 
  GraduationCap,
  Home,
  Sparkles,
  ChevronLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AppBackground } from '../components/AppBackground';

const CategoryLabel: React.FC<{ category: ChallengeCategory }> = ({ category }) => {
  const getColor = (category: ChallengeCategory) => {
    switch (category) {
      case 'wealth': return 'bg-amber-500 text-amber-50';
      case 'investment': return 'bg-emerald-500 text-emerald-50';
      case 'career': return 'bg-blue-500 text-blue-50';
      case 'skills': return 'bg-purple-500 text-purple-50';
      case 'lifestyle': return 'bg-indigo-500 text-indigo-50';
      case 'special': return 'bg-rose-500 text-rose-50';
      default: return 'bg-slate-500 text-slate-50';
    }
  };
  
  const getIcon = (category: ChallengeCategory) => {
    switch (category) {
      case 'wealth': return <Coins className="h-3 w-3 mr-1" />;
      case 'investment': return <TrendingUp className="h-3 w-3 mr-1" />;
      case 'career': return <BadgeCheck className="h-3 w-3 mr-1" />;
      case 'skills': return <GraduationCap className="h-3 w-3 mr-1" />;
      case 'lifestyle': return <Home className="h-3 w-3 mr-1" />;
      case 'special': return <Sparkles className="h-3 w-3 mr-1" />;
      default: return null;
    }
  };
  
  return (
    <Badge variant="outline" className={`${getColor(category)} font-medium flex items-center`}>
      {getIcon(category)}
      <span>{category.charAt(0).toUpperCase() + category.slice(1)}</span>
    </Badge>
  );
};

const DifficultyLabel: React.FC<{ difficulty: DifficultyLevel }> = ({ difficulty }) => {
  const getColor = (difficulty: DifficultyLevel) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800 border-green-300';
      case 'intermediate': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'advanced': return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'expert': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'master': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };
  
  const getStars = (difficulty: DifficultyLevel) => {
    switch (difficulty) {
      case 'beginner': return 1;
      case 'intermediate': return 2;
      case 'advanced': return 3;
      case 'expert': return 4;
      case 'master': return 5;
      default: return 0;
    }
  };
  
  return (
    <div className={`flex items-center rounded-full text-xs px-2.5 py-0.5 border ${getColor(difficulty)}`}>
      {Array.from({ length: getStars(difficulty) }).map((_, i) => (
        <Star key={i} className="h-3 w-3 mr-0.5 fill-current" />
      ))}
      <span className="ml-1">{difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}</span>
    </div>
  );
};

const ChallengeCard: React.FC<{ 
  challenge: Challenge; 
  onStart?: () => void; 
  onAbandon?: () => void;
  onClaim?: () => void;
}> = ({ challenge, onStart, onAbandon, onClaim }) => {
  const progressPercent = Math.min(100, (challenge.progress / challenge.targetValue) * 100);
  
  return (
    <Card className="shadow-md bg-card/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
      <div className="relative">
        {challenge.isCompleted && (
          <div className="absolute top-0 right-0 w-20 h-20 overflow-hidden">
            <div className="absolute top-0 right-0 transform rotate-45 bg-emerald-500 text-white text-xs font-bold px-1 py-0.5 mt-3 w-28 text-center origin-top">
              COMPLETED
            </div>
          </div>
        )}
        
        {challenge.isFailed && (
          <div className="absolute top-0 right-0 w-20 h-20 overflow-hidden">
            <div className="absolute top-0 right-0 transform rotate-45 bg-red-500 text-white text-xs font-bold px-1 py-0.5 mt-3 w-28 text-center origin-top">
              FAILED
            </div>
          </div>
        )}
        
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <CardTitle className="text-xl">{challenge.title}</CardTitle>
              <div className="flex space-x-2 mt-1">
                <CategoryLabel category={challenge.category} />
                <DifficultyLabel difficulty={challenge.difficulty} />
              </div>
            </div>
            
            {challenge.timeLimit && !challenge.isCompleted && !challenge.isFailed && (
              <div className="flex items-center text-sm bg-amber-100 text-amber-800 px-2 py-1 rounded">
                <Clock className="h-3.5 w-3.5 mr-1" />
                <span>{challenge.timeLimit} days</span>
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">{challenge.description}</p>
          
          {!challenge.isCompleted && !challenge.isFailed && (
            <div className="mb-4">
              <div className="flex justify-between text-xs mb-1">
                <span>Progress</span>
                <span>{Math.floor(progressPercent)}%</span>
              </div>
              <Progress value={progressPercent} className="h-2" />
            </div>
          )}
          
          <div className="flex flex-col space-y-2 mb-2">
            <div className="flex items-center text-sm">
              <Award className="h-4 w-4 mr-2 text-blue-500" />
              <span>Reward: <span className="font-medium">{challenge.reward.description}</span></span>
            </div>
            
            {challenge.targetDate && !challenge.isCompleted && !challenge.isFailed && (
              <div className="flex items-center text-sm">
                <Clock className="h-4 w-4 mr-2 text-amber-500" />
                <span>Due: <span className="font-medium">
                  {new Date(challenge.targetDate).toLocaleDateString()}
                </span></span>
              </div>
            )}
          </div>
          
          <div className="flex justify-end space-x-2 mt-2">
            {!challenge.isActive && !challenge.isCompleted && !challenge.isFailed && onStart && (
              <Button size="sm" onClick={onStart} className="bg-blue-500 hover:bg-blue-600">
                Start Challenge
              </Button>
            )}
            
            {challenge.isActive && onAbandon && (
              <Button 
                size="sm" 
                variant="outline" 
                onClick={onAbandon}
                className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
              >
                Abandon
              </Button>
            )}
            
            {challenge.isCompleted && !challenge.rewardClaimed && onClaim && (
              <Button 
                size="sm" 
                className="bg-amber-500 hover:bg-amber-600 flex items-center"
                onClick={onClaim}
              >
                <Gift className="h-4 w-4 mr-1" />
                Claim Reward
              </Button>
            )}
            
            {challenge.isCompleted && challenge.rewardClaimed && (
              <div className="flex items-center text-sm text-emerald-600">
                <BadgeCheck className="h-4 w-4 mr-1" />
                Reward Claimed
              </div>
            )}
          </div>
        </CardContent>
      </div>
    </Card>
  );
};

export default function ChallengesScreen() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("available");
  const { 
    availableChallenges, 
    activeChallenges, 
    completedChallenges,
    failedChallenges,
    totalCompleted,
    consecutiveCompletions,
    startChallenge,
    abandonChallenge,
    claimReward,
    generateNewChallenges,
    checkChallengeProgress
  } = useChallenges();
  
  // Force-check challenge progress when this screen is loaded
  // This ensures any challenges that should be completed are moved correctly
  useEffect(() => {
    console.log("ChallengesScreen: Force checking challenge progress...");
    checkChallengeProgress();
  }, [checkChallengeProgress]);
  
  return (
    <div className="flex flex-col min-h-screen">
      <AppBackground />
      
      <div className="container max-w-6xl mx-auto px-4 py-8 relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Challenges</h1>
            <p className="text-muted-foreground">
              Complete challenges to earn rewards and boost your progress
            </p>
          </div>
          
          <Button 
            variant="outline" 
            onClick={() => navigate('/')}
            className="flex items-center"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-blue-50 dark:bg-blue-950/40 shadow-md">
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="rounded-full bg-blue-100 dark:bg-blue-900 p-3 mr-4">
                  <Flame className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Challenges</p>
                  <h3 className="text-2xl font-bold">{activeChallenges.length}</h3>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-emerald-50 dark:bg-emerald-950/40 shadow-md">
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="rounded-full bg-emerald-100 dark:bg-emerald-900 p-3 mr-4">
                  <BadgeCheck className="h-6 w-6 text-emerald-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Completed</p>
                  <h3 className="text-2xl font-bold">{totalCompleted}</h3>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-amber-50 dark:bg-amber-950/40 shadow-md">
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="rounded-full bg-amber-100 dark:bg-amber-900 p-3 mr-4">
                  <Star className="h-6 w-6 text-amber-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Consecutive Completions</p>
                  <h3 className="text-2xl font-bold">{consecutiveCompletions}</h3>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Tabs 
          defaultValue="available" 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid grid-cols-4 mb-6">
            <TabsTrigger value="available">Available</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="failed">Failed</TabsTrigger>
          </TabsList>
          
          <TabsContent value="available" className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Available Challenges</h2>
              <Button 
                variant="outline" 
                onClick={generateNewChallenges}
                className="flex items-center text-sm"
              >
                <Star className="h-4 w-4 mr-1" />
                Generate New Challenges
              </Button>
            </div>
            
            {availableChallenges.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="rounded-full bg-slate-100 p-3 mb-4">
                    <Clock className="h-8 w-8 text-slate-400" />
                  </div>
                  <h3 className="text-xl font-medium mb-2">No Available Challenges</h3>
                  <p className="text-muted-foreground max-w-md mb-4">
                    You've taken on all current challenges! Generate new ones to continue your progress.
                  </p>
                  <Button onClick={generateNewChallenges}>
                    Generate New Challenges
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {availableChallenges.map((challenge) => (
                  <ChallengeCard 
                    key={challenge.id} 
                    challenge={challenge} 
                    onStart={() => startChallenge(challenge.id)} 
                  />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="active" className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Active Challenges</h2>
            
            {activeChallenges.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="rounded-full bg-slate-100 p-3 mb-4">
                    <Flame className="h-8 w-8 text-slate-400" />
                  </div>
                  <h3 className="text-xl font-medium mb-2">No Active Challenges</h3>
                  <p className="text-muted-foreground max-w-md mb-4">
                    You don't have any active challenges. Start a new challenge to progress!
                  </p>
                  <Button onClick={() => setActiveTab("available")}>
                    Browse Available Challenges
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {activeChallenges.map((challenge) => (
                  <ChallengeCard 
                    key={challenge.id} 
                    challenge={challenge} 
                    onAbandon={() => abandonChallenge(challenge.id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="completed" className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Completed Challenges</h2>
            
            {completedChallenges.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="rounded-full bg-slate-100 p-3 mb-4">
                    <BadgeCheck className="h-8 w-8 text-slate-400" />
                  </div>
                  <h3 className="text-xl font-medium mb-2">No Completed Challenges</h3>
                  <p className="text-muted-foreground max-w-md mb-4">
                    You haven't completed any challenges yet. Complete active challenges to see them here.
                  </p>
                  <Button onClick={() => setActiveTab("active")}>
                    View Active Challenges
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {completedChallenges.map((challenge) => (
                  <ChallengeCard 
                    key={challenge.id} 
                    challenge={challenge} 
                    onClaim={() => claimReward(challenge.id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="failed" className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Failed Challenges</h2>
            
            {failedChallenges.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="rounded-full bg-slate-100 p-3 mb-4">
                    <Clock className="h-8 w-8 text-slate-400" />
                  </div>
                  <h3 className="text-xl font-medium mb-2">No Failed Challenges</h3>
                  <p className="text-muted-foreground max-w-md">
                    You haven't failed any challenges. Keep up the good work!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {failedChallenges.map((challenge) => (
                  <ChallengeCard key={challenge.id} challenge={challenge} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}