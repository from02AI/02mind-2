import React, { useEffect, useState, useRef, useCallback } from 'react';
import WaveBackground from './WaveBackground'; // Import the WaveBackground component

// Define the interface for ritual sequence data
interface RitualSequenceData {
  titles: string[];
  practices: string[];
}

// Define example ritual sequences for different types
const exampleSequences: { [key: string]: RitualSequenceData } = {
  stress: { // Corresponds to 'stress' from LaunchScreen
    titles: ["Mindful Sigh", "Shoulder Release", "Silent Countdown", "Open Palms"],
    practices: ["Gently inhale, then exhale with a soft, audible sigh, releasing any tension.", "Inhale and gently shrug your shoulders up to your ears, then exhale and let them drop completely.", "Slowly and silently count down from 5 to 1, focusing on each number.", "Gently turn your palms upwards on your lap if seated, noticing the subtle shift in feeling."]
  },
  energy: { // Corresponds to 'energy' from LaunchScreen
    titles: ["Confident Posture", "Energy Spark", "Smile Induction", "Vibrant Color Pop"],
    practices: ["Gently notice your posture; if needed, lengthen your spine and relax your shoulders.", "Gently clench your fists, hold for a moment, then release, feeling the energy shift.", "Gently allow the corners of your mouth to turn slightly upwards into a soft smile, noticing how it feels.", "Choose a vibrant color (e.g., yellow or orange) and softly scan your surroundings for it."]
  },
  focus: { // Corresponds to 'focus' from LaunchScreen
    titles: ["Stable Base", "Sound Anchor", "Shape Tracing", "Breath Anchor"],
    practices: ["Feel the contact of your feet with the floor, noticing the support beneath you.", "Pick one sound in your environment and listen to it without judgment, just observing its qualities.", "Pick an object and let your eyes gently trace its outline or shape.", "Notice the natural rhythm of your breath, using it as a point of return for your attention."]
  },
  surprise: { // Corresponds to 'surprise' from LaunchScreen
    titles: ["Novel Perspective", "Deep Listening", "Joyful Color Breath", "Expanded Awareness"],
    practices: ["Look at a common object as if you're seeing it for the very first first time, with curiosity.", "Try to hear the silence or the quietest sound underneath all other sounds around you.", "Imagine inhaling a vibrant, joyful color, and exhaling any dullness.", "Without moving your eyes, gently become aware of your peripheral vision, taking in more of your surroundings."]
  }
};

const dailyRitualSequence = [
  "Sit with your back straight and take deep breath to your abdomen",
  "Feel the contact of your feet with the floor, noticing the support beneath you.",
  "Rest your eyes softly on an object in front of you, noticing its details without staring hard.",
  "Silently affirm 'I am here, in this moment,' bringing awareness to your current existence."
];

const dailyRitualTitles = [
  "Belly breathing",
  "Feet awareness",
  "Gentle Gaze",
  "Affirmation of Presence"
];

const ritualScreenTitles: { [key: string]: string } = {
  daily: "Daily Ritual",
  stress: "Stress Relief",
  energy: "Energy Boost",
  focus: "Focus",
  surprise: "Surprise Me"
};

// Function to fetch AI-generated ritual from OpenAI
async function fetchAIRitualFromOpenAI(
  ritualTypeKey: string, // e.g., "stress", "energy"
  ritualTypeDisplayName: string, // e.g., "Stress Relief", "Energy Boost"
  apiKey: string
): Promise<{ titles: string[]; descriptions: string[] }> {
  console.log(`--- fetchAIRitualFromOpenAI function started for: ${ritualTypeDisplayName} at ${new Date().toLocaleTimeString()}`);
  const systemMessage = `You are an assistant that creates 1-minute mindfulness rituals. Each ritual has 4 unique practices. For each practice, follow exactly these instructions: provide a short title (2-4 words) and a 1-sentence description (around 15-25 words).
Each practice MUST adhere to ALL the following strict constraints:
1. Eyes-open: Assumed to be performed with eyes open.
2. Indoor: Suitable for an indoor environment.
3. No Equipment: Requires absolutely no external items, tools, devices, or reliance on specific music/sounds (e.g., if it implies needing a phone or player). Practices should use only one's body and mind.
4. Discreet & Versatile Posture: Must be extremely subtle. Any suggested action should be performable and described in a way that is equally suitable whether the user is sitting or standing quietly. Avoid instructions that *require* standing, or changing posture in a way not feasible if seated (e.g., avoid phrases like "stand up" or descriptions that imply rising from a chair as the only option). The practice should not draw attention, require significant physical movement, or make sounds.
5. Strict 10-15 Second Duration: The described action MUST be realistically completable within 10 to 15 seconds at a calm, unhurried pace. If adapting a known technique (like sensory awareness), ensure it's a drastically shortened version focused on a single, quick sensory observation or mental note.
6. Mindfulness Element: Each practice, regardless of any minor physical action involved, MUST explicitly guide the user to engage in a mindful awareness, such as focusing on breath, noticing one specific bodily sensation, observing a single piece of sensory input with curiosity, or gently anchoring attention to the present moment.

The output MUST be a valid JSON array of 4 objects, where each object has a 'title' (string) and a 'description' (string) key. Provide ONLY the JSON array, with no other text, introductions, or explanations.`;

  const userMessage = `Generate a new and unique 4-step mindfulness ritual specifically for ${ritualTypeDisplayName}. Adhere strictly to the JSON output format of an array of 4 objects, each with a "title" and "description".`;

  const body = {
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: systemMessage },
      { role: "user", content: userMessage }
    ],
    temperature: 0.7,
    max_tokens: 350,
  };

  try {
    console.log("Attempting to fetch AI ritual from OpenAI for:", ritualTypeDisplayName);

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      console.error("OpenAI API Error Response:", response.status, errorData);
      throw new Error(`OpenAI API request failed: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    console.log("OpenAI API Raw Data:", data);
    const content = data.choices[0]?.message?.content;

    if (!content) {
      console.error("OpenAI API Error: No content in response's choice.", data.choices[0]);
      throw new Error("AI did not return any content.");
    }

    let parsedRitualData;
    try {
      // Attempt to parse the content
      const rawParsedContent = JSON.parse(content);

      // Check if the raw content is an object with numeric keys (common API behavior)
      if (typeof rawParsedContent === 'object' && rawParsedContent !== null && !Array.isArray(rawParsedContent)) {
        console.log("OpenAI API: Received JSON object, attempting to convert to array.", rawParsedContent);
        // Convert the object values into an array, assuming numeric keys like "1", "2", etc.
        // Filter to ensure we only take valid practice objects
        parsedRitualData = Object.values(rawParsedContent).filter(item =>
          typeof item === 'object' && item !== null &&
          'title' in item && typeof item.title === 'string' &&
          'description' in item && typeof item.description === 'string'
        );
      } else if (Array.isArray(rawParsedContent)) {
        // If it's already an array, use it directly
        console.log("OpenAI API: Received JSON array.", rawParsedContent);
        parsedRitualData = rawParsedContent;
      } else {
        // If it's neither a recognized object format nor an array, throw an error
        console.error("OpenAI API Error: Parsed content is not a recognized object or array format.", rawParsedContent);
        throw new Error("AI response was not in a recognized JSON format.");
      }

      // Now validate the resulting array structure
      if (!Array.isArray(parsedRitualData) || parsedRitualData.length !== 4 ||
          !parsedRitualData.every(item => typeof item.title === 'string' && typeof item.description === 'string')) {
        console.error("OpenAI API Error: Converted/Parsed content is not an array of 4 {title, description} objects.", parsedRitualData);
        throw new Error("AI response did not result in the expected array format after processing.");
      }
    } catch (e) {
      console.error("OpenAI API Error: Failed to parse or process JSON response. Content was:", content, e);
      throw new Error("AI response was not valid JSON or did not match expected structure.");
    }
    
    const titles = parsedRitualData.map((p: any) => p.title);
    const descriptions = parsedRitualData.map((p: any) => p.description);
    console.log("Successfully fetched and parsed AI ritual:", { titles, descriptions });
    return { titles, descriptions };

  } catch (error: any) { // Catch and type the error
    console.error("Error within fetchAIRitualFromOpenAI:", error);
    throw error; // Re-throw to be caught by the calling useEffect
  }
}

// Define the OpenAI API key placeholder
const OPENAI_API_KEY_PLACEHOLDER = "sk-YOUR_OPENAI_API_KEY_HERE";

// Define the interface for component props
interface RitualScreenProps {
  selectedRitualType: string;
  onGoBack: () => void;
}

// Change component definition to accept props
const RitualScreen: React.FC<RitualScreenProps> = ({ selectedRitualType, onGoBack }) => {
  console.log(`--- RitualScreen FUNCTION BODY EXECUTION --- Type: "${selectedRitualType}", Time: ${new Date().toLocaleTimeString()}`);
  
  // State declarations
  const [isPracticeActive, setIsPracticeActive] = useState(false);
  const [showFinaleScreen, setShowFinaleScreen] = useState(false); // State for finale screen
  const blueWaveContainerRef = useRef<HTMLDivElement>(null);
  const [currentRitualPractices, setCurrentRitualPractices] = useState<string[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isTextFadingOut, setIsTextFadingOut] = useState(false);
  const [isLoadingAIRitual, setIsLoadingAIRitual] = useState(false);
  const [ritualError, setRitualError] = useState<string | null>(null);
  const [currentRitualTitles, setCurrentRitualTitles] = useState<string[]>([]);
  const [screenTitle, setScreenTitle] = useState("");
  const [isUsingFallback, setIsUsingFallback] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true); // State for audio option, default ON

  // Refs for transition timeouts
  const fadeOutTimerRef = useRef<NodeJS.Timeout | null>(null);
  const fadeInTimerRef = useRef<NodeJS.Timeout | null>(null);
  const stepIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const finaleTimeoutRef = useRef<NodeJS.Timeout | null>(null); // Ref for the finale screen timeout

  // Use a ref to track the type that has been initialized/fetched to prevent re-fetches
  // for the same type if the component re-renders or due to StrictMode.
  const initializedTypeRef = useRef<string | null>(null);

  // Create a ref for the start/reset button
  const startButtonRef = useRef<HTMLButtonElement>(null);

  // Effect to set the screen title and load ritual practices based on selectedRitualType
  useEffect(() => {
    console.log(`RitualScreen: useEffect for selectedRitualType ACTIVATED. Current type: "${selectedRitualType}", Time: ${new Date().toLocaleTimeString()}`);

    // Clear any timers/intervals on ritual type change
    if (fadeOutTimerRef.current) clearTimeout(fadeOutTimerRef.current);
    if (fadeInTimerRef.current) clearTimeout(fadeInTimerRef.current);
    if (stepIntervalRef.current) clearInterval(stepIntervalRef.current);
    if (finaleTimeoutRef.current) clearTimeout(finaleTimeoutRef.current);

    // Only reset finale screen state if a ritual type is selected AND it's different from the initialized type
    // This prevents the initial `true` state for testing from being immediately overwritten.
    if (selectedRitualType && initializedTypeRef.current !== selectedRitualType) {
      setShowFinaleScreen(false); 
    } else if (!selectedRitualType) {
      // If no ritual type is selected, reset everything
      setShowFinaleScreen(false); 
    }

    if (!selectedRitualType) {
      setScreenTitle("Mindfulness Ritual");
      setCurrentRitualPractices([]);
      setCurrentRitualTitles([]);
      setIsLoadingAIRitual(false);
      setRitualError(null);
      setIsPracticeActive(false);
      setCurrentStepIndex(0);
      initializedTypeRef.current = null;
      setIsUsingFallback(false);
      return;
    }

    const displayName = ritualScreenTitles[selectedRitualType] || "Mindfulness Ritual";
    setScreenTitle(displayName);
    setCurrentStepIndex(0);
    setIsPracticeActive(false);
    setShowFinaleScreen(false); // Ensure finale screen is hidden

    if (selectedRitualType === "daily") {
      setCurrentRitualPractices(dailyRitualSequence);
      setCurrentRitualTitles(dailyRitualTitles);
      setIsLoadingAIRitual(false);
      setRitualError(null);
      setIsUsingFallback(false);
      initializedTypeRef.current = "daily";
    } else { // For AI types: "stress", "energy", "focus", "surprise"
      console.log(`Preparing to fetch AI ritual for type: "${selectedRitualType}"`);
      setIsLoadingAIRitual(true);
      setRitualError(null);
      setCurrentRitualPractices([]);
      setCurrentRitualTitles([]);
      setIsUsingFallback(false); // Assume AI will work, will be set to true in .catch or if API key is missing

      // --- IMPORTANT: API Key Section ---
      // Replace "YOUR_VALID_OPENAI_API_KEY_HERE" with your actual OpenAI API key.
      // For development, you can hardcode it here TEMPORARILY.
      // For production, use environment variables to keep your key secure.
      const apiKey = "import.meta.env.VITE_OPENAI_API_KEY";
      // Example of a placeholder often used in tutorials (DO NOT USE THIS EXAMPLE KEY FOR ACTUAL CALLS):
      const OPENAI_API_KEY_PLACEHOLDER = "sk-YOUR_OPENAI_API_KEY_HERE";
      const OLD_EXAMPLE_KEY_PREFIX = "sk-proj-rJ2"; // Define the old example key prefix
      const LEGACY_PLACEHOLDER = "YOUR_VALID_OPENAI_API_KEY_HERE"; // Define the legacy placeholder

      // Check if the apiKey is missing or is a placeholder/example key
      let useFallback = false;
      let errorMsg = "";

      const knownPlaceholders = [LEGACY_PLACEHOLDER, OPENAI_API_KEY_PLACEHOLDER];

      if (!apiKey) {
          useFallback = true;
          errorMsg = "API Key is missing! Using fallback.";
      } else if (knownPlaceholders.includes(apiKey as string)) { // Cast apiKey to string for comparison
           useFallback = true;
           errorMsg = "API Key is a placeholder! Please replace it with your actual key. Using fallback.";
      } else if (typeof apiKey === 'string' && apiKey.startsWith(OLD_EXAMPLE_KEY_PREFIX)) { // Check if it's a string and starts with an old example prefix
           useFallback = true;
           errorMsg = "It looks like you're using an example project key. Please use your personal OpenAI API key. Using fallback.";
      }

      if (useFallback) {
        console.error(errorMsg);
        setRitualError(`API Key setup needed. ${errorMsg}`);
        const fallbackSequence = exampleSequences[selectedRitualType];
        if (fallbackSequence) {
          setCurrentRitualTitles(fallbackSequence.titles);
          setCurrentRitualPractices(fallbackSequence.practices);
        } else {
          setCurrentRitualTitles(["Error", "Unavailable", "Try Again", "Later"]);
          setCurrentRitualPractices(["Sequence not found.", "Please try another.", "Take a deep breath.", "Hope this helps."]);
        }
        setIsLoadingAIRitual(false);
        initializedTypeRef.current = selectedRitualType;
        setIsUsingFallback(true);
        return;
      }
      // --- End of API Key Section ---

      console.log(`>>> Attempting REAL fetchAIRitualFromOpenAI for "${selectedRitualType}"`);
      fetchAIRitualFromOpenAI(selectedRitualType, displayName, apiKey)
        .then(generatedRitual => {
          console.log("AI Ritual Generation Successful for:", selectedRitualType);
          setCurrentRitualTitles(generatedRitual.titles);
          setCurrentRitualPractices(generatedRitual.descriptions);
          setRitualError(null);
          setIsUsingFallback(false);
          initializedTypeRef.current = selectedRitualType;
        })
        .catch(error => {
          console.error("AI Ritual Generation Failed (fetch caught), using fallback for type:", selectedRitualType, error);
          setRitualError(`Oops! Couldn't create a unique ritual for ${displayName.toLowerCase()}. Here's a favorite:`);
          const fallbackSequence = exampleSequences[selectedRitualType];
          if (fallbackSequence) {
            setCurrentRitualTitles(fallbackSequence.titles);
            setCurrentRitualPractices(fallbackSequence.practices);
          } else {
            setCurrentRitualTitles(["Error", "Unavailable", "Try Again", "Later"]);
            setCurrentRitualPractices(["Sequence not found.", "Please try another.", "Take a deep breath.", "Hope this helps."]);
          }
          setIsUsingFallback(true);
        })
        .finally(() => {
          setIsLoadingAIRitual(false);
          initializedTypeRef.current = selectedRitualType;
        });
    }
  }, [selectedRitualType, exampleSequences]); // ADD showFinal

  // Effect to handle step transitions when practice is active
  useEffect(() => {
    // Clear any existing interval first
    if (stepIntervalRef.current) clearInterval(stepIntervalRef.current);

    if (isPracticeActive && currentRitualPractices.length > 0) {
      stepIntervalRef.current = setInterval(() => {
        console.log(`Audio enabled state before gong check: ${isAudioEnabled}`);
        // Play gong for the END of the practice that just finished
        if (isAudioEnabled) {
          // Check if this is the end of the LAST practice (index 3)
          if (currentStepIndex === currentRitualPractices.length - 1) { // Reached the end (index 3) --> play double gong
            console.log("Playing double gong for ritual completion...");
            const gong1 = new Audio('/sounds/gong.mp3');
            gong1.play();
            setTimeout(() => {
              const gong2 = new Audio('/sounds/gong.mp3');
              gong2.play();
            }, 500);
          } else { // Otherwise, play single gong for intermediate practices
            console.log("Playing single gong...");
            const gong = new Audio('/sounds/gong.mp3');
            gong.play();
          }
        }

        setCurrentStepIndex(prevIndex => {
          console.log(`Interval tick: prevIndex = ${prevIndex}, currentRitualPractices.length = ${currentRitualPractices.length}`);
          const nextIndex = prevIndex + 1;
          // Check if there's a next practice
          if (nextIndex < currentRitualPractices.length) {
            // Start fade out before updating text
            setIsTextFadingOut(true);
            // Use a timeout to change text after fade out starts
            const textFadeTimeout = setTimeout(() => {
              setIsTextFadingOut(false); // Start fade in for new text
            }, 700); // Match this duration to CSS transition duration
             // Clear previous timeout before setting a new one
            if (fadeOutTimerRef.current) clearTimeout(fadeOutTimerRef.current);
            fadeOutTimerRef.current = textFadeTimeout;

            return nextIndex;
          } else {
            // All practices complete, stop practice and trigger finale screen transition
            setIsPracticeActive(false); // Stop the practice timer and animation

            // Clear interval
            if (stepIntervalRef.current) clearInterval(stepIntervalRef.current);
            stepIntervalRef.current = null;
            // Clear any lingering text fade out timeout
            if (fadeOutTimerRef.current) clearTimeout(fadeOutTimerRef.current);
            fadeOutTimerRef.current = null;

            // Trigger the finale screen visibility and transition
            console.log("Transitioning to finale screen...");
            setShowFinaleScreen(true); // Directly show the finale screen

            return prevIndex; // Stay on the last step
          }
        });
      }, 15000); // 15 seconds per step
    }

    // Cleanup function to clear the interval
    return () => {
      if (stepIntervalRef.current) clearInterval(stepIntervalRef.current);
      stepIntervalRef.current = null;
      // Also clear timeouts on cleanup
      if (fadeOutTimerRef.current) clearTimeout(fadeOutTimerRef.current);
      if (fadeInTimerRef.current) clearTimeout(fadeInTimerRef.current);
      if (finaleTimeoutRef.current) clearTimeout(finaleTimeoutRef.current); // Clear finale timeout
    };
  }, [isPracticeActive, currentRitualPractices.length, isAudioEnabled]); // Dependencies: Added isAudioEnabled

  // Handler for Start/Reset button (on ritual screen) and "To practice" button (on finale screen)
  const handlePrimaryButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log(`--- Primary Button Clicked: ${showFinaleScreen ? 'To Practice' : (isPracticeActive ? 'Reset' : 'Start')} ---`);

    if (showFinaleScreen) {
      // If we're on finale screen, go back to launch screen
      onGoBack();
    } else {
      // If on ritual screen, toggle practice state
      setIsPracticeActive(!isPracticeActive);
      // Reset step index when starting a new practice only if practice was inactive
      if (!isPracticeActive) { // isPracticeActive is the state *before* toggling
          setCurrentStepIndex(0);
      }
      // Ensure finale screen is hidden when starting/resetting practice
      setShowFinaleScreen(false);
    }
  };

  // Prevent scrolling on mount
  useEffect(() => {
    console.log(`+++ SCROLL LOCK effect: MOUNT/RUN +++ Type: "${selectedRitualType}", Time: ${new Date().toLocaleTimeString()}`);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      console.log(`--- SCROLL LOCK effect: UNMOUNT/CLEANUP --- Type: "${selectedRitualType}", Time: ${new Date().toLocaleTimeString()}`);
      document.body.style.overflow = originalOverflow;
    };
  }, []); // Empty dependency array

  // Add native event listener for debugging (optional, can be removed later)
  useEffect(() => {
    console.log(`+++ NATIVE EVENT LISTENER effect: MOUNT/RUN +++ Time: ${new Date().toLocaleTimeString()}`);
    const button = startButtonRef.current;
    if (button) {
      const nativeClickHandler = () => {
        console.log("--- NATIVE Start/Reset Button Clicked ---");
      };
      button.addEventListener('click', nativeClickHandler);

      // Cleanup function to remove the event listener
      return () => {
        console.log(`--- NATIVE EVENT LISTENER effect: UNMOUNT/CLEANUP --- Time: ${new Date().toLocaleTimeString()}`);
        button.removeEventListener('click', nativeClickHandler);
      };
    }
  }, []); // Empty dependency array

  // --- Animation Configuration ---
  const animationDurationMs = 60000; // Target: 60 SECONDS
  const targetHeight = '105%';      // Target height for blue wave (to cover small top gap)
  const initialHeight = '0%';       // Initial height for blue wave

  useEffect(() => {
    const element = blueWaveContainerRef.current;
    if (element) {
      // Explicitly remove any pre-existing transition before starting or resetting
      element.style.transition = 'none';

      if (isPracticeActive) {
        // Force a reflow to ensure the "no transition" style is applied and
        // the element is ready for new transition properties.
        void element.offsetWidth;

        // Now, set the transition properties FOR THIS ANIMATION
        element.style.transitionProperty = 'height';
        element.style.transitionDuration = `${animationDurationMs}ms`;
        element.style.transitionTimingFunction = 'linear';

        // And set the target height to trigger the animation
        element.style.height = targetHeight;
      } else {
        // For reset: ensure no transition for an instant snap back
        // (transition was already set to 'none' above, which is fine for reset)
        element.style.height = initialHeight;
      }
    }
  }, [isPracticeActive, animationDurationMs, targetHeight, initialHeight]); // Dependencies for the effect

  return (
    // 1. Outermost container - for positioning
    <div className="h-screen w-screen overflow-hidden relative bg-red-500">

      {/* 2. Static Background Waves (from LaunchScreen) - bottom layer */}
      <WaveBackground isHidden={showFinaleScreen} /> {/* Render the imported component, hiding it when finale screen is shown */}

      {/* 3. Semi-transparent white overlay - covers the static waves */}
      <div className="absolute inset-0 w-full h-full bg-white bg-opacity-5 z-10"></div>

      {/* 4. All your existing RitualScreen content - now sits on top of the overlay */}
      {/* This wrapper helps manage z-stacking for content over the overlay */}
      <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center z-20 pb-10">

        {/* Blue filling wave container - should be above the z-10 overlay */}
        {/* Note: WaveBackground visibility is handled by the component itself using the isHidden prop */}
        <div
          ref={blueWaveContainerRef}
          className="absolute bottom-0 left-0 w-full pointer-events-none"
          style={{
            height: initialHeight,
            overflow: 'hidden',
            zIndex: 15 // Ensure it's above the z-10 overlay but below main text/buttons
          }}
        >
          <svg
            viewBox="0 0 375 812"
            xmlns="http://www.w3.org/2000/svg"
            className="absolute bottom-0 left-0 w-full h-full"
            preserveAspectRatio="xMinYMin slice"
          >
            <path
              d="M0 0 C75 25 115 10 180 30 S240 5 310 25 S350 5 375 10 V812 H0 Z"
              fill="white"
              fillOpacity="0.95"
            />
          </svg>
        </div>

        {/* Ritual Screen Content (always rendered, opacity controlled) */}
        <div className={`absolute inset-0 w-full h-full flex flex-col items-center justify-center text-center p-4 pb-10 transition-opacity duration-500 ease-in-out ${showFinaleScreen ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'} z-20`}>
          {/* Original Ritual Screen Content */}
          {/* Back button - always visible on ritual screen, positioned relative to this container */}
          {!showFinaleScreen && (
          <button
            className="absolute top-6 left-6 px-2 py-1 bg-white text-[#b48559] rounded z-30"
            onClick={onGoBack}
            style={{ pointerEvents: 'auto' }}
          >
            Back
          </button>
          )}
          <h2 className="font-nunito text-4xl font-extrabold text-slate-700 text-center mb-20">{screenTitle}</h2>

          {/* Audio Toggle Button */}
          <button
            className="absolute top-6 right-6 px-2 py-1 bg-white text-[#b48559] rounded z-30 flex items-center justify-center w-8 h-8"
            onClick={() => setIsAudioEnabled(!isAudioEnabled)}
            aria-label={isAudioEnabled ? 'Turn Audio Off' : 'Turn Audio On'}
          >
            {isAudioEnabled ? (
              // Speaker ON icon (example SVG)
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M18.5 12c0-1.75-1-3.34-2.75-4.03v8.05c1.75-.69 2.75-2.3 2.75-4.02zM5 10v4h3l4 4V6l-4 4H5zm10.5-4.13v12.25c2.7-.91 4.5-3.5 4.5-6.12s-1.8-5.21-4.5-6.13z" clipRule="evenodd" />
              </svg>
            ) : (
              // Speaker OFF icon (example SVG)
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M9.385 8.5c.015.03.03.058.045.087l7.797-7.797.707.707-7.797 7.797c.029.015.057.03.087.045zM16.873 13.513l2.914 2.914.707-.707-2.914-2.914a3.5 3.5 0 010 .707zM5 10v4h3l4 4V6l-4 4H5zm14.586-1.414a.5.5 0 010 .707L16.873 12l2.713 2.713a.5.5 0 01-.707.707L16.166 12.7l-2.713 2.713a.5.5 0 01-.707-.707L15.459 12l-2.713-2.713a.5.5 0 01.707-.707z" clipRule="evenodd" />
              </svg>
            )}
          </button>

          {isLoadingAIRitual && <p>Crafting an unique practice for you</p>}
          {ritualError && <p className="text-red-500">Error: {ritualError}</p>}

          {!isLoadingAIRitual && !ritualError && currentRitualPractices.length > 0 && (
            <>
              {currentRitualTitles.length > 0 && (
                <h3 className={`font-nunito text-2xl font-extrabold text-slate-700 mb-2 transition-opacity transition-filter duration-700 ease-in-out ${isTextFadingOut ? 'opacity-0 blur-sm' : 'opacity-100 blur-0'}`}>
                  {currentRitualTitles[currentStepIndex]}
                </h3>
              )}
              <p className={`font-nunito text-2xl text-slate-700 mt-2 mx-6 font-semibold transition-opacity transition-filter duration-700 ease-in-out ${isTextFadingOut ? 'opacity-0 blur-sm' : 'opacity-100 blur-0'}`}>
                {currentRitualPractices[currentStepIndex]}
              </p>
            </>
          )}

          {!isLoadingAIRitual && !ritualError && currentRitualPractices.length === 4 && (
            <div className="flex justify-center mt-8 space-x-2">
              {Array(4).fill(0).map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full ${index === currentStepIndex ? 'bg-slate-700' : 'bg-slate-700/50'}`}
                ></div>
              ))}
            </div>
          )}

        </div>

        {/* Finale Screen Content (always rendered, opacity controlled) */}
        <div className={`absolute inset-0 w-full h-full flex flex-col items-center justify-center text-center bg-white transition-opacity duration-500 ease-in-out ${showFinaleScreen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none hidden'} z-20`}>
          {/* Completion Text */}
          <h1 className="text-2xl font-nunito text-slate-700 text-center font-extrabold mb-4 mt-4">
            Mindfulness Boost<br />
            Completed
          </h1>
          {/* Thank you text */}
          <p className="text-lg font-nunito text-slate-600 text-center mb-8">
            Thank you.
          </p>

          {/* Lotus Flower Image - Moved below text */}
          <img
            src="/images/lotus image.png"
            alt="Lotus Flower"
            className="mx-auto w-48 h-48 mb-8 -mt-4"
          />

        </div>

        {/* Start/Reset button - positioned absolutely, hidden when showing finale screen */}
        {!showFinaleScreen && (
            <button
              ref={startButtonRef}
              className={`absolute bottom-12 left-1/2 -translate-x-1/2 px-2 py-2 bg-slate-700 text-white rounded-full z-50 w-20 h-20 text-xl font-bold shadow-md transition-opacity duration-500 ease-in-out ${showFinaleScreen ? 'opacity-0' : 'opacity-100'}`}
              onClick={handlePrimaryButtonClick}
              style={{ pointerEvents: 'auto' }}
            >
              {isPracticeActive ? "Reset" : "Start"}
            </button>
          )}

        {/* To practice button - positioned absolutely at the bottom, only shown when showing finale screen */}
        {showFinaleScreen && (
            <button
              className="absolute bottom-12 left-1/2 -translate-x-1/2 rounded-full bg-slate-700 text-white py-3 px-6 min-w-[150px] text-lg font-nunito font-semibold shadow-md hover:bg-slate-800 transition z-50"
              onClick={handlePrimaryButtonClick}
            >
              To practice
            </button>
          )}

      </div>

    </div>
  );
};

export default RitualScreen;