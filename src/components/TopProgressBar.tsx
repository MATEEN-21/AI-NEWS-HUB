import React, { useEffect, useState } from 'react';

interface TopProgressBarProps {
  isLoading?: boolean;
}

export const TopProgressBar: React.FC<TopProgressBarProps> = ({ isLoading = false }) => {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    let fadeTimer: NodeJS.Timeout;

    if (isLoading) {
      setVisible(true);
      setProgress(15);

      timer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 88) {
            return prev;
          }
          const increment = Math.random() * 15 + 5;
          return Math.min(prev + increment, 88);
        });
      }, 150);
    } else {
      setProgress(100);
      fadeTimer = setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 250);
    }

    return () => {
      clearInterval(timer);
      clearTimeout(fadeTimer);
    };
  }, [isLoading]);

  if (!visible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-[2.5px] bg-transparent pointer-events-none">
      <div
        className="h-full bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-600 transition-all duration-200 ease-out shadow-[0_0_8px_rgba(37,99,235,0.6)]"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};
