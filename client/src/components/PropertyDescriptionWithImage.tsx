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
  // Special case handling for commercial properties
  // Map of commercial property IDs to their image paths
  const commercialImages: Record<string, string> = {
    'strip_mall': '/attached_assets/Neighborhood_Strip_Mall.jpg',
    'mall': '/attached_assets/Shopping_Center.jpg',
    'office_small': '/attached_assets/Small_Office_Building.jpg',
    'restaurant_standalone': '/attached_assets/Standalone_Restaurant.jpg',
    'student_housing': '/attached_assets/Student_Housing_Complex.jpg',
    'urgent_care': '/attached_assets/Urgent_Care_Center.jpg',
    'medical_office': '/attached_assets/Medical_Office_Building.jpg'
  };
  
  // First, check if this is a commercial property
  if (id === 'strip_mall' || id.includes('commercial') || id.includes('retail') || 
      id.includes('office') || id.includes('mall')) {
    console.log(`PropertyDescriptionWithImage - COMMERCIAL PROPERTY DETECTED: ${id}`);
    
    // Use direct path for specific commercial properties
    const imagePath = commercialImages[id] || `/attached_assets/${name.replace(/\s+/g, '_')}.jpg`;
    console.log(`PropertyDescriptionWithImage - Using direct path for commercial: ${imagePath}`);
    
    // Force image to render with explicit URL for commercial properties
    return (
      <div className="space-y-3">
        <div className="mb-2">
          {id === 'strip_mall' && (
            <img 
              src="/attached_assets/Neighborhood_Strip_Mall.jpg" 
              alt={name} 
              className="rounded-md w-full h-48 object-cover"
            />
          )}
          {id === 'mall' && (
            <img 
              src="/attached_assets/Shopping_Center.jpg" 
              alt={name} 
              className="rounded-md w-full h-48 object-cover"
            />
          )}
          {id === 'office_small' && (
            <img 
              src="/attached_assets/Small_Office_Building.jpg" 
              alt={name} 
              className="rounded-md w-full h-48 object-cover"
            />
          )}
          {id === 'restaurant_standalone' && (
            <img 
              src="/attached_assets/Standalone_Restaurant.jpg" 
              alt={name} 
              className="rounded-md w-full h-48 object-cover"
            />
          )}
          {id !== 'strip_mall' && id !== 'mall' && id !== 'office_small' && id !== 'restaurant_standalone' && (
            <img 
              src={imagePath}
              alt={name} 
              className="rounded-md w-full h-48 object-cover"
              onError={(e) => {
                console.error(`Failed to load commercial image: ${imagePath}`);
                e.currentTarget.style.display = 'none';
              }}
            />
          )}
        </div>
        <p className="text-sm">{description}</p>
      </div>
    );
  }
  // Get property image path with detailed logging
  console.log(`PropertyDescriptionWithImage - Finding image for property - ID: ${id}, Name: ${name}`);
  const imagePathFromId = getPropertyImagePath(id);
  console.log(`PropertyDescriptionWithImage - Image path from ID: ${imagePathFromId}`);
  const imagePathFromName = getPropertyImagePath(name);
  console.log(`PropertyDescriptionWithImage - Image path from Name: ${imagePathFromName}`);
  
  // Try both ID and name for maximum compatibility
  const imagePath = imagePathFromId || imagePathFromName;
  console.log(`PropertyDescriptionWithImage - FINAL Image Path selected: ${imagePath}`);
  
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