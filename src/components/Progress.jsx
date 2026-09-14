import React from 'react'

const Progress = ({ currentStep, totalSteps }) => {
  return (
    <div className="w-full bg-neutral-200 h-1.5 rounded-full">
      <div
        className="bg-accent text-accent-foreground h-1.5 rounded-full"
        style={{ width: `${(currentStep / totalSteps) * 100}%` }}
      ></div>
    </div>
  );
};

export default Progress;