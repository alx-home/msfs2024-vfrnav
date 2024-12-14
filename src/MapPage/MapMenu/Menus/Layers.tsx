'use client'

import { Draggable } from "@/Utils/Draggable";
import { useEffect, useRef, useState } from "react";

import Image from "next/image";

import styles from './layers.module.sass';


export class Layer {
   constructor(public src: string, public alt: string, public order: number) { }
};

const LayerComp = ({ src, alt, onActiveChange }: Layer & { onActiveChange: (active: boolean) => void }) => {
   const [active, setActive] = useState<boolean>(true);
   const [transition, setTransition] = useState(false);
   const ref = useRef<HTMLButtonElement | null>(null);

   useEffect(() => onActiveChange(active), [active]);
   useEffect(() => {
      setTransition(false);
      setTimeout(() => setTransition(true), 10);
   }, []);

   return <button className={styles.button}
      ref={ref}
      onClick={e => setActive(active => !active)}
      onMouseUp={e => ref.current?.blur()}>
      <Image width={200} height={200} src={src} alt={alt} className={(active ? styles.active : '') + (transition ? ' ' + styles.with_transition : '')} />
   </button>;
};

export type OnLayerChange = (layers: { index: number, order?: number, active?: boolean }[]) => void;

export const Layers = ({ layers, onLayerChange }: { layers: Layer[], onLayerChange: OnLayerChange }) => {
   return <>
      <div className="flex min-h-12 shrink-0 items-center justify-between ps-1 text-2xl font-semibold">
         Layers
      </div>
      <Draggable className={styles.drag_container}
         vertical={true}
         onOrdersChange={(orders: number[]) => {
            onLayerChange(orders.map((order, index) => ({ index: index, order: order })));
         }}>
         {layers.map((layer, index) =>
            <LayerComp order={layer.order} key={layer.alt} src={layer.src} alt={layer.alt}
               onActiveChange={active => onLayerChange([{ index: index, active: active }])} />
         )}
      </Draggable>
   </>;
};