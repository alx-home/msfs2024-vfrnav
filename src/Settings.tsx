import { createContext, PropsWithChildren, useMemo, useState } from "react";

export const SettingsContext = createContext<{
   speed: number,
   adjustHeading: boolean,
   adjustTime: boolean,
   setSpeed: (speed: number) => void,
   setAdjustHeading: (enable: boolean) => void,
   setAdjustTime: (enable: boolean) => void
}>({
   speed: 95,
   adjustHeading: true,
   adjustTime: true,
   setSpeed: () => { },
   setAdjustHeading: () => { },
   setAdjustTime: () => { }
});

const SettingsContextProvider = ({ children }: PropsWithChildren) => {
   const [speed, setSpeed] = useState(95);
   const [adjustHeading, setAdjustHeading] = useState(true);
   const [adjustTime, setAdjustTime] = useState(true);

   const provider = useMemo(() => ({
      speed: speed,
      adjustHeading: adjustHeading,
      adjustTime: adjustTime,
      setSpeed: (speed: number) => { setSpeed(speed) },
      setAdjustHeading: (enable: boolean) => { setAdjustHeading(enable) },
      setAdjustTime: (enable: boolean) => { setAdjustTime(enable) }
   }), [speed, setSpeed, adjustHeading, setAdjustHeading, adjustTime, setAdjustTime]);

   return (
      <SettingsContext.Provider
         value={provider}
      >
         {children}
      </SettingsContext.Provider>
   );
};

export default SettingsContextProvider;