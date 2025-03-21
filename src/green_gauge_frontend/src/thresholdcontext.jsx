// ThresholdContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';

const ThresholdContext = createContext();

export const ThresholdProvider = ({ children }) => {
  // Load saved thresholds from localStorage or use defaults
  const [energyThreshold, setEnergyThreshold] = useState(() => {
    return localStorage.getItem('energyThreshold') 
      ? JSON.parse(localStorage.getItem('energyThreshold')) 
      : 500;
  });

  const [efficiencyThreshold, setEfficiencyThreshold] = useState(() => {
    return localStorage.getItem('efficiencyThreshold') 
      ? JSON.parse(localStorage.getItem('efficiencyThreshold')) 
      : 1;
  });

  // Function to update the energy threshold
  const updateEnergyThreshold = (newThreshold) => {
    setEnergyThreshold(newThreshold);
    localStorage.setItem('energyThreshold', JSON.stringify(newThreshold));
  };

  // Function to update the efficiency threshold
  const updateEfficiencyThreshold = (newThreshold) => {
    setEfficiencyThreshold(newThreshold);
    localStorage.setItem('efficiencyThreshold', JSON.stringify(newThreshold));
  };

  return (
    <ThresholdContext.Provider value={{ 
      energyThreshold,
      updateEnergyThreshold,
      efficiencyThreshold,
      updateEfficiencyThreshold,
    }}>
      {children}
    </ThresholdContext.Provider>
  );
};

// Custom hook to use the ThresholdContext
export const useThreshold = () => {
  return useContext(ThresholdContext);
};
