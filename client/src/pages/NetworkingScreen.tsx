import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { SocialNetworking } from '../components/SocialNetworking';
import { NetworkTracker } from '../components/NetworkTracker';
import { ChevronLeft } from 'lucide-react';
import { GameUI } from '../components/GameUI';

export function NetworkingScreen() {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-background">
      {/* Background tracking component */}
      <NetworkTracker />
      
      {/* Header with navigation */}
      <GameUI>
        <div className="container mx-auto px-4 pt-4 pb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/dashboard')}
            className="mb-4"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Dashboard
          </Button>
          
          {/* Main content */}
          <SocialNetworking />
        </div>
      </GameUI>
    </div>
  );
}