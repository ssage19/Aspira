import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCharacter } from '../lib/stores/useCharacter';
import { useGame } from '../lib/stores/useGame';
import { useAudio } from '../lib/stores/useAudio';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { toast } from 'sonner';
import { formatCurrency } from '../lib/utils';
import { DollarSign, Briefcase, TrendingUp, Crown } from 'lucide-react';

type WealthOption = 'bootstrapped' | 'middle-class' | 'wealthy';

export default function CharacterCreation() {
  const navigate = useNavigate();
  const { createNewCharacter } = useCharacter();
  const { start } = useGame();
  const { playSuccess } = useAudio();
  
  const [name, setName] = useState('');
  const [selectedWealth, setSelectedWealth] = useState<WealthOption>('bootstrapped');
  
  const handleStartGame = () => {
    if (!name.trim()) {
      toast.error("Please enter a name for your character");
      return;
    }
    
    // Find the selected wealth option
    const selectedOption = wealthOptions.find(option => option.id === selectedWealth);
    if (!selectedOption) {
      toast.error("Please select a valid starting wealth option");
      return;
    }
    
    // Create new character with the numerical amount
    createNewCharacter(name, selectedOption.startingAmount, null);
    playSuccess();
    
    // Change game phase to playing
    start();
    
    // Navigate to main dashboard
    navigate('/');
  };
  
  const wealthOptions = [
    {
      id: 'bootstrapped',
      title: 'Self-Made',
      icon: <Briefcase className="h-10 w-10 mb-2 text-blue-500" />,
      description: 'Start with $10,000 and build your fortune from scratch.',
      startingAmount: 10000,
      difficulty: 'Hard'
    },
    {
      id: 'middle-class',
      title: 'Middle Class',
      icon: <TrendingUp className="h-10 w-10 mb-2 text-green-500" />,
      description: 'Begin with $100,000 - a solid foundation to grow your wealth.',
      startingAmount: 100000,
      difficulty: 'Medium'
    },
    {
      id: 'wealthy',
      title: 'Wealthy',
      icon: <Crown className="h-10 w-10 mb-2 text-amber-500" />,
      description: 'Start with $1,000,000 - already rich and ready to get richer.',
      startingAmount: 1000000,
      difficulty: 'Easy'
    }
  ];
  
  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-gray-50 p-8">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold flex items-center">
            <DollarSign className="h-8 w-8 mr-2 text-green-500" />
            Luxury Lifestyle Simulator
          </CardTitle>
          <CardDescription className="text-lg">
            Create your character and begin your journey to extreme wealth
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              Character Name
            </label>
            <Input
              id="name"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full"
            />
          </div>
          
          <div>
            <h3 className="text-sm font-medium mb-3">Choose Your Starting Wealth</h3>
            <Tabs 
              defaultValue="bootstrapped" 
              onValueChange={(value) => setSelectedWealth(value as WealthOption)}
              className="w-full"
            >
              <TabsList className="grid grid-cols-3 mb-2">
                {wealthOptions.map(option => (
                  <TabsTrigger key={option.id} value={option.id}>{option.title}</TabsTrigger>
                ))}
              </TabsList>
              
              {wealthOptions.map(option => (
                <TabsContent key={option.id} value={option.id} className="mt-0">
                  <Card>
                    <CardHeader className="py-3">
                      <CardTitle className="text-xl flex items-center">
                        {option.icon}
                        <div>
                          {option.title}
                          <span className="ml-2 text-sm font-normal text-gray-500">
                            (Difficulty: {option.difficulty})
                          </span>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="py-2">
                      <p>{option.description}</p>
                      <p className="mt-2 text-lg font-semibold">
                        Starting Wealth: {formatCurrency(option.startingAmount)}
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </CardContent>
        
        <CardFooter>
          <Button onClick={handleStartGame} className="w-full">
            Start Your Journey to Wealth
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
