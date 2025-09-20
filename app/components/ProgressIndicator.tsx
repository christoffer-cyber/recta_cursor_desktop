"use client";
import React from "react";

type Step = {
  id: string;
  label: string;
  description: string;
  status: 'pending' | 'active' | 'completed';
};

type Props = {
  steps: readonly Step[];
  currentStep: string;
};

export default function ProgressIndicator({ steps, currentStep }: Props) {
  return (
    <div className="progress-container">
      <div className="progress-steps">
        {steps.map((step, index) => {
          const isActive = step.id === currentStep;
          const isCompleted = step.status === 'completed';
          const isPending = step.status === 'pending';
          
          return (
            <div key={step.id} className="progress-step">
              <div className="step-connector">
                {index > 0 && (
                  <div className={`connector-line ${isCompleted || (index < steps.findIndex(s => s.id === currentStep)) ? 'completed' : 'pending'}`} />
                )}
              </div>
              
              <div className={`step-circle ${isActive ? 'active' : isCompleted ? 'completed' : 'pending'}`}>
                {isCompleted ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20,6 9,17 4,12"/>
                  </svg>
                ) : (
                  <span className="step-number">{index + 1}</span>
                )}
              </div>
              
              <div className="step-content">
                <div className={`step-label ${isActive ? 'active' : isCompleted ? 'completed' : 'pending'}`}>
                  {step.label}
                </div>
                {isActive && (
                  <div className="step-description">{step.description}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
