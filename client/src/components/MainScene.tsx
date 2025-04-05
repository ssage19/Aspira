import React, { useRef, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, Stars } from '@react-three/drei';
import { useCharacter } from '../lib/stores/useCharacter';
import Character from './Character';
import PropertyCard from './PropertyCard';

// Error boundary fallback component
function WebGLErrorFallback() {
  return (
    <div className="webgl-error-fallback">
      <div style={{
        padding: '20px', 
        background: '#f8d7da', 
        color: '#721c24',
        border: '1px solid #f5c6cb',
        borderRadius: '4px',
        margin: '20px',
        textAlign: 'center'
      }}>
        <h3>3D Rendering Error</h3>
        <p>We encountered an issue with the 3D scene.</p>
        <p>The game will continue to function normally, but without the 3D visualization.</p>
      </div>
    </div>
  );
}

// Simple error boundary component for Three.js scene elements
class ErrorBoundary extends React.Component<{
  children: React.ReactNode;
  fallback: React.ReactNode;
}> {
  state = { hasError: false };
  
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  
  componentDidCatch(error: Error) {
    console.error('Error in 3D scene component:', error);
  }
  
  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

export function MainScene() {
  const { wealth, properties } = useCharacter();
  const [hasError, setHasError] = useState(false);
  
  // Calculate camera position based on wealth level - with NaN protection
  const validWealth = (typeof wealth === 'number' && !isNaN(wealth)) ? wealth : 0;
  const cameraHeight = Math.min(10 + (validWealth / 1000000) * 5, 30);
  
  // Handler for WebGL context loss
  const handleContextLoss = () => {
    console.log('THREE.WebGLRenderer: Context Lost. Handling gracefully.');
    setHasError(true);
  };
  
  // If there was a rendering error, show a fallback
  if (hasError) {
    return <WebGLErrorFallback />;
  }
  
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* The Canvas is wrapped in an error boundary */}
      <Canvas 
        shadows 
        onCreated={({ gl }) => {
          // Set up canvas with error handling
          gl.setClearColor("#87CEEB");
          
          // Add event listener for context lost
          gl.domElement.addEventListener('webglcontextlost', (event) => {
            event.preventDefault();
            handleContextLoss();
          }, false);
        }}
        style={{ background: '#87CEEB' }}
      >
        <color attach="background" args={["#87CEEB"]} />
        
        {/* Scene contents wrapped in error boundaries */}
        <ErrorBoundary fallback={null}>
          {/* Camera */}
          <PerspectiveCamera makeDefault position={[0, cameraHeight, 20]} fov={45} />
          <OrbitControls 
            enablePan={false}
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={Math.PI / 2.5}
            minDistance={10}
            maxDistance={50}
          />
          
          {/* Lighting */}
          <ambientLight intensity={0.5} />
          <directionalLight 
            position={[10, 15, 10]} 
            intensity={1.5} 
            castShadow 
            shadow-mapSize-width={1024} 
            shadow-mapSize-height={1024} 
          />
          
          {/* Scenery - simpler to prevent crashes */}
          <Environment preset="sunset" />
          {validWealth > 10000000 && <Stars radius={100} depth={50} count={2500} factor={4} />}
        </ErrorBoundary>
        
        <ErrorBoundary fallback={null}>
          {/* Ground */}
          <mesh 
            rotation={[-Math.PI / 2, 0, 0]} 
            position={[0, -0.5, 0]} 
            receiveShadow
          >
            <planeGeometry args={[1000, 1000]} />
            <meshStandardMaterial color="#8ab56a" />
          </mesh>
          
          {/* Character */}
          <Character position={[0, 0, 0]} scale={1} />
        </ErrorBoundary>
        
        <ErrorBoundary fallback={null}>
          {/* Properties - with safe array handling */}
          {Array.isArray(properties) && properties.map((property, index) => {
            // Calculate property position in a semi-circle around the character
            const angle = (index / Math.max(1, properties.length)) * Math.PI;
            const radius = 8 + (index % 3) * 4;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            
            return (
              <PropertyCard 
                key={property.id}
                property={property}
                position={[x, 0, z]}
              />
            );
          })}
        </ErrorBoundary>
      </Canvas>
    </div>
  );
}

export default MainScene;
