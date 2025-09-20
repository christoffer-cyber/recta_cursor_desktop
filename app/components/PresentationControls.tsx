"use client";
import React, { useState, useEffect } from "react";

type Props = {
  totalSlides: number;
  onExit: () => void;
};

export default function PresentationControls({ totalSlides, onExit }: Props) {
  const [currentSlide, setCurrentSlide] = useState(1);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowRight':
        case ' ':
          if (currentSlide < totalSlides) setCurrentSlide(prev => prev + 1);
          break;
        case 'ArrowLeft':
          if (currentSlide > 1) setCurrentSlide(prev => prev - 1);
          break;
        case 'Escape':
          onExit();
          break;
        case 'Home':
          setCurrentSlide(1);
          break;
        case 'End':
          setCurrentSlide(totalSlides);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [currentSlide, totalSlides, onExit]);

  useEffect(() => {
    // Scroll to current slide
    const slideElement = document.getElementById(`page-${currentSlide}`);
    if (slideElement) {
      slideElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [currentSlide]);

  const handleExit = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
    document.body.classList.remove('presentation-mode');
    onExit();
  };

  return (
    <div className="presentation-controls">
      <div className="presentation-nav">
        <button 
          className="nav-btn" 
          onClick={() => setCurrentSlide(Math.max(1, currentSlide - 1))}
          disabled={currentSlide === 1}
        >
          ←
        </button>
        <span className="slide-counter">{currentSlide} / {totalSlides}</span>
        <button 
          className="nav-btn" 
          onClick={() => setCurrentSlide(Math.min(totalSlides, currentSlide + 1))}
          disabled={currentSlide === totalSlides}
        >
          →
        </button>
      </div>
      <button className="exit-btn" onClick={handleExit}>
        Avsluta presentation
      </button>
    </div>
  );
}
