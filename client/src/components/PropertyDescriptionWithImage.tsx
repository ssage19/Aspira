import React from 'react';
import { getPropertyImagePath } from '@/lib/utils';

interface PropertyDescriptionWithImageProps {
  description: string;
  id: string;
  name: string;
}

export function PropertyDescriptionWithImage({ 
  description, 
  id, 
  name 
}: PropertyDescriptionWithImageProps) {
  // Get property image path
  const imagePath = getPropertyImagePath(id) || getPropertyImagePath(name);
  
  return (
    <div className="space-y-3">
      {imagePath && (
        <div className="mb-2">
          <img 
            src={imagePath} 
            alt={name} 
            className="rounded-md w-full h-48 object-cover"
          />
        </div>
      )}
      <p className="text-sm">{description}</p>
    </div>
  );
}

export default PropertyDescriptionWithImage;