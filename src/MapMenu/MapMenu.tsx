import { Dispatch, FC, KeyboardEvent, MouseEvent, SetStateAction, useContext, useEffect, useState } from 'react';
import '@/MapMenu/map-menu.css'
import useMouseMove from '@/Events/MouseMove';
import useMouseRelease from '@/Events/MouseRelease';
import { MouseContext } from '@/Events/MouseContext';
import { Layer, Layers, OnLayerChange } from './Layers';
import { Nav } from './Nav';

export enum Menu { layers, nav };

export const MapMenu: FC<{ open: boolean, setOpen: Dispatch<SetStateAction<boolean>>, menu: Menu, layers: Layer[], onLayerChange: OnLayerChange }> =
   ({ open, setOpen, menu, layers, onLayerChange }) => {
      const [initialDelta, setInitialDelta] = useState<number | undefined>();
      const [width, setWidth] = useState(0);
      const [defaultWidth, setDefaultWidth] = useState(100);
      const [cursorOut, setCursorOut] = useState(false);
      const mousePosition = useMouseMove();
      const mouseUp = useMouseRelease();
      const { cursorType, cursorChangeHandler } = useContext(MouseContext);
      const closeWidth = 40;
      const minWidth = 100;
      const maxWidth = 250;

      const onDragStart = (mouseX: number) => {
         setInitialDelta(width + mouseX);
         setOpen(width > 0);
      };

      const onDragEnd = () => {
         if (width > 0) {
            setDefaultWidth(width);
         }
         setInitialDelta(undefined);

         if (cursorOut) {
            cursorChangeHandler("");
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
         if (e.key == "ArrowLeft") {
            updateWidth(width + 10);
         } else if (e.key == "ArrowRight") {
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

      return <>
         <div role="separator" aria-orientation="vertical" tabIndex={0}
            onMouseEnter={() => { setCursorOut(false); cursorChangeHandler("ew-resize"); }}
            onMouseLeave={() => { setCursorOut(true); if (!initialDelta) { cursorChangeHandler(""); } }}
            onMouseDown={e => onDragStart(e.pageX)}
            onMouseUp={onDragEnd}
            onKeyDown={handleKey}
            className='map-menu-handle'></div >
         <div style={{ width: width }} className='map-menu-ext'>
            {menu == Menu.layers ?
               <Layers layers={layers} onLayerChange={onLayerChange} /> :
               <Nav />}
         </div>
      </>
   };