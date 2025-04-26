import { useNavigate } from 'react-router-dom';
import { Suspense, lazy, useState, useEffect } from 'react';
import GameUI from '../components/GameUI';
// Lazy load the Investments component for better performance
const Investments = lazy(() => import('../components/Investments'));
import { Button } from '../components/ui/button';
import { ChevronLeft } from 'lucide-react';

export default function InvestmentScreen() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  
  // Add a loading indicator that times out after 100ms to avoid a flash
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className="w-full min-h-screen pt-2 pb-24">
      {/* Content */}
      <div className="relative z-10 w-full">
        <GameUI />
        
        <div className="p-4 pt-20 max-w-5xl mx-auto">
          <Button 
            variant="outline" 
            size="default"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log("Investment screen: Navigating to dashboard");
              // Use a direct location change as a fallback if navigate doesn't work
              try {
                navigate('/', { replace: true });
                // Add a fallback timeout to ensure navigation happens
                setTimeout(() => {
                  if (window.location.pathname !== '/') {
                    console.log("Investment screen: Fallback navigation to dashboard");
                    window.location.href = '/';
                  }
                }, 300);
              } catch (err) {
                console.error("Navigation error:", err);
                window.location.href = '/';
              }
            }}
            className="mb-6 bg-primary/10 hover:bg-primary/20 border-primary/20 text-primary shadow-sm w-full sm:w-auto"
          >
            <ChevronLeft className="h-5 w-5 mr-2" />
            Back to Dashboard
          </Button>
          
          <Suspense fallback={
            <div className="p-6 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite] opacity-70 mb-4"></div>
              <p>Loading investments...</p>
            </div>
          }>
            {!isLoading && <Investments />}
          </Suspense>
        </div>
      </div>
    </div>
  );
}
