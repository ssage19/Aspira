import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
  const [displayWinnings, setDisplayWinnings] = useState<number>(0);
  
  // Calculate the value of a hand (accounting for Aces) - Optimized with useCallback
  const calculateHandValue = useCallback((hand: PlayingCard[]): number => {
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
  }, []);
  
  // Initialize a new deck of cards
  const initializeDeck = useCallback(() => {
    const newDeck: PlayingCard[] = [];
    const suits: ('hearts' | 'diamonds' | 'clubs' | 'spades')[] = ['hearts', 'diamonds', 'clubs', 'spades'];
    
    suits.forEach(suit => {
      for (let value = 1; value <= 13; value++) {
        newDeck.push({ suit, value, faceUp: true });
      }
    });
    
    // Shuffle the deck
    return shuffleDeck(newDeck);
  }, []);
  
  // Shuffle the deck
  const shuffleDeck = useCallback((deckToShuffle: PlayingCard[]) => {
    const shuffled = [...deckToShuffle];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }, []);
  
  // Deal a card from the deck
  const dealCard = useCallback((faceUp: boolean = true): PlayingCard => {
    if (deck.length === 0) {
      const newDeck = initializeDeck();
      setDeck(newDeck.slice(1));
      return { ...newDeck[0], faceUp };
    }
    
    const card = { ...deck[0], faceUp };
    setDeck(deck.slice(1));
    return card;
  }, [deck, initializeDeck]);
  
  // Track if payout has been processed already
  const payoutProcessed = React.useRef(false);
  
  // Game over handler - determine winnings with safeguard against multiple payouts
  const handleGameOver = useCallback((result: 'win' | 'lose' | 'push', blackjack: boolean = false) => {
    // Set game state and result for UI
    setGameState('gameOver');
    setResult(result);
    
    // Prevent multiple payouts for the same game
    if (payoutProcessed.current) {
      console.log("Payout already processed, skipping duplicate payout");
      return;
    }
    
    // Mark payout as processed
    payoutProcessed.current = true;
    
    if (result === 'win') {
      if (blackjack) {
        // Blackjack pays 3:2 (that's a 1.5x profit)
        const winnings = Math.floor(betAmount * 1.5);
        onWin(winnings);
        
        // Display the total return in the UI
        setDisplayWinnings(betAmount + winnings);
        console.log(`Blackjack win: paying ${winnings} on bet of ${betAmount}`);
      } else {
        // Regular win (1:1 payout)
        onWin(betAmount);
        
        // Display the total return in the UI
        setDisplayWinnings(betAmount * 2);
        console.log(`Regular win: paying ${betAmount} on bet of ${betAmount}`);
      }
    } else if (result === 'lose') {
      onLoss(betAmount);
      setDisplayWinnings(0);
      console.log(`Loss: player lost ${betAmount}`);
    } else {
      // Push - money is returned
      setDisplayWinnings(betAmount);
      console.log(`Push: returning ${betAmount}`);
    }
  }, [betAmount, onWin, onLoss]);
  
  // Player stands (dealer's turn) - optimized with useCallback
  const stand = useCallback(() => {
    setGameState('dealerTurn');
    
    // Flip dealer's hidden card
    const revealedDealerHand = dealerHand.map(card => ({ ...card, faceUp: true }));
    setDealerHand(revealedDealerHand);
    
    // Dealer's turn logic will be handled by useEffect
  }, [dealerHand]);
  
  // Player hits (draws a card) - optimized with useCallback
  const hit = useCallback(() => {
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
  }, [playerHand, dealCard, calculateHandValue, stand, handleGameOver]);
  
  // Start a new game
  const startGame = useCallback(() => {
    if (betAmount <= 0) {
      toast.error("Please enter a valid bet amount");
      return;
    }
    
    if (betAmount > playerBalance) {
      toast.error("You don't have enough money for this bet");
      return;
    }
    
    // Reset the payout processed flag for the new game
    payoutProcessed.current = false;
    
    // Initialize a new deck
    const newDeck = initializeDeck();
    setDeck(newDeck);
    
    // Deal initial cards
    const pHand = [
      { ...newDeck[0], faceUp: true },
      { ...newDeck[1], faceUp: true }
    ];
    const dHand = [
      { ...newDeck[2], faceUp: true },
      { ...newDeck[3], faceUp: false }
    ];
    
    setPlayerHand(pHand);
    setDealerHand(dHand);
    setDeck(newDeck.slice(4));
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
  }, [betAmount, playerBalance, initializeDeck, calculateHandValue, handleGameOver]);
  
  // Handle dealer's turn - using a ref to track if dealer's turn is in progress
  const dealerTurnInProgress = React.useRef(false);
  
  useEffect(() => {
    // Only run this effect when gameState changes to dealerTurn and not already in progress
    if (gameState === 'dealerTurn' && !dealerTurnInProgress.current) {
      // Set flag to prevent multiple executions
      dealerTurnInProgress.current = true;
      
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
        
        // Reset the flag when dealer's turn is complete
        dealerTurnInProgress.current = false;
      };
      
      dealerPlay();
    } else if (gameState !== 'dealerTurn') {
      // Reset the flag when we exit dealer turn state
      dealerTurnInProgress.current = false;
    }
  }, [gameState, calculateHandValue, dealCard, handleGameOver]);
  
  // Get card display value
  const getCardDisplayValue = useCallback((card: PlayingCard) => {
    if (!card.faceUp) return '?';
    
    if (card.value === 1 || card.value > 10) {
      return CARD_VALUES[card.value as keyof typeof CARD_VALUES];
    }
    return card.value.toString();
  }, []);
  
  // Get suit color
  const getSuitColor = useCallback((suit: 'hearts' | 'diamonds' | 'clubs' | 'spades') => {
    return suit === 'hearts' || suit === 'diamonds' ? 'text-red-600' : 'text-black';
  }, []);
  
  // Reset the game
  const resetGame = useCallback(() => {
    setGameState('betting');
    setPlayerHand([]);
    setDealerHand([]);
    setResult(null);
    
    // Reset the payout processed flag
    payoutProcessed.current = false;
  }, []);
  
  // Increase bet amount
  const increaseBet = useCallback(() => {
    if (betAmount + 100 <= playerBalance) {
      setBetAmount(betAmount + 100);
    }
  }, [betAmount, playerBalance]);
  
  // Decrease bet amount
  const decreaseBet = useCallback(() => {
    if (betAmount - 100 >= 100) {
      setBetAmount(betAmount - 100);
    }
  }, [betAmount]);
  
  // Render a card - optimized with useCallback
  const renderCard = useCallback((card: PlayingCard, index: number) => {
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
  }, [getCardDisplayValue, getSuitColor]);
  
  // Memoize dealer hand display
  const dealerHandDisplay = useMemo(() => {
    return dealerHand.map((card, index) => renderCard(card, index));
  }, [dealerHand, renderCard]);
  
  // Memoize player hand display
  const playerHandDisplay = useMemo(() => {
    return playerHand.map((card, index) => renderCard(card, index));
  }, [playerHand, renderCard]);
  
  // Memoize dealer hand value
  const dealerHandValue = useMemo(() => {
    return dealerHand.some(card => !card.faceUp) 
      ? '?' 
      : calculateHandValue(dealerHand);
  }, [dealerHand, calculateHandValue]);
  
  // Memoize player hand value
  const playerHandValue = useMemo(() => {
    return calculateHandValue(playerHand);
  }, [playerHand, calculateHandValue]);
  
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
          {/* Dealer's cards - Optimized with useMemo */}
          <div className="mb-8">
            <div className="flex items-center mb-2">
              <h3 className="text-lg font-bold">Dealer's Hand</h3>
              <span className="ml-2 px-2 py-1 bg-black/20 rounded text-sm">
                {dealerHandValue}
              </span>
            </div>
            <div className="flex flex-wrap">
              {dealerHandDisplay}
            </div>
          </div>
          
          {/* Player's cards - Optimized with useMemo */}
          <div className="mb-8">
            <div className="flex items-center mb-2">
              <h3 className="text-lg font-bold">Your Hand</h3>
              <span className="ml-2 px-2 py-1 bg-black/20 rounded text-sm">
                {playerHandValue}
              </span>
            </div>
            <div className="flex flex-wrap">
              {playerHandDisplay}
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
                    <div>
                      <div className="text-xl font-bold text-green-500">
                        You win!
                      </div>
                      <div className="text-lg mt-1">
                        <span className="text-muted-foreground">Total return:</span>{' '}
                        <span className="text-green-400 font-bold">{formatCurrency(displayWinnings)}</span>
                      </div>
                    </div>
                  )}
                  {result === 'lose' && (
                    <div>
                      <div className="text-xl font-bold text-red-500">
                        You lose!
                      </div>
                      <div className="text-lg mt-1">
                        <span className="text-muted-foreground">Lost:</span>{' '}
                        <span className="text-red-400 font-bold">{formatCurrency(betAmount)}</span>
                      </div>
                    </div>
                  )}
                  {result === 'push' && (
                    <div>
                      <div className="text-xl font-bold text-yellow-500">
                        Push!
                      </div>
                      <div className="text-lg mt-1">
                        <span className="text-muted-foreground">Returned:</span>{' '}
                        <span className="text-yellow-400 font-bold">{formatCurrency(betAmount)}</span>
                      </div>
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