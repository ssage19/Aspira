import { useNavigate } from 'react-router-dom';
import GameUI from '../components/GameUI';
import { Properties } from '../components/Properties';
import { Button } from '../components/ui/button';
import { ChevronLeft } from 'lucide-react';

export default function PropertyScreen() {
  const navigate = useNavigate();
  
  return (
    <div className="w-full min-h-screen pt-2 pb-24">
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-b from-purple-900 to-indigo-900 opacity-90 z-0" />
      
      {/* Content */}
      <div className="relative z-10 w-full">
        <GameUI />
        
        <div className="p-4 max-w-5xl mx-auto">
          <div className="flex mb-4">
            <Button 
              variant="secondary" 
              onClick={() => navigate('/')}
              className="bg-white hover:bg-gray-100 text-black"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
          
          <Properties />
        </div>
      </div>
    </div>
  );
}
