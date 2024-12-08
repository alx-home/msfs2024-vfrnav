
import { Children, isValidElement, PropsWithChildren, useEffect, useRef, useState } from 'react';
import Image from 'next/image';

import editImg from "@/../public/edit.svg";
import deleteImg from "@/../public/delete.svg";
import './nav.css'
import { Feature } from 'ol';
import VectorLayer from 'ol/layer/Vector';

export class NavData {
   constructor(public id: number, public name: string, public active: boolean, public shortName: string, public feature: Feature, public layer: VectorLayer) { }
};

export const NavItem = ({ name, shortName, feature, addFeature, removeFeature, removeItem, editItem, active, setActive }:
   {
      active: boolean, name: string, shortName: string, feature: Feature, addFeature: (feature: Feature) => void,
      removeFeature: (feature: Feature) => void, removeItem: (name: string) => void, editItem: (name: string, newName: string) => void,
      setActive: (active: boolean) => void
   }) => {

   useEffect(() => {
      if (active) {
         addFeature(feature);
      } else {
         removeFeature(feature);
      }
   }, [active]);
   const textArea = useRef<HTMLInputElement | null>(null);

   const [editMode, setEditMode] = useState(false);

   useEffect(() => textArea.current?.focus(), [editMode]);

   return <>
      <button
         onClick={e => setActive(!active)}
         className={active ? 'active-nav' : ''}
         style={editMode ? { display: 'none' } : {}}>
         <div className='nav-name'>{name}</div>
         <div className='nav-shortName'>{shortName}</div>
      </button>
      <div className='item-menu' style={editMode ? { display: 'none' } : {}}>
         <button className='edit' onClick={e => {
            setEditMode(true);
         }}><Image src={editImg} alt={'edit'} /></button>
         <button className='delete' onClick={e => { removeItem(name); removeFeature(feature); }}><Image src={deleteImg} alt={'delete'} /></button>
      </div>
      <input className={active ? 'active-nav' : ''} ref={textArea} value={name} style={editMode ? {} : { display: 'none' }}
         onChange={e => editItem(name, e.target.value)}
         onBlur={e => setEditMode(false)}
         onKeyUp={e => {
            if (e.key == 'Escape' || e.key == 'Enter') {
               setEditMode(false);
            }
         }}
      />
   </>;
};

export const Nav = ({ children, addItem }: PropsWithChildren<{ addItem: () => void }>) => {
   return <>
      <h1>
         Nav's
      </h1>
      <menu>
         {Children.map(children, (child) => {
            if (!isValidElement(child)) return <></>;
            return <span className="item">
               {child}
            </span>
         })}
         <span className="add-item">
            <button onClick={e => { addItem() }}>
               <h1>
                  {"+"}
               </h1>
            </button>
         </span>
      </menu>
   </>
};