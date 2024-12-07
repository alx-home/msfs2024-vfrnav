
import React, { createContext, PropsWithChildren, useMemo, useState } from "react";

export const MouseContext = createContext({
   cursorType: "",
   cursorChangeHandler: (cursorType: string) => { },
});

const MouseContextProvider = ({ children }: PropsWithChildren) => {
   const [cursorType, setCursorType] = useState("");

   return (
      <MouseContext.Provider
         value={{
            cursorType: cursorType,
            cursorChangeHandler: (cursorType: string) => {
               setCursorType(cursorType);
            },
         }}
      >
         <div style={{ cursor: cursorType }}>
            {children}
         </div>
      </MouseContext.Provider>
   );
};

export default MouseContextProvider;