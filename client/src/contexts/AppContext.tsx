import React, { createContext, useContext, useState, useEffect } from 'react';

interface AppContextType {
  isFirstVisit: boolean;
  setFirstVisit: (value: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isFirstVisit, setIsFirstVisit] = useState<boolean>(true);

  // Check if it's the first visit on component mount
  useEffect(() => {
    const visited = localStorage.getItem('visited');
    if (visited) {
      setIsFirstVisit(false);
    }
  }, []);

  // Update local storage when first visit status changes
  const setFirstVisit = (value: boolean) => {
    setIsFirstVisit(value);
    if (!value) {
      localStorage.setItem('visited', 'true');
    }
  };

  return (
    <AppContext.Provider value={{ isFirstVisit, setFirstVisit }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
