import { useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, Stars, useTexture } from '@react-three/drei';
import { useCharacter } from '../lib/stores/useCharacter';
import * as THREE from 'three';

// Futuristic grid background
const GridBackground = () => {
  const gridRef = useRef<THREE.Mesh>(null);
  
  useEffect(() => {
    if (gridRef.current) {
      const animation = () => {
        if (gridRef.current) {
          gridRef.current.rotation.x += 0.0005;
          gridRef.current.rotation.y += 0.0003;
        }
        requestAnimationFrame(animation);
      };
      
      animation();
    }
  }, []);
  
  return (
    <mesh ref={gridRef} position={[0, 0, -50]} rotation={[0.1, 0.1, 0]}>
      <sphereGeometry args={[50, 24, 24]} />
      <meshStandardMaterial 
        color="#116466" 
        emissive="#116466"
        emissiveIntensity={0.3}
        side={THREE.BackSide} 
        wireframe={true} 
        transparent={true}
        opacity={0.4}
      />
    </mesh>
  );
};

// Geometric patterns like in the image
const GeometricShapes = () => {
  const shapeRef = useRef<THREE.Group>(null);
  
  useEffect(() => {
    if (shapeRef.current) {
      const animation = () => {
        if (shapeRef.current) {
          shapeRef.current.rotation.z += 0.001;
        }
        requestAnimationFrame(animation);
      };
      
      animation();
    }
  }, []);
  
  return (
    <group ref={shapeRef} position={[0, 0, -15]}>
      {/* Central design similar to the geometric pattern in the image */}
      <mesh>
        <torusGeometry args={[10, 0.2, 16, 16]} />
        <meshStandardMaterial color="#FFCB9A" emissive="#FFCB9A" emissiveIntensity={0.5} />
      </mesh>
      
      {/* Intersecting lines */}
      {Array.from({ length: 8 }).map((_, i) => (
        <mesh key={i} rotation={[0, 0, (Math.PI * i) / 4]}>
          <cylinderGeometry args={[0.1, 0.1, 20, 8]} />
          <meshStandardMaterial color="#D9B08C" emissive="#D9B08C" emissiveIntensity={0.5} />
        </mesh>
      ))}
      
      {/* Outer ring */}
      <mesh>
        <ringGeometry args={[14, 14.5, 64]} />
        <meshStandardMaterial color="#116466" emissive="#116466" emissiveIntensity={0.3} />
      </mesh>
    </group>
  );
};

export function MainScene() {
  const { wealth } = useCharacter();
  
  return (
    <Canvas shadows>
      <color attach="background" args={["#2C3531"]} />
      
      {/* Camera */}
      <PerspectiveCamera makeDefault position={[0, 0, 20]} fov={50} />
      <OrbitControls 
        enablePan={false}
        enableRotate={false}
        enableZoom={false}
      />
      
      {/* Lighting */}
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 0, 10]} intensity={1} color="#116466" />
      <spotLight position={[5, 5, 20]} angle={0.3} penumbra={1} intensity={1} color="#D9B08C" />
      
      {/* Futuristic background elements */}
      <GridBackground />
      <GeometricShapes />
      <Stars radius={100} depth={50} count={2000} factor={4} fade={true} />
    </Canvas>
  );
}

export default MainScene;
