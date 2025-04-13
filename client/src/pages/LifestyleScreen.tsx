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
      {/* Enhanced Lifestyle Manager (invisible background processor) */}
      <EnhancedLifestyleManager />
      
      {/* Content */}
      <div className="relative z-10 w-full">
        <GameUI />
        
        <div className="p-4 pt-20 max-w-5xl mx-auto">
          <Button 
            variant="outline" 
            size="default"
            onClick={() => navigate('/')}
            className="mb-6 bg-primary/10 hover:bg-primary/20 border-primary/20 text-primary shadow-sm w-full sm:w-auto"
          >
            <ChevronLeft className="h-5 w-5 mr-2" />
            Back to Dashboard
          </Button>
          
          <Tabs defaultValue="lifestyle" className="mb-8">
            <TabsList className="mb-4 flex flex-wrap gap-0.5">
              <TabsTrigger 
                value="lifestyle" 
                className="h-8 px-2 flex items-center justify-center py-1 flex-1 min-w-[100px]"
              >
                <span className="whitespace-nowrap text-xs">Lifestyle & Luxury</span>
              </TabsTrigger>
              <TabsTrigger 
                value="enhanced" 
                className="h-8 px-2 flex items-center justify-center py-1 flex-1 min-w-[100px] text-indigo-600"
              >
                <Sparkles className="h-3 w-3 mr-1 text-indigo-500 flex-shrink-0" />
                <span className="whitespace-nowrap text-xs">Enhanced Choices</span>
              </TabsTrigger>
              <TabsTrigger 
                value="essentials" 
                className="h-8 px-2 flex items-center justify-center py-1 flex-1 min-w-[100px]"
              >
                <span className="whitespace-nowrap text-xs">Basic Needs</span>
              </TabsTrigger>
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
