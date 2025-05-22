import React from 'react';

interface WaveBackgroundProps {
  isHidden?: boolean;
}

const WaveBackground: React.FC<WaveBackgroundProps> = ({ isHidden = false }) => (
  <div
    className="fixed inset-0 w-full h-full z-0 pointer-events-none"
    style={{ display: isHidden ? 'none' : 'block' }}
  >
    <svg
      viewBox="0 0 375 812"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
      preserveAspectRatio="none"
    >
      <rect x="0" y="0" width="375" height="60" fill="#F9E9C0" />

      {/* 1st wave (lightest) - HIGHER, starts Y=0, goes off-screen up */}
      <path d="M0 0 C60 -50 120 -10 180 -40 S270 -20 310 -5 S360 -45 375 -10 V812 H0 Z" fill="#FCF3D9" />
      
      {/* 2nd wave - Baseline Y ~116. Undulates +/- 15 */}
      <path d="M0 116 C50 131 100 106 150 119 S250 129 300 111 S340 126 375 116 V812 H0 Z" fill="#F8E7BE" />
      
      {/* 3rd wave - Baseline Y ~232. Undulates +/- 15 */}
      <path d="M0 232 C40 247 90 222 140 237 S230 248 280 227 S330 242 375 232 V812 H0 Z" fill="#F3D9A2" />
      
      {/* 4th wave - Baseline Y ~348. Undulates +/- 15 */}
      <path d="M0 348 C55 363 105 338 155 351 S245 361 295 343 S350 356 375 348 V812 H0 Z" fill="#EDCC86" />
      
      {/* 5th wave - Baseline Y ~464. Undulates +/- 15 */}
      <path d="M0 464 C50 479 100 454 150 467 S240 477 290 459 S340 472 375 464 V812 H0 Z" fill="#E7BF6F" />
      
      {/* 6th wave - Baseline Y ~580. Undulates +/- 15 */}
      <path d="M0 580 C70 595 120 570 170 583 S260 593 310 575 S355 588 375 580 V812 H0 Z" fill="#E1B258" />
      
      {/* 7th wave (deepest) - Baseline Y ~696. Undulates +/- 15 */}
      <path d="M0 696 C60 711 110 686 160 699 S250 709 300 691 S350 704 375 696 V812 H0 Z" fill="#b48559" />

    </svg>
  </div>
);

export default WaveBackground; 