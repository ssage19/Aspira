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
  const imagePathFromId = getPropertyImagePath(id);
  const imagePathFromName = getPropertyImagePath(name);
  const imagePath = imagePathFromId || imagePathFromName;
  
  console.log(`Portfolio property image check - ID: ${id}, Name: ${name}, Path: ${imagePath}`);
  
  // Check if the image exists
  const checkImageExists = (url: string) => {
    const img = new Image();
    img.onload = () => console.log(`Image exists: ${url}`);
    img.onerror = () => console.log(`Image does NOT exist: ${url}`);
    img.src = url;
  };
  
  if (imagePath) {
    checkImageExists(imagePath);
  }
  
  return (
    <div className="space-y-3">
      {imagePath && (
        <div className="mb-2">
          <img 
            src={imagePath} 
            alt={name} 
            className="rounded-md w-full h-48 object-cover"
            onError={(e) => {
              console.error(`Failed to load image: ${imagePath}`);
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
      )}
      <p className="text-sm">{description}</p>
    </div>
  );
}

export default PropertyDescriptionWithImage;