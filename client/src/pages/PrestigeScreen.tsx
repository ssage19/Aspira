import React from 'react';
import { GameUI } from '../components/GameUI';
import { AppBackground } from '../components/AppBackground';
import PrestigeSystem from '../components/PrestigeSystem';

export default function PrestigeScreen() {
  return (
    <>
      <AppBackground />
      <div className="min-h-screen w-full pt-2 pb-24">
        <GameUI />
        
        <div className="relative z-10 w-full max-w-5xl mx-auto p-6 mt-14">
          <PrestigeSystem />
        </div>
      </div>
    </>
  );
}