import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { DollarSign, RotateCcw, Play, User } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';
import { toast } from 'sonner';

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
  
  // Start a new game
  const startGame = () => {
    if (betAmount <= 0) {
      toast.error("Please enter a valid bet amount");
      return;
    }
    
    if (betAmount > playerBalance) {
      toast.error("You don't have enough money for this bet");
      return;
    }
    
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
  };
  
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
  
  // Evaluate a poker hand
  const evaluateHand = (hand: PlayingCard[]): HandRankInfo => {
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
  
  // Render a card
  const renderCard = (card: PlayingCard, index: number) => {
    const isSelected = selectedCards.includes(index);
    
    return (
      <div 
        key={index} 
        className={`relative w-16 h-24 bg-white rounded-md shadow-md flex flex-col items-center justify-between p-2 border-2 cursor-pointer transition-all
          ${isSelected ? 'border-yellow-500 -translate-y-2' : 'border-gray-300'}
          ${gamePhase === 'initial-deal' ? 'hover:border-yellow-500' : ''}`}
        onClick={() => toggleCardSelection(index)}
      >
        <div className={`text-lg font-bold ${getSuitColor(card.suit)}`}>
          {getCardDisplayValue(card)}
        </div>
        <div className={`text-2xl ${getSuitColor(card.suit)}`}>
          {SUIT_SYMBOLS[card.suit]}
        </div>
        
        {isSelected && gamePhase === 'initial-deal' && (
          <div className="absolute -top-2 -right-2 w-5 h-5 bg-yellow-500 text-white rounded-full flex items-center justify-center text-xs">
            <RotateCcw className="h-3 w-3" />
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className="flex flex-col">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold">Five Card Draw Poker</h2>
        <p className="text-muted-foreground">Draw once to improve your hand. Jacks or better to win.</p>
      </div>
      
      <div className="bg-green-800/30 p-6 rounded-lg mb-6">
        {gamePhase === 'betting' ? (
          <div className="flex flex-col items-center">
            <h3 className="text-xl font-bold mb-4">Place Your Bet</h3>
            
            <div className="flex items-center mb-6">
              <Button variant="outline" size="icon" onClick={() => adjustBetAmount(-100)}>
                -$100
              </Button>
              <div className="mx-4 px-6 py-3 bg-black/20 rounded-md">
                <div className="flex items-center text-xl font-bold">
                  <DollarSign className="h-5 w-5 text-yellow-500" />
                  <span>{betAmount}</span>
                </div>
              </div>
              <Button variant="outline" size="icon" onClick={() => adjustBetAmount(100)}>
                +$100
              </Button>
            </div>
            
            <Button 
              size="lg" 
              onClick={startGame}
              disabled={betAmount > playerBalance}
              className="bg-yellow-600 hover:bg-yellow-700 text-white"
            >
              Deal Cards
            </Button>
          </div>
        ) : (
          <>
            {/* Dealer message */}
            <div className="flex items-center bg-black/40 p-3 rounded-md mb-4">
              <div className="bg-purple-700 w-10 h-10 rounded-full flex items-center justify-center mr-3">
                <User className="h-6 w-6 text-white" />
              </div>
              <div className="text-white">
                <div className="text-xs opacity-80">Dealer:</div>
                <div>{dealerMessage}</div>
              </div>
            </div>
            
            {/* Player's hand */}
            <div className="flex flex-col items-center">
              <div className="mb-4">
                <h3 className="text-lg font-bold mb-2">Your Hand</h3>
                <div className="flex justify-center flex-wrap gap-2">
                  {playerHand.map((card, index) => renderCard(card, index))}
                </div>
              </div>
              
              {/* Game controls */}
              <div className="flex justify-center gap-4">
                {gamePhase === 'initial-deal' && (
                  <Button 
                    onClick={handleDraw} 
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Draw
                  </Button>
                )}
                
                {gamePhase === 'showdown' && (
                  <Button 
                    onClick={resetGame} 
                    className="bg-yellow-600 hover:bg-yellow-700"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Play Again
                  </Button>
                )}
              </div>
            </div>
            
            {/* Hand evaluation */}
            {handEvaluation && (
              <div className={`mt-4 p-3 rounded-md text-center ${
                handEvaluation.multiplier > 0 ? 'bg-green-800/40' : 'bg-red-800/40'
              }`}>
                <div className="font-bold">
                  {handEvaluation.name}
                </div>
                <div className="text-sm mb-1">
                  {handEvaluation.multiplier > 0 
                    ? `Pays ${handEvaluation.multiplier}x` 
                    : 'No payout'}
                </div>
                
                {/* Show total winnings */}
                {gamePhase === 'showdown' && (
                  <div className="mt-2 pt-2 border-t border-white/20">
                    {totalWinnings > 0 ? (
                      <div>
                        <div className="text-sm text-green-300">Total Return:</div>
                        <div className="text-xl font-bold text-yellow-400">{formatCurrency(totalWinnings)}</div>
                      </div>
                    ) : (
                      <div className="text-red-300 font-bold">
                        Loss: {formatCurrency(betAmount)}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Pay table */}
      <div className="bg-black/20 p-4 rounded-lg">
        <h3 className="text-lg font-bold mb-2">Payout Table</h3>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          {HAND_RANKINGS.slice(0, -1).map((hand, index) => (
            <div key={index} className="flex justify-between items-center text-sm">
              <span>{hand.name}</span>
              <span className="font-bold">{hand.multiplier}x</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}