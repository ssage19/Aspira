import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { ChevronLeft, Dice1, DollarSign, Trophy, CaseSensitive, Coins } from 'lucide-react';
import { useCharacter } from '../lib/stores/useCharacter';
import { useAudio } from '../lib/stores/useAudio';
import { formatCurrency } from '../lib/utils';
import { toast } from 'sonner';
import BlackjackGame from '../components/games/BlackjackGame';
import RouletteGame from '../components/games/RouletteGame';
import PokerGame from '../components/games/PokerGame';
import GameUI from '../components/GameUI';

export default function CasinoScreen() {
  const navigate = useNavigate();
  const { wealth, addWealth } = useCharacter();
  const { playSuccess, playHit } = useAudio();
  const [activeGame, setActiveGame] = useState<'blackjack' | 'roulette' | 'poker'>('blackjack');

  // Handle winning and losing money with improved tracking
  const handleWin = (amount: number) => {
    // Add the net winnings (the amount parameter is the net profit)
    addWealth(amount);
    playSuccess();
    toast.success(`You won ${formatCurrency(amount)}!`, {
      style: { background: 'rgba(22, 163, 74, 0.2)', color: '#fff' },
      icon: '💰',
    });
    console.log(`Casino win tracked: +${amount}`);
  };

  const handleLoss = (amount: number) => {
    // Deduct the bet amount (always a positive number)
    addWealth(-amount);
    playHit();
    toast.error(`You lost ${formatCurrency(amount)}`, {
      style: { background: 'rgba(220, 38, 38, 0.2)', color: '#fff' },
      icon: '💸',
    });
    console.log(`Casino loss tracked: -${amount}`);
  };

  return (
    <div className="w-full min-h-screen pt-2 pb-24">
      {/* Game UI for stats */}
      <GameUI />
      
      {/* Content */}
      <div className="relative z-10 w-full">
        <div className="p-4 pt-20 max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <Button 
              variant="outline" 
              size="default"
              onClick={() => navigate('/')}
              className="bg-primary/10 hover:bg-primary/20 border-primary/20 text-primary shadow-sm"
            >
              <ChevronLeft className="h-5 w-5 mr-2" />
              Back to Dashboard
            </Button>

            <div className="flex items-center px-4 py-2 bg-black/10 backdrop-blur-sm rounded-full">
              <DollarSign className="text-yellow-500 h-5 w-5 mr-2" />
              <span className="font-bold text-lg">{formatCurrency(wealth)}</span>
            </div>
          </div>
          
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2 text-gradient">Lucky Stars Casino</h1>
            <p className="text-muted-foreground">
              Try your luck at different casino games and win big! Be careful not to bet more than you can afford to lose.
            </p>
          </div>

          <Tabs defaultValue="blackjack" value={activeGame} onValueChange={(value) => setActiveGame(value as any)}>
            <TabsList className="mb-6 grid grid-cols-3 gap-4">
              <TabsTrigger 
                value="blackjack" 
                className="data-[state=active]:bg-primary/20 flex items-center justify-center gap-2 py-3 border-b-2 data-[state=active]:border-primary"
              >
                <Dice1 className="h-5 w-5" />
                <span>Blackjack</span>
              </TabsTrigger>
              <TabsTrigger 
                value="roulette" 
                className="data-[state=active]:bg-primary/20 flex items-center justify-center gap-2 py-3 border-b-2 data-[state=active]:border-primary"
              >
                <Dice1 className="h-5 w-5" />
                <span>Roulette</span>
              </TabsTrigger>
              <TabsTrigger 
                value="poker" 
                className="data-[state=active]:bg-primary/20 flex items-center justify-center gap-2 py-3 border-b-2 data-[state=active]:border-primary"
              >
                <Trophy className="h-5 w-5" />
                <span>Poker</span>
              </TabsTrigger>
            </TabsList>
            
            <div className="bg-black/5 backdrop-blur-sm border border-slate-200/20 rounded-lg p-6">
              <TabsContent value="blackjack">
                <BlackjackGame onWin={handleWin} onLoss={handleLoss} playerBalance={wealth} />
              </TabsContent>
              
              <TabsContent value="roulette">
                <RouletteGame onWin={handleWin} onLoss={handleLoss} playerBalance={wealth} />
              </TabsContent>
              
              <TabsContent value="poker">
                <PokerGame onWin={handleWin} onLoss={handleLoss} playerBalance={wealth} />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
}