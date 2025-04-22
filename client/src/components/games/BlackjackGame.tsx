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
  
  // Render a card - optimized with useCallback and enhanced styling
  const renderCard = useCallback((card: PlayingCard, index: number) => {
    if (!card.faceUp) {
      return (
        <div 
          key={index} 
          className="relative w-[100px] h-[140px] bg-gradient-to-br from-blue-800 to-blue-900 rounded-lg shadow-xl m-2 transform hover:rotate-1 transition-transform duration-200"
          style={{ 
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -4px rgba(0, 0, 0, 0.4)'
          }}
        >
          {/* Card back pattern */}
          <div className="absolute inset-2 rounded-md border border-blue-500/20 bg-blue-800 overflow-hidden">
            <div className="grid grid-cols-4 grid-rows-7 gap-0.5 h-full w-full p-1">
              {[...Array(28)].map((_, i) => (
                <div key={i} className="bg-blue-700/40 rounded-sm"></div>
              ))}
            </div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
              <div className="text-xl font-bold text-white">?</div>
            </div>
          </div>
        </div>
      );
    }
    
    const isRed = card.suit === 'hearts' || card.suit === 'diamonds';
    const suitColor = isRed ? 'text-red-600' : 'text-gray-900';
    const displayValue = getCardDisplayValue(card);
    
    return (
      <div 
        key={index} 
        className="relative w-[100px] h-[140px] bg-white rounded-lg shadow-xl m-2 transform hover:rotate-1 transition-transform duration-200 overflow-hidden"
        style={{ 
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -4px rgba(0, 0, 0, 0.2)'
        }}
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
        {(card.value === 1 || card.value > 10) && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className={`text-3xl font-bold ${suitColor}`}>
              {displayValue}
            </div>
          </div>
        )}
      </div>
    );
  }, [getCardDisplayValue]);
  
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
        <h2 className="text-4xl font-bold text-amber-500 font-serif">ROYAL BLACKJACK</h2>
        <p className="text-yellow-200/80 mt-1">Blackjack pays 3:2</p>
      </div>
      
      {/* Main game table with dark blue felt background */}
      <div className="relative bg-blue-900 border-8 border-amber-950/80 rounded-3xl shadow-2xl p-10 min-h-[400px] overflow-hidden">
        {/* Background texture and details */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1IiBoZWlnaHQ9IjUiPgo8cmVjdCB3aWR0aD0iNSIgaGVpZ2h0PSI1IiBmaWxsPSIjMWUzYThhIj48L3JlY3Q+CjxwYXRoIGQ9Ik0wIDVMNSAwWk02IDRMNCA2Wk0tMSAxTDEgLTFaIiBzdHJva2U9IiMxYzM0N2QiIHN0cm9rZS13aWR0aD0iMSI+PC9wYXRoPgo8L3N2Zz4=')] opacity-40"></div>
        
        {/* Blackjack logo/title watermark */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-10 pointer-events-none">
          <div className="text-6xl font-serif font-bold text-yellow-100">ROYAL</div>
          <div className="text-3xl font-serif font-bold text-yellow-100 text-center">BLACKJACK</div>
        </div>
        
        {/* Curved text saying "INSURANCE PAYS 2:1" */}
        <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 w-[500px] text-center">
          <div className="text-yellow-100 text-sm font-serif tracking-widest border border-yellow-200/30 py-1 rounded-full transform -rotate-2">
            INSURANCE PAYS 2:1 ~ INSURANCE PAYS 2:1
          </div>
        </div>
        
        {/* Golden table trim at the bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-700 via-yellow-500 to-amber-700"></div>
        
        {gameState === 'betting' ? (
          <div className="relative z-10 flex flex-col items-center py-14">
            <div className="w-24 h-24 rounded-full bg-black flex items-center justify-center mb-8 shadow-xl border-4 border-amber-600">
              <span className="text-amber-500 text-4xl font-bold font-mono">21</span>
            </div>
            
            <h3 className="text-xl font-bold mb-6 text-yellow-100/80">Place Your Bet</h3>
            
            <div className="flex items-center mb-8">
              <Button variant="outline" size="icon" onClick={decreaseBet} className="bg-black/30 border border-amber-600 hover:bg-black/50 text-amber-500">
                <ChevronDown />
              </Button>
              <div className="mx-4 px-6 py-3 bg-black/40 border border-amber-600 rounded-md">
                <div className="flex items-center text-2xl font-bold text-amber-400">
                  <DollarSign className="h-5 w-5 mr-1" />
                  <span>{betAmount}</span>
                </div>
              </div>
              <Button variant="outline" size="icon" onClick={increaseBet} className="bg-black/30 border border-amber-600 hover:bg-black/50 text-amber-500">
                <ChevronUp />
              </Button>
            </div>
            
            {/* Betting chips illustration */}
            <div className="flex mb-6">
              <div className="w-12 h-12 rounded-full bg-green-600 border-2 border-white -mr-2 shadow-md flex items-center justify-center text-white font-bold">25</div>
              <div className="w-12 h-12 rounded-full bg-red-600 border-2 border-white -mr-2 shadow-md flex items-center justify-center text-white font-bold">5</div>
              <div className="w-12 h-12 rounded-full bg-blue-600 border-2 border-white shadow-md flex items-center justify-center text-white font-bold">10</div>
            </div>
            
            <Button 
              size="lg" 
              onClick={startGame}
              disabled={betAmount > playerBalance}
              className="bg-amber-600 hover:bg-amber-700 text-white border-2 border-amber-300/30 shadow-lg px-8"
            >
              Deal Cards
            </Button>
          </div>
        ) : (
          <div className="relative z-10">
            {/* Dealer's hand area */}
            <div className="mb-10 pt-4">
              <div className="flex items-center mb-2">
                <h3 className="text-lg font-bold text-yellow-100">Dealer's Hand</h3>
                <span className="ml-2 px-2 py-1 bg-black/30 border border-amber-700/40 rounded text-sm text-amber-300">
                  {dealerHandValue}
                </span>
              </div>
              <div className="flex flex-wrap justify-center">
                {dealerHandDisplay}
              </div>
            </div>
            
            {/* Player's hand area */}
            <div className="mb-8">
              <div className="flex items-center mb-2">
                <h3 className="text-lg font-bold text-yellow-100">Your Hand</h3>
                <span className="ml-2 px-2 py-1 bg-black/30 border border-amber-700/40 rounded text-sm text-amber-300">
                  {playerHandValue}
                </span>
              </div>
              <div className="flex flex-wrap justify-center">
                {playerHandDisplay}
              </div>
            </div>
            
            {/* Game controls */}
            <div className="flex justify-center gap-4 mt-8">
              {gameState === 'playing' && (
                <>
                  <Button onClick={hit} className="bg-green-800 hover:bg-green-900 text-white border border-green-600/50 px-6">
                    Hit
                  </Button>
                  <Button onClick={stand} className="bg-amber-800 hover:bg-amber-900 text-white border border-amber-600/50 px-6">
                    Stand
                  </Button>
                </>
              )}
              
              {gameState === 'gameOver' && (
                <div className="text-center bg-black/20 p-4 rounded-xl border border-amber-700/30">
                  <div className="mb-4">
                    {result === 'win' && (
                      <div>
                        <div className="text-2xl font-bold text-amber-400">
                          You win!
                        </div>
                        <div className="text-lg mt-1">
                          <span className="text-yellow-100/70">Total return:</span>{' '}
                          <span className="text-amber-400 font-bold">{formatCurrency(displayWinnings)}</span>
                        </div>
                      </div>
                    )}
                    {result === 'lose' && (
                      <div>
                        <div className="text-2xl font-bold text-red-400">
                          You lose!
                        </div>
                        <div className="text-lg mt-1">
                          <span className="text-yellow-100/70">Lost:</span>{' '}
                          <span className="text-red-400 font-bold">{formatCurrency(betAmount)}</span>
                        </div>
                      </div>
                    )}
                    {result === 'push' && (
                      <div>
                        <div className="text-2xl font-bold text-yellow-400">
                          Push!
                        </div>
                        <div className="text-lg mt-1">
                          <span className="text-yellow-100/70">Returned:</span>{' '}
                          <span className="text-yellow-400 font-bold">{formatCurrency(betAmount)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <Button 
                    onClick={resetGame} 
                    className="bg-amber-600 hover:bg-amber-700 text-white border border-amber-500/50"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Play Again
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-4 text-sm text-amber-300/70 text-center italic">
        <p>House Rules: Dealer stands on 17. Blackjack pays 3:2. No insurance or splitting.</p>
      </div>
    </div>
  );
}