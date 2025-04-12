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
      <GameUI />
      
      <div className="container mx-auto px-4 pt-4 pb-6">
        {/* More prominent back button */}
        <Button 
          variant="outline" 
          size="default" 
          onClick={() => navigate('/dashboard')}
          className="mb-6 bg-primary/10 hover:bg-primary/20 border-primary/20 text-primary shadow-sm"
        >
          <ChevronLeft className="h-5 w-5 mr-2" />
          Back to Dashboard
        </Button>
        
        {/* Main content */}
        <SocialNetworking />
      </div>
    </div>
  );
}