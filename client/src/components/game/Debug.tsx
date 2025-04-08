import { useEffect, useState } from 'react';
import { useKeyboardControls } from '@react-three/drei';
import { Controls } from './Game';
import { Stats, useHelper } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

export function Debug() {
  const { scene, camera } = useThree();
  const [fps, setFps] = useState(0);
  const [keyPresses, setKeyPresses] = useState({
    forward: false,
    back: false,
    left: false,
    right: false,
    jump: false,
  });
  
  // Add camera helper
  useHelper(camera as React.MutableRefObject<THREE.PerspectiveCamera>, THREE.CameraHelper);
  
  // Calculate FPS
  useEffect(() => {
    let lastTime = performance.now();
    let frames = 0;
    
    const calculateFps = () => {
      const now = performance.now();
      frames++;
      
      if (now >= lastTime + 1000) {
        setFps(frames);
        frames = 0;
        lastTime = now;
      }
      
      requestAnimationFrame(calculateFps);
    };
    
    const animFrameId = requestAnimationFrame(calculateFps);
    return () => cancelAnimationFrame(animFrameId);
  }, []);
  
  // Monitor keyboard state for debugging
  useEffect(() => {
    // Get keyboard controls and subscribe to them
    const [subscribeKeys, getKeys] = useKeyboardControls<Controls>();
    
    // Forward key
    const unsubForward = subscribeKeys(
      state => state.forward,
      forwardPressed => setKeyPresses(prev => ({ ...prev, forward: forwardPressed }))
    );
    
    // Back key
    const unsubBack = subscribeKeys(
      state => state.back,
      backPressed => setKeyPresses(prev => ({ ...prev, back: backPressed }))
    );
    
    // Left key
    const unsubLeft = subscribeKeys(
      state => state.left,
      leftPressed => setKeyPresses(prev => ({ ...prev, left: leftPressed }))
    );
    
    // Right key
    const unsubRight = subscribeKeys(
      state => state.right,
      rightPressed => setKeyPresses(prev => ({ ...prev, right: rightPressed }))
    );
    
    // Jump key
    const unsubJump = subscribeKeys(
      state => state.jump,
      jumpPressed => setKeyPresses(prev => ({ ...prev, jump: jumpPressed }))
    );
    
    // Cleanup
    return () => {
      unsubForward();
      unsubBack();
      unsubLeft();
      unsubRight();
      unsubJump();
    };
  }, []);
  
  // Handle keyboard input for debug functions
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'KeyG') {
        // Toggle grid helper
        const existingGrid = scene.getObjectByName('debugGrid');
        if (existingGrid) {
          scene.remove(existingGrid);
        } else {
          const gridHelper = new THREE.GridHelper(100, 100);
          gridHelper.name = 'debugGrid';
          scene.add(gridHelper);
        }
      }
      
      if (e.code === 'KeyH') {
        // Toggle axes helper
        const existingAxes = scene.getObjectByName('debugAxes');
        if (existingAxes) {
          scene.remove(existingAxes);
        } else {
          const axesHelper = new THREE.AxesHelper(5);
          axesHelper.name = 'debugAxes';
          scene.add(axesHelper);
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [scene]);
  
  return (
    <>
      {/* Performance stats */}
      <Stats />
      
      {/* Debug info overlay */}
      <group position={[0, 0, -5]}>
        <mesh position={[0, 7, 0]}>
          <planeGeometry args={[10, 5]} />
          <meshBasicMaterial color="black" transparent opacity={0.7} />
        </mesh>
      </group>
      
      {/* Debug UI text */}
      <sprite position={[-4, 8, -4.9]} scale={[8, 4, 1]}>
        <spriteMaterial
          transparent
          depthTest={false}
        >
          <canvasTexture
            attach="map"
            image={(() => {
              const canvas = document.createElement('canvas');
              canvas.width = 512;
              canvas.height = 256;
              const context = canvas.getContext('2d');
              
              if (context) {
                context.fillStyle = 'white';
                context.font = '24px Arial';
                context.fillText(`FPS: ${fps}`, 20, 40);
                context.fillText(`Keys:`, 20, 80);
                context.fillText(`- Forward: ${keyPresses.forward ? 'PRESSED' : 'released'}`, 30, 110);
                context.fillText(`- Back: ${keyPresses.back ? 'PRESSED' : 'released'}`, 30, 140);
                context.fillText(`- Left: ${keyPresses.left ? 'PRESSED' : 'released'}`, 30, 170);
                context.fillText(`- Right: ${keyPresses.right ? 'PRESSED' : 'released'}`, 30, 200);
                context.fillText(`- Jump: ${keyPresses.jump ? 'PRESSED' : 'released'}`, 30, 230);
              }
              
              return canvas;
            })()}
          />
        </spriteMaterial>
      </sprite>
      
      {/* Add grid helper by default */}
      <gridHelper args={[100, 100]} position={[0, 0.01, 0]} />
      
      {/* Add axes helper by default */}
      <axesHelper args={[5]} />
    </>
  );
}