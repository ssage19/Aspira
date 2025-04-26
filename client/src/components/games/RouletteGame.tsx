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
    
    // Important: Since we already deducted the bet amount at the start of the spin,
    // we only need to add the winnings here, not subtract the bet amount again
    setTotalWinnings(totalWinAmount);
    
    // Update player balance - only add winnings, not deduct bets 
    // (bets were already deducted at the beginning of the spin)
    if (totalWinAmount > 0) {
      // Add the winnings to the player balance
      onWin(totalWinAmount);
      
      // Show different messages based on net result
      if (totalWinAmount > totalBetAmount) {
        // Net profit
        toast.success(`You won ${formatCurrency(totalWinAmount - totalBetAmount)}!`);
      } else if (totalWinAmount === totalBetAmount) {
        // Break even
        toast.info(`You broke even. Your bet was returned.`);
      } else {
        // Partial loss (some bets won, but overall still a loss)
        toast.info(`You recovered ${formatCurrency(totalWinAmount)}.`);
      }
    } else {
      // Complete loss - no need to call onLoss again as we already deducted the bet
      toast.error(`You lost ${formatCurrency(totalBetAmount)}`);
    }
    
    console.log(`Game results: Bet ${totalBetAmount}, Winnings ${totalWinAmount}`);
  }, [activeBets, determineBetWin, onWin]);
  
  // Spin the roulette wheel
  const spinWheel = useCallback(() => {
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
    
    // Deduct bet amount from balance directly handled by the parent
    onLoss(totalBet); // Call onLoss to deduct the bet amount from the player's balance
    
    // Generate random result
    const finalResult = Math.floor(Math.random() * 37);
    
    // Find the result position in the wheel sequence
    const resultIndex = WHEEL_SEQUENCE.indexOf(finalResult);
    if (resultIndex === -1) {
      console.error(`Result ${finalResult} not found in wheel sequence`);
      return;
    }
    
    console.log(`Wheel result: ${finalResult} (index ${resultIndex})`);
    
    // Hide current result during spinning
    setResult(null);
    
    // ---- SIMPLIFIED ANIMATION CODE ----
    
    // Calculate the angles and positions
    const anglePerPocket = 360 / WHEEL_SEQUENCE.length;
    const resultAngle = resultIndex * anglePerPocket;
    
    // We want the winning number to end at the top (270 degrees)
    const targetAngle = 270 - resultAngle;
    
    // Set spin duration to 10 seconds as requested
    const spinDuration = 10000;
    
    // Reset wheel and ball positions
    if (wheelRef.current) {
      wheelRef.current.style.transition = 'none';
      wheelRef.current.style.transform = 'rotate(0deg)';
    }
    
    if (ballRef.current) {
      ballRef.current.style.transition = 'none';
      ballRef.current.style.transform = 'rotate(0deg)';
    }
    
    // Force reflow to ensure the reset styles are applied
    if (wheelRef.current) wheelRef.current.offsetHeight;
    if (ballRef.current) ballRef.current.offsetHeight;
    
    // Show random numbers during initial spin
    let flashingNumbersTimer: number | null = null;
    let flashIndex = 0;
    
    flashingNumbersTimer = window.setInterval(() => {
      flashIndex++;
      if (flashIndex < 10) {
        // Show random numbers at start
        const randomNum = Math.floor(Math.random() * 37);
        setResult(randomNum);
      } else {
        // Show the actual result at the end
        setResult(finalResult);
        
        // Clear the interval
        if (flashingNumbersTimer !== null) {
          clearInterval(flashingNumbersTimer);
        }
      }
    }, 150);
    
    // ---- WHEEL ANIMATION ----
    if (wheelRef.current) {
      // For a 10 second spin, add multiple full rotations (4) to the target position
      // This makes the spin look more realistic with the wheel doing several rotations
      const finalPosition = (4 * 360) + targetAngle; // 4 full rotations + target angle
      
      // Apply the spin with a cubic-bezier for natural slowing down
      wheelRef.current.style.transition = `transform ${spinDuration}ms cubic-bezier(0.2, 0.8, 0.3, 1)`;
      wheelRef.current.style.transform = `rotate(${finalPosition}deg)`;
    }
    
    // ---- COMPLETELY REDESIGNED BALL ANIMATION ----
    if (ballRef.current) {
      // Instead of using CSS transitions, use the Web Animations API
      // This gives much more control over the animation keyframes
      
      // Create a much more elaborate 10-second animation for the ball
      // The ball should spin around many more times to match the longer duration
      ballRef.current.animate([
        // Start at a random position
        { transform: 'rotate(0deg)' },
        
        // First phase: Very fast spinning (first 3 seconds - 30%)
        { transform: 'rotate(1800deg)', offset: 0.1 }, // 5 rotations
        { transform: 'rotate(3600deg)', offset: 0.2 }, // 10 rotations
        { transform: 'rotate(5040deg)', offset: 0.3 }, // 14 rotations
        
        // Second phase: Starts slowing down but still fast (next 3 seconds - 30%)
        { transform: 'rotate(6120deg)', offset: 0.4 }, // 17 rotations
        { transform: 'rotate(6840deg)', offset: 0.5 }, // 19 rotations
        { transform: 'rotate(7200deg)', offset: 0.6 }, // 20 rotations
        
        // Third phase: Noticeably slowing (next 2 seconds - 20%)
        { transform: 'rotate(7380deg)', offset: 0.7 }, // 20.5 rotations
        { transform: 'rotate(7488deg)', offset: 0.8 }, // 20.8 rotations
        
        // Final phase: Ball starts bouncing between pockets (last 2 seconds - 20%)
        { transform: 'rotate(7524deg)', offset: 0.85 }, // Bouncing
        { transform: 'rotate(7542deg)', offset: 0.9 }, // Smaller bounces
        { transform: 'rotate(7551deg)', offset: 0.93 }, // Final small bounces
        { transform: 'rotate(7556deg)', offset: 0.96 }, // Settling in
        { transform: 'rotate(7558deg)', offset: 0.98 }, // Almost stopped
        
        // End exactly at the correct position (7560 + 270 degrees = 21 full rotations plus 270 degrees)
        // This positions the ball at the top of the wheel (270 degrees) where we display the result
        { transform: 'rotate(7830deg)' } // 21.75 rotations to end at top (270 deg)
      ], {
        duration: spinDuration,
        easing: 'cubic-bezier(0.2, 0.8, 0.3, 1)', // Match the wheel's easing function
        fill: 'forwards'
      });
    }
    
    // Set results and process bets after animation completes
    setTimeout(() => {
      // Clear any remaining timers
      if (flashingNumbersTimer !== null) {
        clearInterval(flashingNumbersTimer);
      }
      
      // Update results
      setResult(finalResult);
      setLastResults(prev => [finalResult, ...prev].slice(0, 10));
      
      // End spin state
      setSpinning(false);
      spinInProgress.current = false;
      
      // Process bet results
      processResults(finalResult);
      
      console.log(`Spin complete: result ${finalResult}`);
    }, spinDuration + 100); // Add a small buffer after animation ends
  }, [activeBets, playerBalance, processResults, totalBet, onLoss]);
  
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
      <div className="text-center mb-8">
        <h2 className="text-5xl font-bold text-amber-500 font-serif tracking-wide drop-shadow-md">EUROPEAN ROULETTE</h2>
        <p className="text-amber-200/90 mt-2 text-lg">Place your bets on numbers, colors, or sections for instant payouts</p>
      </div>
      
      {/* Main roulette table */}
      <div className="relative bg-emerald-600 border-8 border-emerald-800 rounded-3xl shadow-2xl p-8 overflow-hidden">
        {/* Background texture - bright green like casino table */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-emerald-600 pointer-events-none"></div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
          {/* Left section - Wheel and active bets */}
          <div className="flex flex-col items-center">
            {/* Physical roulette wheel display */}
            <div className="relative w-[320px] h-[320px] mb-6 mx-auto">
              {/* Outer rim - golden edge */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-700 border-4 border-yellow-600 shadow-xl"></div>
              
              {/* Wooden wheel base with timing marks - rich brown color like in reference image */}
              <div className="absolute inset-[4px] rounded-full bg-gradient-to-br from-amber-800 to-amber-950">
                {/* Timing marks on outer ring - golden markers around the wheel */}
                {[...Array(16)].map((_, i) => {
                  const angle = (i / 16) * 360;
                  return (
                    <div 
                      key={`mark-${i}`} 
                      className="absolute"
                      style={{
                        width: '8px',
                        height: '8px',
                        backgroundColor: '#f3d19e',
                        borderRadius: '50%',
                        top: '10px',
                        left: '50%',
                        transform: `translateX(-50%) rotate(${angle}deg) translateY(-145px)`,
                        transformOrigin: 'center 145px',
                        boxShadow: '0 0 3px 1px rgba(255, 215, 0, 0.6)',
                      }}
                    ></div>
                  );
                })}
              </div>
              
              {/* Number track ring */}
              <div className="absolute inset-[30px] rounded-full bg-gradient-to-br from-amber-700 to-amber-900 border-2 border-amber-950/70 flex items-center justify-center">
                {/* Subtle radial shading */}
                <div className="absolute inset-0 rounded-full bg-gradient-radial from-amber-600/20 via-transparent to-amber-950/40"></div>
              </div>
              
              {/* Spinning wheel with pockets */}
              <div 
                ref={wheelRef}
                className="absolute inset-[30px] rounded-full overflow-hidden flex items-center justify-center transition-transform duration-[10000ms] ease-out"
                style={{ willChange: 'transform' }}
              >
                {/* Number pocket ring */}
                <div className="absolute inset-0 rounded-full overflow-hidden">
                  {/* Colored number ring */}
                  <div className="absolute inset-[30px] rounded-full border-2 border-amber-950/70 flex items-center justify-center">
                    {/* Numbers ring - matches exactly with the reference image */}
                    <div className="absolute inset-0 rounded-full overflow-hidden">
                      {/* First create the colored background segments */}
                      <svg className="w-full h-full" viewBox="0 0 260 260">
                        <defs>
                          <linearGradient id="woodGrain" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#b45309" />
                            <stop offset="100%" stopColor="#92400e" />
                          </linearGradient>
                        </defs>
                        {/* Central wooden area */}
                        <circle cx="130" cy="130" r="75" fill="url(#woodGrain)" />
                        
                        {/* Number segments */}
                        {WHEEL_SEQUENCE.map((number, i) => {
                          const angle = (i / WHEEL_SEQUENCE.length) * 360;
                          const startAngle = angle - (360 / WHEEL_SEQUENCE.length / 2);
                          const endAngle = angle + (360 / WHEEL_SEQUENCE.length / 2);
                          const isRed = RED_NUMBERS.includes(number);
                          // Updated colors to match reference - brighter green for 0, deeper red, rich black
                          const color = number === 0 ? '#00a800' : isRed ? '#e60000' : '#000000';
                          
                          // Calculate SVG arc path
                          const innerRadius = 75;
                          const outerRadius = 130;
                          const startRadians = (startAngle * Math.PI) / 180;
                          const endRadians = (endAngle * Math.PI) / 180;
                          
                          const startX1 = 130 + innerRadius * Math.cos(startRadians);
                          const startY1 = 130 + innerRadius * Math.sin(startRadians);
                          const endX1 = 130 + innerRadius * Math.cos(endRadians);
                          const endY1 = 130 + innerRadius * Math.sin(endRadians);
                          
                          const startX2 = 130 + outerRadius * Math.cos(startRadians);
                          const startY2 = 130 + outerRadius * Math.sin(startRadians);
                          const endX2 = 130 + outerRadius * Math.cos(endRadians);
                          const endY2 = 130 + outerRadius * Math.sin(endRadians);
                          
                          const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
                          
                          return (
                            <path
                              key={`segment-${i}`}
                              d={`
                                M ${startX1} ${startY1}
                                A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 1 ${endX1} ${endY1}
                                L ${endX2} ${endY2}
                                A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 0 ${startX2} ${startY2}
                                Z
                              `}
                              fill={color}
                              stroke="rgba(255,255,255,0.3)"
                              strokeWidth="1"
                            />
                          );
                        })}
                        
                        {/* Add number labels on top of segments */}
                        {WHEEL_SEQUENCE.map((number, i) => {
                          const angle = (i / WHEEL_SEQUENCE.length) * 360;
                          const radius = 103; // Position for the text
                          const x = 130 + radius * Math.cos((angle * Math.PI) / 180);
                          const y = 130 + radius * Math.sin((angle * Math.PI) / 180);
                          
                          return (
                            <text
                              key={`number-${i}`}
                              x={x}
                              y={y}
                              fill="white"
                              fontFamily="Arial, sans-serif"
                              fontSize="11"
                              fontWeight="bold"
                              textAnchor="middle"
                              dominantBaseline="middle"
                              style={{
                                textShadow: '0px 0px 3px rgba(0,0,0,0.9)',
                              }}
                            >
                              {number}
                            </text>
                          );
                        })}
                      </svg>
                    </div>
                  </div>
                </div>
                
                {/* Central wood platform */}
                <div className="absolute inset-[75px] rounded-full bg-gradient-to-br from-amber-500 to-amber-700 z-10">
                  {/* Subtle wood grain effect */}
                  <div className="absolute inset-0 rounded-full opacity-30">
                    {[...Array(8)].map((_, i) => (
                      <div
                        key={`grain-${i}`}
                        className="absolute bg-amber-950/10"
                        style={{
                          height: '1px',
                          width: '100%',
                          top: `${i * 14 + 10}%`,
                          transform: `rotate(${i * 20}deg)`,
                        }}
                      ></div>
                    ))}
                  </div>
                </div>
                
                {/* Center hub with spinner */}
                <div className="absolute w-[60px] h-[60px] z-20 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center shadow-inner">
                  {/* Hub details */}
                  <div className="absolute w-[40px] h-[40px] rounded-full bg-black/20"></div>
                  
                  {/* Spinner arms */}
                  <div className="relative w-full h-full flex items-center justify-center">
                    <div className="absolute w-[3px] h-[60px] bg-gradient-to-b from-yellow-300 to-yellow-600"></div>
                    <div className="absolute w-[60px] h-[3px] bg-gradient-to-r from-yellow-300 to-yellow-600"></div>
                    <div className="absolute w-[12px] h-[12px] rounded-full bg-gray-900"></div>
                  </div>
                </div>
              </div>
              
              {/* Ball track ring - This is where the ball will spin */}
              <div className="absolute inset-[40px] rounded-full border-2 border-amber-950/40">
                {/* Ball - white sphere that moves around the outer track */}
                <div 
                  ref={ballRef} 
                  className="absolute top-1/2 left-1/2 w-0 h-0 z-30" 
                  style={{ 
                    willChange: 'transform',
                    transformOrigin: 'center',
                  }}
                >
                  <div 
                    className="w-[12px] h-[12px] rounded-full bg-white" 
                    style={{ 
                      position: 'absolute',
                      left: '-6px', 
                      top: '-120px', // Positioned at the ball track radius (further out than before)
                      boxShadow: '0 0 5px 2px rgba(255,255,255,0.8)',
                    }}
                  ></div>
                </div>
              </div>
              
              {/* Result display under the wheel */}
              {result !== null && (
                <div className="absolute -bottom-8 left-0 right-0 flex items-center justify-center">
                  <div className={`
                    text-xl font-bold px-3 py-1 rounded-full 
                    ${result === 0 ? 'bg-green-600 text-white' : 
                      RED_NUMBERS.includes(result) ? 'bg-red-600 text-white' : 
                      'bg-black text-white'}`
                  }>
                    {result}
                  </div>
                </div>
              )}
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
            {/* Bet amount controls - casino style premium look */}
            <div className="bg-gradient-to-b from-gray-900 to-gray-950 rounded-lg p-5 mb-6 border-2 border-amber-900/50 shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-amber-400 drop-shadow">Bet Amount</h3>
                <div className="text-sm text-amber-200 font-medium bg-black/30 px-3 py-1 rounded border border-amber-950/50">
                  Balance: {formatCurrency(playerBalance)}
                </div>
              </div>
              
              <div className="flex items-center gap-3 mb-4">
                <Button 
                  size="sm" 
                  onClick={(e) => {
                    e.preventDefault();
                    console.log("Decreasing bet amount");
                    adjustBetAmount(-100);
                  }}
                  disabled={parseInt(customBetInput, 10) <= 100 || spinning}
                  className="bg-black hover:bg-gray-900 text-amber-400 border border-amber-800"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                
                <div className="flex-1 relative">
                  <DollarSign className="h-5 w-5 absolute left-3 top-2.5 text-amber-500" />
                  <Input
                    type="text"
                    value={customBetInput}
                    onChange={handleCustomBetInput}
                    disabled={spinning}
                    className="pl-9 bg-black border-2 border-amber-900/70 text-amber-300 font-bold text-lg"
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
                  className="bg-black hover:bg-gray-900 text-amber-400 border border-amber-800"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Quick bet buttons - casino chip style */}
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
                    className="border-2 border-amber-900 bg-gradient-to-b from-amber-950 to-black hover:from-amber-900 hover:to-amber-950 text-amber-400 font-bold py-1"
                  >
                    ${amount}
                  </Button>
                ))}
              </div>
            </div>
            
            {/* Roulette table layout - casino-style bright green felt */}
            <div className="bg-emerald-600 rounded-lg p-6 relative z-10 shadow-xl border-2 border-emerald-800">
              <h3 className="text-xl font-bold mb-4 text-white drop-shadow-md">Betting Table</h3>
              
              {/* Table layout - no rounded corners, sharp edges like real casino tables */}
              <div className="border-4 border-amber-900 mb-6 overflow-hidden">
                {/* Zero - brighter green like reference image */}
                <div className="flex">
                  <Button
                    className="w-full h-16 bg-green-600 hover:bg-green-500 text-white text-xl font-bold rounded-none border-r-2 border-amber-950"
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
                
                {/* Numbers 1-36 grid - brighter colors like in casino tables */}
                <div className="grid grid-cols-3 gap-0">
                  {tableRows.map((row, rowIndex) => (
                    <div key={rowIndex} className="contents">
                      {row.map(number => (
                        <Button
                          key={number}
                          className={`w-full h-14 ${
                            RED_NUMBERS.includes(number) 
                              ? 'bg-red-600 hover:bg-red-500' 
                              : 'bg-black hover:bg-gray-900'
                          } text-white text-lg font-bold rounded-none border border-amber-950`}
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
                
                {/* Bottom bet sections - match casino style */}
                <div className="grid grid-cols-3 gap-0">
                  {/* Dozen bets */}
                  {dozenBetOptions.map((bet, index) => (
                    <Button
                      key={`dozen-${index}`}
                      className="h-12 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-none border border-amber-950"
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
                
                {/* Bottom bet options - standardized with casino colors */}
                <div className="grid grid-cols-6 gap-0">
                  {[
                    { label: '1-18', bet: commonBetOptions.find(b => b.type === 'low')! },
                    { label: 'EVEN', bet: commonBetOptions.find(b => b.type === 'even')! },
                    { label: 'RED', bet: commonBetOptions.find(b => b.type === 'red')!, color: 'bg-red-600 hover:bg-red-500' },
                    { label: 'BLACK', bet: commonBetOptions.find(b => b.type === 'black')!, color: 'bg-black hover:bg-gray-900' },
                    { label: 'ODD', bet: commonBetOptions.find(b => b.type === 'odd')! },
                    { label: '19-36', bet: commonBetOptions.find(b => b.type === 'high')! }
                  ].map((item, index) => (
                    <Button
                      key={`bottom-${index}`}
                      className={`h-12 ${item.color || 'bg-emerald-700 hover:bg-emerald-800'} text-white font-bold rounded-none border border-amber-950`}
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
              
              {/* Column bets - styled to match casino betting table */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                {columnBetOptions.map((bet, index) => (
                  <Button
                    key={`column-${index}`}
                    className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2 border-2 border-amber-950/50 shadow-md"
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