import { useEffect, useState } from "react";

export default function useMouseRelease() {
   const [mousePosition, setMousePosition] = useState<{ x: number, y: number } | undefined>();

   useEffect(() => {
      const handleMouseUp = (e: MouseEvent) => {
         setMousePosition({ x: e.clientX, y: e.clientY });
      };

      document.addEventListener('mouseup', handleMouseUp);
      return () => document.removeEventListener('mouseup', handleMouseUp);
   }, []);

   return mousePosition;
}