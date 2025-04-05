import React, { useMemo } from 'react';
import { useCharacter } from '../lib/stores/useCharacter';
import { useEconomy, EconomyState } from '../lib/stores/useEconomy';

// Improved MainScene that's stable and visually appealing without 3D/WebGL
function MainScene() {
  const { properties } = useCharacter();
  const { economyState } = useEconomy();
  
  // Pre-compute random positions for clouds to avoid rerenders
  const cloudPositions = useMemo(() => {
    return Array(5).fill(0).map(() => ({
      top: `${Math.floor(Math.random() * 80)}%`,
      left: `${Math.floor(Math.random() * 80)}%`,
      width: `${Math.floor(Math.random() * 120) + 80}px`,
      height: `${Math.floor(Math.random() * 40) + 30}px`,
      opacity: Math.random() * 0.3 + 0.1,
      animationDelay: `${Math.random() * 20}s`,
    }));
  }, []);
  
  // Determine background based on economy state
  const getBackgroundGradient = () => {
    switch (economyState) {
      case 'boom': 
        return 'linear-gradient(to bottom, #87CEEB, #4CAF50)';
      case 'recession': 
        return 'linear-gradient(to bottom, #2c3e50, #34495e)';
      case 'stable': 
        return 'linear-gradient(to bottom, #3498db, #2980b9)';
      default: 
        return 'linear-gradient(to bottom, #87CEEB, #45b1e8)';
    }
  };
  
  const bgGradient = getBackgroundGradient();
  
  return (
    <div 
      className="relative w-full h-full overflow-hidden transition-all duration-1000"
      style={{ 
        background: bgGradient,
      }}
    >
      {/* Animated clouds */}
      {cloudPositions.map((cloud, index) => (
        <div 
          key={`cloud-${index}`}
          className="absolute rounded-full bg-white blur-md animate-float"
          style={{ 
            width: cloud.width,
            height: cloud.height,
            top: cloud.top,
            left: cloud.left, 
            opacity: cloud.opacity,
            animationDelay: cloud.animationDelay
          }}
        />
      ))}
      
      {/* City skyline */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-1/3 bg-opacity-70"
        style={{ 
          backgroundImage: "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 1000 200\"><path d=\"M0,200 L0,120 L40,120 L40,100 L60,100 L60,80 L80,80 L80,100 L100,100 L100,70 L120,70 L120,100 L140,100 L140,120 L180,120 L180,60 L200,60 L200,40 L220,40 L220,60 L240,60 L240,30 L260,30 L260,60 L300,60 L300,90 L340,90 L340,60 L360,60 L360,40 L380,40 L380,60 L400,60 L400,80 L440,80 L440,120 L480,120 L480,70 L500,70 L500,40 L520,40 L520,70 L540,70 L540,90 L560,90 L560,70 L580,70 L580,90 L600,90 L600,110 L620,110 L620,80 L640,80 L640,60 L660,60 L660,40 L680,40 L680,60 L700,60 L700,100 L740,100 L740,120 L780,120 L780,90 L800,90 L800,70 L820,70 L820,90 L840,90 L840,110 L860,110 L860,80 L880,80 L880,60 L900,60 L900,80 L920,80 L920,100 L940,100 L940,120 L960,120 L960,100 L980,100 L980,120 L1000,120 L1000,200 Z\" fill=\"%23333333\"/></svg>')",
          backgroundRepeat: 'repeat-x',
          backgroundSize: 'contain',
          backgroundPosition: 'bottom',
        }}
      />
      
      {/* Properties positioned in a grid */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="grid grid-cols-3 gap-6 max-w-3xl">
          {Array.isArray(properties) && properties.map((property, index) => (
            <PropertyIndicator 
              key={property.id}
              property={property}
              index={index}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// Separate component for property indicators to optimize rendering
const PropertyIndicator = React.memo(({ property, index }: { property: any, index: number }) => {
  return (
    <div 
      className="relative animate-pulse rounded-lg shadow-lg overflow-hidden transform transition-all duration-500 hover:scale-105"
      style={{
        width: '80px',
        height: '80px',
        background: getPropertyColor(property.type),
      }}
    >
      <div 
        className="absolute inset-0 flex flex-col items-center justify-center text-white p-2"
        style={{ textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)' }}
      >
        <div className="text-2xl">{getPropertyIcon(property.type)}</div>
        <div className="text-xs font-semibold mt-1 text-center truncate w-full">
          {property.name}
        </div>
      </div>
    </div>
  );
});

// Helper functions for the view
function getPropertyColor(type: string): string {
  switch (type) {
    case 'residential': return 'rgba(76, 175, 80, 0.8)'; // Green with opacity
    case 'commercial': return 'rgba(33, 150, 243, 0.8)'; // Blue with opacity
    case 'industrial': return 'rgba(255, 152, 0, 0.8)';  // Orange with opacity
    case 'land': return 'rgba(121, 85, 72, 0.8)';        // Brown with opacity
    case 'special': return 'rgba(156, 39, 176, 0.8)';    // Purple with opacity
    default: return 'rgba(96, 125, 139, 0.8)';           // Blue-grey with opacity
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
