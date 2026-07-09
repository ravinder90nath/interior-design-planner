import React, { createContext, useContext, useState } from 'react';

const ToolContext = createContext(null);

export const useTool = () => {
  const ctx = useContext(ToolContext);
  if (!ctx) throw new Error('useTool must be inside <ToolProvider>');
  return ctx;
};

export const TOOLS = {
  SELECT: 'select',   // default — click/drag icons
  ZONE:   'zone',     // drag to draw a zone rectangle
  PAN:    'pan',      // pan canvas (same as ctrl+drag but as a tool)
};

export const ToolProvider = ({ children }) => {
  const [activeTool, setActiveTool] = useState(TOOLS.SELECT);

  return (
    <ToolContext.Provider value={{ activeTool, setActiveTool, TOOLS }}>
      {children}
    </ToolContext.Provider>
  );
};
