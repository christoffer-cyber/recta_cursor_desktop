"use client";

import React from 'react';

export interface ChapterProgressProps {
  currentChapter: number;
  completedChapters: number[];
  totalChapters: number;
}

const CHAPTER_NAMES = [
  "Företagsregistrering",
  "Behovsanalys", 
  "Strategisk kartläggning",
  "Resursplanering",
  "Organisationsanalys",
  "Rekommendationer"
];

export default function ChapterProgress({ 
  currentChapter, 
  completedChapters, 
  totalChapters = 6 
}: ChapterProgressProps) {
  
  const getChapterStatus = (chapterNumber: number) => {
    if (completedChapters.includes(chapterNumber)) {
      return 'completed';
    } else if (chapterNumber === currentChapter) {
      return 'current';
    } else if (chapterNumber < currentChapter) {
      return 'completed';
    } else {
      return 'pending';
    }
  };

  const getChapterIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return '✓';
      case 'current':
        return '→';
      default:
        return '○';
    }
  };

  return (
    <div className="chapter-progress">
      <div className="chapter-progress-header">
        <h3>Analysframsteg</h3>
        <span className="chapter-counter">
          {completedChapters.length + (currentChapter > completedChapters.length ? 1 : 0)}/{totalChapters}
        </span>
      </div>
      
      <div className="chapter-list">
        {Array.from({ length: totalChapters }, (_, index) => {
          const chapterNumber = index + 1;
          const status = getChapterStatus(chapterNumber);
          const chapterName = CHAPTER_NAMES[index] || `Kapitel ${chapterNumber}`;
          
          return (
            <div 
              key={chapterNumber}
              className={`chapter-item chapter-${status}`}
            >
              <div className="chapter-icon">
                {getChapterIcon(status)}
              </div>
              <div className="chapter-content">
                <div className="chapter-name">
                  {chapterName}
                </div>
                <div className="chapter-number">
                  Steg {chapterNumber}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="chapter-progress-bar">
        <div 
          className="chapter-progress-fill"
          style={{ 
            width: `${((completedChapters.length + (currentChapter > completedChapters.length ? 0.5 : 0)) / totalChapters) * 100}%` 
          }}
        />
      </div>
    </div>
  );
}
