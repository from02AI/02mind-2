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
  const systemMessage = `You are an assistant that creates 1-minute mindfulness rituals. Each ritual has 4 unique practices. For each practice, provide a short title (2-4 words) and a 1-sentence description (around 15-25 words, suitable for a 15-second eyes-open practice). Practices must be public-friendly and require no equipment.
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
  const blueWaveContainerRef = useRef<HTMLDivElement>(null);
  const [currentRitualPractices, setCurrentRitualPractices] = useState<string[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isTextFadingOut, setIsTextFadingOut] = useState(false);
  const [isLoadingAIRitual, setIsLoadingAIRitual] = useState(false);
  const [ritualError, setRitualError] = useState<string | null>(null);
  const [currentRitualTitles, setCurrentRitualTitles] = useState<string[]>([]);
  const [screenTitle, setScreenTitle] = useState("");
  const [isUsingFallback, setIsUsingFallback] = useState(false);

  // Use a ref to track the type that has been initialized/fetched to prevent re-fetches
  // for the same type if the component re-renders or due to StrictMode.
  const initializedTypeRef = useRef<string | null>(null);

  // Create a ref for the start/reset button
  const startButtonRef = useRef<HTMLButtonElement>(null);

  // Effect to set the screen title and load ritual practices based on selectedRitualType
  useEffect(() => {
    console.log(`RitualScreen: useEffect for selectedRitualType ACTIVATED. Current type: "${selectedRitualType}" at ${new Date().toLocaleTimeString()}`);

    if (initializedTypeRef.current === selectedRitualType && selectedRitualType !== "daily") { // Allow daily to re-initialize if needed, but skip re-fetch for AI types if already initialized.
      console.log(`>>> Skipping fetch for already initialized AI type: "${selectedRitualType}"`);
      return;
    }
    // For "daily" type, it's okay if it re-runs as it's local data and quick.
    // Or, if you want to prevent even "daily" from re-running if initializedTypeRef.current === "daily", adjust the condition above.


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
    // Don't set setIsUsingFallback(false) here yet for AI types, do it before the fetch.

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
      const apiKey = "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"; 
      // Example of a placeholder often used in tutorials (DO NOT USE THIS EXAMPLE KEY FOR ACTUAL CALLS):
      const OPENAI_API_KEY_PLACEHOLDER = "sk-YOUR_OPENAI_API_KEY_HERE";

      // Check if the apiKey is missing or is a placeholder/example key
      let useFallback = false;
      let errorMsg = "";

      if (!apiKey || apiKey === "YOUR_VALID_OPENAI_API_KEY_HERE" || apiKey === OPENAI_API_KEY_PLACEHOLDER) {
          useFallback = true;
          errorMsg = "API Key is missing or is a placeholder! Using fallback.";
      } else if (typeof apiKey === 'string' && apiKey.startsWith("sk-proj-rJ2")) { // Check if it's a string and starts with the specific example prefix
          // This condition checks against the specific example key you previously had hardcoded.
           if (apiKey !== "YOUR_VALID_OPENAI_API_KEY_HERE") {
                useFallback = true;
                errorMsg = "It looks like you're using an example project key. Please use your personal OpenAI API key. Using fallback.";
           }
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
  }, [selectedRitualType, exampleSequences]); // Added missing dependencies from inside the hook

  // Effect to handle step transitions when practice is active
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    let timeoutId: NodeJS.Timeout | null = null;

    if (isPracticeActive) {
      // Clear any existing interval first if restarting practice
      if (intervalId) clearInterval(intervalId);
      if (timeoutId) clearTimeout(timeoutId);

      // Start the interval for step transitions
      intervalId = setInterval(() => {
        setCurrentStepIndex(prevIndex => {
          const nextIndex = prevIndex + 1;
          // Check if there's a next practice
          if (nextIndex < currentRitualPractices.length) {
            // Start fade out before updating text
            setIsTextFadingOut(true);
            // Use a timeout to change text after fade out starts
            timeoutId = setTimeout(() => {
              setIsTextFadingOut(false); // Start fade in for new text
            }, 700); // Match this duration to CSS transition duration (changed from 300)
            return nextIndex;
          } else {
            // All practices complete, clear the interval
            setIsPracticeActive(false); // Optionally stop the practice/animation
            return prevIndex; // Stay on the last step
          }
        });
      }, 15000); // 15 seconds per step
    } else {
        // Clear interval and timeout if practice becomes inactive
        if (intervalId) clearInterval(intervalId);
        if (timeoutId) clearTimeout(timeoutId);
        // Reset step index when practice is not active
        setCurrentStepIndex(0);
    }

    // Cleanup function to clear interval and timeout
    return () => {
      if (intervalId) clearInterval(intervalId);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isPracticeActive, currentRitualPractices.length]); // Use currentRitualPractices.length

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

  // Add native event listener for debugging
  useEffect(() => {
    console.log(`+++ NATIVE EVENT LISTENER effect: MOUNT/RUN +++ Time: ${new Date().toLocaleTimeString()}`);
    const button = startButtonRef.current;
    if (button) {
      const nativeClickHandler = () => {
        console.log("--- NATIVE Button Clicked ---");
      };
      button.addEventListener('click', nativeClickHandler);

      // Cleanup function to remove the event listener
      return () => {
        console.log(`--- NATIVE EVENT LISTENER effect: UNMOUNT/CLEANUP --- Time: ${new Date().toLocaleTimeString()}`);
        button.removeEventListener('click', nativeClickHandler);
      };
    } else {
        console.log("--- NATIVE EVENT LISTENER effect: Button ref not available ---");
    }
  }, []); // Empty dependency array means this effect runs once on mount and cleans up on unmount

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
    <div className="h-screen w-screen overflow-hidden relative">

      {/* 2. Static Background Waves (from LaunchScreen) - bottom layer */}
      <WaveBackground /> {/* Render the imported component */}

      {/* 3. Semi-transparent white overlay - covers the static waves */}
      <div className="absolute inset-0 w-full h-full bg-white bg-opacity-10 z-10"></div>

      {/* 4. All your existing RitualScreen content - now sits on top of the overlay */}
      {/* This wrapper helps manage z-stacking for content over the overlay */}
      <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center z-20">
        
        {/* Back button - now inside the content wrapper */}
        <button
          className="absolute top-6 left-6 px-2 py-1 bg-white text-[#b48559] rounded z-30"
          onClick={onGoBack}
        >
          Back
        </button>
        
        {/* Blue filling wave container - should be above the z-10 overlay */}
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

        {/* Centered text content - now inside the content wrapper */}
        <div className="relative flex flex-col items-center justify-center p-4 text-center pointer-events-none z-20 pb-10"> {/* Added pb-10 */}
          <h2 className="font-nunito text-4xl font-extrabold text-slate-700 text-center mb-20">{screenTitle}</h2>
          
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

        {/* Test button - now inside the content wrapper */}
        <button
          ref={startButtonRef}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 px-2 py-2 bg-slate-700 text-white rounded-full z-50 w-20 h-20 text-xl font-bold shadow-md"
          onClick={(e) => {
            e.stopPropagation();
            console.log("--- REACT Button Clicked ---");
            setIsPracticeActive(!isPracticeActive);
          }}
        >
          {isPracticeActive ? "Reset" : "Start"}
        </button>
      </div>

    </div>
  );
};

export default RitualScreen;