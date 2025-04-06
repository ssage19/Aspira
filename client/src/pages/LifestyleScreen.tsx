import { useNavigate } from 'react-router-dom';
import GameUI from '../components/GameUI';
import { Lifestyle } from '../components/Lifestyle';
import { Essentials } from '../components/Essentials';
import { EnhancedLifestyleSelector } from '../components/EnhancedLifestyleSelector';
import { EnhancedLifestyleManager } from '../components/EnhancedLifestyleManager';
import { Button } from '../components/ui/button';
import { ChevronLeft, Sparkles } from 'lucide-react';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "../components/ui/tabs";

export default function LifestyleScreen() {
  const navigate = useNavigate();
  
  return (
    <div className="w-full min-h-screen pt-2 pb-24">
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-b from-amber-800 to-amber-900 opacity-90 z-0" />
      
      {/* Enhanced Lifestyle Manager (invisible background processor) */}
      <EnhancedLifestyleManager />
      
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
            <TabsList className="mb-4 flex flex-wrap">
              <TabsTrigger value="lifestyle">Lifestyle & Luxury</TabsTrigger>
              <TabsTrigger value="enhanced" className="text-indigo-600">
                <Sparkles className="h-4 w-4 mr-1 text-indigo-500" />
                Enhanced Choices
              </TabsTrigger>
              <TabsTrigger value="essentials">Basic Needs</TabsTrigger>
            </TabsList>
            
            <TabsContent value="lifestyle">
              <Lifestyle />
            </TabsContent>
            
            <TabsContent value="enhanced">
              <EnhancedLifestyleSelector />
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
