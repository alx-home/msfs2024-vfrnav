import useMouseRelease from '@/Events/MouseRelease';
import { PropsWithChildren, MouseEventHandler, useRef, useEffect, useState, useContext, CSSProperties, useCallback } from 'react';
import useMouseMove from '../Events/MouseMove';
import { MouseContext } from '@/Events/MouseContext';
import useMouseDrag from '@/Events/MouseDrag';

export const Scroll = ({ children, className, style }: PropsWithChildren<{
   className?: string,
   style?: CSSProperties
}>) => {
   const [scroll, setScroll] = useState({ x: 0, y: 0, ratioX: 0, ratioY: 0, width: 0, height: 0, displayX: false, displayY: false });
   const [lastPos, setLastPos] = useState<{ x: number, y: number }>();
   const [visible, setVisible] = useState(0);
   const mousePosition = useMouseDrag(lastPos !== undefined);
   const mouseUp = useMouseRelease();
   const ref = useRef<HTMLDivElement | null>(null);

   useEffect(() => {
      setLastPos(undefined);
   }, [mouseUp]);

   useEffect(() => {
      if (mousePosition && lastPos && ref.current) {
         ref.current.scroll(ref.current.scrollLeft + (mousePosition.x - lastPos.x) * scroll.ratioX, ref.current.scrollTop + (mousePosition.y - lastPos.y) * scroll.ratioY);
         setLastPos(mousePosition);
      }
   }, [mousePosition, lastPos, ref.current, setLastPos, scroll]);

   const updateScroll = useCallback((target: HTMLDivElement) => {
      setVisible(count => count + 1);

      const ratio = [target.scrollWidth ? target.clientWidth / target.scrollWidth : 1, target.scrollHeight ? target.clientHeight / target.scrollHeight : 1];
      const client = [target.clientWidth, target.clientHeight];
      const scrollSize = [client[0] * ratio[0], client[1] * ratio[1]];

      const moveSize = [client[0] - scrollSize[0], client[1] - scrollSize[1]];
      const outer = [target.scrollWidth - client[0], target.scrollHeight - client[1]];
      const posRatio = [outer[0] ? target.scrollLeft / outer[0] : 0, outer[1] ? target.scrollTop / outer[1] : 0];

      setScroll({ x: moveSize[0] * posRatio[0], y: moveSize[1] * posRatio[1], ratioX: outer[0] / moveSize[0], ratioY: outer[1] / moveSize[1], width: scrollSize[0], height: scrollSize[1], displayX: outer[0] !== 0, displayY: outer[1] !== 0 })
   }, [setScroll])

   useEffect(() => {
      if (ref.current) {
         updateScroll(ref.current);
      }
   }, [ref.current, ref.current?.scrollWidth, ref.current?.scrollHeight, ref.current?.scrollTop, ref.current?.scrollLeft]);

   useEffect(() => {
      if (visible) {
         setTimeout(() => {
            setVisible(count => count === visible ? 0 : count);
         }, 1000);
      }
   }, [visible]);

   return <div className='flex relative overflow-hidden'>
      <div className={'absolute transition transition-std flex flex-row right-0 top-0 w-2 bottom-0 bg-gray-800 bg-opacity-50 opacity-0 hover:opacity-100'
         + (visible ? ' opacity-100' : '')
         + (scroll.displayY ? '' : ' hidden')
      }>
         <div className={'transition grow bg-gray-700 hover:bg-msfs'
            + (lastPos === undefined ? '' : ' bg-msfs')} style={{ marginTop: scroll.y, height: scroll.height }}
            onMouseDown={e => setLastPos({ x: e.clientX, y: e.clientY })}
            onMouseUp={() => setLastPos(undefined)}
         ></div>
      </div>
      <div className={'absolute right-0 bottom-0 h-2 bg-gray-700 hover:bg-msfs'
         + (scroll.displayX ? '' : ' hidden')
      } style={{ left: scroll.x, width: scroll.width }}></div>
      <div className={'box-content overflow-y-scroll [scrollbar-width:none] ' + (className ?? '')}
         style={style}
         ref={ref}
         onScroll={e => {
            updateScroll(e.currentTarget);
         }}>
         {children}
      </div>
   </div >;
};