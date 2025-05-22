import { useState, useCallback } from 'react';
import LaunchScreen from './components/LaunchScreen';
import RitualScreen from './components/RitualScreen';
import WaveBackground from './components/WaveBackground';
import './App.css';

function App() {
  const [screen, setScreen] = useState<'launch' | 'ritual'>('launch');
  const [ritualType, setRitualType] = useState<string | null>(null);

  // Make onSelectRitual a memoized callback to prevent unnecessary rerenders
  const onSelectRitual = useCallback((type: string) => {
    // Add more detailed logging
    console.log(`PARENT COMPONENT: onSelectRitual called with type: "${type}" at ${new Date().toLocaleTimeString()}`);
    console.log(`Current state before update - screen: ${screen}, ritualType: ${ritualType}`);
    
    // Directly update the state
    setRitualType(type);
    setScreen('ritual');
    
    // Log after update (this will show the previous values due to React's state batching)
    console.log(`State updates requested - new screen: 'ritual', new ritualType: ${type}`);
  }, [screen, ritualType]);

  const handleGoBack = useCallback(() => {
    console.log("PARENT COMPONENT: handleGoBack called");
    setScreen('launch');
    setRitualType(null); // Clear the selected ritual type
  }, []);

  console.log(`PARENT COMPONENT RENDER - Current screen: ${screen}, ritualType: ${ritualType}`);

  return (
    <div className="relative min-h-screen bg-[#FCF3D9] overflow-hidden w-screen">
      <div className="relative z-10 w-screen">
        {screen === 'launch' ? (
          <LaunchScreen onSelectRitual={onSelectRitual} />
        ) : (
          // ritualType should be a string when screen is 'ritual'
          // The selectedRitualType={ritualType || ''} in your RitualScreen prop definition
          // handles the case where ritualType might be null initially by passing an empty string.
          // Your RitualScreen useEffect also has a guard: if (!selectedRitualType) return;
          // So this should be safe:
          <RitualScreen selectedRitualType={ritualType || ''} onGoBack={handleGoBack} />
        )}
      </div>
      <WaveBackground />
    </div>
  );
}

export default App;