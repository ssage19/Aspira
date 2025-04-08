import { useState, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

interface ConfettiProps {
  count?: number;
  spread?: number;
  position?: [number, number, number];
  colors?: string[];
  active?: boolean;
}

export function Confetti({
  count = 100,
  spread = 10,
  position = [0, 10, 0],
  colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'],
  active = false
}: ConfettiProps) {
  const [particles, setParticles] = useState<THREE.Object3D[]>([]);
  const [velocities, setVelocities] = useState<THREE.Vector3[]>([]);
  
  // Create confetti particles when the component mounts or when active changes
  useEffect(() => {
    if (!active) {
      setParticles([]);
      setVelocities([]);
      return;
    }
    
    const newParticles: THREE.Object3D[] = [];
    const newVelocities: THREE.Vector3[] = [];
    
    for (let i = 0; i < count; i++) {
      // Create a simple box for each confetti piece
      const particle = new THREE.Mesh(
        new THREE.BoxGeometry(0.1, 0.1, 0.02),
        new THREE.MeshStandardMaterial({ 
          color: colors[Math.floor(Math.random() * colors.length)],
          metalness: 0.3,
          roughness: 0.5
        })
      );
      
      // Set random initial position
      particle.position.set(
        position[0] + (Math.random() - 0.5) * spread,
        position[1],
        position[2] + (Math.random() - 0.5) * spread
      );
      
      // Set random rotation
      particle.rotation.set(
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2
      );
      
      // Create velocity vector
      const velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 5,
        Math.random() * 10,
        (Math.random() - 0.5) * 5
      );
      
      newParticles.push(particle);
      newVelocities.push(velocity);
    }
    
    setParticles(newParticles);
    setVelocities(newVelocities);
    
    // Clean up after 5 seconds
    const timeout = setTimeout(() => {
      setParticles([]);
      setVelocities([]);
    }, 5000);
    
    return () => clearTimeout(timeout);
  }, [active, count, spread, position, colors]);
  
  // Animate the confetti
  useFrame((_, delta) => {
    const gravity = new THREE.Vector3(0, -9.8, 0);
    
    particles.forEach((particle, i) => {
      // Apply gravity
      velocities[i].add(gravity.clone().multiplyScalar(delta));
      
      // Apply drag
      velocities[i].multiplyScalar(0.98);
      
      // Update position
      particle.position.add(velocities[i].clone().multiplyScalar(delta));
      
      // Rotate the particle
      particle.rotation.x += delta * 5;
      particle.rotation.y += delta * 3;
      particle.rotation.z += delta * 2;
      
      // Remove if it falls below the floor
      if (particle.position.y < -5) {
        particles.splice(i, 1);
        velocities.splice(i, 1);
      }
    });
  });
  
  return (
    <group>
      {particles.map((particle, i) => (
        <primitive key={i} object={particle} />
      ))}
    </group>
  );
}