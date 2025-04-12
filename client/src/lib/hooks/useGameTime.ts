import { useTime } from '../stores/useTime';
import { useEffect, useState } from 'react';

interface GameTimeHook {
  gameTime: Date;
  formattedDate: string;
}

/**
 * A hook that provides the current game time as a JavaScript Date object
 * Also provides a formatted date string
 */
export const useGameTime = (): GameTimeHook => {
  const { currentDay, currentMonth, currentYear } = useTime();
  const [gameTime, setGameTime] = useState<Date>(new Date());
  const [formattedDate, setFormattedDate] = useState<string>('');
  
  useEffect(() => {
    const date = new Date(currentYear, currentMonth - 1, currentDay);
    setGameTime(date);
    
    setFormattedDate(date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    }));
  }, [currentDay, currentMonth, currentYear]);
  
  return { gameTime, formattedDate };
};