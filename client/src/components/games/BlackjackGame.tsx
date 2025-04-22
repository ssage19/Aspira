import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Dices, DollarSign, ChevronUp, ChevronDown, RotateCcw, 
  Split as SplitIcon, Plus, Minus, Maximize2
} from 'lucide-react';
import { formatCurrency } from '../../lib/utils';
import { toast } from 'sonner';
import { Input } from '../ui/input';

// Define card types
interface PlayingCard {
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
  value: number; // 1 (Ace) through 13 (King)
  faceUp: boolean;
  id: string; // Unique identifier for animation/tracking
}

// Define a hand type to track multiple hands
interface PlayerHand {
  id: string;
  cards: PlayingCard[];
  bet: number;
  status: 'playing' | 'stood' | 'busted' | 'blackjack' | 'doubled' | 'complete';
  result: 'win' | 'lose' | 'push' | null;
  doubledDown: boolean;
  payout: number;
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
  const [dealerCards, setDealerCards] = useState<PlayingCard[]>([]);
  const [playerHands, setPlayerHands] = useState<PlayerHand[]>([]);
  const [activeHandIndex, setActiveHandIndex] = useState<number>(0);
  const [gameState, setGameState] = useState<'betting' | 'playing' | 'dealerTurn' | 'gameOver'>('betting');
  const [baseBetAmount, setBaseBetAmount] = useState(100);
  const [customBetInput, setCustomBetInput] = useState('100');
  const [numberOfHands, setNumberOfHands] = useState(1);
  const [totalBet, setTotalBet] = useState<number>(0);
  const [totalWinnings, setTotalWinnings] = useState<number>(0);
  
  // Flags to prevent race conditions
  const dealerTurnInProgress = React.useRef(false);
  const payoutProcessed = React.useRef(false);
  
  // Generate a unique ID for cards and hands
  const generateId = useCallback(() => {
    return Math.random().toString(36).substring(2, 9);
  }, []);
  
  // Calculate the value of a hand (accounting for Aces)
  const calculateHandValue = useCallback((cards: PlayingCard[]): number => {
    let value = 0;
    let aces = 0;
    
    cards.forEach(card => {
      if (!card.faceUp) return; // Skip face down cards
      
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
  
  // Check if a hand can be split (has exactly 2 cards of the same value)
  const canSplitHand = useCallback((hand: PlayerHand): boolean => {
    if (hand.cards.length !== 2) return false;
    if (hand.doubledDown) return false;
    if (hand.status !== 'playing') return false;
    
    const card1Value = hand.cards[0].value > 10 ? 10 : hand.cards[0].value;
    const card2Value = hand.cards[1].value > 10 ? 10 : hand.cards[1].value;
    
    return card1Value === card2Value;
  }, []);
  
  // Check if a hand can be doubled down (has exactly 2 cards and total value 9-11)
  const canDoubleDown = useCallback((hand: PlayerHand): boolean => {
    if (hand.cards.length !== 2) return false;
    if (hand.doubledDown) return false;
    if (hand.status !== 'playing') return false;
    
    const handValue = calculateHandValue(hand.cards);
    return handValue >= 9 && handValue <= 11;
  }, [calculateHandValue]);
  
  // Initialize a new deck of cards
  const initializeDeck = useCallback(() => {
    const newDeck: PlayingCard[] = [];
    const suits: ('hearts' | 'diamonds' | 'clubs' | 'spades')[] = ['hearts', 'diamonds', 'clubs', 'spades'];
    
    suits.forEach(suit => {
      for (let value = 1; value <= 13; value++) {
        newDeck.push({ 
          suit, 
          value, 
          faceUp: true,
          id: `${suit}-${value}-${generateId()}`
        });
      }
    });
    
    // Shuffle the deck
    return shuffleDeck(newDeck);
  }, [generateId]);
  
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
      return { ...newDeck[0], faceUp, id: `${newDeck[0].suit}-${newDeck[0].value}-${generateId()}` };
    }
    
    const card = { ...deck[0], faceUp, id: `${deck[0].suit}-${deck[0].value}-${generateId()}` };
    setDeck(prevDeck => prevDeck.slice(1));
    return card;
  }, [deck, initializeDeck, generateId]);
  
  // Handle processing the final results and payouts
  const processGameResults = useCallback(() => {
    // Prevent multiple payouts
    if (payoutProcessed.current) {
      console.log("Results already processed, skipping");
      return;
    }
    
    // Mark as processed
    payoutProcessed.current = true;
    
    let totalPayout = 0;
    let totalAmountBet = 0;
    
    // Get final dealer value
    const finalDealerValue = calculateHandValue(dealerCards);
    console.log("FINAL DEALER VALUE:", finalDealerValue);
    const dealerHasBlackjack = dealerCards.length === 2 && finalDealerValue === 21;
    const dealerBusted = finalDealerValue > 21;
    
    // Process each hand's result
    const updatedHands = playerHands.map(hand => {
      let result: 'win' | 'lose' | 'push' | null = null;
      let payout = 0;
      
      // Add bet to total
      totalAmountBet += hand.bet;
      
      // Calculate final hand value
      const handValue = calculateHandValue(hand.cards);
      const isBlackjack = hand.cards.length === 2 && handValue === 21;
      
      console.log(`Processing hand ${hand.id}: Value=${handValue}, Status=${hand.status}, Dealer=${finalDealerValue}`);
      
      // CASE 1: Player busted
      if (hand.status === 'busted') {
        result = 'lose';
        payout = 0;
        console.log(`Hand ${hand.id}: Player busted, loses ${hand.bet}`);
      }
      // CASE 2: Player has blackjack
      else if (isBlackjack) {
        if (dealerHasBlackjack) {
          // Push if both have blackjack
          result = 'push';
          payout = hand.bet;
          console.log(`Hand ${hand.id}: Both have blackjack, push ${hand.bet}`);
        } else {
          // Blackjack pays 3:2
          result = 'win';
          payout = hand.bet + Math.floor(hand.bet * 1.5);
          console.log(`Hand ${hand.id}: Player has blackjack, wins ${payout}`);
        }
      }
      // CASE 3: Dealer busted (and player didn't)
      else if (dealerBusted) {
        result = 'win';
        payout = hand.bet * 2; // Original bet + winnings
        console.log(`Hand ${hand.id}: Dealer busted, player wins ${payout}`);
      }
      // CASE 4: Compare values (neither busted)
      else {
        // Dealer has higher value
        if (finalDealerValue > handValue) {
          result = 'lose';
          payout = 0;
          console.log(`Hand ${hand.id}: Dealer ${finalDealerValue} > Player ${handValue}, Player loses ${hand.bet}`);
        }
        // Player has higher value 
        else if (finalDealerValue < handValue) {
          result = 'win';
          payout = hand.bet * 2; // Original bet + winnings
          console.log(`Hand ${hand.id}: Dealer ${finalDealerValue} < Player ${handValue}, Player wins ${payout}`);
        }
        // Equal values - push
        else {
          result = 'push';
          payout = hand.bet;
          console.log(`Hand ${hand.id}: Dealer ${finalDealerValue} = Player ${handValue}, Push ${hand.bet}`);
        }
      }
      
      // Add to total payout
      totalPayout += payout;
      
      // Return updated hand with result
      return {
        ...hand,
        result,
        payout,
        status: 'complete' as const
      };
    });
    
    // Update player hands with results
    setPlayerHands(updatedHands);
    
    // Calculate net winnings/losses
    const netWinnings = totalPayout - totalAmountBet;
    setTotalWinnings(netWinnings);
    
    // Update player balance
    if (netWinnings > 0) {
      onWin(netWinnings);
      toast.success(`You won ${formatCurrency(netWinnings)}!`);
    } else if (netWinnings < 0) {
      onLoss(Math.abs(netWinnings));
      toast.error(`You lost ${formatCurrency(Math.abs(netWinnings))}`);
    } else {
      toast.info("Push - no win or loss");
    }
    
    console.log(`Game results processed: Bet ${totalAmountBet}, Payout ${totalPayout}, Net ${netWinnings}`);
  }, [playerHands, dealerCards, calculateHandValue, onWin, onLoss]);
  
  // Player actions - Hit
  const handleHit = useCallback(() => {
    if (gameState !== 'playing' || activeHandIndex >= playerHands.length) return;
    
    // Get active hand
    const activeHand = playerHands[activeHandIndex];
    if (activeHand.status !== 'playing') return;
    
    // Deal a new card
    const newCard = dealCard();
    
    // Add card to the hand
    const updatedHand = {
      ...activeHand,
      cards: [...activeHand.cards, newCard]
    };
    
    // Check for bust
    const handValue = calculateHandValue([...activeHand.cards, newCard]);
    if (handValue > 21) {
      updatedHand.status = 'busted' as const;
    }
    
    // Update the hand in the array
    const updatedHands = [...playerHands];
    updatedHands[activeHandIndex] = updatedHand;
    setPlayerHands(updatedHands);
    
    // If hand busted, move to next hand or dealer turn
    if (updatedHand.status === 'busted') {
      // Check if this is the last hand
      if (activeHandIndex === playerHands.length - 1) {
        // All hands complete, dealer's turn
        setGameState('dealerTurn');
      } else {
        // Move to next hand
        setActiveHandIndex(activeHandIndex + 1);
      }
    }
  }, [gameState, activeHandIndex, playerHands, dealCard, calculateHandValue]);
  
  // Player actions - Stand
  const handleStand = useCallback(() => {
    if (gameState !== 'playing' || activeHandIndex >= playerHands.length) return;
    
    // Get active hand
    const activeHand = playerHands[activeHandIndex];
    if (activeHand.status !== 'playing') return;
    
    // Mark hand as stood
    const updatedHand = {
      ...activeHand,
      status: 'stood' as const
    };
    
    // Update the hand in the array
    const updatedHands = [...playerHands];
    updatedHands[activeHandIndex] = updatedHand;
    setPlayerHands(updatedHands);
    
    // Check if this is the last hand
    if (activeHandIndex === playerHands.length - 1) {
      // All hands complete, dealer's turn
      setGameState('dealerTurn');
    } else {
      // Move to next hand
      setActiveHandIndex(activeHandIndex + 1);
    }
  }, [gameState, activeHandIndex, playerHands]);
  
  // Player actions - Double Down
  const handleDoubleDown = useCallback(() => {
    if (gameState !== 'playing' || activeHandIndex >= playerHands.length) return;
    
    // Get active hand
    const activeHand = playerHands[activeHandIndex];
    if (!canDoubleDown(activeHand)) return;
    
    // Check if player has enough balance
    if (activeHand.bet > playerBalance) {
      toast.error("Not enough balance to double down");
      return;
    }
    
    // Deal one more card
    const newCard = dealCard();
    
    // Update the hand
    const updatedHand = {
      ...activeHand,
      cards: [...activeHand.cards, newCard],
      bet: activeHand.bet * 2, // Double the bet
      doubledDown: true,
      status: 'stood' as const // Automatically stand after doubling down
    };
    
    // Update total bet
    setTotalBet(prev => prev + activeHand.bet);
    
    // Update the hand in the array
    const updatedHands = [...playerHands];
    updatedHands[activeHandIndex] = updatedHand;
    setPlayerHands(updatedHands);
    
    // Check if this is the last hand
    if (activeHandIndex === playerHands.length - 1) {
      // All hands complete, dealer's turn
      setGameState('dealerTurn');
    } else {
      // Move to next hand
      setActiveHandIndex(activeHandIndex + 1);
    }
  }, [gameState, activeHandIndex, playerHands, canDoubleDown, playerBalance, dealCard]);
  
  // Player actions - Split
  const handleSplit = useCallback(() => {
    if (gameState !== 'playing' || activeHandIndex >= playerHands.length) return;
    
    // Get active hand
    const activeHand = playerHands[activeHandIndex];
    if (!canSplitHand(activeHand)) return;
    
    // Check if player has enough balance
    if (activeHand.bet > playerBalance) {
      toast.error("Not enough balance to split");
      return;
    }
    
    // Create two new hands from the split
    const card1 = activeHand.cards[0];
    const card2 = activeHand.cards[1];
    
    // Deal a new card to each hand
    const newCard1 = dealCard();
    const newCard2 = dealCard();
    
    const hand1: PlayerHand = {
      id: `split-1-${generateId()}`,
      cards: [card1, newCard1],
      bet: activeHand.bet,
      status: 'playing',
      result: null,
      doubledDown: false,
      payout: 0
    };
    
    const hand2: PlayerHand = {
      id: `split-2-${generateId()}`,
      cards: [card2, newCard2],
      bet: activeHand.bet,
      status: 'playing',
      result: null,
      doubledDown: false,
      payout: 0
    };
    
    // Update total bet
    setTotalBet(prev => prev + activeHand.bet);
    
    // Replace current hand with the two new hands
    const updatedHands = [...playerHands];
    updatedHands.splice(activeHandIndex, 1, hand1, hand2);
    setPlayerHands(updatedHands);
    
    // Keep active hand index the same (now pointing to hand1)
    // Play will continue with the first split hand
  }, [gameState, activeHandIndex, playerHands, canSplitHand, playerBalance, dealCard, generateId]);
  
  // Start game with current bet and number of hands
  const startGame = useCallback(() => {
    // Validate inputs
    const betAmount = parseInt(customBetInput, 10);
    if (isNaN(betAmount) || betAmount < 10) {
      toast.error("Please enter a valid bet amount (minimum 10)");
      return;
    }
    
    if (numberOfHands < 1 || numberOfHands > 5) {
      toast.error("Please choose between 1 and 5 hands");
      return;
    }
    
    const totalBetRequired = betAmount * numberOfHands;
    if (totalBetRequired > playerBalance) {
      toast.error("You don't have enough balance for this bet");
      return;
    }
    
    // Reset any previous game state
    payoutProcessed.current = false;
    dealerTurnInProgress.current = false;
    
    // Initialize a new deck
    const newDeck = initializeDeck();
    setDeck(newDeck);
    
    // Deal initial cards for each player hand
    const initialPlayerHands: PlayerHand[] = [];
    
    for (let i = 0; i < numberOfHands; i++) {
      // Deal 2 cards for this hand
      const card1 = { ...newDeck.shift()!, faceUp: true, id: generateId() };
      const card2 = { ...newDeck.shift()!, faceUp: true, id: generateId() };
      
      // Create the hand
      const hand: PlayerHand = {
        id: `hand-${i}-${generateId()}`,
        cards: [card1, card2],
        bet: betAmount,
        status: 'playing',
        result: null,
        doubledDown: false,
        payout: 0
      };
      
      // Check for blackjack
      if (calculateHandValue([card1, card2]) === 21) {
        hand.status = 'blackjack' as const;
      }
      
      initialPlayerHands.push(hand);
    }
    
    // Deal dealer's cards
    const dealerCard1 = { ...newDeck.shift()!, faceUp: true, id: generateId() };
    const dealerCard2 = { ...newDeck.shift()!, faceUp: false, id: generateId() };
    
    // Set game state
    setDealerCards([dealerCard1, dealerCard2]);
    setPlayerHands(initialPlayerHands);
    setActiveHandIndex(0); // Start with the first hand
    setDeck(newDeck);
    setGameState('playing');
    setTotalBet(betAmount * numberOfHands);
    setTotalWinnings(0);
    
    // Store bet amount for next game
    setBaseBetAmount(betAmount);
    
    // Check if all hands are blackjack
    const allBlackjack = initialPlayerHands.every(hand => hand.status === 'blackjack');
    if (allBlackjack) {
      // Skip to dealer's turn
      setGameState('dealerTurn');
    }
  }, [customBetInput, numberOfHands, playerBalance, initializeDeck, generateId, calculateHandValue]);
  
  // Handle dealer's turn
  useEffect(() => {
    if (gameState !== 'dealerTurn' || dealerTurnInProgress.current) return;
    
    // Set flag to prevent multiple executions
    dealerTurnInProgress.current = true;
    
    const dealerPlay = async () => {
      // Flip dealer's hidden card
      const revealedDealerCards = dealerCards.map(card => ({ ...card, faceUp: true }));
      setDealerCards(revealedDealerCards);
      
      // Add a slight delay for animation
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Check if any player hands are still active (not busted)
      const activeHandsExist = playerHands.some(hand => hand.status !== 'busted');
      
      // Only draw cards if there are active hands
      if (activeHandsExist) {
        let currentDealerCards = [...revealedDealerCards];
        let dealerValue = calculateHandValue(currentDealerCards);
        
        // Dealer draws until 17 or higher
        while (dealerValue < 17) {
          const newCard = dealCard();
          currentDealerCards = [...currentDealerCards, newCard];
          setDealerCards(currentDealerCards);
          
          dealerValue = calculateHandValue(currentDealerCards);
          
          // Add a slight delay for animation
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
      // Process final results
      console.log("Dealer's turn completed, processing final results");
      console.log("Dealer final cards:", dealerCards);
      console.log("Dealer final value:", calculateHandValue(dealerCards));
      
      setGameState('gameOver');
      processGameResults();
      
      // Reset the flag
      dealerTurnInProgress.current = false;
    };
    
    dealerPlay();
  }, [gameState, dealerCards, playerHands, dealCard, calculateHandValue, processGameResults]);
  
  // Reset the game
  const resetGame = useCallback(() => {
    setGameState('betting');
    setDealerCards([]);
    setPlayerHands([]);
    setActiveHandIndex(0);
    setTotalBet(0);
    setTotalWinnings(0);
    payoutProcessed.current = false;
    dealerTurnInProgress.current = false;
  }, []);
  
  // Handle custom bet input
  const handleCustomBetInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers
    if (/^\d*$/.test(value)) {
      setCustomBetInput(value);
    }
  }, []);
  
  // Update number of hands
  const incrementHands = useCallback(() => {
    if (numberOfHands < 5) {
      setNumberOfHands(numberOfHands + 1);
    }
  }, [numberOfHands]);
  
  const decrementHands = useCallback(() => {
    if (numberOfHands > 1) {
      setNumberOfHands(numberOfHands - 1);
    }
  }, [numberOfHands]);
  
  // Get card display value
  const getCardDisplayValue = useCallback((card: PlayingCard) => {
    if (!card.faceUp) return '?';
    
    if (card.value === 1 || card.value > 10) {
      return CARD_VALUES[card.value as keyof typeof CARD_VALUES];
    }
    return card.value.toString();
  }, []);
  
  // Render a card with enhanced styling
  const renderCard = useCallback((card: PlayingCard, index: number, isActive: boolean = false) => {
    if (!card.faceUp) {
      return (
        <div 
          key={card.id || index} 
          className={`relative w-[100px] h-[140px] bg-gradient-to-br from-blue-800 to-blue-900 rounded-lg shadow-xl m-2 transform hover:rotate-1 transition-transform duration-200 ${isActive ? 'ring-2 ring-amber-400 ring-offset-2' : ''}`}
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
        key={card.id || index} 
        className={`relative w-[100px] h-[140px] bg-white rounded-lg shadow-xl m-2 transform hover:rotate-1 transition-transform duration-200 overflow-hidden ${isActive ? 'ring-2 ring-amber-400 ring-offset-2' : ''}`}
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
  
  // Render hands
  const renderPlayerHand = useCallback((hand: PlayerHand, index: number) => {
    const isActive = index === activeHandIndex && gameState === 'playing';
    const handValue = calculateHandValue(hand.cards);
    
    // Determine status indicator color and text
    let statusColor = "bg-blue-600";
    let statusText = `${handValue}`;
    
    if (hand.status === 'busted') {
      statusColor = "bg-red-600";
      statusText = "Bust";
    } else if (hand.status === 'blackjack') {
      statusColor = "bg-amber-500";
      statusText = "Blackjack!";
    } else if (hand.status === 'stood') {
      statusColor = "bg-purple-600";
      statusText = `${handValue} (Stood)`;
    }
    
    // Show game results if game is over
    if (gameState === 'gameOver') {
      if (hand.result === 'win') {
        statusColor = "bg-green-600";
        statusText = `Win ${formatCurrency(hand.payout)}`;
      } else if (hand.result === 'lose') {
        statusColor = "bg-red-600";
        statusText = `Lose ${formatCurrency(hand.bet)}`;
      } else if (hand.result === 'push') {
        statusColor = "bg-blue-500";
        statusText = `Tie - Push (${formatCurrency(hand.bet)})`;
      }
    }
    
    return (
      <div 
        key={hand.id} 
        className={`relative mb-8 p-3 rounded-lg ${isActive ? 'bg-blue-900/30 border border-amber-500/50' : 'bg-blue-900/10'}`}
      >
        <div className="flex items-center mb-2 justify-between">
          <div className="flex items-center">
            <span className="text-sm font-bold text-yellow-100 mr-1">Hand {index + 1}:</span>
            <span className={`ml-1 px-2 py-0.5 rounded text-xs text-white ${statusColor}`}>
              {statusText}
            </span>
          </div>
          <div className="text-yellow-100 text-xs">
            Bet: {formatCurrency(hand.bet)}
          </div>
        </div>
        <div className="flex flex-wrap justify-center">
          {hand.cards.map((card, cardIndex) => 
            renderCard(card, cardIndex, isActive)
          )}
        </div>
        
        {/* Action buttons for active hand */}
        {isActive && (
          <div className="mt-4 flex justify-center gap-2">
            <Button onClick={handleHit} className="bg-green-800 hover:bg-green-900 text-white">
              Hit
            </Button>
            <Button onClick={handleStand} className="bg-purple-800 hover:bg-purple-900 text-white">
              Stand
            </Button>
            {canDoubleDown(hand) && (
              <Button 
                onClick={handleDoubleDown} 
                className="bg-amber-800 hover:bg-amber-900 text-white"
                disabled={hand.bet > playerBalance}
              >
                <Maximize2 className="h-4 w-4 mr-1" />
                Double
              </Button>
            )}
            {canSplitHand(hand) && (
              <Button 
                onClick={handleSplit} 
                className="bg-blue-800 hover:bg-blue-900 text-white"
                disabled={hand.bet > playerBalance}
              >
                <SplitIcon className="h-4 w-4 mr-1" />
                Split
              </Button>
            )}
          </div>
        )}
      </div>
    );
  }, [
    activeHandIndex, 
    gameState, 
    calculateHandValue, 
    renderCard, 
    handleHit, 
    handleStand, 
    handleDoubleDown,
    handleSplit,
    canDoubleDown,
    canSplitHand,
    playerBalance
  ]);
  
  // Render UI
  return (
    <div className="flex flex-col">
      <div className="text-center mb-6">
        <h2 className="text-4xl font-bold text-amber-500 font-serif">ROYAL BLACKJACK</h2>
        <p className="text-yellow-200/80 mt-1">Blackjack pays 3:2</p>
      </div>
      
      {/* Main game table with dark blue felt background */}
      <div className="relative bg-blue-900 border-8 border-amber-950/80 rounded-3xl shadow-2xl p-8 min-h-[400px] overflow-hidden">
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
        
        <div className="relative z-10">
          {gameState === 'betting' ? (
            <div className="flex flex-col items-center py-10">
              <div className="w-24 h-24 rounded-full bg-black flex items-center justify-center mb-8 shadow-xl border-4 border-amber-600">
                <span className="text-amber-500 text-4xl font-bold font-mono">21</span>
              </div>
              
              <h3 className="text-xl font-bold mb-6 text-yellow-100/80">Place Your Bet</h3>
              
              {/* Custom bet input */}
              <div className="flex items-center mb-4">
                <div className="flex items-center">
                  <span className="text-yellow-100 mr-2">Bet:</span>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-amber-400" />
                    <Input
                      type="text"
                      value={customBetInput}
                      onChange={handleCustomBetInput}
                      className="pl-9 w-32 bg-black/30 border-amber-600 text-amber-400 focus:ring-amber-500"
                    />
                  </div>
                </div>
              </div>
              
              {/* Number of hands selection */}
              <div className="flex items-center mb-6">
                <span className="text-yellow-100 mr-2">Hands:</span>
                <Button variant="outline" size="icon" onClick={decrementHands} className="bg-black/30 border border-amber-600 hover:bg-black/50 text-amber-500">
                  <Minus className="h-4 w-4" />
                </Button>
                <div className="mx-2 px-4 py-2 bg-black/40 border border-amber-600 rounded-md min-w-[40px] text-center">
                  <span className="text-lg font-bold text-amber-400">{numberOfHands}</span>
                </div>
                <Button variant="outline" size="icon" onClick={incrementHands} className="bg-black/30 border border-amber-600 hover:bg-black/50 text-amber-500">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Total bet calculation */}
              <div className="bg-black/20 rounded-md py-2 px-4 mb-6 border border-amber-700/30">
                <div className="flex items-center">
                  <span className="text-yellow-100 mr-2">Total Bet:</span>
                  <span className="text-amber-400 font-bold">
                    {formatCurrency(parseInt(customBetInput || '0', 10) * numberOfHands)}
                  </span>
                </div>
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
                disabled={parseInt(customBetInput || '0', 10) * numberOfHands > playerBalance}
                className="bg-amber-600 hover:bg-amber-700 text-white border-2 border-amber-300/30 shadow-lg px-8"
              >
                Deal Cards
              </Button>
            </div>
          ) : (
            <div>
              {/* Dealer's area */}
              <div className="mb-8 pt-1">
                <div className="flex items-center mb-2">
                  <h3 className="text-lg font-bold text-yellow-100">Dealer's Hand</h3>
                  <span className="ml-2 px-2 py-1 bg-black/30 border border-amber-700/40 rounded text-sm text-amber-300">
                    {dealerCards.some(card => !card.faceUp) ? '?' : calculateHandValue(dealerCards)}
                  </span>
                </div>
                <div className="flex flex-wrap justify-center">
                  {dealerCards.map((card, index) => renderCard(card, index))}
                </div>
              </div>
              
              {/* Divider */}
              <div className="border-t border-amber-800/30 my-6"></div>
              
              {/* Player's hands area */}
              <div className="mt-6">
                {playerHands.map((hand, index) => renderPlayerHand(hand, index))}
              </div>
              
              {/* Game Over controls and summary */}
              {gameState === 'gameOver' && (
                <div className="mt-6 p-4 rounded-xl border border-amber-700/30 bg-black/20">
                  <div className="text-center mb-4">
                    <h3 className="text-xl font-bold text-amber-400 mb-2">Game Results</h3>
                    <div className="flex justify-center gap-4 text-sm">
                      <div>
                        <span className="text-yellow-100/70">Total Bet:</span>
                        <span className="text-yellow-400 font-bold ml-1">{formatCurrency(totalBet)}</span>
                      </div>
                      <div>
                        <span className="text-yellow-100/70">Net:</span>
                        <span className={`font-bold ml-1 ${totalWinnings >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {totalWinnings >= 0 ? '+' : ''}{formatCurrency(totalWinnings)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-center">
                    <Button 
                      onClick={resetGame} 
                      className="bg-amber-600 hover:bg-amber-700 text-white border border-amber-500/50"
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Play Again
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-4 text-sm text-amber-300/70 text-center italic">
        <p>House Rules: Dealer stands on 17. Blackjack pays 3:2. No insurance offered.</p>
      </div>
    </div>
  );
}