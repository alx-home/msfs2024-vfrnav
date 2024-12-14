
import { Children, Dispatch, isValidElement, MouseEventHandler, PropsWithChildren, SetStateAction, useEffect, useRef, useState } from 'react';
import Image from 'next/image';

import { Feature } from 'ol';
import VectorLayer from 'ol/layer/Vector';
import { MapContext } from '@/MapPage/MapPage';

import { Button } from '@/Utils/Button';
import useKeyUp from '@/Events/KeyUp';
import { StaticImport } from 'next/dist/shared/lib/get-img-props';

import newFileImg from '@/../public/new-file.svg';
import importImg from '@/../public/import.svg';
import editImg from "@/../public/edit.svg";
import deleteImg from "@/../public/delete.svg";

export class NavData {
   constructor(public id: number, public name: string, public active: boolean, public shortName: string, public feature: Feature, public layer: VectorLayer) { }
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

const Edit = ({ onClick, image, alt, background }: {
   onClick: MouseEventHandler<HTMLButtonElement>,
   image: string | StaticImport,
   alt: string,
   background: string
}) => {
   return <button className={'flex w-11 h-11 hover:brightness-125 focus:border-2 focus:border-with ' + ' ' + background} onClick={onClick}>
      <Image className='w-8 h-8 grow mt-auto mb-auto justify-center' src={image} alt={alt} />
   </button>;
};

const Input = ({ mapContext, editMode, setEditMode, name, active }: {
   editMode: boolean,
   setEditMode: Dispatch<SetStateAction<boolean>>,
   active: boolean,
   mapContext: MapContext,
   name: string
}) => {
   const textArea = useRef<HTMLInputElement | null>(null);
   useEffect(() => textArea.current?.focus(), [editMode]);

   return <input className={'bg-transparent h-8 pt-1 pl-2'} ref={textArea} value={name} style={editMode ? {} : { display: 'none' }}
      onChange={e => mapContext.editNav(name, e.target.value)}
      onBlur={() => setEditMode(false)}
      onKeyUp={e => {
         if (e.key === 'Escape' || e.key === 'Enter') {
            setEditMode(false);
         }
      }}
   />;
};

export const NavItem = ({ name, shortName, feature, active, mapContext }:
   {
      active: boolean, name: string, shortName: string, feature: Feature, mapContext: MapContext
   }) => {
   const [editMode, setEditMode] = useState(false);
   const [hover, setHover] = useState(false);
   const [focused, setFocused] = useState(false);

   useEffect(() => {
      if (active) {
         mapContext.addFeature(feature);
      } else {
         mapContext.removeFeature(feature);
      }
   }, [active]);


   return <div className={'flex flex-row grow gap-2 ' + (active ? 'border-l-2 border-msfs' : '')}
      onMouseEnter={e => setHover(true)}
      onMouseLeave={e => setHover(false)}>
      <Button className='flex flex-row grow @container/label'
         onClick={() => mapContext.setNavData((navData) => {
            const newData = [...navData];
            const elem = newData.find(e => e.name === name);
            if (elem) {
               elem.active = !active;
               console.log(elem.active)
            }
            return newData;
         })}>
         <Label name={name} shortName={shortName} editMode={editMode} />
         <Input mapContext={mapContext} editMode={editMode} setEditMode={setEditMode} name={name} active={active} />
      </Button>
      <div className={'transition duration-std flex flex-row gap-2 overflow-hidden max-w-24 h-11 mt-auto mb-auto ' + ((hover || focused) ? 'w-full' : 'w-0')}
         style={{ display: (editMode ? 'none' : ''), transitionProperty: 'width' }}
         onFocus={() => setFocused(true)}
         onBlur={() => setFocused(false)}
      >
         <Edit onClick={() => setEditMode(true)} image={editImg} alt='edit' background='bg-msfs' />
         <Edit onClick={() => { mapContext.removeNav(name); mapContext.removeFeature(feature); }} image={deleteImg} alt='delete' background='bg-red-600' />
      </div>
   </div>;
};

const Add = ({ name, image, onClick }: PropsWithChildren<{
   name: string,
   image: string | StaticImport,
   onClick: MouseEventHandler<HTMLButtonElement>
}>) => {
   return <Button onClick={onClick} className='px-2 min-h-8 pt-1 flex flex-row grow @container'>
      <div className='hidden @[47px]:flex'>{name}</div>
      <div className='flex grow justify-center @[47px]:hidden'><Image src={image} alt={name} className='invert' /></div>
   </Button>;
};

export const Nav = ({ children, mapContext }: PropsWithChildren<{ mapContext: MapContext }>) => {
   const keyUp = useKeyUp();

   useEffect(() => {
      if (keyUp === 'Escape') {
         mapContext.cancel();
      }
   }, [keyUp]);

   return <>
      <div className="flex min-h-12 shrink-0 items-center justify-between ps-1 text-2xl font-semibold">
         Nav's
      </div>
      <menu className={"flex flex-col gap-3"}>
         {Children.map(children, (child) => {
            if (!isValidElement(child)) return <></>;
            return <div className='flex gap-x-4'>
               {child}
            </div>
         })}
         <div className='flex gap-x-4'>
            <Add name='Add' image={newFileImg} onClick={e => { mapContext.addNav() }} />
            <Add name='Import' image={importImg} onClick={e => { }} />
         </div>
      </menu>
   </>
};