import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { DollarSign, RotateCcw, Play } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';
import { toast } from 'sonner';

// Roulette constants
const RED_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
const BLACK_NUMBERS = [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35];
const ZERO = 0;

// Bet types
type BetType = 'red' | 'black' | 'even' | 'odd' | 'low' | 'high' | 'number';

interface BetOption {
  type: BetType;
  label: string;
  color: string;
  hoverColor: string;
  payout: number;
  value?: number; // For single number bets
}

interface RouletteGameProps {
  onWin: (amount: number) => void;
  onLoss: (amount: number) => void;
  playerBalance: number;
}

export default function RouletteGame({ onWin, onLoss, playerBalance }: RouletteGameProps) {
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const [selectedBet, setSelectedBet] = useState<BetOption | null>(null);
  const [betAmount, setBetAmount] = useState(100);
  const [lastResults, setLastResults] = useState<number[]>([]);
  
  // Define bet options
  const betOptions: BetOption[] = [
    { type: 'red', label: 'Red', color: 'bg-red-600', hoverColor: 'hover:bg-red-700', payout: 2 },
    { type: 'black', label: 'Black', color: 'bg-black', hoverColor: 'hover:bg-gray-800', payout: 2 },
    { type: 'even', label: 'Even', color: 'bg-purple-600', hoverColor: 'hover:bg-purple-700', payout: 2 },
    { type: 'odd', label: 'Odd', color: 'bg-blue-600', hoverColor: 'hover:bg-blue-700', payout: 2 },
    { type: 'low', label: '1-18', color: 'bg-teal-600', hoverColor: 'hover:bg-teal-700', payout: 2 },
    { type: 'high', label: '19-36', color: 'bg-indigo-600', hoverColor: 'hover:bg-indigo-700', payout: 2 },
  ];
  
  // Create number bet options (1-36)
  const numberBetOptions: BetOption[] = Array.from({ length: 37 }, (_, i) => ({
    type: 'number',
    label: i.toString(),
    color: i === 0 ? 'bg-green-600' : RED_NUMBERS.includes(i) ? 'bg-red-600' : 'bg-black',
    hoverColor: i === 0 ? 'hover:bg-green-700' : RED_NUMBERS.includes(i) ? 'hover:bg-red-700' : 'hover:bg-gray-800',
    payout: 36,
    value: i
  }));
  
  // Handle selecting a bet
  const handleSelectBet = (bet: BetOption) => {
    setSelectedBet(bet);
  };
  
  // Adjust bet amount
  const adjustBetAmount = (amount: number) => {
    const newAmount = betAmount + amount;
    if (newAmount >= 100 && newAmount <= playerBalance) {
      setBetAmount(newAmount);
    }
  };
  
  // Get the color class for a number
  const getNumberColor = (num: number) => {
    if (num === 0) return 'text-green-600';
    if (RED_NUMBERS.includes(num)) return 'text-red-600';
    return 'text-black';
  };
  
  // Spin the roulette wheel
  const spinWheel = async () => {
    if (!selectedBet) {
      toast.error("Please select a bet first");
      return;
    }
    
    if (betAmount > playerBalance) {
      toast.error("You don't have enough money for this bet");
      return;
    }
    
    setSpinning(true);
    
    // Animated spinning effect
    const spinTime = 3000; // 3 seconds
    const intervalTime = 100; // 100ms between updates
    const iterations = spinTime / intervalTime;
    
    for (let i = 0; i < iterations; i++) {
      await new Promise(resolve => setTimeout(resolve, intervalTime));
      // Update with a random number each time for animation effect
      setResult(Math.floor(Math.random() * 37));
    }
    
    // Final result
    const finalResult = Math.floor(Math.random() * 37);
    setResult(finalResult);
    setLastResults(prev => [finalResult, ...prev].slice(0, 10));
    
    // Determine if the player won
    let isWin = false;
    
    if (selectedBet.type === 'red') {
      isWin = RED_NUMBERS.includes(finalResult);
    } else if (selectedBet.type === 'black') {
      isWin = BLACK_NUMBERS.includes(finalResult);
    } else if (selectedBet.type === 'even') {
      isWin = finalResult !== 0 && finalResult % 2 === 0;
    } else if (selectedBet.type === 'odd') {
      isWin = finalResult !== 0 && finalResult % 2 !== 0;
    } else if (selectedBet.type === 'low') {
      isWin = finalResult >= 1 && finalResult <= 18;
    } else if (selectedBet.type === 'high') {
      isWin = finalResult >= 19 && finalResult <= 36;
    } else if (selectedBet.type === 'number') {
      isWin = finalResult === selectedBet.value;
    }
    
    setTimeout(() => {
      setSpinning(false);
      
      if (isWin) {
        // Calculate the net winnings (profit only)
        // For example: a bet of $100 on red (1:1) returns $200 total, but the profit is $100
        const totalReturn = betAmount * selectedBet.payout;
        const netProfit = totalReturn - betAmount;
        
        // Set state for displaying the total return
        setWinAmount(totalReturn);
        
        // Use onWin with just the profit amount
        onWin(netProfit);
      } else {
        setWinAmount(0);
        onLoss(betAmount);
      }
    }, 500);
  };
  
  // Reset the game
  const resetGame = () => {
    setSelectedBet(null);
    setResult(null);
  };
  
  return (
    <div className="flex flex-col">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold">Roulette</h2>
        <p className="text-muted-foreground">Place your bets and try your luck on the wheel</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Wheel and result display */}
        <div className="bg-green-900/30 p-6 rounded-lg flex flex-col items-center">
          <div className="relative w-48 h-48 rounded-full border-4 border-yellow-500 mb-4 flex items-center justify-center bg-green-800 overflow-hidden">
            {/* Simple roulette wheel visualization */}
            <div className="absolute inset-0 flex items-center justify-center">
              {result !== null ? (
                <div className={`text-4xl font-bold ${getNumberColor(result)}`}>
                  {result}
                </div>
              ) : (
                <div className="text-white text-lg">Spin to Play</div>
              )}
            </div>
            
            {/* Spinning animation */}
            {spinning && (
              <div className="absolute inset-0 animate-spin">
                <div className="h-full w-[1px] bg-white absolute left-1/2"></div>
                <div className="w-full h-[1px] bg-white absolute top-1/2"></div>
              </div>
            )}
          </div>
          
          {/* Bet controls */}
          <div className="flex items-center gap-2 mb-4">
            <Button 
              size="sm" 
              onClick={() => adjustBetAmount(-100)}
              disabled={betAmount <= 100}
              variant="outline"
            >
              -$100
            </Button>
            <div className="px-4 py-2 bg-black/20 rounded-md">
              <div className="flex items-center text-lg font-bold">
                <DollarSign className="h-4 w-4 text-yellow-500" />
                <span>{betAmount}</span>
              </div>
            </div>
            <Button 
              size="sm" 
              onClick={() => adjustBetAmount(100)}
              disabled={betAmount + 100 > playerBalance}
              variant="outline"
            >
              +$100
            </Button>
          </div>
          
          {/* Spin button */}
          <Button 
            size="lg" 
            onClick={spinWheel}
            disabled={spinning || !selectedBet || betAmount > playerBalance}
            className="bg-yellow-600 hover:bg-yellow-700 w-full"
          >
            {spinning ? 'Spinning...' : 'Spin'}
            {!spinning && <Play className="h-4 w-4 ml-2" />}
          </Button>
          
          {/* Previous results */}
          {lastResults.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-bold mb-1">Previous Results:</h3>
              <div className="flex flex-wrap gap-1">
                {lastResults.map((num, index) => (
                  <div 
                    key={index} 
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs ${
                      num === 0 ? 'bg-green-600' : 
                      RED_NUMBERS.includes(num) ? 'bg-red-600' : 
                      'bg-black'
                    }`}
                  >
                    {num}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Betting options */}
        <div className="bg-green-900/30 p-6 rounded-lg">
          <h3 className="text-lg font-bold mb-4">Place Your Bet</h3>
          
          {/* Selected bet display */}
          {selectedBet && (
            <div className="mb-4 p-3 border border-yellow-500 rounded-md bg-black/20">
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-bold">Selected Bet:</span>{' '}
                  <span className="font-medium">{selectedBet.label}</span>
                </div>
                <div className="text-sm">
                  <span className="opacity-70">Payout:</span>{' '}
                  <span className="font-bold">{selectedBet.payout}x</span>
                </div>
              </div>
            </div>
          )}
          
          {/* Basic bet options */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            {betOptions.map((bet, index) => (
              <Button 
                key={index}
                onClick={() => handleSelectBet(bet)}
                className={`${bet.color} ${bet.hoverColor} text-white ${
                  selectedBet?.type === bet.type && selectedBet?.label === bet.label ? 
                  'ring-2 ring-yellow-500' : ''
                }`}
              >
                {bet.label}
              </Button>
            ))}
          </div>
          
          {/* Number selections */}
          <div>
            <h4 className="text-sm font-bold mb-2">Single Numbers (Pays 35:1)</h4>
            <div className="grid grid-cols-3 gap-1">
              {/* Zero */}
              <Button 
                onClick={() => handleSelectBet(numberBetOptions[0])}
                className={`bg-green-600 hover:bg-green-700 text-white ${
                  selectedBet?.type === 'number' && selectedBet?.value === 0 ? 
                  'ring-2 ring-yellow-500' : ''
                }`}
              >
                0
              </Button>
              
              {/* Grid of numbers 1-36 */}
              <div className="col-span-2 grid grid-cols-6 gap-1">
                {Array.from({ length: 36 }, (_, i) => i + 1).map(num => (
                  <Button 
                    key={num}
                    size="sm"
                    onClick={() => handleSelectBet(numberBetOptions[num])}
                    className={`${RED_NUMBERS.includes(num) ? 'bg-red-600 hover:bg-red-700' : 'bg-black hover:bg-gray-800'} 
                      text-white p-0 h-8 ${
                      selectedBet?.type === 'number' && selectedBet?.value === num ? 
                      'ring-2 ring-yellow-500' : ''
                    }`}
                  >
                    {num}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          
          {/* Reset button */}
          <Button 
            onClick={resetGame}
            variant="outline"
            className="mt-4 w-full"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Clear Bet
          </Button>
        </div>
      </div>
      
      <div className="mt-4 text-sm text-muted-foreground">
        <p>European roulette with a single zero. Place your bet, then press Spin.</p>
      </div>
    </div>
  );
}