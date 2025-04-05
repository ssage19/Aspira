import React from 'react';
import { useCharacter } from '../lib/stores/useCharacter';

// Completely simplified MainScene that doesn't use any 3D or WebGL
// This is a fallback to prevent crashes

export function MainScene() {
  const { properties } = useCharacter();
  
  // Create a simple gradient background instead of 3D scene
  return (
    <div 
      style={{ 
        position: 'relative', 
        width: '100%', 
        height: '100%',
        background: 'linear-gradient(to bottom, #87CEEB, #45b1e8)',
        overflow: 'hidden'
      }}
    >
      {/* Simple decorative elements */}
      <div className="absolute inset-0 flex items-center justify-center opacity-10">
        <div className="flex flex-wrap justify-center items-center w-full gap-8">
          {/* Simple cloud shapes */}
          <div className="bg-white rounded-full w-32 h-16 absolute top-1/4 left-1/4 blur-md"></div>
          <div className="bg-white rounded-full w-48 h-20 absolute top-1/3 right-1/4 blur-md"></div>
          <div className="bg-white rounded-full w-24 h-12 absolute bottom-1/3 left-1/3 blur-md"></div>
          
          {/* Property visual indicators - simplified */}
          {Array.isArray(properties) && properties.map((property, index) => (
            <div 
              key={property.id}
              className="relative animate-pulse"
              style={{
                width: '60px',
                height: '60px',
                background: getPropertyColor(property.type),
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                transform: `translate(${(index % 5) * 120 - 240}px, ${Math.floor(index / 5) * 100 - 100}px)`,
                opacity: 0.7
              }}
            >
              <div 
                className="absolute inset-0 flex items-center justify-center text-white font-bold text-lg"
                style={{ textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)' }}
              >
                {getPropertyIcon(property.type)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Helper functions for the simplified view
function getPropertyColor(type: string): string {
  switch (type) {
    case 'residential': return '#4CAF50';
    case 'commercial': return '#2196F3';
    case 'industrial': return '#FF9800';
    case 'land': return '#795548';
    case 'special': return '#9C27B0';
    default: return '#607D8B';
  }
}

function getPropertyIcon(type: string): string {
  switch (type) {
    case 'residential': return '🏠';
    case 'commercial': return '🏢';
    case 'industrial': return '🏭';
    case 'land': return '🌳';
    case 'special': return '🏆';
    default: return '🏡';
  }
}

export default MainScene;
