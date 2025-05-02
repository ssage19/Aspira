import React from 'react';
import { getPropertyImagePath, getCommercialPropertyImagePath, determinePropertyCategory, PropertyCategory } from '@/lib/utils';

// Define interfaces for better separation of concerns (ISP)
interface PropertyDescriptor {
  id: string;
  name: string;
  description: string;
}

interface PropertyImageProps {
  src: string;
  alt: string;
  className?: string;
  onError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
}

// Main component props following Interface Segregation Principle
interface PropertyDescriptionWithImageProps extends PropertyDescriptor {}

// Separate component for property image following SRP
function PropertyImage({ src, alt, className = "rounded-md w-full h-48 object-cover", onError }: PropertyImageProps) {
  return (
    <div className="mb-2">
      <img 
        src={src} 
        alt={alt} 
        className={className}
        onError={onError || ((e) => {
          console.error(`Failed to load image: ${src}`);
          e.currentTarget.style.display = 'none';
        })}
      />
    </div>
  );
}

// Separate component for property description following SRP
function PropertyDescription({ description }: { description: string }) {
  return <p className="text-sm">{description}</p>;
}

// Main component following SRP and OCP
export function PropertyDescriptionWithImage({ description, id, name }: PropertyDescriptionWithImageProps) {
  // Get the property category
  const category = determinePropertyCategory(id);
  
  // Get the appropriate image path based on property category
  let imagePath: string | null = null;
  
  if (category === PropertyCategory.Commercial) {
    // Commercial properties use specialized image handling
    imagePath = getCommercialPropertyImagePath(id);
  } else {
    // All other property types use the standard image path resolution
    imagePath = getPropertyImagePath(id) || getPropertyImagePath(name);
  }
  
  return (
    <div className="space-y-3">
      {imagePath && <PropertyImage src={imagePath} alt={name} />}
      <PropertyDescription description={description} />
    </div>
  );
}

export default PropertyDescriptionWithImage;