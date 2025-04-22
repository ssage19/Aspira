import React from 'react';
import { User, Loader2 } from 'lucide-react';
import { useCharacter } from '../lib/stores/useCharacter';
import { getAccessoryById } from '../lib/data/avatarAccessories';

interface CustomAvatarPreviewProps {
  size?: 'sm' | 'md' | 'lg';
  showPlaceholder?: boolean;
}

export default function CustomAvatarPreview({ 
  size = 'md', 
  showPlaceholder = true
}: CustomAvatarPreviewProps) {
  const character = useCharacter();
  const selectedAccessories = character.selectedAccessories || {};
  
  // Check if there's an avatar URL, in which case we'll still display the Ready Player Me avatar
  if (character.avatarUrl) {
    return (
      <div className={`
        ${size === 'sm' ? 'w-16 h-16' : ''} 
        ${size === 'md' ? 'w-24 h-24' : ''} 
        ${size === 'lg' ? 'w-40 h-40' : ''} 
        rounded-full overflow-hidden relative bg-gray-100
      `}>
        <img 
          src={character.avatarUrl} 
          alt="Character Avatar" 
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = "";
            e.currentTarget.classList.add("fallback");
          }} 
        />
        {/* Fallback if image loading fails */}
        <div className="absolute inset-0 flex items-center justify-center fallback:block hidden">
          <User size={size === 'sm' ? 24 : size === 'md' ? 32 : 48} className="text-gray-400" />
        </div>
      </div>
    );
  }
  
  // Custom avatar visualization
  const renderCustomAvatar = () => {
    // Here we can show a visualization of the custom avatar based on the selected accessories
    const accessoryItems = Object.entries(selectedAccessories).map(([type, id]) => {
      const accessory = getAccessoryById(id);
      return accessory ? (
        <div key={id} className="text-xs text-gray-600">
          {accessory.name}
        </div>
      ) : null;
    });
    
    return (
      <div className="flex flex-col items-center justify-center w-full h-full">
        <div className="mb-2">
          <User size={size === 'sm' ? 24 : size === 'md' ? 32 : 48} className="text-primary" />
        </div>
        <div className="text-xs font-medium">Custom Avatar</div>
        <div className="text-xs text-gray-500 mt-1">
          {accessoryItems.length > 0 ? (
            <div className="flex flex-col items-center">{accessoryItems}</div>
          ) : (
            <span>No accessories selected</span>
          )}
        </div>
      </div>
    );
  };
  
  return (
    <div className={`
      ${size === 'sm' ? 'w-16 h-16' : ''} 
      ${size === 'md' ? 'w-24 h-24' : ''} 
      ${size === 'lg' ? 'w-40 h-40' : ''} 
      rounded-full overflow-hidden relative bg-gray-100 flex items-center justify-center
    `}>
      {renderCustomAvatar()}
    </div>
  );
}