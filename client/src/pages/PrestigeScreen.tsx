import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { GameUI } from '../components/GameUI';
import { AppBackground } from '../components/AppBackground';
import PrestigeSystem from '../components/PrestigeSystem';
import { ChevronLeft } from 'lucide-react';

export default function PrestigeScreen() {
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
          
          <PrestigeSystem />
        </div>
      </div>
    </>
  );
}