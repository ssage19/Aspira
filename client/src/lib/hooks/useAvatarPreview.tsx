import { useState, useEffect } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';

export function useAvatarPreview(url: string | null) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(url);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  // Attempt to convert GLB URL to image preview URL
  useEffect(() => {
    if (!url) {
      setAvatarUrl(null);
      setPreviewUrl(null);
      setIsLoading(false);
      return;
    }
    
    setAvatarUrl(url);
    setIsLoading(true);
    setError(null);
    
    if (url.includes('readyplayer.me') && url.endsWith('.glb')) {
      // For Ready Player Me GLB models, we can use their automatic preview image
      const previewUrl = url.replace('.glb', '.png');
      setPreviewUrl(previewUrl);
      setIsLoading(false);
    } else {
      // For other URLs, just use as is
      setPreviewUrl(url);
      setIsLoading(false);
    }
  }, [url]);
  
  return {
    isLoading,
    error,
    avatarUrl,
    previewUrl,
    isGLB: avatarUrl?.endsWith('.glb') || false
  };
}

// For loading actual 3D model
export function AvatarModel({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  const { camera } = useThree();
  
  useEffect(() => {
    if (camera && scene) {
      // Position camera to see the avatar
      camera.position.set(0, 1.5, 2);
      camera.lookAt(0, 1, 0);
      
      // Center the model
      const box = new THREE.Box3().setFromObject(scene);
      const center = box.getCenter(new THREE.Vector3());
      scene.position.x = -center.x;
      scene.position.y = -center.y;
      scene.position.z = -center.z;
    }
  }, [camera, scene]);
  
  return <primitive object={scene} />;
}