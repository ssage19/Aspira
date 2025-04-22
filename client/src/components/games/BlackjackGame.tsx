import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dices, DollarSign, ChevronUp, ChevronDown, RotateCcw } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';
import { toast } from 'sonner';

// Define card types
interface PlayingCard {
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
  value: number; // 1 (Ace) through 13 (King)
  faceUp: boolean;
}

// Suit symbols
const SUIT_SYMBOLS = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠'
};

// Card value to display value
const CARD_VALUES = {
  1: 'A',
  11: 'J',
  12: 'Q',
  13: 'K'
};

interface BlackjackGameProps {
  onWin: (amount: number) => void;
  onLoss: (amount: number) => void;
  playerBalance: number;
}

export default function BlackjackGame({ onWin, onLoss, playerBalance }: BlackjackGameProps) {
  // Game state
  const [deck, setDeck] = useState<PlayingCard[]>([]);
  const [dealerHand, setDealerHand] = useState<PlayingCard[]>([]);
  const [playerHand, setPlayerHand] = useState<PlayingCard[]>([]);
  const [gameState, setGameState] = useState<'betting' | 'playing' | 'dealerTurn' | 'gameOver'>('betting');
  const [betAmount, setBetAmount] = useState(100);
  const [result, setResult] = useState<'win' | 'lose' | 'push' | null>(null);
  
  // Initialize a new deck of cards
  const initializeDeck = () => {
    const newDeck: PlayingCard[] = [];
    const suits: ('hearts' | 'diamonds' | 'clubs' | 'spades')[] = ['hearts', 'diamonds', 'clubs', 'spades'];
    
    suits.forEach(suit => {
      for (let value = 1; value <= 13; value++) {
        newDeck.push({ suit, value, faceUp: true });
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
  
  // Deal a card from the deck
  const dealCard = (faceUp: boolean = true): PlayingCard => {
    if (deck.length === 0) {
      const newDeck = initializeDeck();
      setDeck(newDeck.slice(1));
      return { ...newDeck[0], faceUp };
    }
    
    const card = { ...deck[0], faceUp };
    setDeck(deck.slice(1));
    return card;
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
    setDeck(newDeck);
    
    // Deal initial cards
    const pHand = [dealCard(), dealCard()];
    const dHand = [dealCard(), dealCard(false)];
    
    setPlayerHand(pHand);
    setDealerHand(dHand);
    setGameState('playing');
    setResult(null);
    
    // Check for blackjack
    if (calculateHandValue(pHand) === 21) {
      if (calculateHandValue([{ ...dHand[0], faceUp: true }, { ...dHand[1], faceUp: true }]) === 21) {
        // Both have blackjack, it's a push
        handleGameOver('push');
      } else {
        // Player has blackjack, pays 3:2
        handleGameOver('win', true);
      }
    }
  };
  
  // Player hits (draws a card)
  const hit = () => {
    const newCard = dealCard();
    const newHand = [...playerHand, newCard];
    setPlayerHand(newHand);
    
    const handValue = calculateHandValue(newHand);
    if (handValue > 21) {
      // Player busts
      handleGameOver('lose');
    } else if (handValue === 21) {
      // Player has 21, dealer's turn
      stand();
    }
  };
  
  // Player stands (dealer's turn)
  const stand = () => {
    setGameState('dealerTurn');
    
    // Flip dealer's hidden card
    const revealedDealerHand = dealerHand.map(card => ({ ...card, faceUp: true }));
    setDealerHand(revealedDealerHand);
    
    // Dealer's turn logic will be handled by useEffect
  };
  
  // Handle dealer's turn
  useEffect(() => {
    if (gameState === 'dealerTurn') {
      const dealerPlay = async () => {
        let currentDealerHand = [...dealerHand];
        
        // Make sure all dealer cards are face up
        currentDealerHand = currentDealerHand.map(card => ({ ...card, faceUp: true }));
        setDealerHand(currentDealerHand);
        
        // Dealer draws until 17 or higher
        let dealerValue = calculateHandValue(currentDealerHand);
        
        // Add a slight delay for animation
        await new Promise(resolve => setTimeout(resolve, 500));
        
        while (dealerValue < 17) {
          const newCard = dealCard();
          currentDealerHand = [...currentDealerHand, newCard];
          setDealerHand(currentDealerHand);
          
          dealerValue = calculateHandValue(currentDealerHand);
          
          // Add a slight delay for animation
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        // Determine the winner
        const playerValue = calculateHandValue(playerHand);
        
        if (dealerValue > 21) {
          // Dealer busts
          handleGameOver('win');
        } else if (dealerValue > playerValue) {
          // Dealer wins
          handleGameOver('lose');
        } else if (dealerValue < playerValue) {
          // Player wins
          handleGameOver('win');
        } else {
          // Push (tie)
          handleGameOver('push');
        }
      };
      
      dealerPlay();
    }
  }, [gameState, dealerHand]);
  
  // Calculate the value of a hand (accounting for Aces)
  const calculateHandValue = (hand: PlayingCard[]): number => {
    let value = 0;
    let aces = 0;
    
    hand.forEach(card => {
      if (card.value === 1) {
        // Ace
        aces += 1;
        value += 11;
      } else if (card.value > 10) {
        // Face card
        value += 10;
      } else {
        value += card.value;
      }
    });
    
    // Adjust value for aces if necessary
    while (value > 21 && aces > 0) {
      value -= 10; // Change Ace from 11 to 1
      aces -= 1;
    }
    
    return value;
  };
  
  // Handle game over
  const handleGameOver = (result: 'win' | 'lose' | 'push', blackjack: boolean = false) => {
    setGameState('gameOver');
    setResult(result);
    
    if (result === 'win') {
      if (blackjack) {
        // Blackjack pays 3:2
        const winnings = Math.floor(betAmount * 1.5);
        onWin(winnings);
      } else {
        onWin(betAmount);
      }
    } else if (result === 'lose') {
      onLoss(betAmount);
    }
    // Push doesn't change player's balance
  };
  
  // Get card display value
  const getCardDisplayValue = (card: PlayingCard) => {
    if (!card.faceUp) return '?';
    
    if (card.value === 1 || card.value > 10) {
      return CARD_VALUES[card.value as keyof typeof CARD_VALUES];
    }
    return card.value.toString();
  };
  
  // Get suit color
  const getSuitColor = (suit: 'hearts' | 'diamonds' | 'clubs' | 'spades') => {
    return suit === 'hearts' || suit === 'diamonds' ? 'text-red-600' : 'text-black';
  };
  
  // Reset the game
  const resetGame = () => {
    setGameState('betting');
    setPlayerHand([]);
    setDealerHand([]);
    setResult(null);
  };
  
  // Increase bet amount
  const increaseBet = () => {
    if (betAmount + 100 <= playerBalance) {
      setBetAmount(betAmount + 100);
    }
  };
  
  // Decrease bet amount
  const decreaseBet = () => {
    if (betAmount - 100 >= 100) {
      setBetAmount(betAmount - 100);
    }
  };

  // Render a card
  const renderCard = (card: PlayingCard, index: number) => {
    if (!card.faceUp) {
      return (
        <div 
          key={index} 
          className="w-16 h-24 bg-blue-800 rounded-md shadow-md flex items-center justify-center text-white border-2 border-white m-1"
        >
          <div className="text-xl font-bold">?</div>
        </div>
      );
    }
    
    return (
      <div 
        key={index} 
        className="w-16 h-24 bg-white rounded-md shadow-md flex flex-col items-center justify-between p-2 border-2 border-gray-300 m-1"
      >
        <div className={`text-lg font-bold ${getSuitColor(card.suit)}`}>
          {getCardDisplayValue(card)}
        </div>
        <div className={`text-2xl ${getSuitColor(card.suit)}`}>
          {SUIT_SYMBOLS[card.suit]}
        </div>
      </div>
    );
  };
  
  return (
    <div className="flex flex-col">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold">Blackjack</h2>
        <p className="text-muted-foreground">Get closer to 21 than the dealer without going over</p>
      </div>
      
      {gameState === 'betting' ? (
        <div className="flex flex-col items-center p-6 bg-green-800/30 rounded-lg">
          <h3 className="text-xl font-bold mb-4">Place Your Bet</h3>
          
          <div className="flex items-center mb-6">
            <Button variant="outline" size="icon" onClick={decreaseBet}>
              <ChevronDown />
            </Button>
            <div className="mx-4 px-6 py-3 bg-black/20 rounded-md">
              <div className="flex items-center text-xl font-bold">
                <DollarSign className="h-5 w-5 text-yellow-500" />
                <span>{betAmount}</span>
              </div>
            </div>
            <Button variant="outline" size="icon" onClick={increaseBet}>
              <ChevronUp />
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
        <div className="bg-green-800/30 p-6 rounded-lg">
          {/* Dealer's cards */}
          <div className="mb-8">
            <div className="flex items-center mb-2">
              <h3 className="text-lg font-bold">Dealer's Hand</h3>
              <span className="ml-2 px-2 py-1 bg-black/20 rounded text-sm">
                {dealerHand.some(card => !card.faceUp) 
                  ? '?' 
                  : calculateHandValue(dealerHand)}
              </span>
            </div>
            <div className="flex flex-wrap">
              {dealerHand.map((card, index) => renderCard(card, index))}
            </div>
          </div>
          
          {/* Player's cards */}
          <div className="mb-8">
            <div className="flex items-center mb-2">
              <h3 className="text-lg font-bold">Your Hand</h3>
              <span className="ml-2 px-2 py-1 bg-black/20 rounded text-sm">
                {calculateHandValue(playerHand)}
              </span>
            </div>
            <div className="flex flex-wrap">
              {playerHand.map((card, index) => renderCard(card, index))}
            </div>
          </div>
          
          {/* Game controls */}
          <div className="flex justify-center gap-4">
            {gameState === 'playing' && (
              <>
                <Button onClick={hit} className="bg-blue-600 hover:bg-blue-700">
                  Hit
                </Button>
                <Button onClick={stand} className="bg-purple-600 hover:bg-purple-700">
                  Stand
                </Button>
              </>
            )}
            
            {gameState === 'gameOver' && (
              <div className="text-center">
                <div className="mb-4">
                  {result === 'win' && (
                    <div className="text-xl font-bold text-green-500">
                      You win {formatCurrency(betAmount)}!
                    </div>
                  )}
                  {result === 'lose' && (
                    <div className="text-xl font-bold text-red-500">
                      You lose {formatCurrency(betAmount)}!
                    </div>
                  )}
                  {result === 'push' && (
                    <div className="text-xl font-bold text-yellow-500">
                      Push! Your bet is returned.
                    </div>
                  )}
                </div>
                
                <Button 
                  onClick={resetGame} 
                  className="bg-yellow-600 hover:bg-yellow-700"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Play Again
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
      
      <div className="mt-4 text-sm text-muted-foreground">
        <p>House Rules: Dealer stands on 17. Blackjack pays 3:2. No insurance or splitting.</p>
      </div>
    </div>
  );
}