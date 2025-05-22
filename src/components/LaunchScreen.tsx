import React, { useEffect } from 'react';

interface LaunchScreenProps {
  onSelectRitual: (type: string) => void;
}

const LaunchScreen: React.FC<LaunchScreenProps> = ({ onSelectRitual }) => {
  // Add console log whenever component renders
  console.log("LaunchScreen rendering...");
  
  // Add a test function for button clicks
  const handleButtonClick = (type: string) => {
    console.log(`Button clicked: ${type}`);
    // Add event.stopPropagation() equivalent for direct function calls
    // Force a small timeout to ensure state updates happen
    setTimeout(() => {
      onSelectRitual(type);
    }, 10);
  };
  
  useEffect(() => {
    // Prevent scrolling on mount using body styles
    const originalStyle = window.getComputedStyle(document.body);
    const originalOverflow = originalStyle.overflow;
    const originalPosition = originalStyle.position;
    const originalTop = originalStyle.top;
    const originalWidth = originalStyle.width;
    const scrollPosition = window.pageYOffset;
    
    // Apply styles to prevent scrolling
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollPosition}px`;
    document.body.style.width = '100%';
    
    // Cleanup function to restore original styles on unmount
    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.position = originalPosition;
      document.body.style.top = originalTop;
      document.body.style.width = originalWidth;
      window.scrollTo(0, scrollPosition);
    };
  }, []);

  return (
    <div className="relative flex flex-col items-center justify-center h-[100vh] overflow-hidden overscroll-none touch-none py-4 px-4 z-10 pb-8">
      {/* Semi-transparent white overlay */}
      <div className="absolute inset-0 bg-white opacity-0 z-0"></div>

      {/* Title section - adjust mb-6 to control spacing to buttons */}
      <div className="flex-none mb-8">
        <h1 className="font-nunito text-3xl md:text-3xl font-bold text-slate-800 text-center mb-8">
          Ready for your<br />
          1-min mindful reset?
        </h1>
        <p className="font-nunito text-xl text-slate-700 text-center">What do you need now?</p>
      </div>
      
      <div className="flex-none flex flex-col items-center w-full">
        {/* Primary Button */}
        <button
          className="rounded-full bg-amber-700 border-2 border-amber-700 text-white py-2.5 px-8 text-base font-semibold mx-auto w-56 shadow-md hover:bg-amber-800 transition z-20"
          onClick={(e) => {
            e.stopPropagation();
            console.log("Primary button clicked directly");
            handleButtonClick('daily');
          }}
        >
          Daily Ritual
        </button>
        
        {/* Secondary Button Group - 2×2 Grid - adjust mt-3.5 to control spacing from main button */}
        <div className="grid grid-cols-2 gap-2.5 w-full max-w-[320px] mt-8 z-20">
          <button
            className="rounded-full bg-amber-50/80 border-2 border-amber-200 text-amber-900 py-2 px-3 text-base font-semibold hover:bg-amber-50 hover:border-amber-300 transition"
            onClick={(e) => {
              e.stopPropagation();
              handleButtonClick('stress');
            }}
          >
            Stress Relief
          </button>
          <button
            className="rounded-full bg-amber-50/80 border-2 border-amber-200 text-amber-900 py-2 px-3 text-base font-semibold hover:bg-amber-50 hover:border-amber-300 transition"
            onClick={(e) => {
              e.stopPropagation();
              handleButtonClick('energy');
            }}
          >
            Energy Boost
          </button>
          <button
            className="rounded-full bg-amber-50/80 border-2 border-amber-200 text-amber-900 py-2 px-3 text-base font-semibold hover:bg-amber-50 hover:border-amber-300 transition"
            onClick={(e) => {
              e.stopPropagation();
              handleButtonClick('focus');
            }}
          >
            Focus
          </button>
          <button
            className="rounded-full bg-amber-50/80 border-2 border-amber-200 text-amber-900 py-2 px-3 text-base font-semibold hover:bg-amber-50 hover:border-amber-300 transition"
            onClick={(e) => {
              e.stopPropagation();
              handleButtonClick('surprise');
            }}
          >
            Surprise Me
          </button>
        </div>
      </div>
    </div>
  );
};

export default LaunchScreen; 