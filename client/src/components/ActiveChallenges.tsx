import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useChallenges, Challenge } from '../lib/stores/useChallenges';
import { Progress } from './ui/progress';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { ArrowRight } from 'lucide-react';

const ChallengeProgressItem: React.FC<{ challenge: Challenge }> = ({ challenge }) => {
  const progressPercent = Math.min(100, (challenge.progress / challenge.targetValue) * 100);
  
  return (
    <div className="mb-4">
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <h4 className="text-base font-semibold">{challenge.title}</h4>
          <p className="text-sm text-muted-foreground">{challenge.description}</p>
        </div>
        <div className="text-sm font-medium ml-2">
          {Math.floor(progressPercent)}%
        </div>
      </div>
      <Progress value={progressPercent} className="h-2" />
    </div>
  );
};

export function ActiveChallenges() {
  const { activeChallenges } = useChallenges();
  const navigate = useNavigate();
  
  // If no active challenges, show a prompt to start some
  if (activeChallenges.length === 0) {
    return (
      <Card className="shadow-md bg-gradient-to-r from-blue-900/20 to-indigo-900/20 backdrop-blur-sm dark:shadow-xl py-2">
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">No Active Challenges</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Complete challenges to earn rewards and boost your progress
              </p>
            </div>
            <Button 
              variant="outline" 
              className="ml-4 flex items-center"
              onClick={() => navigate('/challenges')}
            >
              <span>Start a Challenge</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="shadow-md bg-gradient-to-r from-blue-900/20 to-indigo-900/20 backdrop-blur-sm dark:shadow-xl">
      <CardContent className="pt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Active Challenges</h3>
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs flex items-center"
            onClick={() => navigate('/challenges')}
          >
            <span>View All</span>
            <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        </div>
        
        <div>
          {activeChallenges.map((challenge) => (
            <ChallengeProgressItem 
              key={challenge.id} 
              challenge={challenge} 
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}