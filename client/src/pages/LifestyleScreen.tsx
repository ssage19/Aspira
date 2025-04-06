import { useNavigate } from 'react-router-dom';
import GameUI from '../components/GameUI';
import { Lifestyle } from '../components/Lifestyle';
import { Essentials } from '../components/Essentials';
import { Button } from '../components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "../components/ui/tabs";

export default function LifestyleScreen() {
  const navigate = useNavigate();
  
  return (
    <div className="w-full min-h-screen pt-12 pb-32">
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-b from-amber-800 to-amber-900 opacity-90 z-0" />
      
      {/* Content */}
      <div className="relative z-10 w-full">
        <GameUI />
        
        <div className="p-4 max-w-5xl mx-auto">
          <Button 
            variant="outline" 
            onClick={() => navigate('/')}
            className="mb-4 bg-white"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <Tabs defaultValue="lifestyle" className="mb-8">
            <TabsList className="mb-4">
              <TabsTrigger value="lifestyle">Lifestyle & Luxury</TabsTrigger>
              <TabsTrigger value="essentials">Basic Needs</TabsTrigger>
            </TabsList>
            
            <TabsContent value="lifestyle">
              <Lifestyle />
            </TabsContent>
            
            <TabsContent value="essentials">
              <Essentials />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
