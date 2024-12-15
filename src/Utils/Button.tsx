import useMouseRelease from '@/Events/MouseRelease';
import { PropsWithChildren, MouseEventHandler, useState, useRef, useEffect } from 'react';

export const Button = ({ children, onClick, className, active }: PropsWithChildren<{
   onClick?: MouseEventHandler<HTMLButtonElement>,
   className?: string,
   active: boolean
}>) => {
   const elemRef = useRef<HTMLButtonElement | null>(null);
   const mouseLeave = useMouseRelease();

   useEffect(() => {
      if (active) {
         elemRef.current?.focus();
         elemRef.current?.blur();
      }
   }, [mouseLeave]);


   return <div className={"grow bg-gray-700 p-1 shadow-md flex text-left hover:bg-gray-800 hover:drop-shadow-xl rounded-sm border-2 border-gray-900 has-[:focus]:border-msfs has-[:hover]:border-msfs"}>
      <button className='grow flex'
         ref={elemRef}
         onClick={e => onClick?.(e)}
         disabled={!active}>
         <div className={'line-clamp-1 w-[100%] overflow-hidden overflow-ellipsis text-xl font-semibold text-white ' + (className ?? "")} >
            {children}
         </div>
      </button>
   </div>;
};