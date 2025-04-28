import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { ChevronLeft, Dice1, DollarSign, Trophy, CaseSensitive, Coins } from 'lucide-react';
import { useCharacter } from '../lib/stores/useCharacter';
// Audio removed
import { formatCurrency } from '../lib/utils';
import { toast } from 'sonner';
import BlackjackGame from '../components/games/BlackjackGame';
import RouletteGame from '../components/games/RouletteGame';
import PokerGame from '../components/games/PokerGame';
import GameUI from '../components/GameUI';

export default function CasinoScreen() {
  const navigate = useNavigate();
  const { wealth, addWealth } = useCharacter();
  // Audio removed - using empty functions
  const playSuccess = () => {};
  const playHit = () => {};
  const [activeGame, setActiveGame] = useState<'blackjack' | 'roulette' | 'poker'>('blackjack');

  // Handle winning and losing money with improved tracking - optimized with useCallback
  const handleWin = useCallback((amount: number) => {
    // Add the net winnings (the amount parameter is the net profit)
    addWealth(amount);
    playSuccess();
    toast.success(`You won ${formatCurrency(amount)}!`, {
      style: { background: 'rgba(22, 163, 74, 0.2)', color: '#fff' },
      icon: '💰',
    });
    console.log(`Casino win tracked: +${amount}`);
  }, [addWealth, playSuccess]);

  const handleLoss = useCallback((amount: number) => {
    // Deduct the bet amount (always a positive number)
    addWealth(-amount);
    playHit();
    toast.error(`You lost ${formatCurrency(amount)}`, {
      style: { background: 'rgba(220, 38, 38, 0.2)', color: '#fff' },
      icon: '💸',
    });
    console.log(`Casino loss tracked: -${amount}`);
  }, [addWealth, playHit]);

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
              className="bg-black/20 hover:bg-black/30 border-slate-700/50 text-slate-200 shadow-md transition-all duration-200 rounded-lg px-5 py-2 h-auto"
            >
              <ChevronLeft className="h-5 w-5 mr-2 text-slate-400" />
              <span>Back to Dashboard</span>
            </Button>

            <div className="flex items-center px-5 py-3 bg-gradient-to-r from-black/20 to-yellow-900/20 backdrop-blur-sm rounded-2xl border border-yellow-500/20 shadow-lg">
              <div className="bg-gradient-to-r from-yellow-500 to-amber-600 rounded-full p-2 mr-3">
                <DollarSign className="text-white h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-yellow-500/70">Your Balance</span>
                <span className="font-bold text-xl text-white">{formatCurrency(wealth)}</span>
              </div>
            </div>
          </div>
          
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-3 text-gradient bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600">
              Lucky Stars Casino
            </h1>
            <div className="flex items-center">
              <p className="text-muted-foreground mr-2">
                Try your luck at different casino games and win big!
              </p>
              <div className="flex items-center bg-yellow-500/20 px-3 py-1 rounded-full">
                <Coins className="h-4 w-4 text-yellow-500 mr-1" />
                <span className="text-yellow-400 text-sm font-medium">Good luck!</span>
              </div>
            </div>
          </div>

          <Tabs defaultValue="blackjack" value={activeGame} onValueChange={(value) => setActiveGame(value as any)}>
            <TabsList className="mb-6 grid grid-cols-3 gap-4 bg-transparent">
              <TabsTrigger 
                value="blackjack" 
                className="data-[state=active]:bg-gradient-to-b data-[state=active]:from-amber-500/30 data-[state=active]:to-amber-800/30 
                  flex items-center justify-center gap-2 py-4 rounded-lg border border-slate-200/10 data-[state=active]:border-yellow-500/50 shadow-lg
                  hover:bg-black/20 transition-all duration-200"
              >
                <Dice1 className="h-5 w-5 text-yellow-500" />
                <span className="font-medium">Blackjack</span>
              </TabsTrigger>
              <TabsTrigger 
                value="roulette" 
                className="data-[state=active]:bg-gradient-to-b data-[state=active]:from-amber-500/30 data-[state=active]:to-amber-800/30 
                  flex items-center justify-center gap-2 py-4 rounded-lg border border-slate-200/10 data-[state=active]:border-yellow-500/50 shadow-lg
                  hover:bg-black/20 transition-all duration-200"
              >
                <Dice1 className="h-5 w-5 text-yellow-500" />
                <span className="font-medium">Roulette</span>
              </TabsTrigger>
              <TabsTrigger 
                value="poker" 
                className="data-[state=active]:bg-gradient-to-b data-[state=active]:from-amber-500/30 data-[state=active]:to-amber-800/30 
                  flex items-center justify-center gap-2 py-4 rounded-lg border border-slate-200/10 data-[state=active]:border-yellow-500/50 shadow-lg
                  hover:bg-black/20 transition-all duration-200"
              >
                <Trophy className="h-5 w-5 text-yellow-500" />
                <span className="font-medium">Poker</span>
              </TabsTrigger>
            </TabsList>
            
            <div className="bg-gradient-to-b from-black/10 to-black/20 backdrop-blur-md border border-slate-200/10 rounded-lg p-8 shadow-xl">
              <TabsContent value="blackjack">
                {useMemo(() => (
                  <BlackjackGame onWin={handleWin} onLoss={handleLoss} playerBalance={wealth} />
                ), [handleWin, handleLoss, wealth])}
              </TabsContent>
              
              <TabsContent value="roulette">
                {useMemo(() => (
                  <RouletteGame onWin={handleWin} onLoss={handleLoss} playerBalance={wealth} />
                ), [handleWin, handleLoss, wealth])}
              </TabsContent>
              
              <TabsContent value="poker">
                {useMemo(() => (
                  <PokerGame onWin={handleWin} onLoss={handleLoss} playerBalance={wealth} />
                ), [handleWin, handleLoss, wealth])}
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
}