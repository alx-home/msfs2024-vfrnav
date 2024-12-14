import useMouseRelease from '@/Events/MouseRelease';
import { PropsWithChildren, MouseEventHandler, useState, useRef, useEffect } from 'react';

export const Button = ({ children, onClick, className }: PropsWithChildren<{ onClick?: MouseEventHandler<HTMLButtonElement>, className?: string }>) => {
   const [focused, setFocused] = useState(false);
   const elemRef = useRef<HTMLButtonElement | null>(null);
   const mouseLeave = useMouseRelease();

   useEffect(() => {
      elemRef.current?.focus(); elemRef.current?.blur();
   }, [mouseLeave]);

   return <button className={"grow bg-gray-700 p-1 shadow-md flex text-left hover:bg-gray-800 hover:drop-shadow-xl rounded-sm border-2" + (focused ? " border-msfs" : " border-gray-900 hover:border-gray-200")}
      ref={elemRef}
      onFocus={e => setFocused(true)}
      onBlur={e => setFocused(false)}
      onClick={onClick}>
      <div className={'line-clamp-1 w-[100%] overflow-hidden overflow-ellipsis text-xl font-semibold text-white ' + (className ?? "")} >{children}</div>
   </button>;
};