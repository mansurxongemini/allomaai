import { createContext, useContext } from 'react';

type ContextValues = {
  isOpen: boolean;
  toggleIsOpen: () => void;
};

export const RightSidebarContext = createContext<ContextValues | null>(null);

export const useRightSidebarContext = () => {
  const context = useContext(RightSidebarContext);

  if (!context) {
    throw new Error(
      'useRightSidebarContext must be used within a RightSidebarProvider'
    );
  }

  return context;
};
