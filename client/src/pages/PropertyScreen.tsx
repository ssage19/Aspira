import { useNavigate } from 'react-router-dom';
import GameUI from '../components/GameUI';
import { Properties } from '../components/Properties';
import { Button } from '../components/ui/button';
import { ChevronLeft } from 'lucide-react';

export default function PropertyScreen() {
  const navigate = useNavigate();
  
  return (
    <div className="w-full min-h-screen pt-2 pb-24">
      {/* Content */}
      <div className="relative z-10 w-full">
        <GameUI />
        
        <div className="p-4 max-w-5xl mx-auto">
          <Button 
            variant="outline" 
            size="default"
            onClick={() => navigate('/')}
            className="mb-6 bg-primary/10 hover:bg-primary/20 border-primary/20 text-primary shadow-sm w-full sm:w-auto"
          >
            <ChevronLeft className="h-5 w-5 mr-2" />
            Back to Dashboard
          </Button>
          
          <Properties />
        </div>
      </div>
    </div>
  );
}
