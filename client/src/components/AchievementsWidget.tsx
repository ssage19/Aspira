/**
 * Simple Achievements Widget
 * 
 * A lightweight component that shows a few recent achievements
 * without causing any render loops
 */
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Medal, Trophy, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export function AchievementsWidget() {
  const navigate = useNavigate();
  
  // Instead of directly accessing achievement state, we'll use a local state copy
  // to avoid infinite rendering loops
  const [achievementPreview, setAchievementPreview] = useState<any[]>([]);
  
  useEffect(() => {
    // Load achievements from localStorage to avoid direct zustand access
    try {
      const achievementsData = localStorage.getItem('luxury_lifestyle_achievements');
      if (achievementsData) {
        const parsed = JSON.parse(achievementsData);
        if (Array.isArray(parsed)) {
          // Take the 3 most recent completed achievements
          setAchievementPreview(
            parsed
              .filter((a: any) => a.completed)
              .sort((a: any, b: any) => b.completedAt - a.completedAt)
              .slice(0, 3)
          );
        }
      }
    } catch (error) {
      console.error("Error loading achievements:", error);
    }
  }, []);
  
  // Handle navigation to achievements page
  const handleViewAll = (e: React.MouseEvent) => {
    e.preventDefault();
    console.log("Navigating to achievements page");
    navigate('/achievements');
  };
  
  if (achievementPreview.length === 0) {
    // If no achievements, show a simple placeholder
    return (
      <Card className="mb-8 futuristic-card border-primary/30 shadow-lg relative overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex justify-between items-center">
            <span className="flex items-center">
              <Trophy className="mr-2 h-5 w-5 text-amber-400" />
              Recent Achievements
            </span>
            <Link to="/achievements">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleViewAll}
              >
                View All <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent className="py-4 text-center text-muted-foreground">
          Complete achievements to earn rewards and track your progress!
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="mb-8 futuristic-card border-primary/30 shadow-lg relative overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex justify-between items-center">
          <span className="flex items-center">
            <Trophy className="mr-2 h-5 w-5 text-amber-400" />
            Recent Achievements
          </span>
          <Link to="/achievements">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleViewAll}
            >
              View All <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="py-4">
        <div className="space-y-3">
          {achievementPreview.map((achievement: any, index: number) => (
            <div key={index} className="flex items-center p-2 rounded-lg bg-background/50 backdrop-blur-sm border border-primary/10">
              <div className="p-2 rounded-full bg-amber-500/10 mr-3">
                <Medal className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <h4 className="text-sm font-medium">{achievement.title}</h4>
                <p className="text-xs text-muted-foreground">{achievement.description}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}