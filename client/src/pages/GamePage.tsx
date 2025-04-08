import { Game } from "../components/game/Game";
import { AppBackground } from "../components/AppBackground";

export default function GamePage() {
  return (
    <div className="w-full h-screen overflow-hidden bg-black">
      <div className="absolute inset-0 z-0">
        <AppBackground />
      </div>
      <div className="relative z-10 h-full">
        <Game />
      </div>
    </div>
  );
}