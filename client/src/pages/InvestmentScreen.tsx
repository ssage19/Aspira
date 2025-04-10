import { useNavigate } from 'react-router-dom';
import GameUI from '../components/GameUI';
import { Investments } from '../components/Investments';
import { Button } from '../components/ui/button';
import { ChevronLeft } from 'lucide-react';

export default function InvestmentScreen() {
  const navigate = useNavigate();
  
  return (
    <div className="w-full min-h-screen pt-2 pb-24">
      {/* Content */}
      <div className="relative z-10 w-full">
        <GameUI />
        
        <div className="p-4 max-w-5xl mx-auto">
          <div className="flex mb-4">
            <Button 
              variant="outline" 
              onClick={() => navigate('/')}
              className="bg-background hover:bg-muted border-border text-white"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
          
          <Investments />
        </div>
      </div>
    </div>
  );
}
