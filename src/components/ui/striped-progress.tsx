import React, { useMemo } from 'react';

interface StripedProgressProps {
  value: number; // 0-100
  className?: string;
  scoreBasedColor?: boolean; // Use score-based coloring
}

export function StripedProgress({ value, className = '', scoreBasedColor = false }: StripedProgressProps) {
  // Clamp value between 0 and 100
  const percentage = Math.min(Math.max(value, 0), 100);
  
  // Generate stable unique IDs for this component instance
  const uniqueId = useMemo(() => Math.random().toString(36).substring(7), []);
  
  // Get score-based color
  const getScoreColor = (score: number) => {
    if (score >= 80) return '#6cc922'; // Excellent - Green
    if (score >= 60) return '#fca924'; // Good - Yellow/Orange
    if (score >= 30) return '#fe6521'; // Fair - Orange
    return '#f00c01'; // Needs Improvement - Red
  };
  
  // Golden color for Financial Clinic branding
  const fillColor = scoreBasedColor ? getScoreColor(percentage) : '#bd912e';
  const stripeColor = scoreBasedColor ? getScoreColor(percentage) : '#9a7625';
  
  return (
    <div className={`relative rounded-full overflow-hidden ${className}`}>
      <svg
        viewBox="0 0 697 18"
        className="w-full h-full"
        preserveAspectRatio="none"
      >
        <defs>
          {/* Background stripe pattern (light/faint) */}
          <pattern
            id={`stripesBg-${uniqueId}`}
            patternUnits="userSpaceOnUse"
            width="16"
            height="16"
            patternTransform="rotate(-45)"
          >
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="16"
              stroke={stripeColor}
              strokeOpacity="0.15"
              strokeWidth="8"
            />
          </pattern>
          
          {/* Filled stripe pattern (solid/dark) */}
          <pattern
            id={`stripesFill-${uniqueId}`}
            patternUnits="userSpaceOnUse"
            width="16"
            height="16"
            patternTransform="rotate(-45)"
          >
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="16"
              stroke={stripeColor}
              strokeOpacity="0.8"
              strokeWidth="8"
            />
          </pattern>
        </defs>
        
        {/* Gray background with faint stripes - Full width */}
        <rect width="697" height="18" rx="9" fill="#E1E1EA" />
        <rect width="697" height="18" rx="9" fill={`url(#stripesBg-${uniqueId})`} />
        
        {/* Score-colored filled portion with solid stripes - Only up to percentage */}
        <rect 
          width={`${(percentage / 100) * 697}`} 
          height="18" 
          rx="9" 
          fill={fillColor} 
        />
        <rect 
          width={`${(percentage / 100) * 697}`} 
          height="18" 
          rx="9" 
          fill={`url(#stripesFill-${uniqueId})`} 
        />
      </svg>
    </div>
  );
}
