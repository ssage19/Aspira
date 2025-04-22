import React from 'react';
import { useCharacter } from '../lib/stores/useCharacter';

interface CustomAvatarPreviewProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showPlaceholder?: boolean;
}

export default function CustomAvatarPreview({ 
  size = 'md',
  showPlaceholder = false
}: CustomAvatarPreviewProps) {
  // Get character state (we won't use most of this for now)
  const character = useCharacter();
  
  // Size classes for the container
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-32 h-32',
    lg: 'w-48 h-48',
    xl: 'w-64 h-64'
  };
  
  // Simple SVG avatar - an abstract representation with business/casual outfit based on selection
  const getAvatarSVG = () => {
    // Change tie color based on outfit selection
    const outfitType = character.selectedAccessories?.outfit || "";
    const isBusinessOutfit = outfitType === 'outfit_business';
    const tieColor = isBusinessOutfit ? '#CC3333' : '#4267B2';
    const jacketColor = isBusinessOutfit ? '#333333' : '#5591AF';
    
    return (
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* Background circle */}
        <circle cx="50" cy="50" r="48" fill="#FAFAFA" />
        
        {/* Head */}
        <circle cx="50" cy="35" r="20" fill="#F5D0A9" />
        
        {/* Hair */}
        <path 
          d="M30 30 Q50 0 70 30" 
          fill="#3B2E1F" 
          stroke="none" 
        />
        
        {/* Eyes */}
        <circle cx="42" cy="32" r="3" fill="#333" />
        <circle cx="58" cy="32" r="3" fill="#333" />
        
        {/* Smile */}
        <path 
          d="M40 42 Q50 50 60 42" 
          fill="none" 
          stroke="#333"
          strokeWidth="1.5"
        />
        
        {/* Jacket */}
        <path 
          d="M30 55 L40 90 L50 75 L60 90 L70 55 Q60 65 50 60 Q40 65 30 55" 
          fill={jacketColor} 
        />
        
        {/* Shirt */}
        <path 
          d="M40 55 L50 72 L60 55" 
          fill="white" 
        />
        
        {/* Tie or casual accent */}
        <path 
          d="M50 55 L47 65 L50 75 L53 65 Z" 
          fill={tieColor} 
        />
        
        {/* Add glasses if selected */}
        {character.selectedAccessories?.eyewear && (
          <>
            <circle cx="42" cy="32" r="6" fill="none" stroke="#555" strokeWidth="1.5" />
            <circle cx="58" cy="32" r="6" fill="none" stroke="#555" strokeWidth="1.5" />
            <line x1="48" y1="32" x2="52" y2="32" stroke="#555" strokeWidth="1.5" />
          </>
        )}
      </svg>
    );
  };
  
  return (
    <div className={`${sizeClasses[size]} rounded-md overflow-hidden bg-gradient-to-b from-slate-800 to-slate-900 flex items-center justify-center`}>
      {showPlaceholder ? (
        <div className="flex items-center justify-center text-muted-foreground">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="5" />
            <path d="M20 21a8 8 0 0 0-16 0" />
          </svg>
        </div>
      ) : (
        <div className="w-5/6 h-5/6">
          {getAvatarSVG()}
        </div>
      )}
    </div>
  );
}