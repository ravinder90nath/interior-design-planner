import React, { createContext, useContext, useState } from 'react';

const ToolContext = createContext(null);

export const useTool = () => {
  const ctx = useContext(ToolContext);
  if (!ctx) throw new Error('useTool must be inside <ToolProvider>');
  return ctx;
};

export const TOOLS = {
  SELECT:  'select',   // default — click/drag icons & zones
  ZONE:    'zone',     // drag to draw a rectangular zone
  CIRCLE:  'circle',   // drag to draw a circular/elliptical zone
  POLYGON: 'polygon',  // click points, close the shape for an uneven zone
  PAN:     'pan',      // pan canvas
};

export const ToolProvider = ({ children }) => {
  const [activeTool, setActiveTool] = useState(TOOLS.SELECT);

  return (
    <ToolContext.Provider value={{ activeTool, setActiveTool, TOOLS }}>
      {children}
    </ToolContext.Provider>
  );
};
