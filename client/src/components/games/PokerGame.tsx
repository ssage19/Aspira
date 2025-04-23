import React, { useState, useCallback, useMemo } from 'react';
import { Button } from '../ui/button';
import { DollarSign, RotateCcw, Play, User, ChevronUp, ChevronDown, Trophy, Flame } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';
import { toast } from 'sonner';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card';

// Simple poker game implementation (Five Card Draw)
// This is a simplified version with just one round of betting and card replacement

// Define card types
interface PlayingCard {
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
  value: number; // 2-14 (2-10, Jack=11, Queen=12, King=13, Ace=14)
  selected?: boolean;
}

// Suit symbols
const SUIT_SYMBOLS = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠'
};

// Card value to display value
const CARD_VALUES: Record<number, string> = {
  11: 'J',
  12: 'Q',
  13: 'K',
  14: 'A'
};

// Poker hand types
type HandRank = 
  | 'high-card'
  | 'pair'
  | 'two-pair'
  | 'three-kind'
  | 'straight'
  | 'flush'
  | 'full-house'
  | 'four-kind'
  | 'straight-flush'
  | 'royal-flush';

interface HandRankInfo {
  rank: HandRank;
  name: string;
  multiplier: number;
}

// Hand rankings and payouts
const HAND_RANKINGS: HandRankInfo[] = [
  { rank: 'royal-flush', name: 'Royal Flush', multiplier: 250 },
  { rank: 'straight-flush', name: 'Straight Flush', multiplier: 50 },
  { rank: 'four-kind', name: 'Four of a Kind', multiplier: 25 },
  { rank: 'full-house', name: 'Full House', multiplier: 9 },
  { rank: 'flush', name: 'Flush', multiplier: 6 },
  { rank: 'straight', name: 'Straight', multiplier: 4 },
  { rank: 'three-kind', name: 'Three of a Kind', multiplier: 3 },
  { rank: 'two-pair', name: 'Two Pair', multiplier: 2 },
  { rank: 'pair', name: 'Pair (Jacks or Better)', multiplier: 1 },
  { rank: 'high-card', name: 'High Card', multiplier: 0 }
];

interface PokerGameProps {
  onWin: (amount: number) => void;
  onLoss: (amount: number) => void;
  playerBalance: number;
}

export default function PokerGame({ onWin, onLoss, playerBalance }: PokerGameProps) {
  const [deck, setDeck] = useState<PlayingCard[]>([]);
  const [playerHand, setPlayerHand] = useState<PlayingCard[]>([]);
  const [gamePhase, setGamePhase] = useState<'betting' | 'initial-deal' | 'draw' | 'showdown'>('betting');
  const [betAmount, setBetAmount] = useState(100);
  const [customBetInput, setCustomBetInput] = useState('100');
  const [handEvaluation, setHandEvaluation] = useState<HandRankInfo | null>(null);
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [dealerMessage, setDealerMessage] = useState("Place your bet to begin");
  const [totalWinnings, setTotalWinnings] = useState(0);
  
  // Initialize a new deck of cards
  const initializeDeck = () => {
    const newDeck: PlayingCard[] = [];
    const suits: ('hearts' | 'diamonds' | 'clubs' | 'spades')[] = ['hearts', 'diamonds', 'clubs', 'spades'];
    
    suits.forEach(suit => {
      // Cards 2-14 (2-10, Jack, Queen, King, Ace)
      for (let value = 2; value <= 14; value++) {
        newDeck.push({ suit, value });
      }
    });
    
    // Shuffle the deck
    return shuffleDeck(newDeck);
  };
  
  // Shuffle the deck
  const shuffleDeck = (deckToShuffle: PlayingCard[]) => {
    const shuffled = [...deckToShuffle];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };
  
  // Deal cards to player
  const dealCards = (count: number, from: PlayingCard[]) => {
    if (from.length < count) {
      toast.error("Not enough cards in the deck!");
      return { dealt: [], remaining: from };
    }
    
    const dealt = from.slice(0, count);
    const remaining = from.slice(count);
    
    return { dealt, remaining };
  };
  
  // Evaluate a poker hand
  const evaluateHand = useCallback((hand: PlayingCard[]): HandRankInfo => {
    // Sort hand by value
    const sortedHand = [...hand].sort((a, b) => a.value - b.value);
    
    // Check for flush (all cards of same suit)
    const isFlush = sortedHand.every(card => card.suit === sortedHand[0].suit);
    
    // Check for straight (consecutive values)
    let isStraight = false;
    if (
      sortedHand[4].value - sortedHand[0].value === 4 && 
      sortedHand[1].value === sortedHand[0].value + 1 &&
      sortedHand[2].value === sortedHand[1].value + 1 &&
      sortedHand[3].value === sortedHand[2].value + 1
    ) {
      isStraight = true;
    }
    
    // Special case: A-5 straight (Ace can be low)
    if (
      sortedHand[0].value === 2 &&
      sortedHand[1].value === 3 &&
      sortedHand[2].value === 4 &&
      sortedHand[3].value === 5 &&
      sortedHand[4].value === 14 // Ace
    ) {
      isStraight = true;
    }
    
    // Royal flush
    if (isFlush && isStraight && sortedHand[0].value === 10) {
      return HAND_RANKINGS.find(h => h.rank === 'royal-flush')!;
    }
    
    // Straight flush
    if (isFlush && isStraight) {
      return HAND_RANKINGS.find(h => h.rank === 'straight-flush')!;
    }
    
    // Count occurrences of each value
    const valueCounts: Record<number, number> = {};
    sortedHand.forEach(card => {
      valueCounts[card.value] = (valueCounts[card.value] || 0) + 1;
    });
    
    const counts = Object.values(valueCounts).sort((a, b) => b - a);
    
    // Four of a kind
    if (counts[0] === 4) {
      return HAND_RANKINGS.find(h => h.rank === 'four-kind')!;
    }
    
    // Full house
    if (counts[0] === 3 && counts[1] === 2) {
      return HAND_RANKINGS.find(h => h.rank === 'full-house')!;
    }
    
    // Flush
    if (isFlush) {
      return HAND_RANKINGS.find(h => h.rank === 'flush')!;
    }
    
    // Straight
    if (isStraight) {
      return HAND_RANKINGS.find(h => h.rank === 'straight')!;
    }
    
    // Three of a kind
    if (counts[0] === 3) {
      return HAND_RANKINGS.find(h => h.rank === 'three-kind')!;
    }
    
    // Two pair
    if (counts[0] === 2 && counts[1] === 2) {
      return HAND_RANKINGS.find(h => h.rank === 'two-pair')!;
    }
    
    // Pair (Jacks or better)
    if (counts[0] === 2) {
      // Find the value that appears twice
      const pairValue = Number(Object.keys(valueCounts).find(key => valueCounts[Number(key)] === 2));
      
      // Check if pair is Jacks or better (Jack=11, Queen=12, King=13, Ace=14)
      if (pairValue >= 11) {
        return HAND_RANKINGS.find(h => h.rank === 'pair')!;
      }
    }
    
    // High card
    return HAND_RANKINGS.find(h => h.rank === 'high-card')!;
  }, []);

  // Handle custom bet input
  const handleCustomBetInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers
    if (/^\d*$/.test(value)) {
      setCustomBetInput(value);
      // Update bet amount if valid
      const numValue = parseInt(value, 10);
      if (!isNaN(numValue) && numValue >= 25 && numValue <= playerBalance) {
        setBetAmount(numValue);
      }
    }
  }, [playerBalance]);

  // Start a new game
  const startGame = useCallback(() => {
    // Validate inputs
    const betValue = parseInt(customBetInput, 10);
    if (isNaN(betValue) || betValue < 25) {
      toast.error("Please enter a valid bet amount (minimum $25)");
      return;
    }
    
    if (betValue > playerBalance) {
      toast.error("You don't have enough balance for this bet");
      return;
    }
    
    // Set the bet amount
    setBetAmount(betValue);
    
    // Initialize a new deck
    const newDeck = initializeDeck();
    
    // Deal 5 cards to the player
    const { dealt: playerCards, remaining } = dealCards(5, newDeck);
    
    setDeck(remaining);
    setPlayerHand(playerCards);
    setSelectedCards([]);
    setGamePhase('initial-deal');
    setHandEvaluation(null);
    
    // Evaluate initial hand
    const initialEvaluation = evaluateHand(playerCards);
    setHandEvaluation(initialEvaluation);
    
    // Set dealer message
    setDealerMessage("Select cards to discard or press 'Draw' to continue");
  }, [customBetInput, playerBalance, initializeDeck, dealCards, evaluateHand]);
  
  // Toggle card selection for replacement
  const toggleCardSelection = (index: number) => {
    if (gamePhase !== 'initial-deal') return;
    
    setSelectedCards(prev => {
      if (prev.includes(index)) {
        return prev.filter(i => i !== index);
      } else {
        return [...prev, index];
      }
    });
  };
  
  // Handle the draw phase (replace selected cards)
  const handleDraw = () => {
    if (gamePhase !== 'initial-deal') return;
    
    // If no cards selected, proceed to showdown
    if (selectedCards.length === 0) {
      setGamePhase('showdown');
      handleShowdown();
      return;
    }
    
    // Replace selected cards
    const newHand = [...playerHand];
    
    // Deal new cards
    const { dealt: replacementCards, remaining } = dealCards(selectedCards.length, deck);
    
    // Replace selected cards with new ones
    selectedCards.forEach((cardIndex, i) => {
      if (replacementCards[i]) {
        newHand[cardIndex] = replacementCards[i];
      }
    });
    
    setDeck(remaining);
    setPlayerHand(newHand);
    setSelectedCards([]);
    setGamePhase('showdown');
    
    // Evaluate final hand
    handleShowdown(newHand);
  };
  
  // Handle the showdown phase
  const handleShowdown = (hand = playerHand) => {
    const evaluation = evaluateHand(hand);
    setHandEvaluation(evaluation);
    
    // Determine win/loss
    setTimeout(() => {
      if (evaluation.multiplier > 0) {
        // Calculate the correct payout
        // For example: on a $100 bet with a pair (1x multiplier), player should get $200 back (original bet + winnings)
        const totalReturn = betAmount * evaluation.multiplier + betAmount;
        const netProfit = totalReturn - betAmount;  // This is just the profit portion
        
        // Store the total return for display
        setTotalWinnings(totalReturn);
        
        // Send only the profit/winnings to the onWin handler
        onWin(netProfit);
        setDealerMessage(`You win with ${evaluation.name}!`);
        
      } else {
        // Player loses
        setTotalWinnings(0);
        onLoss(betAmount);
        setDealerMessage(`You lose with ${evaluation.name}. Try again!`);
      }
    }, 500);
  };
  

  
  // Reset the game
  const resetGame = () => {
    setGamePhase('betting');
    setPlayerHand([]);
    setSelectedCards([]);
    setHandEvaluation(null);
    setDealerMessage("Place your bet to begin");
    setTotalWinnings(0);
  };
  
  // Adjust bet amount
  const adjustBetAmount = (amount: number) => {
    const newAmount = betAmount + amount;
    if (newAmount >= 100 && newAmount <= playerBalance) {
      setBetAmount(newAmount);
    }
  };
  
  // Get suit color
  const getSuitColor = (suit: 'hearts' | 'diamonds' | 'clubs' | 'spades') => {
    return suit === 'hearts' || suit === 'diamonds' ? 'text-red-600' : 'text-black';
  };
  
  // Get card display value
  const getCardDisplayValue = (card: PlayingCard) => {
    if (card.value <= 10) {
      return card.value.toString();
    }
    return CARD_VALUES[card.value];
  };
  
  // Render a card with enhanced styling
  const renderCard = useCallback((card: PlayingCard, index: number) => {
    const isSelected = selectedCards.includes(index);
    const isRed = card.suit === 'hearts' || card.suit === 'diamonds';
    const suitColor = isRed ? 'text-red-600' : 'text-gray-900';
    const displayValue = getCardDisplayValue(card);
    
    return (
      <div 
        key={index} 
        className={`relative w-[100px] h-[140px] bg-white rounded-lg shadow-xl m-2 transform transition-transform duration-200 overflow-hidden cursor-pointer
          ${isSelected ? 'border-2 border-amber-500 -translate-y-4' : 'hover:rotate-1'}
          ${gamePhase === 'initial-deal' ? 'hover:border-amber-400' : ''}`}
        style={{ 
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -4px rgba(0, 0, 0, 0.2)'
        }}
        onClick={() => toggleCardSelection(index)}
      >
        {/* Card inner border for design */}
        <div className="absolute inset-1.5 rounded-md border border-gray-200"></div>
        
        {/* Top left value and suit */}
        <div className="absolute top-2 left-2">
          <div className={`text-xl font-bold ${suitColor}`}>
            {displayValue}
          </div>
          <div className={`text-xl leading-none ${suitColor}`}>
            {SUIT_SYMBOLS[card.suit]}
          </div>
        </div>
        
        {/* Bottom right value and suit (inverted) */}
        <div className="absolute bottom-2 right-2 rotate-180">
          <div className={`text-xl font-bold ${suitColor}`}>
            {displayValue}
          </div>
          <div className={`text-xl leading-none ${suitColor}`}>
            {SUIT_SYMBOLS[card.suit]}
          </div>
        </div>
        
        {/* Center large suit */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`text-4xl ${suitColor}`}>
            {SUIT_SYMBOLS[card.suit]}
          </div>
        </div>
        
        {/* Card value at the top center for face cards and aces */}
        {(card.value === 14 || card.value > 10) && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className={`text-3xl font-bold ${suitColor}`}>
              {displayValue}
            </div>
          </div>
        )}
        
        {/* Selection indicator */}
        {isSelected && gamePhase === 'initial-deal' && (
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center shadow-md z-10">
            <RotateCcw className="h-4 w-4" />
          </div>
        )}
      </div>
    );
  }, [selectedCards, gamePhase, getCardDisplayValue]);
  
  return (
    <div className="flex flex-col">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-amber-100">Five Card Draw Poker</h2>
        <p className="text-yellow-100/70 mt-1">Draw once to improve your hand. Jacks or better to win.</p>
      </div>
      
      {/* Main game area */}
      <Card className="bg-gradient-to-b from-green-900/70 to-green-800/50 border border-green-700/50 shadow-2xl mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            <span className="text-amber-100">Poker Table</span>
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          {gamePhase === 'betting' ? (
            <div className="flex flex-col items-center py-4">
              <div className="mb-6 text-center">
                <h3 className="text-xl font-bold text-yellow-100 mb-2">Place Your Bet</h3>
                <p className="text-sm text-yellow-100/70">Balance: {formatCurrency(playerBalance)}</p>
              </div>
              
              <div className="flex flex-col items-center justify-center mb-8 gap-4">
                {/* Preset bet buttons */}
                <div className="flex items-center justify-center gap-2">
                  <Button 
                    variant="outline"
                    onClick={() => { 
                      const value = "100";
                      setCustomBetInput(value); 
                      setBetAmount(100);
                    }}
                    className="bg-black/30 text-white border-amber-500/30 hover:bg-black/40 hover:border-amber-500/50"
                  >
                    $100
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={() => { 
                      const value = "250";
                      setCustomBetInput(value);
                      setBetAmount(250);
                    }}
                    className="bg-black/30 text-white border-amber-500/30 hover:bg-black/40 hover:border-amber-500/50"
                  >
                    $250
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={() => { 
                      const value = "500";
                      setCustomBetInput(value);
                      setBetAmount(500);
                    }}
                    className="bg-black/30 text-white border-amber-500/30 hover:bg-black/40 hover:border-amber-500/50"
                  >
                    $500
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={() => { 
                      const value = "1000";
                      setCustomBetInput(value);
                      setBetAmount(1000);
                    }}
                    className="bg-black/30 text-white border-amber-500/30 hover:bg-black/40 hover:border-amber-500/50"
                  >
                    $1,000
                  </Button>
                </div>
                
                {/* Custom bet input */}
                <div className="flex items-center justify-center gap-2">
                  <label className="text-amber-100 text-sm">Custom Bet:</label>
                  <div className="relative">
                    <DollarSign className="h-5 w-5 text-amber-500 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      type="text"
                      value={customBetInput}
                      onChange={handleCustomBetInput}
                      className="w-[150px] pl-10 py-3 bg-black/20 rounded-lg border border-amber-500/30 text-lg 
                                 font-bold text-amber-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
                
                {/* Display current bet */}
                <div className="mt-2 text-center">
                  <div className="text-sm text-amber-100/70">Current Bet:</div>
                  <div className="text-2xl font-bold text-amber-100">
                    {formatCurrency(betAmount)}
                  </div>
                </div>
              </div>
              
              <Button 
                size="lg" 
                onClick={startGame}
                disabled={betAmount > playerBalance}
                className="bg-gradient-to-b from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white border-none 
                           shadow-lg px-8 py-6 text-lg transition-all duration-200 disabled:opacity-50"
              >
                <Play className="h-5 w-5 mr-2" />
                Deal Cards
              </Button>
            </div>
          ) : (
            <div className="space-y-6 py-2">
              {/* Dealer message */}
              <div className="flex items-center bg-black/40 p-4 rounded-lg border border-purple-500/20">
                <div className="bg-gradient-to-b from-purple-700 to-purple-800 w-12 h-12 rounded-full flex items-center justify-center mr-4 shadow-lg">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div className="text-white">
                  <div className="text-xs text-purple-300 mb-1">Dealer:</div>
                  <div className="text-lg">{dealerMessage}</div>
                </div>
              </div>
              
              {/* Player's hand */}
              <div className="flex flex-col items-center">
                <div className="mb-6 w-full">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-bold text-amber-100 flex items-center">
                      <Flame className="h-5 w-5 text-amber-500 mr-2" />
                      Your Hand
                    </h3>
                    <div className="text-sm text-amber-200 bg-black/30 px-3 py-1 rounded-full">
                      Bet: {formatCurrency(betAmount)}
                    </div>
                  </div>
                  <div className="flex justify-center flex-wrap gap-2 bg-green-800/20 p-6 pb-8 border border-green-600/20 rounded-lg shadow-inner min-h-[200px]">
                    {playerHand.map((card, index) => renderCard(card, index))}
                  </div>
                </div>
                
                {/* Game controls */}
                <div className="flex justify-center gap-4 mt-2">
                  {gamePhase === 'initial-deal' && (
                    <Button 
                      onClick={handleDraw} 
                      className="bg-gradient-to-b from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600
                                 px-8 py-6 text-lg text-white shadow-lg border-none"
                      size="lg"
                    >
                      {selectedCards.length > 0 
                        ? `Replace ${selectedCards.length} Card${selectedCards.length > 1 ? 's' : ''}` 
                        : 'Stand Pat'}
                    </Button>
                  )}
                  
                  {gamePhase === 'showdown' && (
                    <Button 
                      onClick={resetGame} 
                      className="bg-gradient-to-b from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600
                                 px-8 py-6 text-lg text-white shadow-lg border-none"
                      size="lg"
                    >
                      <RotateCcw className="h-5 w-5 mr-2" />
                      Play Again
                    </Button>
                  )}
                </div>
                
                {/* Card selection help */}
                {gamePhase === 'initial-deal' && (
                  <div className="text-center mt-4 text-sm text-amber-100/70">
                    Select cards to replace or press "Stand Pat" to keep your current hand
                  </div>
                )}
              </div>
              
              {/* Hand evaluation */}
              {handEvaluation && (
                <div className={`p-4 rounded-lg shadow-lg border text-center ${
                  handEvaluation.multiplier > 0 
                    ? 'bg-gradient-to-b from-green-900/70 to-green-800/50 border-green-500/30' 
                    : 'bg-gradient-to-b from-red-900/70 to-red-800/50 border-red-500/30'
                }`}>
                  <div className="font-bold text-xl text-amber-100 mb-1">
                    {handEvaluation.name}
                  </div>
                  <div className="text-sm mb-3 text-amber-100/80">
                    {handEvaluation.multiplier > 0 
                      ? `Pays ${handEvaluation.multiplier}× your bet` 
                      : 'No payout'}
                  </div>
                  
                  {/* Show total winnings */}
                  {gamePhase === 'showdown' && (
                    <div className="mt-2 pt-3 border-t border-white/20">
                      {totalWinnings > 0 ? (
                        <div>
                          <div className="text-sm text-green-300">Total Return:</div>
                          <div className="text-2xl font-bold text-amber-300 mt-1">{formatCurrency(totalWinnings)}</div>
                        </div>
                      ) : (
                        <div className="text-red-300 font-bold text-xl">
                          Loss: {formatCurrency(betAmount)}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Pay table */}
      <Card className="bg-gradient-to-b from-gray-900/60 to-black/40 border border-amber-500/20 shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-amber-100 text-lg flex items-center">
            <DollarSign className="h-5 w-5 text-amber-500 mr-2" />
            Payout Table
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {HAND_RANKINGS.slice(0, -1).map((hand, index) => (
              <div key={index} className="flex justify-between items-center text-sm border-b border-amber-500/10 pb-1">
                <span className="text-amber-100">{hand.name}</span>
                <span className="font-bold text-amber-300">{hand.multiplier}×</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}