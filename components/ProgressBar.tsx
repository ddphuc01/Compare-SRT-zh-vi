import React from 'react';

interface ProgressBarProps {
  progress: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
  const cappedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className="w-full bg-gray-700 rounded-full h-2.5 my-4 overflow-hidden" role="progressbar" aria-valuenow={cappedProgress} aria-valuemin={0} aria-valuemax={100}>
      <div
        className="bg-gradient-to-r from-purple-500 to-indigo-500 h-2.5 rounded-full transition-all duration-500 ease-out"
        style={{ width: `${cappedProgress}%` }}
      ></div>
    </div>
  );
};

export default ProgressBar;