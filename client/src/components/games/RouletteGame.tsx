import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { 
  DollarSign, RotateCcw, Play, ChevronUp, ChevronDown, 
  Plus, Minus
} from 'lucide-react';
import { formatCurrency } from '../../lib/utils';
import { toast } from 'sonner';

// Roulette constants
const RED_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
const BLACK_NUMBERS = [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35];
const ZERO = 0;

// Standard European roulette wheel sequence (not sequential)
const WHEEL_SEQUENCE = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
];

// Define all bet types
type BetType = 'red' | 'black' | 'even' | 'odd' | 'low' | 'high' | 'dozen' | 'column' | 'number';

// Define an active bet
interface ActiveBet {
  id: string;
  type: BetType;
  label: string;
  payout: number;
  bet: number;
  value?: number | number[]; // For number bets or groups of numbers
  result: 'win' | 'lose' | null;
  winnings: number;
}

// Define bet option types
interface BetOption {
  type: BetType;
  label: string;
  color: string;
  hoverColor: string;
  payout: number;
  value?: number | number[]; // For single or multiple number bets
  description?: string;
}

interface RouletteGameProps {
  onWin: (amount: number) => void;
  onLoss: (amount: number) => void;
  playerBalance: number;
}

export default function RouletteGame({ onWin, onLoss, playerBalance }: RouletteGameProps) {
  // Game state
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const [customBetInput, setCustomBetInput] = useState('100');
  const [lastResults, setLastResults] = useState<number[]>([]);
  
  // Active bets state
  const [activeBets, setActiveBets] = useState<ActiveBet[]>([]);
  const [totalBet, setTotalBet] = useState(0);
  const [totalWinnings, setTotalWinnings] = useState(0);
  
  // Wheel animation references
  const wheelRef = useRef<HTMLDivElement>(null);
  const ballRef = useRef<HTMLDivElement>(null);
  const spinInProgress = useRef(false);
  
  // Calculate total bet amount
  useEffect(() => {
    const total = activeBets.reduce((sum, bet) => sum + bet.bet, 0);
    setTotalBet(total);
  }, [activeBets]);
  
  // Generate a unique ID for bets
  const generateId = useCallback(() => {
    return Math.random().toString(36).substring(2, 9);
  }, []);
  
  // Define European roulette table sections
  const tableRows = [
    [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36],
    [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35],
    [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34],
  ];
  
  // Define bet options
  const commonBetOptions: BetOption[] = useMemo(() => [
    { type: 'red', label: 'Red', color: 'bg-red-600', hoverColor: 'hover:bg-red-700', payout: 2, description: 'Any red number' },
    { type: 'black', label: 'Black', color: 'bg-black', hoverColor: 'hover:bg-gray-800', payout: 2, description: 'Any black number' },
    { type: 'even', label: 'Even', color: 'bg-amber-600', hoverColor: 'hover:bg-amber-700', payout: 2, description: 'Any even number (not 0)' },
    { type: 'odd', label: 'Odd', color: 'bg-amber-600', hoverColor: 'hover:bg-amber-700', payout: 2, description: 'Any odd number' },
    { type: 'low', label: '1-18', color: 'bg-blue-600', hoverColor: 'hover:bg-blue-700', payout: 2, description: 'Any number from 1 to 18' },
    { type: 'high', label: '19-36', color: 'bg-blue-600', hoverColor: 'hover:bg-blue-700', payout: 2, description: 'Any number from 19 to 36' },
  ], []);
  
  // Define dozen bets (1st dozen, 2nd dozen, 3rd dozen)
  const dozenBetOptions: BetOption[] = useMemo(() => [
    { type: 'dozen', label: '1st 12', color: 'bg-purple-600', hoverColor: 'hover:bg-purple-700', payout: 3, value: Array.from({ length: 12 }, (_, i) => i + 1), description: 'Numbers 1-12' },
    { type: 'dozen', label: '2nd 12', color: 'bg-purple-600', hoverColor: 'hover:bg-purple-700', payout: 3, value: Array.from({ length: 12 }, (_, i) => i + 13), description: 'Numbers 13-24' },
    { type: 'dozen', label: '3rd 12', color: 'bg-purple-600', hoverColor: 'hover:bg-purple-700', payout: 3, value: Array.from({ length: 12 }, (_, i) => i + 25), description: 'Numbers 25-36' },
  ], []);
  
  // Define column bets
  const columnBetOptions: BetOption[] = useMemo(() => [
    { type: 'column', label: '1st Column', color: 'bg-indigo-600', hoverColor: 'hover:bg-indigo-700', payout: 3, value: tableRows[2], description: 'Numbers in bottom row' },
    { type: 'column', label: '2nd Column', color: 'bg-indigo-600', hoverColor: 'hover:bg-indigo-700', payout: 3, value: tableRows[1], description: 'Numbers in middle row' },
    { type: 'column', label: '3rd Column', color: 'bg-indigo-600', hoverColor: 'hover:bg-indigo-700', payout: 3, value: tableRows[0], description: 'Numbers in top row' },
  ], []);
  
  // Create number bet options (0-36)
  const numberBetOptions: BetOption[] = useMemo(() => 
    Array.from({ length: 37 }, (_, i) => ({
      type: 'number',
      label: i.toString(),
      color: i === 0 ? 'bg-green-600' : RED_NUMBERS.includes(i) ? 'bg-red-600' : 'bg-black',
      hoverColor: i === 0 ? 'hover:bg-green-700' : RED_NUMBERS.includes(i) ? 'hover:bg-red-700' : 'hover:bg-gray-800',
      payout: 36,
      value: i,
      description: `Single number ${i}`
    })), 
  []);
  
  // Add a bet to the active bets
  const addBet = useCallback((betOption: BetOption) => {
    // Parse bet amount from input (minimum 10)
    const betAmount = Math.max(10, parseInt(customBetInput, 10) || 100);
    
    console.log(`Placing a bet: ${betOption.label} for ${betAmount}`);
    
    // Check if player has enough balance
    if (betAmount > playerBalance - totalBet) {
      toast.error("You don't have enough balance for this bet");
      return;
    }
    
    // Create new active bet
    const newBet: ActiveBet = {
      id: generateId(),
      type: betOption.type,
      label: betOption.label,
      payout: betOption.payout,
      bet: betAmount,
      value: betOption.value,
      result: null,
      winnings: 0
    };
    
    // Add to active bets
    setActiveBets(prev => [...prev, newBet]);
    toast.success(`Added ${formatCurrency(betAmount)} bet on ${betOption.label}`);
  }, [customBetInput, generateId, playerBalance, totalBet]);
  
  // Remove a bet
  const removeBet = useCallback((betId: string) => {
    setActiveBets(prev => prev.filter(bet => bet.id !== betId));
  }, []);
  
  // Reset all bets
  const resetBets = useCallback(() => {
    setActiveBets([]);
  }, []);
  
  // Handle custom bet input
  const handleCustomBetInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers
    if (/^\d*$/.test(value)) {
      setCustomBetInput(value);
    }
  }, []);
  
  // Quick bet amount adjustments
  const adjustBetAmount = useCallback((amount: number) => {
    const currentValue = parseInt(customBetInput, 10) || 0;
    const newValue = Math.max(10, currentValue + amount);
    console.log(`Adjusting bet: ${currentValue} + ${amount} = ${newValue}`);
    setCustomBetInput(newValue.toString());
  }, [customBetInput]);
  
  // Get the color class for a number
  const getNumberColor = useCallback((num: number): string => {
    if (num === 0) return 'text-green-600';
    if (RED_NUMBERS.includes(num)) return 'text-red-600';
    return 'text-black';
  }, []);
  
  // Get the background color class for a number
  const getNumberBgColor = useCallback((num: number): string => {
    if (num === 0) return 'bg-green-600';
    if (RED_NUMBERS.includes(num)) return 'bg-red-600';
    return 'bg-black';
  }, []);
  
  // Determine if the bet is a winner based on the result
  const determineBetWin = useCallback((bet: ActiveBet, resultNumber: number): boolean => {
    switch (bet.type) {
      case 'red':
        return RED_NUMBERS.includes(resultNumber);
      case 'black':
        return BLACK_NUMBERS.includes(resultNumber);
      case 'even':
        return resultNumber !== 0 && resultNumber % 2 === 0;
      case 'odd':
        return resultNumber !== 0 && resultNumber % 2 !== 0;
      case 'low':
        return resultNumber >= 1 && resultNumber <= 18;
      case 'high':
        return resultNumber >= 19 && resultNumber <= 36;
      case 'dozen':
      case 'column':
        return Array.isArray(bet.value) && bet.value.includes(resultNumber);
      case 'number':
        return bet.value === resultNumber;
      default:
        return false;
    }
  }, []);
  
  // Process the results of the spin
  const processResults = useCallback((resultNumber: number) => {
    let totalWinAmount = 0;
    
    // Calculate results for each bet
    const updatedBets = activeBets.map(bet => {
      const isWin = determineBetWin(bet, resultNumber);
      const winnings = isWin ? bet.bet * bet.payout : 0;
      totalWinAmount += winnings;
      
      // Create a properly typed result
      const result: 'win' | 'lose' | null = isWin ? 'win' : 'lose';
      
      return {
        ...bet,
        result,
        winnings
      };
    });
    
    // Update the bets with results 
    setActiveBets(updatedBets);
    
    // Calculate net winnings (total winnings - total bet)
    const totalBetAmount = updatedBets.reduce((sum, bet) => sum + bet.bet, 0);
    const netWinnings = totalWinAmount - totalBetAmount;
    setTotalWinnings(netWinnings);
    
    // Update player balance
    if (netWinnings > 0) {
      onWin(netWinnings);
      toast.success(`You won ${formatCurrency(netWinnings)}!`);
    } else if (netWinnings < 0) {
      onLoss(Math.abs(netWinnings));
      toast.error(`You lost ${formatCurrency(Math.abs(netWinnings))}`);
    } else {
      toast.info("No win or loss");
    }
    
    console.log(`Game results: Bet ${totalBetAmount}, Winnings ${totalWinAmount}, Net ${netWinnings}`);
  }, [activeBets, determineBetWin, onWin, onLoss]);
  
  // Spin the roulette wheel
  const spinWheel = useCallback(async () => {
    // Check if there are any active bets
    if (activeBets.length === 0) {
      toast.error("Please place at least one bet before spinning");
      return;
    }
    
    // Check if the player has enough balance
    if (totalBet > playerBalance) {
      toast.error("You don't have enough balance for these bets");
      return;
    }
    
    // Check if already spinning
    if (spinInProgress.current) return;
    spinInProgress.current = true;
    
    setSpinning(true);
    
    // Animated wheel spinning effect
    const spinTime = 5000; // 5 seconds for more dramatic effect
    const intervalTime = 50; // 50ms between updates for smoother animation
    const iterations = spinTime / intervalTime;
    
    // Sound effects would go here in a real implementation
    console.log("Wheel spinning started");
    
    // For visual spinning effect through multiple numbers
    await new Promise(resolve => {
      const animateSpinning = (iteration = 0) => {
        if (iteration >= iterations) {
          resolve(true);
          return;
        }
        
        // Update with a random number for animation effect during spin
        if (iteration % 4 === 0) {
          setResult(Math.floor(Math.random() * 37));
        }
        
        // Animate the wheel - start fast, then slow down with easeOut
        if (wheelRef.current) {
          // Acceleration curve - fast at first, then slower
          const progress = iteration / iterations;
          const easeOut = 1 - Math.pow(1 - progress, 3); // Cubic ease out for natural slowdown
          
          // Start with rapid rotation (10 spins) that gradually slows down
          const rotation = easeOut * 3600; // 10 full rotations total
          wheelRef.current.style.transform = `rotate(${rotation}deg)`;
        }
        
        // Animate the ball in the opposite direction but slower, with delay before settling
        if (ballRef.current) {
          const progress = iteration / iterations;
          // Ball moves opposite to wheel initially, then appears to settle as wheel slows
          let ballRotation;
          
          if (progress < 0.7) {
            // Ball spins freely in opposite direction at first
            ballRotation = -((progress / 0.7) * 2520); // 7 full rotations opposite
          } else {
            // Ball starts to "catch" in a pocket as wheel slows
            const settlingProgress = (progress - 0.7) / 0.3;
            const settling = 1 - Math.pow(1 - settlingProgress, 5); // Stronger easing for settling
            ballRotation = -2520 + (settling * 2520); // Ball gradually stops spinning
          }
          
          ballRef.current.style.transform = `rotate(${ballRotation}deg)`;
        }
        
        // Schedule next animation frame
        setTimeout(() => animateSpinning(iteration + 1), intervalTime);
      };
      
      // Start animation
      animateSpinning();
    });
    
    // Final result
    const finalResult = Math.floor(Math.random() * 37);
    setResult(finalResult);
    setLastResults(prev => [finalResult, ...prev].slice(0, 10));
    
    console.log(`Final result: ${finalResult}`);
    
    // Calculate final wheel position to align the winning number at the top
    if (wheelRef.current) {
      // Each number takes up 360/37 ≈ 9.73 degrees
      // We want to position the winning number at the top (12 o'clock position)
      // Compute a final position where finalResult is at the top
      const numberPositionOffset = finalResult * (360 / 37);
      const finalPosition = 3600 + numberPositionOffset; // 10 rotations + position
      
      wheelRef.current.style.transition = 'transform 2s cubic-bezier(0.1, 0.7, 0.1, 1)'; // Custom easing for realistic stop
      wheelRef.current.style.transform = `rotate(${finalPosition}deg)`;
      
      // Sound effect for ball settling would go here
    }
    
    // Ball lands in the result pocket
    if (ballRef.current) {
      // Position the ball in the winning pocket at the top
      ballRef.current.style.transition = 'transform 2s cubic-bezier(0.1, 0.7, 0.1, 1)';
      ballRef.current.style.transform = 'rotate(0deg)';
    }
    
    // Slight delay before processing results to allow animation to complete
    setTimeout(() => {
      setSpinning(false);
      spinInProgress.current = false;
      processResults(finalResult);
      
      // Sound effect for win/loss would go here
    }, 2000);
  }, [activeBets, playerBalance, processResults, totalBet]);
  
  // Start a new game
  const startNewGame = useCallback(() => {
    setActiveBets([]);
    setResult(null);
    setTotalWinnings(0);
    spinInProgress.current = false;
    
    // Reset wheel animation
    if (wheelRef.current) {
      wheelRef.current.style.transition = 'none';
      wheelRef.current.style.transform = 'rotate(0deg)';
    }
    
    if (ballRef.current) {
      ballRef.current.style.transition = 'none';
      ballRef.current.style.transform = 'rotate(0deg)';
    }
  }, []);
  
  // Render wheel number at specific position
  const renderWheelNumber = useCallback((number: number, index: number, total: number) => {
    const isRed = RED_NUMBERS.includes(number);
    const angle = (index / total) * 360;
    const radian = (angle * Math.PI) / 180;
    const radius = 100; // Wheel radius in pixels
    
    // Calculate position around the wheel
    const x = Math.cos(radian) * radius;
    const y = Math.sin(radian) * radius;
    
    return (
      <div 
        key={number}
        className={`absolute w-6 h-12 flex items-center justify-center text-white font-bold ${
          number === 0 ? 'bg-green-600' : isRed ? 'bg-red-600' : 'bg-black'
        }`}
        style={{
          transform: `translate(${x}px, ${y}px) rotate(${angle + 90}deg)`,
          transformOrigin: 'center'
        }}
      >
        {number}
      </div>
    );
  }, []);
  
  // Render European Roulette table layout
  return (
    <div className="flex flex-col w-full max-w-7xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-4xl font-bold text-amber-500 font-serif">EUROPEAN ROULETTE</h2>
        <p className="text-yellow-200/80 mt-1">Place multiple bets on numbers, colors, or sections</p>
      </div>
      
      {/* Main roulette table */}
      <div className="relative bg-green-800 border-8 border-amber-950/80 rounded-3xl shadow-2xl p-8 overflow-hidden">
        {/* Background texture - subtle gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-800 to-green-900 pointer-events-none"></div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
          {/* Left section - Wheel and active bets */}
          <div className="flex flex-col items-center">
            {/* Physical roulette wheel display */}
            <div className="relative w-72 h-72 mb-6">
              {/* Wooden wheel base */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-800 to-amber-950 border-8 border-amber-950/80 shadow-xl"></div>
              
              {/* Spinning wheel with pockets */}
              <div 
                ref={wheelRef}
                className="absolute inset-4 rounded-full bg-gradient-to-br from-amber-700 to-amber-900 border-4 border-amber-950/60 shadow-inner flex items-center justify-center transition-transform duration-[3s] ease-out"
                style={{ willChange: 'transform' }}
              >
                {/* Wheel pocket markers */}
                {WHEEL_SEQUENCE.map((number, i) => {
                  const angle = (i / WHEEL_SEQUENCE.length) * 360;
                  const isRed = RED_NUMBERS.includes(number);
                  const slotWidth = 24; // Slightly wider pockets
                  
                  return (
                    <div 
                      key={`pocket-${i}`} 
                      className="absolute" 
                      style={{
                        width: `${slotWidth}px`,
                        height: '42px',
                        background: number === 0 ? '#0a8f0a' : RED_NUMBERS.includes(number) ? '#c71212' : '#000',
                        transform: `rotate(${angle}deg) translateY(-96px)`,
                        transformOrigin: 'center bottom',
                        zIndex: 5,
                        borderLeft: '1px solid rgba(255,255,255,0.1)',
                        borderRight: '1px solid rgba(0,0,0,0.3)',
                      }}
                    >
                      <div className="w-full h-full flex items-center justify-center text-white font-bold text-xs">
                        {number}
                      </div>
                    </div>
                  );
                })}
                
                {/* Wheel center with golden spinner */}
                <div className="absolute w-24 h-24 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 z-10 flex items-center justify-center shadow-md">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center">
                    {/* Wheel spinner arms */}
                    <div className="absolute w-1 h-12 bg-yellow-200 rounded-full"></div>
                    <div className="absolute w-12 h-1 bg-yellow-200 rounded-full"></div>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 shadow-inner"></div>
                  </div>
                </div>
                
                {/* Ball track around the wheel */}
                <div className="absolute inset-0 rounded-full border-8 border-amber-800/60"></div>
                
                {/* Ball */}
                <div ref={ballRef} className="absolute" style={{ willChange: 'transform' }}>
                  <div className="absolute w-4 h-4 rounded-full bg-gray-100 shadow-lg" style={{ 
                    left: 'calc(50% - 8px)', 
                    top: '10px',
                    transformOrigin: '8px 122px'
                  }}></div>
                </div>
                
                {/* Result display on the bottom */}
                {result !== null && (
                  <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center z-20 p-1 bg-black/40 backdrop-blur-sm rounded-b-full">
                    <div className={`text-2xl font-bold ${result === 0 ? 'text-green-400' : RED_NUMBERS.includes(result) ? 'text-red-400' : 'text-white'}`}>
                      {result}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Previous results */}
            {lastResults.length > 0 && (
              <div className="mb-6 w-full">
                <h3 className="text-sm font-bold mb-2 text-white/90">Previous Results:</h3>
                <div className="flex flex-wrap gap-1 justify-center">
                  {lastResults.map((num, index) => (
                    <div 
                      key={index} 
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${
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
            
            {/* Active bets */}
            <div className="w-full bg-green-900/60 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-bold mb-2 text-yellow-300">Your Active Bets</h3>
              
              {activeBets.length === 0 ? (
                <div className="text-center py-4 text-white/70 italic">
                  No bets placed yet. Place a bet to begin.
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                  {activeBets.map((bet) => (
                    <div 
                      key={bet.id} 
                      className={`flex justify-between items-center p-2 rounded-md ${
                        bet.result === 'win' ? 'bg-green-700/50' : 
                        bet.result === 'lose' ? 'bg-red-900/50' : 
                        'bg-black/30'
                      }`}
                    >
                      <div className="flex-1">
                        <div className="font-bold text-sm">{bet.label}</div>
                        <div className="text-xs text-yellow-200/80">
                          Bet: {formatCurrency(bet.bet)} (Pays {bet.payout}:1)
                        </div>
                      </div>
                      
                      {bet.result === null ? (
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-8 text-red-400 hover:text-red-300 hover:bg-red-900/30"
                          onClick={(e) => {
                            e.preventDefault();
                            console.log(`Removing bet on ${bet.label}`);
                            removeBet(bet.id);
                          }}
                          disabled={spinning}
                        >
                          Remove
                        </Button>
                      ) : (
                        <div className={`text-sm font-bold ${bet.result === 'win' ? 'text-green-300' : 'text-red-300'}`}>
                          {bet.result === 'win' 
                            ? `+${formatCurrency(bet.winnings)}` 
                            : `-${formatCurrency(bet.bet)}`}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              <div className="mt-4 flex justify-between border-t border-white/20 pt-2">
                <div className="text-white font-medium">
                  Total Bet: <span className="text-yellow-300 font-bold">{formatCurrency(totalBet)}</span>
                </div>
                
                {result !== null && !spinning && (
                  <div className={`font-bold ${totalWinnings >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {totalWinnings >= 0 
                      ? `+${formatCurrency(totalWinnings)}` 
                      : `-${formatCurrency(Math.abs(totalWinnings))}`}
                  </div>
                )}
              </div>
            </div>
            
            {/* Spin and reset buttons */}
            <div className="grid grid-cols-2 gap-4 w-full">
              <Button 
                size="lg" 
                onClick={(e) => {
                  e.preventDefault();
                  console.log("Spinning wheel");
                  spinWheel();
                }}
                disabled={spinning || activeBets.length === 0 || totalBet > playerBalance}
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                {spinning ? 'Spinning...' : 'Spin Wheel'}
                {!spinning && <Play className="h-4 w-4 ml-2" />}
              </Button>
              
              <Button 
                size="lg" 
                onClick={(e) => {
                  e.preventDefault();
                  console.log(result !== null ? "Starting new game" : "Clearing bets");
                  result !== null ? startNewGame() : resetBets();
                }}
                disabled={spinning}
                variant="outline"
                className="border-amber-600 text-amber-500 hover:bg-amber-900/30"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                {result !== null ? 'New Game' : 'Clear Bets'}
              </Button>
            </div>
          </div>
          
          {/* Right section - Betting table */}
          <div className="flex flex-col">
            {/* Bet amount controls */}
            <div className="bg-green-900/60 rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-yellow-300">Bet Amount</h3>
                <div className="text-xs text-yellow-200/70">Balance: {formatCurrency(playerBalance)}</div>
              </div>
              
              <div className="flex items-center gap-3 mb-3">
                <Button 
                  size="sm" 
                  onClick={(e) => {
                    e.preventDefault();
                    console.log("Decreasing bet amount");
                    adjustBetAmount(-100);
                  }}
                  disabled={parseInt(customBetInput, 10) <= 100 || spinning}
                  className="bg-amber-700 hover:bg-amber-800"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                
                <div className="flex-1 relative">
                  <DollarSign className="h-4 w-4 absolute left-3 top-2.5 text-yellow-500" />
                  <Input
                    type="text"
                    value={customBetInput}
                    onChange={handleCustomBetInput}
                    disabled={spinning}
                    className="pl-8 bg-black/30 border-amber-900 text-yellow-300 font-medium"
                  />
                </div>
                
                <Button 
                  size="sm" 
                  onClick={(e) => {
                    e.preventDefault();
                    console.log("Increasing bet amount");
                    adjustBetAmount(100);
                  }}
                  disabled={spinning}
                  className="bg-amber-700 hover:bg-amber-800"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Quick bet buttons */}
              <div className="grid grid-cols-4 gap-2">
                {[50, 100, 250, 500].map(amount => (
                  <Button 
                    key={amount}
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      console.log(`Setting bet to ${amount}`);
                      setCustomBetInput(amount.toString());
                    }}
                    disabled={spinning}
                    variant="outline"
                    className="border-amber-600/50 hover:bg-amber-900/30 text-yellow-200"
                  >
                    ${amount}
                  </Button>
                ))}
              </div>
            </div>
            
            {/* Roulette table layout */}
            <div className="bg-green-900/60 rounded-lg p-4 relative z-10">
              <h3 className="text-lg font-bold mb-4 text-yellow-300">Betting Table</h3>
              
              {/* Table layout */}
              <div className="border-2 border-amber-900/50 rounded-md mb-4 overflow-hidden">
                {/* Zero */}
                <div className="flex">
                  <Button
                    className="w-full h-12 bg-green-700 hover:bg-green-600 text-white rounded-none border border-amber-900/30"
                    onClick={(e) => {
                      e.preventDefault();
                      console.log("Placing bet on 0");
                      addBet(numberBetOptions[0]);
                    }}
                    disabled={spinning}
                  >
                    0
                  </Button>
                </div>
                
                {/* Numbers 1-36 grid */}
                <div className="grid grid-cols-3 gap-0">
                  {tableRows.map((row, rowIndex) => (
                    <div key={rowIndex} className="contents">
                      {row.map(number => (
                        <Button
                          key={number}
                          className={`w-full h-12 ${RED_NUMBERS.includes(number) ? 'bg-red-700 hover:bg-red-600' : 'bg-zinc-900 hover:bg-zinc-800'} text-white rounded-none border border-amber-900/30`}
                          onClick={(e) => {
                            e.preventDefault();
                            console.log(`Placing bet on number ${number}`);
                            addBet(numberBetOptions[number]);
                          }}
                          disabled={spinning}
                        >
                          {number}
                        </Button>
                      ))}
                    </div>
                  ))}
                </div>
                
                {/* Bottom bet sections */}
                <div className="grid grid-cols-3 gap-0">
                  {/* Dozen bets */}
                  {dozenBetOptions.map((bet, index) => (
                    <Button
                      key={`dozen-${index}`}
                      className="h-10 bg-purple-900 hover:bg-purple-800 text-white rounded-none border border-amber-900/30"
                      onClick={(e) => {
                        e.preventDefault(); 
                        console.log(`Placing bet on ${bet.label}`);
                        addBet(bet);
                      }}
                      disabled={spinning}
                    >
                      {bet.label}
                    </Button>
                  ))}
                </div>
                
                {/* Bottom bet options */}
                <div className="grid grid-cols-6 gap-0">
                  {[
                    { label: '1-18', bet: commonBetOptions.find(b => b.type === 'low')! },
                    { label: 'EVEN', bet: commonBetOptions.find(b => b.type === 'even')! },
                    { label: 'RED', bet: commonBetOptions.find(b => b.type === 'red')!, color: 'bg-red-700 hover:bg-red-600' },
                    { label: 'BLACK', bet: commonBetOptions.find(b => b.type === 'black')!, color: 'bg-black hover:bg-zinc-800' },
                    { label: 'ODD', bet: commonBetOptions.find(b => b.type === 'odd')! },
                    { label: '19-36', bet: commonBetOptions.find(b => b.type === 'high')! }
                  ].map((item, index) => (
                    <Button
                      key={`bottom-${index}`}
                      className={`h-10 ${item.color || 'bg-blue-900 hover:bg-blue-800'} text-white rounded-none border border-amber-900/30`}
                      onClick={(e) => {
                        e.preventDefault();
                        console.log(`Placing bet on ${item.label}`);
                        addBet(item.bet);
                      }}
                      disabled={spinning}
                    >
                      {item.label}
                    </Button>
                  ))}
                </div>
              </div>
              
              {/* Column bets */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                {columnBetOptions.map((bet, index) => (
                  <Button
                    key={`column-${index}`}
                    className="bg-indigo-800 hover:bg-indigo-700 text-white"
                    onClick={(e) => {
                      e.preventDefault();
                      console.log(`Placing bet on ${bet.label}`);
                      addBet(bet);
                    }}
                    disabled={spinning}
                  >
                    {bet.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-4 text-sm text-yellow-100/60 text-center">
        <p>European roulette features a single zero and offers better odds than American roulette.</p>
        <p>You can place multiple bets simultaneously. Maximum bet is based on your available balance.</p>
      </div>
    </div>
  );
}