import { useEffect, useState } from "react";

export default function useMouseMove() {
   const [mousePosition, setMousePosition] = useState<{ x: number, y: number } | undefined>();

   useEffect(() => {
      const handleMouseMove = (e: MouseEvent) => {
         setMousePosition({ x: e.clientX, y: e.clientY });
      };

      document.addEventListener('mousemove', handleMouseMove);
      return () => document.removeEventListener('mousemove', handleMouseMove);
   }, []);

   return mousePosition;
}