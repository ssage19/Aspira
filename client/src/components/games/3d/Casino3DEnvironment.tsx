import { useRef, useState, useEffect, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { 
  useKeyboardControls, 
  OrbitControls, 
  useGLTF, 
  PerspectiveCamera, 
  Environment, 
  SpotLight,
  Text,
  Sky
} from "@react-three/drei";
import * as THREE from "three";
import { GLTF } from "three-stdlib";

// Preload the models
useGLTF.preload('/models/poker_table.glb');
useGLTF.preload('/models/blackjack_table.glb');
useGLTF.preload('/models/roulette_table.glb');

// Define the keyboard controls for movement
enum Controls {
  forward = 'forward',
  back = 'back',
  left = 'left',
  right = 'right',
  jump = 'jump',
}

// Table Models
function PokerTable({ position = [0, 0, 0] as [number, number, number] }) {
  const { scene } = useGLTF('/models/poker_table.glb') as GLTF & {
    scene: THREE.Group
  };
  const modelRef = useRef<THREE.Group>(null);
  
  useEffect(() => {
    if (scene) {
      // Scale the model to appropriate size
      scene.scale.set(2.5, 2.5, 2.5);
      
      // Add shadows to all meshes
      scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      
      // Log successful loading
      console.log("Poker table model loaded successfully");
    }
  }, [scene]);
  
  return (
    <group ref={modelRef} position={position}>
      <primitive object={scene.clone()} />
      <spotLight 
        position={[0, 5, 0]} 
        intensity={0.5} 
        angle={0.5} 
        penumbra={0.5} 
        castShadow 
      />
      {/* Text label for the table */}
      <mesh position={[0, 1.5, 0]}>
        <boxGeometry args={[3, 0.5, 0.1]} />
        <meshStandardMaterial color="gold" />
      </mesh>
    </group>
  );
}

function BlackjackTable({ position = [0, 0, 0] as [number, number, number] }) {
  const { scene } = useGLTF('/models/blackjack_table.glb') as GLTF & {
    scene: THREE.Group
  };
  const modelRef = useRef<THREE.Group>(null);
  
  useEffect(() => {
    if (scene) {
      // Scale the model to appropriate size
      scene.scale.set(2.5, 2.5, 2.5);
      
      // Add shadows to all meshes
      scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      
      // Log successful loading
      console.log("Blackjack table model loaded successfully");
    }
  }, [scene]);
  
  return (
    <group ref={modelRef} position={position}>
      <primitive object={scene.clone()} />
      <spotLight 
        position={[0, 5, 0]} 
        intensity={0.5} 
        angle={0.5} 
        penumbra={0.5} 
        castShadow 
      />
      {/* Text label for the table */}
      <mesh position={[0, 1.5, 0]}>
        <boxGeometry args={[3, 0.5, 0.1]} />
        <meshStandardMaterial color="gold" />
      </mesh>
      <Text 
        position={[0, 1.5, 0.1]} 
        fontSize={0.3}
        color="black"
        anchorX="center"
        anchorY="middle"
      >
        Blackjack
      </Text>
    </group>
  );
}

function RouletteTable({ position = [0, 0, 0] as [number, number, number] }) {
  const { scene } = useGLTF('/models/roulette_table.glb') as GLTF & {
    scene: THREE.Group
  };
  const modelRef = useRef<THREE.Group>(null);
  
  useEffect(() => {
    if (scene) {
      // Scale the model to appropriate size
      scene.scale.set(2.5, 2.5, 2.5);
      
      // Add shadows to all meshes
      scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      
      // Log successful loading
      console.log("Roulette table model loaded successfully");
    }
  }, [scene]);
  
  return (
    <group ref={modelRef} position={position}>
      <primitive object={scene.clone()} />
      <spotLight 
        position={[0, 5, 0]} 
        intensity={0.5} 
        angle={0.5} 
        penumbra={0.5} 
        castShadow 
      />
      {/* Text label for the table */}
      <mesh position={[0, 1.5, 0]}>
        <boxGeometry args={[3, 0.5, 0.1]} />
        <meshStandardMaterial color="gold" />
      </mesh>
      <Text 
        position={[0, 1.5, 0.1]} 
        fontSize={0.3}
        color="black"
        anchorX="center"
        anchorY="middle"
      >
        Roulette
      </Text>
    </group>
  );
}

// Player character
function Player() {
  const playerRef = useRef<THREE.Group>(null);
  const [, getKeys] = useKeyboardControls<Controls>();
  
  // Player movement logic
  useFrame((state, delta) => {
    if (!playerRef.current) return;
    
    const { forward, back, left, right } = getKeys();
    const speed = 5 * delta;
    
    // Movement logic
    if (forward) {
      playerRef.current.position.z -= speed;
    }
    if (back) {
      playerRef.current.position.z += speed;
    }
    if (left) {
      playerRef.current.position.x -= speed;
    }
    if (right) {
      playerRef.current.position.x += speed;
    }
    
    // Update camera to follow player
    state.camera.position.x = playerRef.current.position.x;
    state.camera.position.z = playerRef.current.position.z + 5;
    state.camera.lookAt(playerRef.current.position);
  });
  
  return (
    <group ref={playerRef} position={[0, 0, 10]}>
      <mesh castShadow>
        <boxGeometry args={[1, 2, 1]} />
        <meshStandardMaterial color="blue" />
      </mesh>
    </group>
  );
}

// The floor
function Floor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
      <planeGeometry args={[100, 100]} />
      <meshStandardMaterial 
        color="#4a3d30" 
        roughness={0.8}
        metalness={0.2}
      />
    </mesh>
  );
}

// Casino environment decoration
function CasinoDecoration() {
  return (
    <>
      {/* Fancy ceiling lights */}
      {Array.from({ length: 5 }).map((_, index) => (
        <SpotLight
          key={`ceiling-light-${index}`}
          position={[index * 10 - 20, 8, 0]}
          angle={0.6}
          penumbra={0.5}
          distance={15}
          intensity={2}
          color="#ffcb8c"
          castShadow
        />
      ))}
      
      {/* Casino sign */}
      <group position={[0, 10, -30]}>
        <mesh position={[-15, 0, 0]} scale={[30, 3, 0.5]}>
          <boxGeometry />
          <meshStandardMaterial color="gold" emissive="#ffcb8c" emissiveIntensity={0.5} />
        </mesh>
        <Text 
          position={[-15, 0, 0.3]} 
          fontSize={2}
          color="black"
          anchorX="center"
          anchorY="middle"
          font="Arial"
        >
          LUCKY STARS CASINO
        </Text>
      </group>
      
      {/* Walls */}
      <mesh position={[0, 10, -50]} receiveShadow>
        <boxGeometry args={[200, 20, 1]} />
        <meshStandardMaterial color="#45322e" />
      </mesh>
      <mesh position={[0, 10, 50]} receiveShadow>
        <boxGeometry args={[200, 20, 1]} />
        <meshStandardMaterial color="#45322e" />
      </mesh>
      <mesh position={[-50, 10, 0]} receiveShadow>
        <boxGeometry args={[1, 20, 100]} />
        <meshStandardMaterial color="#45322e" />
      </mesh>
      <mesh position={[50, 10, 0]} receiveShadow>
        <boxGeometry args={[1, 20, 100]} />
        <meshStandardMaterial color="#45322e" />
      </mesh>
      
      {/* Ceiling */}
      <mesh position={[0, 20, 0]} receiveShadow>
        <boxGeometry args={[100, 1, 100]} />
        <meshStandardMaterial color="#333" />
      </mesh>
    </>
  );
}

// The main casino environment component
export default function Casino3DEnvironment() {
  const [selectedGame, setSelectedGame] = useState<'none' | 'poker' | 'blackjack' | 'roulette'>('none');
  
  // Define the key mappings for player movement
  const keyMap = [
    { name: Controls.forward, keys: ['ArrowUp', 'KeyW'] },
    { name: Controls.back, keys: ['ArrowDown', 'KeyS'] },
    { name: Controls.left, keys: ['ArrowLeft', 'KeyA'] },
    { name: Controls.right, keys: ['ArrowRight', 'KeyD'] },
    { name: Controls.jump, keys: ['Space'] },
  ];
  
  // Handle game selection
  const handleGameSelection = (game: 'poker' | 'blackjack' | 'roulette') => {
    setSelectedGame(game);
    console.log(`Selected game: ${game}`);
  };
  
  return (
    <div className="w-full h-screen">
      <Canvas shadows>
        <color attach="background" args={["#070707"]} />
        
        {/* Camera setup */}
        <PerspectiveCamera makeDefault position={[0, 2, 15]} fov={75} />
        <OrbitControls 
          enablePan={false}
          maxPolarAngle={Math.PI / 2}
          minDistance={2}
          maxDistance={25}
        />
        
        {/* Lighting */}
        <ambientLight intensity={0.2} />
        <directionalLight 
          position={[10, 10, 5]} 
          intensity={0.5} 
          castShadow 
          shadow-mapSize-width={2048} 
          shadow-mapSize-height={2048} 
        />
        
        {/* Environment */}
        <Environment preset="night" />
        
        {/* Game tables */}
        <Suspense fallback={null}>
          <PokerTable position={[-15, 0, -15]} />
          <BlackjackTable position={[0, 0, -15]} />
          <RouletteTable position={[15, 0, -15]} />
        </Suspense>
        
        {/* Player */}
        <Player />
        
        {/* Floor */}
        <Floor />
        
        {/* Casino decorations */}
        <CasinoDecoration />
      </Canvas>
      
      {/* UI Controls */}
      <div className="absolute bottom-4 left-0 w-full flex justify-center gap-4">
        <button 
          className="bg-amber-800 hover:bg-amber-700 text-white px-4 py-2 rounded-lg shadow-lg"
          onClick={() => handleGameSelection('poker')}
        >
          Play Poker
        </button>
        <button 
          className="bg-amber-800 hover:bg-amber-700 text-white px-4 py-2 rounded-lg shadow-lg"
          onClick={() => handleGameSelection('blackjack')}
        >
          Play Blackjack
        </button>
        <button 
          className="bg-amber-800 hover:bg-amber-700 text-white px-4 py-2 rounded-lg shadow-lg"
          onClick={() => handleGameSelection('roulette')}
        >
          Play Roulette
        </button>
      </div>
      
      {/* Game Selection UI */}
      {selectedGame !== 'none' && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
          <div className="bg-gray-900 p-8 rounded-xl shadow-2xl max-w-2xl w-full">
            <h2 className="text-3xl font-bold text-amber-500 mb-4">
              {selectedGame === 'poker' ? 'Poker Table' : 
               selectedGame === 'blackjack' ? 'Blackjack Table' : 
               'Roulette Table'}
            </h2>
            <p className="text-gray-300 mb-6">
              {selectedGame === 'poker' 
                ? 'Take a seat at our premium poker table and test your skills against AI opponents.' 
                : selectedGame === 'blackjack' 
                ? 'Try your luck against the dealer in this classic casino card game.' 
                : 'Place your bets and watch the wheel spin in this game of chance.'}
            </p>
            <div className="flex justify-between">
              <button 
                className="bg-red-700 hover:bg-red-600 text-white px-6 py-3 rounded-lg"
                onClick={() => setSelectedGame('none')}
              >
                Cancel
              </button>
              <button 
                className="bg-green-700 hover:bg-green-600 text-white px-6 py-3 rounded-lg"
                onClick={() => {
                  // Here we would launch the actual game
                  console.log(`Starting ${selectedGame} game`);
                  // For now just close the dialog
                  setSelectedGame('none');
                }}
              >
                Start Game
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}