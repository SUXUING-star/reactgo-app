// src/contexts/ProgressContext.jsx
import React, { createContext, useContext, useState } from 'react';

const ProgressContext = createContext();

export const ProgressProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const startLoading = () => {
    setIsLoading(true);
    setProgress(0);
  };

  const updateProgress = (value) => {
    setProgress(value);
  };

  const completeLoading = () => {
    setProgress(100);
    setTimeout(() => {
      setIsLoading(false);
      setProgress(0);
    }, 500);
  };

  return (
    <ProgressContext.Provider 
      value={{ 
        isLoading, 
        progress, 
        startLoading, 
        updateProgress, 
        completeLoading 
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
};

export const useProgress = () => {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
};