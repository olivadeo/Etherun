import { createContext, useContext, useState } from 'react';

const EtherunContext = createContext({});

export const EtherunContextProvider = ({ children }) => {
  const [connectedProfile, setConnectedProfile] = useState();

  return (
    <EtherunContext.Provider value={{ connectedProfile, setConnectedProfile }}>
      {children}
    </EtherunContext.Provider>
  );
};

export const useEtherunContext = () => {
  return useContext(EtherunContext);
};
