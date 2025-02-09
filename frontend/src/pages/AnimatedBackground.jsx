import React from 'react';

const AnimatedBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Animated beam gradients */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-950 via-gray-900 to-blue-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_500px_at_50%_50%,rgba(0,123,255,0.1),transparent_100%)] animate-pulse" />
      </div>

      {/* Floating app icons */}
      <div className="absolute inset-0">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              opacity: 0.3
            }}
          >
            <div className="w-12 h-12 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center">
              {i === 0 && <img src="/api/placeholder/48/48" alt="Drive" className="w-6 h-6" />}
              {i === 1 && <img src="/api/placeholder/48/48" alt="Sheets" className="w-6 h-6" />}
              {i === 2 && <img src="/api/placeholder/48/48" alt="Gmail" className="w-6 h-6" />}
              {i === 3 && <img src="/api/placeholder/48/48" alt="Meet" className="w-6 h-6" />}
              {i === 4 && <img src="/api/placeholder/48/48" alt="Calendar" className="w-6 h-6" />}
              {i === 5 && <img src="/api/placeholder/48/48" alt="Docs" className="w-6 h-6" />}
            </div>
          </div>
        ))}
      </div>

      {/* Meteors */}
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute h-0.5 w-0.5 rotate-[215deg] animate-meteor"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 8}s`,
            animationDuration: `${Math.random() * 3 + 2}s`
          }}
        >
          <div className="absolute left-0 top-0 h-[2px] w-[50px] bg-gradient-to-r from-blue-400 to-transparent" />
        </div>
      ))}

      {/* Center logo glow effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="relative">
          <div className="absolute inset-0 blur-3xl bg-blue-500/20 animate-pulse rounded-full" />
          <div className="relative z-10 w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-xl">
            <span className="text-4xl">⚡</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimatedBackground;