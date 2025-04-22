import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { User, Skull } from 'lucide-react';
import { useAvatarPreview, AvatarModel } from '@/lib/hooks/useAvatarPreview';

interface AvatarPreviewProps {
  url: string | null;
  className?: string;
}

export function AvatarPreview({ url, className = "" }: AvatarPreviewProps) {
  const { isLoading, error, previewUrl, isGLB } = useAvatarPreview(url);
  
  if (!url) {
    return (
      <div className={`flex flex-col items-center justify-center p-4 bg-muted/50 ${className}`}>
        <User className="h-12 w-12 text-muted-foreground" />
        <p className="mt-2 text-sm text-muted-foreground">No avatar selected</p>
      </div>
    );
  }
  
  if (isLoading) {
    return (
      <div className={`flex items-center justify-center p-4 bg-muted/50 ${className}`}>
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className={`flex flex-col items-center justify-center p-4 bg-muted/50 ${className}`}>
        <div className="h-12 w-12 text-destructive">⚠️</div>
        <p className="mt-2 text-sm text-destructive">Error loading avatar</p>
      </div>
    );
  }
  
  // If it's a GLB file, try to render it using both the 3D renderer and a fallback image
  if (isGLB) {
    return (
      <div className={`relative ${className}`}>
        {/* Show the PNG preview as fallback */}
        {previewUrl && (
          <img 
            src={previewUrl} 
            alt="Avatar Preview" 
            className="absolute inset-0 w-full h-full object-contain"
            style={{ opacity: 0.3 }}
          />
        )}
        
        {/* Render the 3D model */}
        <Canvas className="w-full h-full">
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <PerspectiveCamera makeDefault position={[0, 1.5, 2]} />
          <Suspense fallback={null}>
            {url && <AvatarModel url={url} />}
          </Suspense>
          <OrbitControls 
            enableZoom={false}
            minPolarAngle={Math.PI / 4}
            maxPolarAngle={Math.PI / 1.5}
          />
        </Canvas>
        
        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
          3D Model
        </div>
      </div>
    );
  }
  
  // Otherwise, just show it as an image
  return (
    <div className={`relative ${className}`}>
      <img 
        src={previewUrl || url} 
        alt="Avatar" 
        className="w-full h-full object-contain"
        onError={(e) => {
          console.error('Failed to load avatar image:', url);
          e.currentTarget.style.display = 'none';
        }}
      />
      <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
        2D Image
      </div>
    </div>
  );
}

export default AvatarPreview;