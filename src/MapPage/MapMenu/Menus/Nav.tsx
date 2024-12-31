
import { Children, Dispatch, isValidElement, MouseEventHandler, PropsWithChildren, SetStateAction, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { Feature } from 'ol';
import VectorLayer from 'ol/layer/Vector';

import { Button } from '@/Utils/Button';

import newFileImg from '@/images/new-file.svg';
import importImg from '@/images/import.svg';
import exportImg from '@/images/export.svg';
import editImg from "@/images/edit.svg";
import deleteImg from "@/images/delete.svg";
import { Draggable } from '@/Utils/Draggable';
import { MapContext } from '@/MapPage/MapContext';

export class NavData {
   // eslint-disable-next-line no-unused-vars
   constructor(public id: number, public order: number, public name: string, public active: boolean, public shortName: string, public feature: Feature, public layer: VectorLayer) { }
};

const Label = ({ name, shortName, editMode }: {
   name: string,
   shortName: string,
   editMode: boolean
}) => {
   return <div
      className='flex flex-row px-2 pt-1 grow'
      style={editMode ? { display: 'none' } : {}}>
      <div className="text-nowrap hidden @[85px]/label:flex">{name}</div>
      <div className="text-nowrap hidden @[55px]/label:flex @[85px]/label:hidden">nav: {shortName}</div>
      <div className="text-nowrap flex @[55px]/label:hidden">{shortName}</div>
   </div>;
};

const Edit = ({ onClick, image, alt, background, hidden }: {
   onClick: MouseEventHandler<HTMLButtonElement>,
   image: string,
   alt: string,
   background: string,
   hidden: boolean
}) => {
   return <button className={'flex w-11 h-11 hover:brightness-125 focus:border-2 focus:border-with ' + ' ' + background + (hidden ? ' overflow-hidden hidden' : '')} onClick={onClick}>
      <img className='w-8 h-8 grow mt-auto mb-auto justify-center' src={image} alt={alt} />
   </button>;
};

const Input = ({ editMode, setEditMode, name }: {
   editMode: boolean,
   setEditMode: Dispatch<SetStateAction<boolean>>,
   name: string
}) => {
   const mapContext = useContext(MapContext)!;
   const textArea = useRef<HTMLInputElement | null>(null);
   useEffect(() => {
      if (editMode) {
         textArea.current?.focus()
      }
   }, [editMode]);
   const [value, setValue] = useState(name);

   return <input className={'bg-transparent h-8 pt-1 pl-2 pointer-events-auto'} ref={textArea} value={value} style={editMode ? {} : { display: 'none' }}
      onBlur={() => {
         mapContext.editNav(name, value)
         setEditMode(false);
      }}
      onChange={() => { }}
      onKeyUp={e => {
         setValue(e.currentTarget.value);

         if (e.key === 'Escape' || e.key === 'Enter') {
            mapContext.editNav(name, value);
            setEditMode(false);
         }
      }}
   />;
};

export const NavItem = ({ name, shortName, active, setDraggable }: {
   active: boolean,
   name: string,
   shortName: string,
   setDraggable?: Dispatch<SetStateAction<boolean>>
}) => {
   const mapContext = useContext(MapContext)!;
   const [editMode, setEditMode] = useState(false);
   const [hover, setHover] = useState(false);
   const [focused, setFocused] = useState(false);

   useEffect(() => {
      return () => setDraggable?.(true);
   }, [setDraggable])

   useEffect(() => {
      if (editMode) {
         setDraggable?.(false);
      } else {
         setDraggable?.(true);
      }
   }, [editMode, setDraggable])

   return <div className={'flex flex-row grow hover:gap-x-2' + (active ? ' border-l-2 border-msfs' : '')}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}>
      <Button className={'flex flex-row grow @container/label'}
         active={!editMode}
         onClick={() => mapContext.setNavData(navData => {
            const newData = [...navData];
            const elem = newData.find(e => e.name === name);
            if (elem) {
               elem.active = !active;
            }
            return newData;
         })}>
         <Label name={name} shortName={shortName} editMode={editMode} />
         <Input editMode={editMode} setEditMode={setEditMode} name={name} />
      </Button>
      <div className={'transition duration-std flex flex-row gap-2 overflow-hidden max-w-24 h-11 mt-auto mb-auto ' + ((hover || focused) ? 'w-full' : 'w-0')}
         style={{ display: (editMode ? 'none' : ''), transitionProperty: 'width' }}
         onFocus={() => setFocused(true)}
         onBlur={() => setFocused(false)}
      >
         <Edit onClick={() => setEditMode(true)} image={editImg} alt='edit' background='bg-msfs' hidden={!(hover || focused)} />
         <Edit onClick={() => mapContext.removeNav(name)} image={deleteImg} alt='delete' background='bg-red-600' hidden={!(hover || focused)} />
      </div>
   </div>;
};

const Add = ({ name, image, onClick, disabled, active }: PropsWithChildren<{
   name: string,
   image: string,
   onClick: MouseEventHandler<HTMLButtonElement>,
   disabled?: boolean,
   active?: boolean
}>) => {
   return <Button onClick={onClick} active={active ?? true} disabled={disabled ?? false} className='px-2 min-h-8 pt-1 flex flex-row grow @container'>
      <div className='hidden @[47px]:flex'>{name}</div>
      <div className='flex grow justify-center @[47px]:hidden'>
         <img src={image} alt={name} className='invert' />
      </div>
   </Button>;
};

const Item = ({ children, className, setDraggable }: PropsWithChildren<{
   order: number,
   className: string,
   setDraggable: Dispatch<SetStateAction<boolean>>
}>) => {
   const child = useMemo(() => {
      const child = Children.only(children);
      if (isValidElement<object>(child)) {
         return {
            ...child, props: {
               ...child.props,
               setDraggable: setDraggable
            }
         };
      }
      return undefined;
   }, [children, setDraggable]);

   return <div className={className + ' gap-x-0'}>{child}</div>;
};

export const Nav = ({ children }: PropsWithChildren<unknown>) => {
   const mapContext = useContext(MapContext)!;
   const key = mapContext.navData.reduce((prev, elem) => { return prev + ";" + elem.name; }, "");
   const [draggable, setDraggable] = useState(true);
   const childs = useMemo(() => Children.toArray(children).filter(child => isValidElement(child)).map((child, index) => {
      return <Item key={mapContext.navData[index].id} order={mapContext.navData[index].order} className='flex gap-x-4' setDraggable={setDraggable}>
         {child}
      </Item>
   })
      , [children, mapContext.navData]);

   return <>
      <div className="flex min-h-12 shrink-0 items-center justify-between ps-1 text-2xl font-semibold">
         Nav&apos;s
      </div>
      <menu className={"flex flex-col gap-2"}>
         <Draggable key={key} className={'@container flex flex-col w-full overflow-hidden gap-y-2'}
            vertical={true}
            active={draggable}
            onOrdersChange={(orders: number[]) => {
               mapContext.reorderNav(orders);
            }}
         >
            {childs}
         </Draggable>
         <div className='flex gap-x-4 mt-2'>
            <Add name='Add' image={newFileImg} onClick={() => mapContext.addNav?.()} />
            <Add name='Import' image={importImg} disabled={true} onClick={() => { }} />
         </div>
         <Add name='Export' image={exportImg} disabled={true} onClick={() => { }} />
      </menu>
   </>
};