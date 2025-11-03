import React, { useState, useEffect } from 'react';

export default function IntroAnimation({ onComplete }) {
  const [isVisible, setIsVisible] = useState(true);
  const [showText, setShowText] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Show text animation after 500ms
    const textTimer = setTimeout(() => {
      setShowText(true);
    }, 500);

    // Start fade out animation after 3 seconds
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 3000);

    // Complete animation and hide after 3.8 seconds (800ms for fade out)
    const completeTimer = setTimeout(() => {
      setIsVisible(false);
      onComplete();
    }, 3800);

    return () => {
      clearTimeout(textTimer);
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-stone-100 via-orange-50 to-stone-100 transition-opacity duration-800 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Background Image */}
      <div 
        className={`absolute inset-0 flex items-center justify-center transition-all duration-1000 ${
          fadeOut ? 'opacity-0 scale-105' : 'opacity-30 scale-100'
        }`}
      >
        <img
          src="/Self Estimation RARIN.png"
          alt="Rarin Space Background"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Animated Text */}
      <div className="relative z-10">
        <div
          className={`transition-all duration-1000 ${
            showText ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          } ${
            fadeOut ? 'opacity-0 -translate-y-8 scale-95' : ''
          }`}
        >
          <h1 
            className="text-4xl md:text-9xl font text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-orange-500 to-orange-600 animate-text-shimmer"
            style={{
              fontFamily: "'Momo Signature', 'Dancing Script', 'Brush Script MT', cursive",
              letterSpacing: '0.1em',
              textShadow: '0 2px 10px rgba(234, 88, 12, 0.1)',
              backgroundSize: '200% auto',
            }}
          >
            Rarin
          </h1>
          
          {/* Underline animation */}
          <div 
            className={`h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent mt-4 transition-all duration-1000 delay-300 ${
              showText ? 'w-full opacity-100' : 'w-0 opacity-0'
            } ${
              fadeOut ? 'opacity-0' : ''
            }`}
          />
        </div>

        {/* Subtitle */}
        <p
          className={`text-center mt-6 text-xl md:text-2xl text-stone-600 font-light tracking-wide transition-all duration-1000 delay-500 ${
            showText ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          } ${
            fadeOut ? 'opacity-0' : ''
          }`}
        >
          Where Memories Begin
        </p>
      </div>

      {/* Decorative Elements */}
      <div className={`absolute inset-0 pointer-events-none transition-opacity duration-800 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-orange-300 rounded-full filter blur-3xl opacity-20 animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-orange-200 rounded-full filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }} />
      </div>
    </div>
  );
}
