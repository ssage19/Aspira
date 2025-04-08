import { ReactNode, createContext, useContext, useState } from 'react';

// Create a physics context to manage game physics state
interface PhysicsContextType {
  gravity: number;
  friction: number;
  collisions: { [key: string]: boolean };
  registerCollision: (id: string, isColliding: boolean) => void;
}

const PhysicsContext = createContext<PhysicsContextType>({
  gravity: 9.8,
  friction: 0.2,
  collisions: {},
  registerCollision: () => {},
});

// Hook to access physics state
export const usePhysics = () => useContext(PhysicsContext);

// Physics provider component
export function Physics({ children }: { children: ReactNode }) {
  const [collisions, setCollisions] = useState<{ [key: string]: boolean }>({});
  
  const registerCollision = (id: string, isColliding: boolean) => {
    setCollisions(prev => ({
      ...prev,
      [id]: isColliding
    }));
  };
  
  const value = {
    gravity: 9.8,
    friction: 0.2,
    collisions,
    registerCollision
  };
  
  return (
    <PhysicsContext.Provider value={value}>
      {children}
    </PhysicsContext.Provider>
  );
}