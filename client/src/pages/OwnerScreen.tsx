import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import GameUI from '../components/GameUI';
import { AppBackground } from '../components/AppBackground';
import { BusinessManagement } from '../components/BusinessManagement';
import { ChevronLeft } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { HorseRacingOwnership } from '../components/ownership/HorseRacingOwnership';
import { Formula1Ownership } from '../components/ownership/Formula1Ownership';
import { SportsTeamOwnership } from '../components/ownership/SportsTeamOwnership';

export default function OwnerScreen() {
  const navigate = useNavigate();

  return (
    <>
      <AppBackground />
      <div className="min-h-screen w-full pt-2 pb-24">
        <GameUI />
        
        <div className="relative z-10 w-full max-w-5xl mx-auto p-6 mt-14">
          <div className="mb-4">
            <Button 
              variant="ghost" 
              className="flex items-center text-muted-foreground hover:text-primary"
              onClick={() => navigate('/')}
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>
          
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-primary">Ownership</h1>
            <p className="text-muted-foreground">Manage your businesses and investments</p>
          </div>
          
          <Tabs defaultValue="business" className="w-full">
            <TabsList className="grid grid-cols-4 mb-6">
              <TabsTrigger value="business">Business</TabsTrigger>
              <TabsTrigger value="racing">Horse Racing</TabsTrigger>
              <TabsTrigger value="formula1">Formula 1</TabsTrigger>
              <TabsTrigger value="sports">Sports Teams</TabsTrigger>
            </TabsList>
            
            <TabsContent value="business">
              <BusinessManagement />
            </TabsContent>
            
            <TabsContent value="racing">
              <HorseRacingOwnership />
            </TabsContent>
            
            <TabsContent value="formula1">
              <Formula1Ownership />
            </TabsContent>
            
            <TabsContent value="sports">
              <SportsTeamOwnership />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}