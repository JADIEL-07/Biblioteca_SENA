import React from 'react';

interface AnimatedRobotIconProps {
  className?: string;
  style?: React.CSSProperties;
  size?: number | string;
}

export const AnimatedRobotIcon: React.FC<AnimatedRobotIconProps> = ({
  className = '',
  style,
  size = '1.25rem'
}) => {
  return (
    <span 
      className={`robot-icon-container ${className}`} 
      style={{ 
        display: 'inline-flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        width: size,
        height: size,
        ...style 
      }}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          width: '100%',
          height: '100%',
          overflow: 'visible'
        }}
      >
        <defs>
          <style>{`
            @keyframes robot-bob {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-1.2px); }
            }
            @keyframes robot-blink {
              0%, 46%, 54%, 100% { transform: scaleY(1); }
              50% { transform: scaleY(0.1); }
            }
            @keyframes robot-glow {
              0%, 100% { 
                fill: #39a900; 
                stroke: #39a900;
                filter: drop-shadow(0 0 1px rgba(57, 169, 0, 0.6)); 
              }
              50% { 
                fill: #10b981; 
                stroke: #10b981;
                filter: drop-shadow(0 0 3px rgba(16, 185, 129, 0.9)); 
              }
            }
            @keyframes robot-eye-pulse {
              0%, 100% { fill: currentColor; }
              50% { fill: #39a900; }
            }
            @keyframes robot-arm-wave {
              0%, 100% { transform: rotate(0deg); }
              25% { transform: rotate(-35deg); }
              75% { transform: rotate(15deg); }
            }
            @keyframes robot-idle-wave-right {
              0%, 85%, 100% { transform: rotate(0deg); }
              88% { transform: rotate(-20deg); }
              92% { transform: rotate(10deg); }
              96% { transform: rotate(-15deg); }
            }
            @keyframes robot-idle-wave-left {
              0%, 85%, 100% { transform: rotate(0deg); }
              88% { transform: rotate(15deg); }
              92% { transform: rotate(-5deg); }
              96% { transform: rotate(10deg); }
            }
            
            .robot-head-group {
              animation: robot-bob 3s ease-in-out infinite;
              transform-origin: center bottom;
            }
            .robot-eye-left, .robot-eye-right {
              animation: robot-blink 4.5s ease-in-out infinite;
              transform-origin: center;
              fill: currentColor;
            }
            .robot-antenna-tip {
              animation: robot-glow 1.8s ease-in-out infinite;
              stroke-width: 0.5px;
            }
            .robot-chest-light {
              animation: robot-glow 2.2s ease-in-out infinite;
              stroke-width: 0.5px;
            }
            .robot-arm-left {
              transform-origin: 5.5px 15px;
              animation: robot-idle-wave-left 8s ease-in-out infinite;
              animation-delay: 1.5s;
            }
            .robot-arm-right {
              transform-origin: 18.5px 15px;
              animation: robot-idle-wave-right 8s ease-in-out infinite;
            }
            
            /* Hover interactions on the outer button / container */
            .sidebar-item:hover .robot-arm-right,
            .admin-sidebar-item:hover .robot-arm-right,
            .robot-icon-container:hover .robot-arm-right {
              animation: robot-arm-wave 0.6s ease-in-out infinite;
            }
            
            .sidebar-item:hover .robot-eye-left,
            .sidebar-item:hover .robot-eye-right,
            .admin-sidebar-item:hover .robot-eye-left,
            .admin-sidebar-item:hover .robot-eye-right,
            .robot-icon-container:hover .robot-eye-left,
            .robot-icon-container:hover .robot-eye-right {
              animation: robot-eye-pulse 0.5s infinite alternate;
              fill: #39a900;
            }
          `}</style>
        </defs>

        {/* Neck */}
        <line x1="12" y1="13" x2="12" y2="15" />

        {/* Arms */}
        <path d="M6,15 C4.5,16 3.5,18 4.2,20" className="robot-arm-left" />
        <path d="M18,15 C19.5,16 20.5,18 19.8,20" className="robot-arm-right" />

        {/* Body */}
        <rect x="6" y="15" width="12" height="7" rx="1.5" />
        <circle cx="12" cy="18.5" r="1.5" className="robot-chest-light" />
        <line x1="9" y1="22" x2="9" y2="23" />
        <line x1="15" y1="22" x2="15" y2="23" />

        {/* Head Bobbing Group */}
        <g className="robot-head-group">
          {/* Antenna */}
          <line x1="12" y1="6" x2="12" y2="2.5" />
          <circle cx="12" cy="2" r="1.5" className="robot-antenna-tip" />

          {/* Head & Face */}
          <rect x="7" y="6" width="10" height="7" rx="2" fill="none" />
          <rect x="8.5" y="7.5" width="7" height="4" rx="1" style={{ opacity: 0.15 }} fill="currentColor" />
          <circle cx="10.5" cy="9.5" r="0.75" className="robot-eye-left" />
          <circle cx="13.5" cy="9.5" r="0.75" className="robot-eye-right" />
        </g>
      </svg>
    </span>
  );
};
