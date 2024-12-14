import { Dispatch, FC, KeyboardEvent, SetStateAction, useContext, useEffect, useRef, useState } from 'react';
import useMouseMove from '@/Events/MouseMove';
import useMouseRelease from '@/Events/MouseRelease';
import { MouseContext } from '@/Events/MouseContext';
import { Layer, Layers, OnLayerChange } from './Menus/Layers';
import { Nav, NavItem } from './Menus/Nav';

import { MapContext } from '../MapPage';

export enum Menu { layers, nav };

export const MapMenu: FC<{ open: boolean, setOpen: Dispatch<SetStateAction<boolean>>, menu: Menu, layers: Layer[], onLayerChange: OnLayerChange, mapContext: MapContext }> =
   ({ open, setOpen, menu, layers, onLayerChange, mapContext }) => {
      const closeWidth = 40;
      const minWidth = 120;
      const maxWidth = 250;

      const [initialDelta, setInitialDelta] = useState<number | undefined>();
      const [width, setWidth] = useState(0);
      const [defaultWidth, setDefaultWidth] = useState(minWidth);
      const [cursorOut, setCursorOut] = useState(false);
      const [resizing, setResizing] = useState(false);

      const handleRef = useRef<HTMLDivElement>(null);

      const mousePosition = useMouseMove();
      const mouseUp = useMouseRelease();
      const { cursorChangeHandler } = useContext(MouseContext);

      const onDragStart = (mouseX: number) => {
         setInitialDelta(width + mouseX);
         setOpen(width > 0);
      };

      const onDragEnd = () => {
         handleRef.current?.blur();

         if (width > 0) {
            setDefaultWidth(width);
         }
         setInitialDelta(undefined);

         if (cursorOut) {
            setResizing(false);
         }
      };

      const updateWidth = (width: number) => {
         if (width < closeWidth) {
            width = 0;
         } else if (width < minWidth) {
            width = minWidth;
         } else if (width > maxWidth) {
            width = maxWidth;
         }

         setOpen(width > 0);
         setWidth(width);
      };

      const onDrag = (mouseX: number) => {
         if (initialDelta) {
            let width = initialDelta - mouseX;
            updateWidth(width);
         }
      };

      const handleKey = (e: KeyboardEvent<HTMLDivElement>) => {
         if (e.key === "ArrowLeft") {
            updateWidth(width + 10);
         } else if (e.key === "ArrowRight") {
            updateWidth(width - 10);
         }
      };

      useEffect(() => {
         if (mousePosition) {
            onDrag(mousePosition.x);
         }
      }, [mousePosition]);

      useEffect(() => {
         onDragEnd();
      }, [mouseUp]);

      useEffect(() => {
         if (open) {
            if (!width) {
               setWidth(defaultWidth);
            }
         } else if (width) {
            setWidth(0);
         }
      }, [open]);

      useEffect(() => {
         if (resizing) {
            cursorChangeHandler("ew-resize");
         } else {
            cursorChangeHandler("");
         }
      }, [resizing]);

      return <>
         <div ref={handleRef} role="separator" aria-orientation="vertical" tabIndex={0}
            onMouseEnter={() => {
               setCursorOut(false);
               setResizing(true);
            }}
            onMouseLeave={() => {
               setCursorOut(true);
               if (!initialDelta) {
                  setResizing(false);
               }
            }}
            onMouseDown={e => onDragStart(e.pageX)}
            onMouseUp={onDragEnd}
            onKeyDown={handleKey}
            className='select-none transition-std transition-colors w-2 bg-slate-900 hover:bg-[var(--item-bg)] focus:bg-[var(--item-bg)]' />

         <div style={{ width: width, ...(width > 0 ? {} : { display: 'none' }) }} className={'overflow-hidden shrink-0 border-l border-gray-700 pointer-events-auto flex h-full w-full flex-col gap-y-2.5 overflow-y-scroll bg-gray-800 text-center text-white' + (width > 0 ? ' p-3' : '')}>
            {menu === Menu.layers ?
               <Layers layers={layers} onLayerChange={onLayerChange} /> :
               <Nav mapContext={mapContext}>
                  {mapContext.navData.map((item) =>
                     <NavItem key={item.id} active={item.active} name={item.name} shortName={item.shortName} feature={item.feature} mapContext={mapContext} />
                  )}
               </Nav>}
         </div>
      </>
   };